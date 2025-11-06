import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Image,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { 
  EDIT_IMPLEMENTATION_URL,
  IDEA_DETAIL_URL 
} from './api';

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-IN', { month: 'short' });
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

const normalizeImagePath = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const BASE_URL = 'https://ideabank-api-dev.abisaio.com';
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

const hasExistingImplementation = (ideaDetail) => {
  if (!ideaDetail) return false;
  if (ideaDetail.implementationCycle && Object.keys(ideaDetail.implementationCycle).length > 0) {
    return true;
  }
  if (ideaDetail.implementation || ideaDetail.outcome || ideaDetail.afterImplementationImagePath) {
    return true;
  }
  return false;
};

function TimelineItem({ status, date, description, isLast }) {
  const getCircleColor = (status) => {
    if (!status) return "#9E9E9E";
    const s = status.toLowerCase();
    if (s.includes("created")) return "#2196F3";
    if (s.includes("edited")) return "#9C27B0";
    if (s.includes("approved")) return "#4CAF50";
    if (s.includes("implementation")) return "#3F51B5";
    if (s.includes("rejected")) return "#F44336";
    if (s.includes("pending")) return "#FF9800";
    return "#9E9E9E";
  };

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineCircle, { backgroundColor: getCircleColor(status) }]} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={styles.timelineStatus}>{status}</Text>
        {description && <Text style={styles.timelineDescription}>{description}</Text>}
        {date && <Text style={styles.timelineDate}>{formatDateTime(date)}</Text>}
      </View>
    </View>
  );
}

function RemarksCard({ title, comment, date }) {
  return (
    <View style={styles.remarkCard}>
      <Text style={styles.remarkTitle}>{title}</Text>
      <Text style={styles.remarkComment}>{comment}</Text>
      <Text style={styles.remarkDate}>{date}</Text>
    </View>
  );
}

const parseRemarks = (remarkData) => {
  if (!remarkData) return [];
  if (Array.isArray(remarkData)) return remarkData;
  if (typeof remarkData === "object") {
    const keys = Object.keys(remarkData);
    if (keys.length > 0 && keys.every(k => !isNaN(k))) return Object.values(remarkData);
    return [remarkData];
  }
  return [];
};

const getStatusColor = (status) => {
  if (!status) return "gray";
  const s = status.toLowerCase();
  if (s === "draft") return "#2196F3";
  if (s === "published") return "#4CAF50";
  if (s === "closed") return "#00ACC1";
  if (s === "pending") return "#FF9800";
  if (s.includes("approved by be team") || s.includes("ready for implementation")) return "#4CAF50";
  if (s.includes("rejected")) return "#F44336";
  if (s.includes("hold")) return "#FFC107";
  return "#9E9E9E";
};

export default function ImplementationDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  
  const { ideaId, ideaData } = route.params || {};

  const [ideaDetail, setIdeaDetail] = useState(ideaData || null);
  const [loading, setLoading] = useState(false);
  
  const [implementationDetails, setImplementationDetails] = useState('');
  const [outcomesBenefits, setOutcomesBenefits] = useState('');
  const [afterImage, setAfterImage] = useState(null);
  const [afterImageName, setAfterImageName] = useState('');
  const [afterImageType, setAfterImageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [keepExistingImage, setKeepExistingImage] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const [employeeInfoExpanded, setEmployeeInfoExpanded] = useState(false);
  const [ideaInfoExpanded, setIdeaInfoExpanded] = useState(true);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imageScale, setImageScale] = useState(1);

  const isEditMode = hasExistingImplementation(ideaDetail);

  useEffect(() => {
    if (!ideaData && ideaId) {
      fetchIdeaDetail();
    }
  }, [ideaId]);

  useEffect(() => {
    if (isEditMode && ideaDetail) {
      const implData = ideaDetail.implementationCycle || ideaDetail;
      
      setImplementationDetails(implData.implementation || ideaDetail.implementation || '');
      setOutcomesBenefits(implData.outcome || ideaDetail.outcome || '');
      
      const existingImage = implData.afterImplementationImagePath || 
                           ideaDetail.afterImplementationImagePath;
      
      if (existingImage) {
        const normalizedUrl = normalizeImagePath(existingImage);
        setExistingImageUrl(normalizedUrl);
        setKeepExistingImage(true);
        setAfterImageName('Existing image on server');
      }
    }
  }, [ideaDetail, isEditMode]);

  const fetchIdeaDetail = async () => {
    if (!ideaId) return;
    
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const { data: response } = await axios.get(
        `${IDEA_DETAIL_URL}/${encodeURIComponent(ideaId)}`, 
        { headers }
      );

      if (response?.success && response?.data) {
        setIdeaDetail(response.data);
      } else {
        Alert.alert("Error", response?.message || "Idea details not found.");
        navigation.goBack();
      }
    } catch (error) {
      console.error('Fetch idea detail error:', error);
      Alert.alert("Error", "Failed to fetch idea details.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required!');
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    
    if (!result.canceled) {
      setAfterImage(result.assets[0].uri);
      setAfterImageType('image');
      const uriParts = result.assets[0].uri.split('/');
      setAfterImageName(uriParts[uriParts.length - 1]);
      setKeepExistingImage(false);
      setShowFileOptions(false);
    }
  };

  const pickImageFromCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Camera permission required!');
      return;
    }
    
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    
    if (!result.canceled) {
      setAfterImage(result.assets[0].uri);
      setAfterImageType('image');
      const uriParts = result.assets[0].uri.split('/');
      setAfterImageName(uriParts[uriParts.length - 1]);
      setKeepExistingImage(false);
      setShowFileOptions(false);
    }
  };

  const pickPDF = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      
      if (result.type === 'success' || !result.canceled) {
        const selectedFile = result.assets ? result.assets[0] : result;
        setAfterImage(selectedFile.uri);
        setAfterImageType('pdf');
        setAfterImageName(selectedFile.name);
        setKeepExistingImage(false);
        setShowFileOptions(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick PDF file');
    }
  };

  const handleSubmit = async () => {
    if (!implementationDetails.trim()) {
      Alert.alert('Error', 'Please enter implementation details');
      return;
    }
    if (!outcomesBenefits.trim()) {
      Alert.alert('Error', 'Please enter outcome/benefits achieved');
      return;
    }
    
    if (!isEditMode && !afterImage) {
      Alert.alert('Error', 'Please upload after implementation image');
      return;
    }
    
    if (isEditMode && !keepExistingImage && !afterImage) {
      Alert.alert('Error', 'Please upload after implementation image or keep existing one');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();

      const apiUrl = EDIT_IMPLEMENTATION_URL(ideaDetail.id);

      formData.append('IdeaId', ideaDetail.id);
      formData.append('Implementation', implementationDetails.trim());
      formData.append('Outcome', outcomesBenefits.trim());

      if (!keepExistingImage && afterImage && afterImageName) {
        let fileUri = afterImage;
        
        if (Platform.OS === 'android' && 
            !fileUri.startsWith('file://') && 
            !fileUri.startsWith('content://')) {
          fileUri = `file://${fileUri}`;
        }

        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          Alert.alert('File Error', 'Image file not found!');
          setIsSubmitting(false);
          return;
        }

        let mimeType = 'application/octet-stream';
        const ext = afterImageName.split('.').pop()?.toLowerCase();
        
        if (ext === 'pdf') mimeType = 'application/pdf';
        else if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';

        const cleanName = afterImageName.replace(/[^a-zA-Z0-9._-]/g, '_');

        formData.append('AfterImplementationImage', {
          uri: fileInfo.uri,
          type: mimeType,
          name: cleanName,
        });
      }

      const response = await axios.put(apiUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success) {
        Alert.alert(
          'Success',
          response.data?.message || 'Implementation updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                if (route.params?.onSuccess) {
                  route.params.onSuccess();
                }
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Error',
          response.data?.message || 'Failed to update implementation'
        );
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      
      let errorMessage = 'Failed to update implementation.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleZoomIn = () => { setImageScale(prev => Math.min(prev + 0.2, 3)); };
  const handleZoomOut = () => { setImageScale(prev => Math.max(prev - 0.2, 0.5)); };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c5aa0" />
        <Text style={styles.loadingText}>Loading idea details...</Text>
      </View>
    );
  }

  if (!ideaDetail) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <Text style={styles.errorText}>Idea details not found</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Implementation Details</Text>
        <TouchableOpacity 
          style={styles.timelineButton}
          onPress={() => setShowTimelineModal(true)}
        >
          <Ionicons name="time-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Employee Information - Collapsible */}
        <TouchableOpacity 
          style={styles.collapsibleHeader} 
          onPress={() => setEmployeeInfoExpanded(!employeeInfoExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.collapsibleHeaderText}>Employee Information</Text>
          <Ionicons 
            name={employeeInfoExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#2c5aa0" 
          />
        </TouchableOpacity>
        
        {employeeInfoExpanded && (
          <View style={styles.cardDetail}>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Employee Name:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerName || "N/A"}</Text>
            </View>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Employee Number:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerEmployeeNo || "N/A"}</Text>
            </View>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Employee Email:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerEmail || "N/A"}</Text>
            </View>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Department:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerDepartment || "N/A"}</Text>
            </View>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Mobile:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.mobileNumber || "N/A"}</Text>
            </View>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Reporting Manager:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.reportingManagerName || "N/A"}</Text>
            </View>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Manager Email:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.managerEmail || "N/A"}</Text>
            </View>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Employee Location:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.location || "N/A"}</Text>
            </View>
            <View style={styles.rowDetail}>
              <Text style={styles.labelDetail}>Sub Department:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerSubDepartment || "N/A"}</Text>
            </View>
          </View>
        )}

        {/* Idea Information - Collapsible */}
        <TouchableOpacity 
          style={styles.collapsibleHeader} 
          onPress={() => setIdeaInfoExpanded(!ideaInfoExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.collapsibleHeaderText}>Idea Information</Text>
          <Ionicons 
            name={ideaInfoExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#2c5aa0" 
          />
        </TouchableOpacity>

        {ideaInfoExpanded && (
          <View style={styles.cardDetail}>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Idea No:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.ideaNumber || "N/A"}</Text>
            </View>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Solution Category:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.solutionCategory || "N/A"}</Text>
            </View>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Creation Date:</Text>
              <Text style={styles.valueDetail}>{formatDate(ideaDetail.ideaCreationDate)}</Text>
            </View>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Planned Completion:</Text>
              <Text style={styles.valueDetail}>{formatDate(ideaDetail.plannedImplementationDuration)}</Text>
            </View>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Status:</Text>
              <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(ideaDetail.ideaStatus) }]}>
                {ideaDetail.ideaStatus || "N/A"}
              </Text>
            </View>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Description:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.ideaDescription || "N/A"}</Text>
            </View>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Proposed Solution:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.proposedSolution || "N/A"}</Text>
            </View>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Process Improvement:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.tentativeBenefit || "N/A"}</Text>
            </View>
            <View style={styles.rowDetailWithBorder}>
              <Text style={styles.labelDetail}>Team Members:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.teamMembers || "N/A"}</Text>
            </View>
            <View style={styles.rowDetail}>
              <Text style={styles.labelDetail}>Idea Theme:</Text>
              <Text style={styles.valueDetail}>{ideaDetail.ideaTheme || "N/A"}</Text>
            </View>
          </View>
        )}

        {/* Before Implementation Image */}
        {ideaDetail.beforeImplementationImagePath && (
          <View style={styles.cardDetail}>
            <Text style={styles.cardHeading}>Before Implementation</Text>
            <Image 
              source={{ uri: normalizeImagePath(ideaDetail.beforeImplementationImagePath) }} 
              style={styles.beforeImage} 
              resizeMode="cover"
            />
          </View>
        )}

        {/* Remarks */}
        <View style={styles.cardDetail}>
          <Text style={styles.cardHeading}>Remarks</Text>
          {(() => {
            const remarks = parseRemarks(ideaDetail.remarks || ideaDetail.remark);
            if (remarks.length === 0) {
              return <Text style={styles.noRemarksText}>No remarks available</Text>;
            }
            return remarks.map((remark, index) => (
              <RemarksCard
                key={index}
                title={remark.approverName || remark.title || "Unknown"}
                comment={remark.comments || remark.comment || "No comment"}
                date={remark.approvalDate || remark.date ? formatDateTime(remark.approvalDate || remark.date) : ""}
              />
            ));
          })()}
        </View>

        {/* Implementation Form */}
        <View style={styles.cardDetail}>
          <Text style={styles.cardHeading}>
            {isEditMode ? 'Edit Implementation Details' : 'Submit Implementation Details'}
          </Text>

          <View style={styles.rowDetailWithBorder}>
            <Text style={styles.labelDetail}>
              Implementation Details<Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
          <TextInput
            style={styles.textInputArea}
            multiline
            numberOfLines={5}
            value={implementationDetails}
            onChangeText={setImplementationDetails}
            placeholder="Enter implementation details..."
            placeholderTextColor="#999"
          />

          <View style={[styles.rowDetailWithBorder, { marginTop: 16 }]}>
            <Text style={styles.labelDetail}>
              Outcome/Benefits Achieved<Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
          <TextInput
            style={styles.textInputArea}
            multiline
            numberOfLines={5}
            value={outcomesBenefits}
            onChangeText={setOutcomesBenefits}
            placeholder="Enter outcome/benefits achieved..."
            placeholderTextColor="#999"
          />

          <View style={[styles.rowDetailWithBorder, { marginTop: 16 }]}>
            <Text style={styles.labelDetail}>
              After Implementation Image<Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>

          {isEditMode && existingImageUrl && (
            <View style={styles.existingImageContainer}>
              <TouchableOpacity onPress={() => {
                setShowImagePreview(true);
              }}>
                <Image
                  source={{ uri: existingImageUrl }}
                  style={styles.existingImageThumbnail}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setKeepExistingImage(!keepExistingImage)}
                style={styles.checkboxButton}
              >
                <Ionicons
                  name={keepExistingImage ? 'checkbox' : 'square-outline'}
                  size={24}
                  color="#2196F3"
                />
                <Text style={styles.checkboxLabel}>Keep existing image</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.fileInputRow}>
            <TouchableOpacity
              style={styles.chooseFileButton}
              onPress={() => setShowFileOptions(true)}
              disabled={keepExistingImage}
            >
              <Text style={styles.chooseFileText}>
                {keepExistingImage ? 'Using Existing' : 'Choose File'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.fileNameDisplay}>
              {keepExistingImage 
                ? 'Existing image will be kept' 
                : (afterImageName || 'No file chosen')}
            </Text>
          </View>

          {afterImage && afterImageType === 'image' && !keepExistingImage && (
            <TouchableOpacity onPress={() => setShowImagePreview(true)} style={styles.eyeIconContainer}>
              <Feather name="eye" size={20} color="#2196F3" />
              <Text style={styles.previewText}>Preview Image</Text>
            </TouchableOpacity>
          )}

          {afterImage && afterImageType === 'pdf' && !keepExistingImage && (
            <View style={styles.pdfInfoContainer}>
              <Feather name="file-text" size={20} color="#FF5722" />
              <Text style={styles.pdfInfoText}>PDF Selected</Text>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Update Implementation' : 'Submit Implementation'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* File Options Modal */}
      <Modal visible={showFileOptions} transparent={true} animationType="slide">
        <View style={styles.imageOptionsContainer}>
          <View style={styles.imageOptionsContent}>
            <Text style={styles.imageOptionsTitle}>Choose File Source</Text>
            
            <TouchableOpacity style={styles.imageOptionButton} onPress={pickImageFromCamera}>
              <Feather name="camera" size={24} color="#2196F3" />
              <Text style={styles.imageOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.imageOptionButton} onPress={pickImageFromGallery}>
              <Feather name="image" size={24} color="#4CAF50" />
              <Text style={styles.imageOptionText}>Choose Image from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.imageOptionButton} onPress={pickPDF}>
              <Feather name="file-text" size={24} color="#FF5722" />
              <Text style={styles.imageOptionText}>Choose PDF Document</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.imageOptionButton, styles.cancelButton]}
              onPress={() => setShowFileOptions(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Preview Modal */}
      <Modal visible={showImagePreview} transparent animationType="fade">
        <View style={styles.imagePreviewModal}>
          <View style={styles.imagePreviewHeader}>
            <TouchableOpacity onPress={() => setShowImagePreview(false)}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={styles.zoomControls}>
              <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
                <Ionicons name="remove" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.zoomText}>{Math.round(imageScale * 100)}%</Text>
              <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.imageScrollContent} maximumZoomScale={3} minimumZoomScale={0.5}>
            {(afterImage || existingImageUrl) && (
              <Image 
                source={{ uri: afterImage || existingImageUrl }} 
                style={[styles.fullImagePreview, { transform: [{ scale: imageScale }] }]} 
                resizeMode="contain" 
              />
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Timeline Modal */}
      <Modal visible={showTimelineModal} animationType="slide">
        <View style={styles.timelineModal}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineHeaderTitle}>Progress Timeline</Text>
            <TouchableOpacity
              style={styles.timelineCloseButton}
              onPress={() => setShowTimelineModal(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.timelineScrollContent}>
            <View style={styles.timelineContainer}>
              {ideaDetail?.timeline && Array.isArray(ideaDetail.timeline) && ideaDetail.timeline.length > 0 ? (
                ideaDetail.timeline.map((item, idx) => (
                  <TimelineItem
                    key={idx}
                    status={item.status || item.approvalStage || "N/A"}
                    date={item.date || item.approvalDate}
                    description={item.description || item.comments}
                    isLast={idx === ideaDetail.timeline.length - 1}
                  />
                ))
              ) : (
                <View style={styles.noTimelineContainer}>
                  <Ionicons name="time-outline" size={48} color="#ccc" />
                  <Text style={styles.noTimelineText}>No timeline data available</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { marginTop: 12, fontSize: 16, color: '#666', textAlign: 'center' },
  goBackButton: { marginTop: 20, backgroundColor: '#2c5aa0', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  goBackText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  header: { 
    backgroundColor: '#0f4c5c', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 16,
    paddingTop: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: { padding: 8 },
  headerTitle: { 
    flex: 1, 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginLeft: 12,
    textAlign: 'center'
  },
  timelineButton: { padding: 8 },
  scrollContent: { padding: 16, paddingBottom: 30 },
  collapsibleHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 8, 
    marginBottom: 8, 
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  collapsibleHeaderText: { fontSize: 16, fontWeight: '600', color: '#2c5aa0' },
  cardDetail: { 
    backgroundColor: "#fff", 
    padding: 16, 
    borderRadius: 10, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: "#E0E0E0", 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeading: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#2c5aa0" },
  rowDetail: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, alignItems: 'flex-start' },
  rowDetailWithBorder: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingBottom: 10, 
    marginBottom: 10, 
    alignItems: 'flex-start', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0' 
  },
  labelDetail: { fontWeight: "600", color: "#555", width: "45%", fontSize: 14 },
  valueDetail: { color: "#222", width: "50%", textAlign: "right", fontSize: 14 },
  statusBadge: { 
    color: "#fff", 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 12, 
    fontSize: 11, 
    fontWeight: '600', 
    maxWidth: 200, 
    textAlign: 'center' 
  },
  beforeImage: { width: '100%', height: 200, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  remarkCard: { 
    backgroundColor: '#f8f9fa', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 10, 
    borderLeftWidth: 3, 
    borderLeftColor: '#2c5aa0' 
  },
  remarkTitle: { fontSize: 15, fontWeight: 'bold', color: '#2c5aa0', marginBottom: 6 },
  remarkComment: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 6 },
  remarkDate: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  noRemarksText: { textAlign: 'center', color: '#999', fontSize: 14, fontStyle: 'italic', paddingVertical: 10 },
  requiredStar: { color: '#F44336', fontSize: 16 },
  textInputArea: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 6, 
    padding: 12, 
    fontSize: 14, 
    color: '#333', 
    backgroundColor: '#fafafa', 
    textAlignVertical: 'top', 
    minHeight: 100 
  },
  existingImageContainer: { 
    marginVertical: 12, 
    padding: 12, 
    backgroundColor: '#f8f9fa', 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  existingImageThumbnail: { 
    width: '100%', 
    height: 150, 
    borderRadius: 8, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  checkboxButton: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: 8
  },
  checkboxLabel: { marginLeft: 8, fontSize: 14, color: '#333', fontWeight: '500' },
  fileInputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0F2F5', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    overflow: 'hidden',
    marginVertical: 8
  },
  chooseFileButton: { 
    backgroundColor: '#e0e0e0', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRightWidth: 1, 
    borderRightColor: '#ccc'
  },
  chooseFileText: { color: '#333', fontSize: 14, fontWeight: '500' },
  fileNameDisplay: { 
    flex: 1, 
    paddingHorizontal: 12, 
    color: '#666', 
    fontSize: 13 
  },
  eyeIconContainer: { 
    marginTop: 8, 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start' 
  },
  previewText: { marginLeft: 6, color: '#2196F3', fontSize: 14, fontWeight: '500' },
  pdfInfoContainer: { 
    marginTop: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF3E0', 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderRadius: 8, 
    borderWidth: 1,
    borderColor: '#FFE0B2'
  },
  pdfInfoText: { marginLeft: 8, color: '#FF5722', fontSize: 13, fontWeight: '500' },
  submitButton: { 
    backgroundColor: '#1976D2', 
    paddingVertical: 14, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 8,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  submitButtonDisabled: { backgroundColor: '#9E9E9E' },
  imageOptionsContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  imageOptionsContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20, 
    paddingBottom: 40 
  },
  imageOptionsTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  imageOptionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0F2F5', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12 
  },
  imageOptionText: { 
    fontSize: 16, 
    color: '#333', 
    fontWeight: '600', 
    marginLeft: 15 
  },
  cancelButton: { 
    backgroundColor: '#FFE5E5', 
    marginTop: 10, 
    justifyContent: 'center' 
  },
  cancelButtonText: { 
    fontSize: 16, 
    color: '#FF3B30', 
    fontWeight: '600', 
    textAlign: 'center' 
  },
  imagePreviewModal: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.95)'
  },
  imagePreviewHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 50, 
    paddingBottom: 15 
  },
  zoomControls: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 20, 
    paddingHorizontal: 10, 
    paddingVertical: 5 
  },
  zoomButton: { padding: 8 },
  zoomText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginHorizontal: 15, 
    minWidth: 50, 
    textAlign: 'center' 
  },
  imageScrollContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  fullImagePreview: { 
    width: 350, 
    height: 500 
  },
  timelineModal: { flex: 1, backgroundColor: '#f5f5f5' },
  timelineHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#2c5aa0', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    paddingTop: 50,
    elevation: 4 
  },
  timelineHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  timelineCloseButton: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 18, 
    width: 36, 
    height: 36, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  timelineScrollContent: { padding: 16 },
  timelineContainer: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#E0E0E0' 
  },
  timelineItem: { flexDirection: "row", marginBottom: 20 },
  timelineLeft: { alignItems: "center", marginRight: 15, width: 20 },
  timelineCircle: { 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    borderWidth: 3, 
    borderColor: "#fff", 
    elevation: 2 
  },
  timelineLine: { width: 3, backgroundColor: "#E0E0E0", flex: 1, marginTop: 4 },
  timelineContent: { flex: 1, paddingBottom: 5 },
  timelineStatus: { fontSize: 15, fontWeight: "bold", color: "#333", marginBottom: 4 },
  timelineDescription: { fontSize: 13, color: "#666", marginBottom: 6, lineHeight: 18 },
  timelineDate: { fontSize: 12, color: "#999", fontStyle: "italic" },
  noTimelineContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 40 
  },
  noTimelineText: { 
    color: "#999", 
    textAlign: "center", 
    marginTop: 10, 
    fontSize: 15, 
    fontStyle: 'italic' 
  },
});