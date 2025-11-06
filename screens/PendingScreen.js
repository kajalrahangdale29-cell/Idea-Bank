import React, { useEffect, useState } from "react";
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
} from "react-native";
import { Ionicons, Feather } from '@expo/vector-icons';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { 
  PENDING_APPROVALS_URL, 
  IDEA_DETAIL_URL, 
  UPDATE_STATUS_URL,
  SUBMIT_URL
} from "../src/context/api";

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
    <View style={{ flexDirection: "row", marginBottom: 12 }}>
      <View style={{ alignItems: "center", marginRight: 12 }}>
        <View style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: getCircleColor(status),
          borderWidth: 2,
          borderColor: "#fff",
        }} />
        {!isLast && <View style={{ width: 2, flex: 1, backgroundColor: "#E0E0E0", marginTop: 2 }} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "bold", fontSize: 14, color: "#333" }}>{status}</Text>
        {description && <Text style={{ fontSize: 12, color: "#555", marginVertical: 2 }}>{description}</Text>}
        {date && <Text style={{ fontSize: 11, color: "#999" }}>{formatDateTime(date)}</Text>}
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

const getStatusColor = (status) => {
  if (!status) return "gray";
  const s = status.toLowerCase();
  if (s === "draft") return "#2196F3";
  if (s === "published") return "#4CAF50";
  if (s === "closed") return "#00ACC1";
  if (s === "pending") return "#FF9800";
  if (s.includes("approval")) return "#FF9800";
  if (s.includes("approved by be team") || s.includes("ready for implementation")) return "#4CAF50";
  return "gray";
};

  const isImplementationPhase = (status) => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s.includes("approved by be team") || 
          s.includes("ready for implementation") || 
          s.includes("implementation");
  };

  const shouldShowImplementationDetails = (ideaDetail) => {
    if (!ideaDetail) return false;
    if (ideaDetail.implementationCycle && Object.keys(ideaDetail.implementationCycle).length > 0) {
      return true;
    }
    const type = (ideaDetail.ideaType || ideaDetail.type || '').toLowerCase().trim();
    return type === "implementation" || type === "implement";
  };

  const parseRemarks = (remarkData) => {
    if (!remarkData) return [];
    if (Array.isArray(remarkData)) return remarkData;
    if (typeof remarkData === "object") {
      const keys = Object.keys(remarkData);
      if (keys.length > 0 && keys.every(k => !isNaN(k))) {
        return Object.values(remarkData);
      }
      return [remarkData];
    }
    return [];
  };

function ImplementationForm({ ideaDetail, onClose, refreshIdeas }) {
  const [implementationDetails, setImplementationDetails] = useState('');
  const [outcomesBenefits, setOutcomesBenefits] = useState('');
  const [afterImage, setAfterImage] = useState(null);
  const [afterImageName, setAfterImageName] = useState('');
  const [afterImageType, setAfterImageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);

  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) { 
      Alert.alert('Permission Required', 'Please allow gallery access.'); 
      return; 
    }
    let result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, 
      quality: 1 
    });
    if (!result.canceled) {
      setAfterImage(result.assets[0].uri);
      setAfterImageType('image');
      const uriParts = result.assets[0].uri.split('/');
      setAfterImageName(uriParts[uriParts.length - 1]);
      setShowFileOptions(false);
    }
  };

  const pickImageFromCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) { 
      Alert.alert('Permission Required', 'Please allow camera access.'); 
      return; 
    }
    let result = await ImagePicker.launchCameraAsync({ 
      allowsEditing: true, 
      quality: 1 
    });
    if (!result.canceled) {
      setAfterImage(result.assets[0].uri);
      setAfterImageType('image');
      const uriParts = result.assets[0].uri.split('/');
      setAfterImageName(uriParts[uriParts.length - 1]);
      setShowFileOptions(false);
    }
  };

  const pickPDF = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({ 
        type: 'application/pdf', 
        copyToCacheDirectory: true 
      });
      if (result.type === 'success' || !result.canceled) {
        const selectedFile = result.assets ? result.assets[0] : result;
        setAfterImage(selectedFile.uri);
        setAfterImageType('pdf');
        setAfterImageName(selectedFile.name);
        setShowFileOptions(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick PDF file');
    }
  };

  const handleSubmit = async () => {
    if (!implementationDetails.trim()) { 
      Alert.alert('Required Field', 'Please enter implementation details'); 
      return; 
    }
    if (!outcomesBenefits.trim()) { 
      Alert.alert('Required Field', 'Please enter outcome/benefits'); 
      return; 
    }
    if (!afterImage) { 
      Alert.alert('Required Field', 'Please upload after implementation image'); 
      return; 
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('IdeaId', ideaDetail.id);
      formData.append('Implementation', implementationDetails);
      formData.append('Outcome', outcomesBenefits);

      if (afterImage && afterImageName) {
        let fileUri = afterImage;
        if (Platform.OS === 'android' && !fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
          fileUri = `file://${fileUri}`;
        }
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          Alert.alert('File Error', 'Image file not found!');
          throw new Error('File not found');
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
          name: cleanName 
        });
      }

      const response = await axios.post(SUBMIT_URL, formData, { 
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data' 
        } 
      });

      if (response.data?.success) {
        Alert.alert('Success', 'Implementation submitted successfully!', [{
          text: 'OK',
          onPress: () => {
            refreshIdeas();
            onClose();
          }
        }]);
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to submit');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.modalScrollContent}>
      <View style={styles.cardDetail}>
        <Text style={styles.cardHeading}>Submit Implementation Details</Text>
        
        <View style={styles.rowDetailWithBorder}>
          <Text style={styles.labelDetail}>Implementation Details<Text style={styles.requiredStar}>*</Text></Text>
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
          <Text style={styles.labelDetail}>Outcome/Benefits Achieved<Text style={styles.requiredStar}>*</Text></Text>
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
          <Text style={styles.labelDetail}>After Implementation Image<Text style={styles.requiredStar}>*</Text></Text>
        </View>
        <View style={styles.fileInputRow}>
          <TouchableOpacity style={styles.chooseFileButton} onPress={() => setShowFileOptions(true)}>
            <Text style={styles.chooseFileText}>Choose File</Text>
          </TouchableOpacity>
          <Text style={styles.fileNameDisplay}>{afterImageName || 'No file chosen'}</Text>
        </View>
        
        {afterImage && afterImageType === 'pdf' && (
          <View style={styles.pdfInfoContainer}>
            <Feather name="file-text" size={20} color="#FF5722" />
            <Text style={styles.pdfInfoText}>PDF Selected</Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.submitImplementButton, isSubmitting && styles.submitButtonDisabled]} 
        onPress={handleSubmit} 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitImplementButtonText}>Submit Implementation</Text>
        )}
      </TouchableOpacity>

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
              <Text style={styles.imageOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageOptionButton} onPress={pickPDF}>
              <Feather name="file-text" size={24} color="#FF5722" />
              <Text style={styles.imageOptionText}>Choose PDF</Text>
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
    </ScrollView>
  );
}

export default function PendingScreen() {
  const navigation = useNavigation();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [searchIdeaNumber, setSearchIdeaNumber] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [ideaDetail, setIdeaDetail] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remarkType, setRemarkType] = useState(""); 
  const [remarkText, setRemarkText] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const [employeeInfoExpanded, setEmployeeInfoExpanded] = useState(false);
  const [ideaInfoExpanded, setIdeaInfoExpanded] = useState(true);
  const [showImplementationDetails, setShowImplementationDetails] = useState(false);
  const [showImplementationForm, setShowImplementationForm] = useState(false);

  useEffect(() => {
    fetchIdeas();
  }, [page, searchIdeaNumber, fromDate, toDate]);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      let url = `${PENDING_APPROVALS_URL}?page=${page}&pageSize=${pageSize}`;
      if (searchIdeaNumber.trim()) {
        url += `&ideaNumber=${searchIdeaNumber.trim()}`;
      }
      if (fromDate) {
        url += `&fromDate=${fromDate.toISOString().split('T')[0]}`;
      }
      if (toDate) {
        url += `&toDate=${toDate.toISOString().split('T')[0]}`;
      }

      const response = await axios.get(url, {
        headers: authHeaders,
      });

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.items)
      ) {
        const items = response.data.data.items;
        setIdeas(items);
        setTotalItems(items.length);
      } else {
        setIdeas([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert("Error", "Failed to load pending ideas.");
    } finally {
      setLoading(false);
    }
  };

  const fetchIdeaDetail = async (ideaId) => {
    if (!ideaId) return;
    try {
      setLoadingDetail(true);
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const { data: response } = await axios.get(`${IDEA_DETAIL_URL}/${encodeURIComponent(ideaId)}`, { headers });

      if (response?.success && response?.data) {
        setIdeaDetail(response.data);
        setSelectedIdea(response.data);
        if (shouldShowImplementationDetails(response.data)) {
          setShowImplementationDetails(true);
        }
      } else {
        Alert.alert("Error", response?.message || "Idea details not found.");
      }
    } catch (error) {
      console.error('Detail fetch error:', error);
      Alert.alert("Error", "Failed to fetch idea details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const openRemarkModal = (type) => {
    setRemarkType(type);
    setRemarkText("");
    setShowRemarkModal(true);
  };

  const closeRemarkModal = () => {
    setShowRemarkModal(false);
    setRemarkType("");
    setRemarkText("");
  };

  const submitStatusUpdate = async () => {
    if (!remarkText.trim()) {
      Alert.alert("Required", "Please enter a remark.");
      return;
    }
    
    const originalIdea = ideas.find(i => 
      i.ideaId === (ideaDetail?.ideaId || ideaDetail?.id) || 
      i.id === (ideaDetail?.ideaId || ideaDetail?.id)
    );

    if (!ideaDetail?.id) {
      Alert.alert("Error", "Unable to find idea. Please refresh and try again.");
      return;
    }

    setSubmittingStatus(true);

    try {
      const token = await AsyncStorage.getItem("token");
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const statusMap = {
        approve: "Approved",
        reject: "Rejected",
        hold: "On Hold"
      };

      const formData = new FormData();
      formData.append('id', ideaDetail.id.toString());
      formData.append('status', statusMap[remarkType]);
      formData.append('approvalstage', originalIdea?.approvalStage || 'Manager');
      formData.append('comments', remarkText.trim());

      const response = await axios.post(UPDATE_STATUS_URL, formData, {
        headers: {
          ...authHeaders,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && (response.data.success === true || response.status === 200)) {
        Alert.alert(
          "Success",
          response.data.message || `Idea ${remarkType}d successfully!`,
          [
            {
              text: "OK",
              onPress: () => {
                closeRemarkModal();
                closeModal();
                fetchIdeas();
              }
            }
          ]
        );
      } else {
        throw new Error(response.data?.message || "Failed to update status");
      }
    } catch (error) {
      console.error('Status update error:', error);
      let errorMessage = "Failed to update status.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleApprove = () => openRemarkModal("approve");
  const handleReject = () => openRemarkModal("reject");
  const handleHold = () => openRemarkModal("hold");

  const handleEdit = () => {
    if (!ideaDetail) {
      Alert.alert('Error', 'Idea details not loaded');
      return;
    }
    const ideaIdFromDetail = ideaDetail.id || ideaDetail.ideaId;
    const originalIdea = ideas.find(i => i.ideaId === ideaIdFromDetail);
  
    const hasImplementationCycle = !!ideaDetail.implementationCycle;
  
    if (hasImplementationCycle) {
      closeModal();
      setTimeout(() => {
        navigation.navigate('ImplementationDetails', {
          ideaId: ideaIdFromDetail,
          ideaData: ideaDetail,
          onSuccess: () => {
            fetchIdeas();
          }
        });
      }, 100);
    } else {
      closeModal();
      setTimeout(() => {
        navigation.navigate('ManagerEditIdea', { 
          ideaId: ideaIdFromDetail,
          ideaData: ideaDetail,
          onSuccess: () => {
            fetchIdeas();
          }
        });
      }, 100);
    }
  };
  


  const applyFilters = () => {
    fetchIdeas();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchIdeaNumber("");
    setFromDate(null);
    setToDate(null);
    setPage(1);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxButtonsToShow = 5;
    const pageButtons = [];
    
    let startPage = Math.max(1, page - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);
    
    if (endPage - startPage < maxButtonsToShow - 1) {
      startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <TouchableOpacity
          key={i}
          style={[styles.pageButton, page === i && styles.pageButtonActive]}
          onPress={() => setPage(i)}
        >
          <Text style={page === i ? styles.pageButtonTextActive : styles.pageButtonText}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          disabled={page === 1}
          onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
          style={[styles.pageButton, page === 1 && { opacity: 0.5 }]}
        >
          <Text style={styles.pageButtonText}>Previous</Text>
        </TouchableOpacity>

        {startPage > 1 && (
          <>
            <TouchableOpacity style={styles.pageButton} onPress={() => setPage(1)}>
              <Text style={styles.pageButtonText}>1</Text>
            </TouchableOpacity>
            {startPage > 2 && <Text style={styles.pageButtonText}>...</Text>}
          </>
        )}

        {pageButtons}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <Text style={styles.pageButtonText}>...</Text>}
            <TouchableOpacity style={styles.pageButton} onPress={() => setPage(totalPages)}>
              <Text style={styles.pageButtonText}>{totalPages}</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          disabled={page === totalPages}
          onPress={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          style={[styles.pageButton, page === totalPages && { opacity: 0.5 }]}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </TouchableOpacity>
        
        <View style={styles.pageInfo}>
          <Text style={styles.pageInfoText}>
            Page {page} of {totalPages} ({totalItems} items)
          </Text>
        </View>
      </View>
    );
  };

  const getRemarkModalTitle = () => {
    if (remarkType === "approve") return "Enter Remark for Approved";
    if (remarkType === "reject") return "Enter Remark for Rejected";
    if (remarkType === "hold") return "Enter Remark for On Hold";
    return "Enter Remark";
  };

  const closeModal = () => {
    setSelectedIdea(null);
    setIdeaDetail(null);
    setEmployeeInfoExpanded(false);
    setIdeaInfoExpanded(true);
    setShowImplementationDetails(false);
    setShowImplementationForm(false); 
  };

  const openImagePreview = (imageUrl) => {
    setCurrentImageUrl(imageUrl);
    setShowImage(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pending Approvals</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterButtonText}>{showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}</Text>
          <Text style={styles.filterArrow}>{showFilters ? "▲" : "▼"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Search:</Text>
          <TextInput
            placeholder="Idea Number / Owner / Description"
            style={styles.searchInput}
            value={searchIdeaNumber}
            onChangeText={(text) => setSearchIdeaNumber(text)}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Create Date Range</Text>

          <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromPicker(true)}>
            <Text style={styles.dateInputText}>{fromDate ? fromDate.toLocaleDateString() : "Select From Date"}</Text>
          </TouchableOpacity>
          {showFromPicker && (
            <DateTimePicker
              value={fromDate || new Date()}
              mode="date"
              display="default"
              onChange={(e, date) => { 
                setShowFromPicker(false); 
                if (date) { 
                  setFromDate(date); 
                  if (toDate && date > toDate) { 
                    setToDate(null) 
                  } 
                } 
              }}
              maximumDate={toDate || undefined}
            />
          )}

          <TouchableOpacity style={styles.dateInput} onPress={() => setShowToPicker(true)}>
            <Text style={styles.dateInputText}>{toDate ? toDate.toLocaleDateString() : "Select To Date"}</Text>
          </TouchableOpacity>
          {showToPicker && (
            <DateTimePicker
              value={toDate || (fromDate || new Date())}
              mode="date"
              display="default"
              onChange={(e, date) => { 
                setShowToPicker(false); 
                if (date) { 
                  setToDate(date) 
                } 
              }}
              minimumDate={fromDate || undefined}
            />
          )}

          <View style={styles.filterButtons}>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
              <Text style={styles.btnText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetBtn} onPress={clearFilters}>
              <Text style={styles.btnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#2c5aa0" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {ideas.length === 0 ? (
            <Text style={styles.noDataText}>No pending approvals found.</Text>
          ) : (
            <>
              {ideas.map((idea, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  style={styles.cardContainer}
                  onPress={() => fetchIdeaDetail(idea.ideaId || idea.id)}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.ideaNumber} numberOfLines={2}>{idea.ideaNumber || "N/A"}</Text>
                    <View style={styles.typeTag}>
                      <Text style={styles.typeText}>{idea.type || "N/A"}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.cardContent}>
                    <View style={styles.rowDetail}>
                      <Text style={styles.label}>Description:</Text>
                      <Text style={styles.value} numberOfLines={2}>{idea.description || "N/A"}</Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Owner:</Text>
                      <Text style={styles.value}>{idea.ownerName || "N/A"}</Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Created:</Text>
                      <Text style={styles.value}>{formatDate(idea.creationDate)}</Text>
                    </View>

                    <View style={styles.rowDetail}>
                      <Text style={styles.label}>Status:</Text>
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(idea.status) }]} numberOfLines={2}>
                          {idea.status || "N/A"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total Ideas: {totalItems}</Text>
              </View>
            </>
          )}
        </ScrollView>
      )}

      {renderPagination()}

      {loadingDetail && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2c5aa0" />
        </View>
      )}
      <Modal visible={showImplementationForm && !!selectedIdea} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalHeaderTitle}>Submit Implementation</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => {
                  setShowImplementationForm(false);
                  closeModal();
                }}
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          <ImplementationForm 
            ideaDetail={ideaDetail} 
            onClose={() => {
              setShowImplementationForm(false);
              closeModal();
            }} 
            refreshIdeas={fetchIdeas} 
          />
        </View>
      </Modal>

      <Modal visible={!!selectedIdea && !showImplementationForm} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalHeaderTitle}>Idea Details</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.timelineButtonHeader}
              onPress={() => setShowTimelineModal(true)}
            >
              <Ionicons name="time-outline" size={18} color="#2c5aa0" />
              <Text style={styles.timelineButtonText}>View Progress Timeline</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            {selectedIdea && ideaDetail && (
              <>
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
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Employee Name:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaOwnerName || "N/A"}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Employee Number:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaOwnerEmployeeNo || "N/A"}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Employee Email:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaOwnerEmail || "N/A"}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Department:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaOwnerDepartment || "N/A"}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Mobile:</Text><Text style={styles.valueDetail}>{ideaDetail.mobileNumber || "N/A"}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Reporting Manager:</Text><Text style={styles.valueDetail}>{ideaDetail.reportingManagerName || "N/A"}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Manager Email:</Text><Text style={styles.valueDetail}>{ideaDetail.managerEmail || "N/A"}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Employee Location:</Text><Text style={styles.valueDetail}>{ideaDetail.location || "N/A"}</Text></View>
                    <View style={styles.rowDetail}><Text style={styles.labelDetail}>Sub Department:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaOwnerSubDepartment || "N/A"}</Text></View>
                  </View>
                )}

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
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Idea No:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaNumber || "N/A"}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Solution Category:</Text><Text style={styles.valueDetail}>{ideaDetail.solutionCategory || "N/A"}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Creation Date:</Text><Text style={styles.valueDetail}>{formatDate(ideaDetail.ideaCreationDate)}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Planned Completion:</Text><Text style={styles.valueDetail}>{formatDate(ideaDetail.plannedImplementationDuration)}</Text></View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Before Implementation:</Text>
                      {(ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath) ? (
                        <TouchableOpacity 
                          style={styles.imagePreviewContainer} 
                          onPress={() => openImagePreview(ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath)}
                        >
                          <Image 
                            source={{ uri: ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath }} 
                            style={styles.thumbnailSmall} 
                          />
                          <Text style={styles.tapToEnlargeText}></Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.valueDetail}>N/A</Text>
                      )}
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Status:</Text>
                      <Text style={[styles.statusBadgeDetail, { backgroundColor: getStatusColor(ideaDetail.ideaStatus) }]}>
                        {ideaDetail.ideaStatus || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Idea Description:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaDescription || "N/A"}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Proposed Solution:</Text><Text style={styles.valueDetail}>{ideaDetail.proposedSolution || "N/A"}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Process Improvement/Cost Benefit:</Text><Text style={styles.valueDetail}>{ideaDetail.tentativeBenefit || "N/A"}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Team Members:</Text><Text style={styles.valueDetail}>{ideaDetail.teamMembers || "N/A"}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Idea Theme:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaTheme || "N/A"}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>Type:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaType || ideaDetail.type || "N/A"}</Text></View>
                    <View style={styles.rowDetailWithBorder}><Text style={styles.labelDetail}>BE Team Support Needed:</Text><Text style={styles.valueDetail}>{ideaDetail.isBETeamSupportNeeded ? "Yes" : "No"}</Text></View>
                    <View style={styles.rowDetail}><Text style={styles.labelDetail}>Can Be Implemented To Other Locations:</Text><Text style={styles.valueDetail}>{ideaDetail.canBeImplementedToOtherLocation ? "Yes" : "No"}</Text></View>
                  </View>
                )}

                {shouldShowImplementationDetails(ideaDetail) && (
                  <>
                    <TouchableOpacity 
                      style={styles.collapsibleHeader} 
                      onPress={() => setShowImplementationDetails(!showImplementationDetails)} 
                      activeOpacity={0.7}
                    >
                      <Text style={styles.collapsibleHeaderText}>Implementation Details</Text>
                      <Ionicons 
                        name={showImplementationDetails ? "chevron-up" : "chevron-down"} 
                        size={24} 
                        color="#2c5aa0" 
                      />
                    </TouchableOpacity>
                    
                    {showImplementationDetails && (
                      <View style={styles.cardDetail}>
                        <View style={styles.rowDetailWithBorder}>
                          <Text style={styles.labelDetail}>Implementation Status:</Text>
                          <Text style={[styles.statusBadgeDetail, { backgroundColor: getStatusColor(ideaDetail.implementationCycle?.status) }]}>
                            {ideaDetail.implementationCycle?.status || "N/A"}
                          </Text>
                        </View>
                        <View style={styles.rowDetailWithBorder}>
                          <Text style={styles.labelDetail}>Implementation Details:</Text>
                          <Text style={styles.valueDetail}>
                            {ideaDetail.implementationCycle?.implementation || 
                             ideaDetail.implementationDetail || 
                             ideaDetail.implementation || 
                             "Not provided"}
                          </Text>
                        </View>
                        <View style={styles.rowDetailWithBorder}>
                          <Text style={styles.labelDetail}>Outcome/Benefits:</Text>
                          <Text style={styles.valueDetail}>
                            {ideaDetail.implementationCycle?.outcome || 
                             ideaDetail.implementationOutcome || 
                             ideaDetail.outcome || 
                             "Not provided"}
                          </Text>
                        </View>
                        {(ideaDetail.implementationCycle?.startDate || ideaDetail.implementationDate) && (
                          <View style={styles.rowDetailWithBorder}>
                            <Text style={styles.labelDetail}>Completed On:</Text>
                            <Text style={styles.valueDetail}>
                              {formatDate(ideaDetail.implementationCycle?.startDate || ideaDetail.implementationDate)}
                            </Text>
                          </View>
                        )}
                        
                        {ideaDetail.implementationCycle?.beforeImplementationImagePath && (
                          <View style={styles.implementationImageSection}>
                            <Text style={styles.imageLabel}>Before Implementation:</Text>
                            <TouchableOpacity onPress={() => openImagePreview(ideaDetail.implementationCycle.beforeImplementationImagePath)}>
                              <Image 
                                source={{ uri: ideaDetail.implementationCycle.beforeImplementationImagePath }} 
                                style={styles.implementationImage} 
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                        
                        {(ideaDetail.implementationCycle?.afterImplementationImagePath || ideaDetail.afterImplementationImagePath) && (
                          <View style={styles.implementationImageSection}>
                            <Text style={styles.imageLabel}>After Implementation:</Text>
                            <TouchableOpacity onPress={() => {
                              const imagePath = ideaDetail.implementationCycle?.afterImplementationImagePath || ideaDetail.afterImplementationImagePath;
                              const fullUrl = imagePath.startsWith('http') 
                                ? imagePath 
                                : `https://ideabank-api-dev.abisaio.com${imagePath}`;
                              openImagePreview(fullUrl);
                            }}>
                              <Image 
                                source={{ 
                                  uri: (() => {
                                    const imagePath = ideaDetail.implementationCycle?.afterImplementationImagePath || ideaDetail.afterImplementationImagePath;
                                    return imagePath.startsWith('http') 
                                      ? imagePath 
                                      : `https://ideabank-api-dev.abisaio.com${imagePath}`;
                                  })()
                                }} 
                                style={styles.implementationImage} 
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </>
                )}

                <View style={styles.cardDetail}>
                  <Text style={styles.cardHeading}>Remarks</Text>
                  {(() => {
                    const remarks = parseRemarks(ideaDetail.remark || ideaDetail.remarks);
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
              </>
            )}
          </ScrollView>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>
                {(() => {
                  if (!ideaDetail) return 'Edit';
                  const ideaIdFromDetail = ideaDetail.id || ideaDetail.ideaId;
                  const originalIdea = ideas.find(i => i.ideaId === ideaIdFromDetail);
                  const ideaType = (ideaDetail?.ideaType || ideaDetail?.type || originalIdea?.type || '').toLowerCase();
                  return ideaType.includes('implementation') || ideaType.includes('implement') ? 'Implementation' : 'Edit';
                })()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
              <Ionicons name="close-circle" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.holdButton} onPress={handleHold}>
              <Ionicons name="pause-circle" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Hold</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Remark Modal */}
      <Modal visible={showRemarkModal} transparent animationType="fade">
        <View style={styles.remarkModalOverlay}>
          <View style={styles.remarkModalContainer}>
            <View style={styles.remarkModalHeader}>
              <Text style={styles.remarkModalTitle}>{getRemarkModalTitle()}</Text>
              <TouchableOpacity
                style={styles.remarkCloseButton}
                onPress={closeRemarkModal}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.remarkModalBody}>
              <Text style={styles.remarkLabel}>Remark *</Text>
              <TextInput
                style={styles.remarkTextArea}
                placeholder="Enter your remark here..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={remarkText}
                onChangeText={setRemarkText}
              />
            </View>

            <View style={styles.remarkModalFooter}>
              <TouchableOpacity
                style={styles.remarkCancelButton}
                onPress={closeRemarkModal}
                disabled={submittingStatus}
              >
                <Text style={styles.remarkCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.remarkSubmitButton}
                onPress={submitStatusUpdate}
                disabled={submittingStatus}
              >
                {submittingStatus ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.remarkSubmitText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Timeline Modal */}
      <Modal visible={showTimelineModal} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.timelineModalHeader}>
            <Text style={styles.timelineModalTitle}>Progress Timeline</Text>
            <TouchableOpacity
              style={styles.closeButtonTimeline}
              onPress={() => setShowTimelineModal(false)}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.timelineCardContainer}>
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
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal visible={showImage} transparent animationType="fade">
        <View style={styles.imageModal}>
          <TouchableOpacity
            style={styles.closeButtonImage}
            onPress={() => { setShowImage(false); setCurrentImageUrl(null); }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          {currentImageUrl ? (
            <Image
              source={{ uri: currentImageUrl }}
              style={styles.fullImage}
              resizeMode="contain"
              onError={(e) => Alert.alert('Error', 'Failed to load image')}
            />
          ) : (
            <Text style={{ color: '#fff' }}>No image available</Text>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  filterButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#e8e8e8', borderRadius: 4 },
  filterButtonText: { fontSize: 11, color: '#000', marginRight: 6, fontWeight: '600' },
  filterArrow: { fontSize: 10, color: '#000', fontWeight: 'bold' },
  searchSection: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  searchLabel: { fontSize: 16, color: '#333', marginRight: 8, fontWeight: '500' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, backgroundColor: '#fff' },
  filtersContainer: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  filterLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' },
  dateInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, backgroundColor: '#f9f9f9', marginBottom: 10 },
  dateInputText: { fontSize: 14, color: '#333' },
  filterButtons: { flexDirection: 'row', marginTop: 12 },
  applyBtn: { flex: 1, backgroundColor: '#0A5064', padding: 12, borderRadius: 6, alignItems: 'center', marginRight: 8 },
  resetBtn: { flex: 1, backgroundColor: '#6c757d', padding: 12, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  scrollContainer: { padding: 16, paddingBottom: 30 },
  cardContainer: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { backgroundColor: '#2c5aa0', padding: 12, borderTopLeftRadius: 8, borderTopRightRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  ideaNumber: { color: '#fff', fontSize: 14, fontWeight: 'bold', flex: 1, marginRight: 8 },
  typeTag: { backgroundColor: '#f0ad4e', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  typeText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  cardContent: { padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
  rowDetail: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, alignItems: 'flex-start' },
  rowDetailWithBorder: { flexDirection: "row", justifyContent: "space-between", paddingBottom: 10, marginBottom: 10, alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label: { color: '#555', fontWeight: '500', fontSize: 14 },
  value: { color: '#333', fontSize: 14, maxWidth: '65%', textAlign: 'right' },
  statusBadge: { color: "#fff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 11, fontWeight: '600', maxWidth: 200, textAlign: 'center' },
  totalContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginTop: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0' },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#2c5aa0' },
  noDataText: { textAlign: "center", marginTop: 20, color: "#777", fontSize: 16 },
  paginationContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: 15, flexWrap: "wrap", paddingBottom: 10, paddingHorizontal: 10 },
  pageButton: { marginHorizontal: 5, marginVertical: 3, backgroundColor: "#ddd", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
  pageButtonActive: { backgroundColor: "#0A5064" },
  pageButtonText: { color: "#000", fontWeight: "bold" },
  pageButtonTextActive: { color: "#fff", fontWeight: "bold" },
  pageInfo: { width: "100%", alignItems: "center", marginTop: 8 },
  pageInfoText: { fontSize: 12, color: "#666", fontWeight: "500" },
  loadingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.6)" },
  fullModal: { flex: 1, backgroundColor: "#f5f5f5" },
  modalHeader: { backgroundColor: '#fff', paddingTop: 24, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', elevation: 4 },
  modalHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c5aa0' },
  closeButton: { backgroundColor: '#f0f0f0', borderRadius: 18, width: 32, height: 32, justifyContent: "center", alignItems: "center" },
  timelineButtonHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e3f2fd', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2c5aa0' },
  timelineButtonText: { color: '#2c5aa0', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  modalScrollContent: { padding: 16, paddingBottom: 30 },
  cardDetail: { backgroundColor: "#fff", padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2 },
  cardHeading: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#2c5aa0" },
  labelDetail: { fontWeight: "600", color: "#555", width: "45%", fontSize: 14 },
  valueDetail: { color: "#222", width: "50%", textAlign: "right", fontSize: 14 },
  statusBadgeDetail: { color: "#fff", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, fontSize: 11, fontWeight: '600', maxWidth: 200, textAlign: 'center' },
  imagePreviewContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  thumbnailSmall: { width: 60, height: 60, borderRadius: 6, borderWidth: 1, borderColor: '#ddd' },
  tapToEnlargeText: { color: '#2196F3', fontSize: 12, fontWeight: '500' },
  implementationImageSection: { marginTop: 12, marginBottom: 12 },
  imageLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
  implementationImage: { width: '100%', height: 200, borderRadius: 8, resizeMode: 'cover', borderWidth: 1, borderColor: '#ddd' },
  remarkCard: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#2c5aa0' },
  remarkTitle: { fontSize: 15, fontWeight: 'bold', color: '#2c5aa0', marginBottom: 6 },
  remarkComment: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 6 },
  remarkDate: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  noRemarksText: { textAlign: 'center', color: '#999', fontSize: 14, fontStyle: 'italic', paddingVertical: 10 },
  timelineModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c5aa0', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 40, elevation: 4 },
  timelineModalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  closeButtonTimeline: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18, width: 32, height: 32, justifyContent: "center", alignItems: "center" },
  timelineCardContainer: { backgroundColor: "#fff", padding: 16, borderRadius: 10, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2 },
  timelineContainer: { paddingLeft: 4, paddingTop: 4 },
  noTimelineContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  noTimelineText: { color: "#999", textAlign: "center", marginTop: 10, fontSize: 15, fontStyle: 'italic' },
  imageModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
  closeButtonImage: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 22, width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  fullImage: { width: "90%", height: "70%" },
  actionButtonsContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    paddingHorizontal: 12, 
    paddingVertical: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#e0e0e0', 
    elevation: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    gap: 8 
  },
  editButton: { 
    flex: 1, 
    backgroundColor: '#607D8B', 
    paddingVertical: 10, 
    borderRadius: 6, 
    alignItems: 'center', 
    justifyContent: 'center', 
    flexDirection: 'row', 
    gap: 4, 
    elevation: 2 
  },
  approveButton: { 
    flex: 1, 
    backgroundColor: '#4CAF50', 
    paddingVertical: 10, 
    borderRadius: 6, 
    alignItems: 'center', 
    justifyContent: 'center', 
    flexDirection: 'row', 
    gap: 4, 
    elevation: 2 
  },
  rejectButton: { 
    flex: 1, 
    backgroundColor: '#F44336', 
    paddingVertical: 10, 
    borderRadius: 6, 
    alignItems: 'center', 
    justifyContent: 'center', 
    flexDirection: 'row', 
    gap: 4, 
    elevation: 2 
  },
  holdButton: { 
    flex: 1, 
    backgroundColor: '#FFC107', 
    paddingVertical: 10, 
    borderRadius: 6, 
    alignItems: 'center', 
    justifyContent: 'center', 
    flexDirection: 'row', 
    gap: 4, 
    elevation: 2 
  },
  actionButtonText: { 
    color: '#fff', 
    fontSize: 11, 
    fontWeight: 'bold', 
    textTransform: 'uppercase' 
  },
  remarkModalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  remarkModalContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    width: '100%', 
    maxWidth: 500, 
    overflow: 'hidden', 
    elevation: 5 
  },
  remarkModalHeader: { 
    backgroundColor: '#2c5aa0', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16 
  },
  remarkModalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff', 
    flex: 1 
  },
  remarkCloseButton: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 15, 
    width: 30, 
    height: 30, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  remarkModalBody: { 
    padding: 20 
  },
  remarkLabel: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333', 
    marginBottom: 10 
  },
  remarkTextArea: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 14, 
    color: '#333', 
    minHeight: 120, 
    backgroundColor: '#f9f9f9' 
  },
  remarkModalFooter: { 
    flexDirection: 'row', 
    padding: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#e0e0e0', 
    gap: 10 
  },
  remarkCancelButton: { 
    flex: 1, 
    backgroundColor: '#6c757d', 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  remarkCancelText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  remarkSubmitButton: { 
    flex: 1, 
    backgroundColor: '#2c5aa0', 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  remarkSubmitText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '600' 
  },
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
    shadowRadius: 2 
  },
  collapsibleHeaderText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#2c5aa0' 
  },
  requiredStar: { 
    color: '#F44336', 
    fontSize: 16 
  },
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
  fileInputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0F2F5', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    overflow: 'hidden' 
  },
  chooseFileButton: { 
    backgroundColor: '#e0e0e0', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRightWidth: 1, 
    borderRightColor: '#ccc' 
  },
  chooseFileText: { 
    color: '#333', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  fileNameDisplay: { 
    flex: 1, 
    paddingHorizontal: 12, 
    color: '#666', 
    fontSize: 14 
  },
  pdfInfoContainer: { 
    marginTop: 8, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF3E0', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 6, 
    alignSelf: 'flex-start' 
  },
  pdfInfoText: { 
    marginLeft: 8, 
    color: '#FF5722', 
    fontSize: 14, 
    fontWeight: '500' 
  },
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
  submitImplementButton: { 
    backgroundColor: '#1976D2', 
    paddingVertical: 14, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 16, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 3 
  },
  submitImplementButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  submitButtonDisabled: { 
    backgroundColor: '#9E9E9E' 
  },
});