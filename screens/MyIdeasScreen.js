import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator, TextInput, Vibration, Platform, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useRoute, useNavigation } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MY_IDEAS_URL, IDEA_DETAIL_URL, DELETE_IDEA_URL, SUBMIT_URL, EDIT_IMPLEMENTATION_URL } from '../src/context/api';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const Tab = createMaterialTopTabNavigator();

const normalizeImagePath = (path) => {
  if (!path) return null;

  let cleanPath = path;
  const basePattern = 'https://ideabank-api-dev.abisaio.com';

  const occurrences = (cleanPath.match(new RegExp(basePattern, 'g')) || []).length;

  if (occurrences > 1) {
    const lastIndex = cleanPath.lastIndexOf(basePattern);
    cleanPath = basePattern + cleanPath.substring(lastIndex + basePattern.length);
  }

  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  const BASE_URL = 'https://ideabank-api-dev.abisaio.com';
  const fullUrl = `${BASE_URL}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
  return fullUrl;
};

const getAlternateImageUrl = (url) => {
  if (!url) return null;
  return url.replace('ideabank-api-dev.abisaio.com', 'ideabank-dev.abisaio.com');
};

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

const isImplementationPhase = (status) => {
  if (!status) return false;
  const s = status.toLowerCase();
  return s.includes("approved by be team") || s.includes("ready for implementation") || s.includes("implementation") || s.includes("approved") || s.includes("closed")    || s.includes("implementation submitted")
    || s.includes("rm approval pending"); // <--- ADD THIS LINE
};

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

const shouldShowImplementationDetails = (ideaDetail) => {
  if (!ideaDetail) return false;
  if (ideaDetail.implementationCycle && Object.keys(ideaDetail.implementationCycle).length > 0) {
    return true;
  }
  const type = (ideaDetail.ideaType || ideaDetail.type || '').toLowerCase().trim();
  return type === "implementation" || type === "implement";
};

function IdeasList({ ideas, editIdea, deleteIdea, refreshIdeas }) {
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [ideaDetail, setIdeaDetail] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showImplementationForm, setShowImplementationForm] = useState(false);
  const [isEditingImplementation, setIsEditingImplementation] = useState(false);
  const [employeeInfoExpanded, setEmployeeInfoExpanded] = useState(false);
  const [ideaInfoExpanded, setIdeaInfoExpanded] = useState(true);
  const [showImplementationDetails, setShowImplementationDetails] = useState(false);
  const [imageRetryUrl, setImageRetryUrl] = useState(null);
  const [imageLoadError, setImageLoadError] = useState({});
  const navigation = useNavigation();

  const fetchIdeaDetail = async (ideaId) => {
    if (!ideaId) return;
    try {
      setLoadingDetail(true);
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data: response } = await axios.get(`${IDEA_DETAIL_URL}/${encodeURIComponent(ideaId)}`, { headers });

      if (response?.success && response?.data) {
        const detail = response.data;

        const beforeImagePath = detail.beforeImplementationImagePath || detail.imagePath || detail.beforeImplementationImage;
        const normalizedBeforeImagePath = normalizeImagePath(beforeImagePath);

        const afterImagePath = detail.afterImplementationImagePath || detail.implementationCycle?.afterImplementationImagePath;
        const normalizedAfterImagePath = normalizeImagePath(afterImagePath);

        console.log('📸 Before Image Path:', beforeImagePath);
        console.log('📸 Normalized Before:', normalizedBeforeImagePath);
        console.log('📸 After Image Path:', afterImagePath);
        console.log('📸 Normalized After:', normalizedAfterImagePath);

        const normalizedDetail = {
          ...detail,
          beforeImplementationImagePath: normalizedBeforeImagePath,
          imagePath: normalizedBeforeImagePath,
          afterImplementationImagePath: normalizedAfterImagePath,
          implementationCycle: detail.implementationCycle ? {
            ...detail.implementationCycle,
            beforeImplementationImagePath: normalizeImagePath(detail.implementationCycle.beforeImplementationImagePath),
            afterImplementationImagePath: normalizedAfterImagePath
          } : null
        };

        setIdeaDetail(normalizedDetail);
        setSelectedIdea(normalizedDetail);

        if (shouldShowImplementationDetails(normalizedDetail)) {
          setShowImplementationDetails(true);
        }
      } else {
        Alert.alert("Error", response?.message || "Idea details not found.");
      }
    } catch (error) {
      console.error('Error fetching idea detail:', error);
      Alert.alert("Error", "Failed to fetch idea details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setSelectedIdea(null);
    setIdeaDetail(null);
    setShowImplementationForm(false);
    setEmployeeInfoExpanded(false);
    setIdeaInfoExpanded(true);
    setShowImplementationDetails(false);
    setImageLoadError({});
  };

  const openImagePreview = (imageUrl) => {
    const finalUrl = normalizeImagePath(imageUrl);
    console.log('🖼️ Opening image preview:', finalUrl);

    if (finalUrl && (finalUrl.toLowerCase().endsWith('.pdf') || finalUrl.includes('.pdf'))) {
      Alert.alert(
        'PDF Document',
        'This is a PDF document. Would you like to open it?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open',
            onPress: () => {
              Linking.openURL(finalUrl).catch(err => {
                Alert.alert('Error', 'Unable to open PDF. Please try accessing it from a web browser.');
              });
            }
          }
        ]
      );
      return;
    }

    setCurrentImageUrl(finalUrl);
    setImageRetryUrl(getAlternateImageUrl(finalUrl));
    setShowImage(true);
  };

  const handleImageError = (error) => {
    console.error('❌ Image load error:', error);
    if (imageRetryUrl && currentImageUrl !== imageRetryUrl) {
      console.log('🔄 Retrying with alternate URL:', imageRetryUrl);
      setCurrentImageUrl(imageRetryUrl);
      setImageRetryUrl(null);
    } else {
      Alert.alert(
        'Image Upload Issue Detected',
        '⚠️ The image was uploaded but is not accessible on the server.\n\n' +
        'This is a backend configuration issue:\n' +
        '• Files are not being saved to disk\n' +
        '• Upload directory may not exist\n' +
        '• Static file serving may not be configured\n\n' +
        'Please contact your backend developer to:\n' +
        '1. Check the uploads folder exists\n' +
        '2. Verify file permissions\n' +
        '3. Enable static file serving\n\n' +
        'Idea was created successfully, but image needs to be re-uploaded once fixed.',
        [
          {
            text: 'Copy URL for Backend Team',
            onPress: () => {
              console.log('📋 Backend team needs to check this URL:', currentImageUrl);
              Alert.alert('URL Copied to Console', 'Check your development console for the URL');
            }
          },
          { text: 'Close' }
        ]
      );
    }
  };

  const canEditIdea = (status) => {
    if (!status) return false;
    const s = status.toLowerCase().trim();
    return s === "draft" || s === "published";
  };

  const handleEdit = (idea) => {
    const hasImplementation = idea.implementationCycle && Object.keys(idea.implementationCycle).length > 0;
    if (isImplementationPhase(idea.ideaStatus)) {
      if (hasImplementation) {
        setIsEditingImplementation(true);
        setShowImplementationForm(true);
      } else {
        setIsEditingImplementation(false);
        setShowImplementationForm(true);
      }
    } else {
      editIdea(idea);
      closeModal();
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {ideas.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>No ideas found</Text>
      ) : (
        ideas.map((idea, index) => {
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              style={styles.cardContainer}
              onPress={() => fetchIdeaDetail(idea.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.ideaNumber} numberOfLines={2}>
                  {idea.ideaNumber || "N/A"}
                </Text>
                <View style={styles.typeTag}>
                  <Text style={styles.typeText}>{idea.ideaType || "N/A"}</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.rowDetail}>
                  <Text style={styles.label}>Idea Description:</Text>
                  <Text style={styles.value} numberOfLines={2}>
                    {idea.ideaDescription || "N/A"}
                  </Text>
                </View>
                <View style={styles.rowDetail}>
                  <Text style={styles.label}>Proposed Solution:</Text>
                  <Text style={styles.value} numberOfLines={2}>
                    {idea.proposedSolution || "N/A"}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Created Date:</Text>
                  <Text style={styles.value}>{formatDate(idea.ideaCreationDate)}</Text>
                </View>
                <View style={styles.rowDetail}>
                  <Text style={styles.label}>Status:</Text>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text
                      style={[styles.statusBadge, { backgroundColor: getStatusColor(idea.ideaStatus) }]}
                      numberOfLines={2}
                    >
                      {idea.ideaStatus || "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {loadingDetail && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2c5aa0" />
        </View>
      )}

      {/* Implementation Form Modal */}
      <Modal visible={showImplementationForm && !!selectedIdea} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalHeaderTitle}>{isEditingImplementation ? 'Edit Implementation' : 'Submit Implementation'}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => {
                closeModal();
                setIsEditingImplementation(false);
              }}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          <ImplementationForm
            ideaDetail={ideaDetail}
            onClose={() => {
                closeModal();
                setIsEditingImplementation(false);
            }}
            refreshIdeas={refreshIdeas}
            isEditing={isEditingImplementation}
          />
        </View>
      </Modal>

      {/* Idea Details Modal */}
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
                      <Text style={styles.valueDetail}>
                        {formatDate(ideaDetail.plannedImplementationDuration)}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Before Implementation:</Text>
                      {ideaDetail.beforeImplementationImagePath ? (
                        <TouchableOpacity
                          style={styles.imagePreviewContainer}
                          onPress={() => openImagePreview(ideaDetail.beforeImplementationImagePath)}
                        >
                          {ideaDetail.beforeImplementationImagePath.toLowerCase().includes('.pdf') ? (
                            <View style={styles.pdfThumbnailContainer}>
                              <Ionicons name="document-text" size={30} color="#FF5722" />
                              <Text style={styles.pdfThumbnailText}>PDF</Text>
                            </View>
                          ) : !imageLoadError[`before_${ideaDetail.id}`] ? (
                            <Image
                              source={{ uri: ideaDetail.beforeImplementationImagePath }}
                              style={styles.thumbnailSmall}
                              contentFit="cover"
                              cachePolicy="none"
                              placeholder="L6Pj0^jE.AyE_3t7t7R**0o#DgR4"
                              transition={1000}
                              onError={(e) => {
                                console.log("❌ Before Image load error for ID:", ideaDetail.id);
                                console.log("❌ Failed URL:", ideaDetail.beforeImplementationImagePath);
                                const altUrl = getAlternateImageUrl(ideaDetail.beforeImplementationImagePath);
                                if (altUrl && ideaDetail.beforeImplementationImagePath !== altUrl) {
                                  console.log("🔄 Trying alternate URL:", altUrl);
                                  setIdeaDetail(prev => ({
                                    ...prev,
                                    beforeImplementationImagePath: altUrl
                                  }));
                                } else {
                                  console.log("❌ No alternate URL available, showing error state");
                                  setImageLoadError(prev => ({
                                    ...prev,
                                    [`before_${ideaDetail.id}`]: true
                                  }));
                                }
                              }}
                              onLoad={() => {
                                console.log("✅ Before Image loaded successfully:", ideaDetail.beforeImplementationImagePath);
                              }}
                            />
                          ) : (
                            <View style={styles.imageErrorContainer}>
                              <Ionicons name="image-outline" size={24} color="#999" />
                              <Text style={styles.imageErrorText}>Image unavailable</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.valueDetail}>N/A</Text>
                      )}
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Status:</Text>
                      <Text
                        style={[
                          styles.statusBadgeDetail,
                          { backgroundColor: getStatusColor(ideaDetail.ideaStatus) }
                        ]}
                      >
                        {ideaDetail.ideaStatus || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Idea Description:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.ideaDescription || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Proposed Solution:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.proposedSolution || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Process Improvement/Cost Benefit:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.tentativeBenefit || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Team Members:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.teamMembers || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Idea Theme:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.ideaTheme || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Type:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.ideaType || ideaDetail.type || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>BE Team Support Needed:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.isBETeamSupportNeeded ? "Yes" : "No"}
                      </Text>
                    </View>
                    <View style={styles.rowDetail}>
                      <Text style={styles.labelDetail}>Can Be Implemented To Other Locations:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.canBeImplementedToOtherLocations ? "Yes" : "No"}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Implementation Details - Show if available */}
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
                          <Text
                            style={[
                              styles.statusBadgeDetail,
                              { backgroundColor: getStatusColor(ideaDetail.implementationCycle?.status) }
                            ]}
                          >
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
                            <Text style={styles.labelDetail}>Submitted On:</Text>
                            <Text style={styles.valueDetail}>
                              {formatDate(ideaDetail.implementationCycle?.startDate || ideaDetail.implementationDate)}
                            </Text>
                          </View>
                        )}

                        {ideaDetail.implementationCycle?.beforeImplementationImagePath && (
                          <View style={styles.rowDetailWithBorder}>
                            <Text style={styles.labelDetail}>Before Implementation:</Text>

                            {ideaDetail.implementationCycle.beforeImplementationImagePath.toLowerCase().includes('.pdf') ? (
                              <TouchableOpacity
                                onPress={() => openImagePreview(ideaDetail.implementationCycle.beforeImplementationImagePath)}
                              >
                                <View style={styles.pdfThumbnailContainer}>
                                  <Ionicons name="document-text" size={30} color="#FF5722" />
                                  <Text style={styles.pdfThumbnailText}>PDF</Text>
                                </View>
                              </TouchableOpacity>
                            ) : !imageLoadError[`impl_before_${ideaDetail.id}`] ? (
                              <TouchableOpacity
                                onPress={() => openImagePreview(ideaDetail.implementationCycle.beforeImplementationImagePath)}
                              >
                                <Image
                                  source={{ uri: ideaDetail.implementationCycle.beforeImplementationImagePath }}
                                  style={styles.thumbnailSmall}
                                  contentFit="cover"
                                  cachePolicy="none"
                                  onError={() => {
                                    const altUrl = getAlternateImageUrl(ideaDetail.implementationCycle.beforeImplementationImagePath);
                                    if (altUrl) {
                                      setIdeaDetail(prev => ({
                                        ...prev,
                                        implementationCycle: {
                                          ...prev.implementationCycle,
                                          beforeImplementationImagePath: altUrl
                                        }
                                      }));
                                    } else {
                                      setImageLoadError(prev => ({
                                        ...prev,
                                        [`impl_before_${ideaDetail.id}`]: true
                                      }));
                                    }
                                  }}
                                />
                              </TouchableOpacity>
                            ) : (
                              <View style={styles.imageErrorContainer}>
                                <Ionicons name="image-outline" size={24} color="#999" />
                                <Text style={styles.imageErrorText}>Image unavailable</Text>
                              </View>
                            )}
                          </View>
                        )}

                        {ideaDetail.afterImplementationImagePath && (
                          <View style={styles.rowDetailWithBorder}>
                            <Text style={styles.labelDetail}>After Implementation:</Text>

                            {ideaDetail.afterImplementationImagePath.toLowerCase().includes('.pdf') ? (
                              <TouchableOpacity
                                onPress={() => openImagePreview(ideaDetail.afterImplementationImagePath)}
                              >
                                <View style={styles.pdfThumbnailContainer}>
                                  <Ionicons name="document-text" size={30} color="#FF5722" />
                                  <Text style={styles.pdfThumbnailText}>PDF</Text>
                                </View>
                              </TouchableOpacity>
                            ) : !imageLoadError[`after_${ideaDetail.id}`] ? (
                              <TouchableOpacity
                                onPress={() => openImagePreview(ideaDetail.afterImplementationImagePath)}
                              >
                                <Image
                                  source={{ uri: ideaDetail.afterImplementationImagePath }}
                                  style={styles.thumbnailSmall}
                                  contentFit="cover"
                                  cachePolicy="none"
                                  onError={() => {
                                    const altUrl = getAlternateImageUrl(ideaDetail.afterImplementationImagePath);
                                    if (altUrl) {
                                      setIdeaDetail(prev => ({
                                        ...prev,
                                        afterImplementationImagePath: altUrl
                                      }));
                                    } else {
                                      setImageLoadError(prev => ({
                                        ...prev,
                                        [`after_${ideaDetail.id}`]: true
                                      }));
                                    }
                                  }}
                                />
                              </TouchableOpacity>
                            ) : (
                              <View style={styles.imageErrorContainer}>
                                <Ionicons name="image-outline" size={24} color="#999" />
                                <Text style={styles.imageErrorText}>Image unavailable</Text>
                              </View>
                            )}
                          </View>
                        )}

                      </View>
                    )}
                  </>
                )}

                {/* Remarks Section */}
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

                {/* Edit/Delete Buttons */}
                {(() => {
                  const status = (ideaDetail.ideaStatus || "").toLowerCase().trim();
                  const canEdit = canEditIdea(status);
                  const canDelete = status === "draft" || status === "published";
                  const inImplementation = isImplementationPhase(status);
                  const hasImplementation = ideaDetail.implementationCycle && Object.keys(ideaDetail.implementationCycle).length > 0;

                  let buttonText = 'Edit';
                  if (inImplementation && hasImplementation) {
                    buttonText = 'Edit Implementation';
                  } else if (inImplementation) {
                    buttonText = 'Submit Implementation';
                  }

                  return (canEdit || canDelete || inImplementation) && (
                    <View style={styles.buttonRow}>
                      {(canEdit || inImplementation) && (
                        <TouchableOpacity
                          style={[styles.button, styles.editButton]}
                          onPress={() => handleEdit(ideaDetail)}
                        >
                          <Ionicons name="create-outline" size={18} color="#fff" />
                          <Text style={styles.buttonText}>
                            {buttonText}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {canDelete && (
                        <TouchableOpacity
                          style={[styles.button, styles.deleteButton]}
                          onPress={() => {
                            deleteIdea(ideaDetail, () => {
                              closeModal();
                              refreshIdeas();
                            });
                          }}
                        >
                          <Ionicons name="trash-outline" size={18} color="#fff" />
                          <Text style={styles.buttonText}>Delete</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })()}
              </>
            )}
          </ScrollView>
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
            onPress={() => {
              setShowImage(false);
              setCurrentImageUrl(null);
              setImageRetryUrl(null);
            }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          {currentImageUrl ? (
            <Image
              source={{ uri: currentImageUrl }}
              style={styles.fullImage}
              contentFit="contain"
              onError={handleImageError}
            />
          ) : (
            <Text style={{ color: '#fff' }}>No image available</Text>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

export default function MyIdeasScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [ideas, setIdeas] = useState([]);

  const fetchIdeas = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${MY_IDEAS_URL}?page=1&pageSize=1000`, { headers });

      if (response.data && response.data.data && Array.isArray(response.data.data.ideas)) {
        const normalizedIdeas = response.data.data.ideas.map(idea => {
          const imagePath = idea.beforeImplementationImagePath || idea.imagePath || idea.beforeImplementationImage;
          return {
            ...idea,
            beforeImplementationImagePath: normalizeImagePath(imagePath),
            imagePath: normalizeImagePath(imagePath),
          };
        });
        setIdeas(normalizedIdeas);
      } else {
        setIdeas([]);
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
      Alert.alert("Error", "Failed to load ideas from server.");
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchIdeas();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (route.params?.newIdea) {
      if (route.params?.showDraftMessage) {
        Alert.alert('Draft Saved', 'Your idea has been saved as a draft.');
      }
      fetchIdeas();
    }
  }, [route.params?.newIdea, route.params?.showDraftMessage]);

  useEffect(() => {
    if (route.params?.refreshIdeas) {
      fetchIdeas();
    }
  }, [route.params?.refreshIdeas]);

  const deleteIdea = async (idea, callback) => {
    Alert.alert(
      "Delete Idea",
      "Are you sure you want to delete this idea?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const headers = token ? { Authorization: `Bearer ${token}` } : {};
              const response = await axios.post(DELETE_IDEA_URL(idea.id), {}, { headers });
              if (response.data?.success) {
                Alert.alert("Success", "Idea deleted successfully!");
                if (callback) callback();
                fetchIdeas();
              } else {
                Alert.alert("Error", response.data?.message || "Failed to delete idea.");
              }
            } catch (error) {
              console.error('Error deleting idea:', error);
              Alert.alert("Error", "Failed to delete idea. Please try again.");
            }
          }
        }
      ]
    );
  };

  const editIdea = (idea) => {
    navigation.navigate("EditIdea", { ideaId: idea.id, ideaData: idea });
  };

  const filterIdeas = (status) => {
    return ideas.filter((idea) => {
      const s = (idea.ideaStatus || "").toLowerCase().trim();
      switch (status.toLowerCase()) {
        case "pending":
          return [
            "pending",
            "approval pending",
            "rm approval pending",
            "under review by be team",
            "be_team approval pending",
            "published",
            "draft",
            "ready for implementation",
            "approved by be team",
            "approved by be team - ready for implementation"
          ].includes(s);
        case "approved":
          return s === "closed";
        case "hold":
          return [
            "hold",
            "idea hold by be team",
            "implementation hold by be team",
            "idea hold by manager",
            "implementation hold by manager"
          ].includes(s);
        case "rejected":
          return [
            "rejected",
            "implementation rejected by manager",
            "idea rejected by be team",
            "implementation rejected by be team",
            "idea rejected by manager"
          ].includes(s);

        default:
          return false;
      }
    });
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#333333",
        tabBarStyle: { backgroundColor: "#CED8E7" },
        tabBarIndicatorStyle: { backgroundColor: "#5A6FAE" },
        tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        tabBarScrollEnabled: true
      }}
    >
      <Tab.Screen name="Pending">
        {() => (
          <IdeasList
            ideas={filterIdeas("Pending")}
            editIdea={editIdea}
            deleteIdea={deleteIdea}
            refreshIdeas={fetchIdeas}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Closed">
        {() => (
          <IdeasList
            ideas={filterIdeas("Approved")}
            editIdea={editIdea}
            deleteIdea={deleteIdea}
            refreshIdeas={fetchIdeas}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Hold">
        {() => (
          <IdeasList
            ideas={filterIdeas("Hold")}
            editIdea={editIdea}
            deleteIdea={deleteIdea}
            refreshIdeas={fetchIdeas}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Rejected">
        {() => (
          <IdeasList
            ideas={filterIdeas("Rejected")}
            editIdea={editIdea}
            deleteIdea={deleteIdea}
            refreshIdeas={fetchIdeas}
          />
        )}
      </Tab.Screen>

    </Tab.Navigator>
  );
}

function ImplementationForm({ ideaDetail, onClose, refreshIdeas, isEditing }) {
  const [implementationDetails, setImplementationDetails] = useState('');
  const [outcomesBenefits, setOutcomesBenefits] = useState('');
  const [afterImage, setAfterImage] = useState(null);
  const [afterImageName, setAfterImageName] = useState('');
  const [afterImageType, setAfterImageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [isNewFile, setIsNewFile] = useState(false);

  const [employeeInfoExpanded, setEmployeeInfoExpanded] = useState(false);
  const [ideaInfoExpanded, setIdeaInfoExpanded] = useState(true);
  const [remarksExpanded, setRemarksExpanded] = useState(false);
  const [implementationFormExpanded, setImplementationFormExpanded] = useState(true);

  useEffect(() => {
    if (isEditing && ideaDetail?.id) {
      const fetchImplementationDetails = async () => {
        setIsSubmitting(true);
        try {
          const token = await AsyncStorage.getItem('token');
          const url = `https://ideabank-api-dev.abisaio.com/api/Approval/implementation/edit/${ideaDetail.id}`;
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data?.success && response.data?.data) {
            const data = response.data.data;
            setImplementationDetails(data.implementation || '');
            setOutcomesBenefits(data.outcome || '');
            const imageUrl = normalizeImagePath(data.afterImplementationImagePath);
            if (imageUrl) {
              setAfterImage(imageUrl);
              setAfterImageName(imageUrl.split('/').pop() || 'Existing File');
              setAfterImageType(imageUrl.toLowerCase().includes('.pdf') ? 'pdf' : 'image');
            }
            setIsNewFile(false);
          } else {
            Alert.alert('Error', response.data?.message || 'Failed to fetch implementation details for editing.');
            onClose();
          }
        } catch (error) {
          console.error('Error fetching implementation details:', error);
          Alert.alert('Error', 'An error occurred while fetching details for editing.');
          onClose();
        } finally {
          setIsSubmitting(false);
        }
      };
      fetchImplementationDetails();
    } else {
        setImplementationDetails('');
        setOutcomesBenefits('');
        setAfterImage(null);
        setAfterImageName('');
        setAfterImageType('');
        setIsNewFile(false);
    }
  }, [isEditing, ideaDetail?.id, onClose]);

  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required!');
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
      setIsNewFile(true);
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
      quality: 1
    });
    if (!result.canceled) {
      setAfterImage(result.assets[0].uri);
      setAfterImageType('image');
      const uriParts = result.assets[0].uri.split('/');
      setAfterImageName(uriParts[uriParts.length - 1]);
      setIsNewFile(true);
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
        setIsNewFile(true);
        setShowFileOptions(false);
      }
    } catch (error) {
      console.error('Error picking PDF:', error);
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
    if (!afterImage) {
      Alert.alert('Error', 'Please upload after implementation image');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('IdeaId', ideaDetail.id);
      formData.append('Implementation', implementationDetails);
      formData.append('Outcome', outcomesBenefits);

      if (afterImage && afterImageName && (!isEditing || isNewFile)) {
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

      const url = isEditing ? `https://ideabank-api-dev.abisaio.com/api/Approval/implementation/edit/${ideaDetail.id}` : SUBMIT_URL;
      console.log('📤 Submitting implementation form to:', url);
      
      const response = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.success) {
        console.log(`✅ Implementation ${isEditing ? 'updated' : 'submitted'} successfully`);
        const pattern = [0, 100, 50, 100];
        Vibration.vibrate(pattern);
        Alert.alert(
          'Success',
          response.data?.message || `Implementation ${isEditing ? 'updated' : 'submitted'} successfully!`,
          [{
            text: 'OK',
            onPress: () => {
              refreshIdeas();
              onClose();
            }
          }]
        );
      } else {
        console.log(`❌ Implementation ${isEditing ? 'update' : 'submission'} failed:`, response.data?.message);
        Alert.alert('Error', response.data?.message || `Failed to ${isEditing ? 'update' : 'submit'} implementation`);
      }
    } catch (error) {
      console.error(`❌ Error ${isEditing ? 'updating' : 'submitting'} implementation:`, error);
      Alert.alert('Error', error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'submit'} implementation. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleZoomIn = () => {
    setImageScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setImageScale(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <ScrollView contentContainerStyle={styles.modalScrollContent}>
      <TouchableOpacity
        style={styles.timelineButtonHeader}
        onPress={() => setShowTimelineModal(true)}
      >
        <Ionicons name="time-outline" size={18} color="#2c5aa0" />
        <Text style={styles.timelineButtonText}>View Progress Timeline</Text>
      </TouchableOpacity>

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
            <Text style={styles.valueDetail}>
              {formatDate(ideaDetail.plannedImplementationDuration)}
            </Text>
          </View>
          <View style={styles.rowDetailWithBorder}>
            <Text style={styles.labelDetail}>Status:</Text>
            <Text
              style={[
                styles.statusBadgeDetail,
                { backgroundColor: getStatusColor(ideaDetail.ideaStatus) }
              ]}
            >
              {ideaDetail.ideaStatus || "N/A"}
            </Text>
          </View>
          <View style={styles.rowDetailWithBorder}>
            <Text style={styles.labelDetail}>Idea Description:</Text>
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

      {/* Before Implementation Image Section */}
      {ideaDetail.beforeImplementationImagePath && (
        <View style={styles.cardDetail}>
          <Text style={styles.cardHeading}>Before Implementation Image</Text>
          <View style={styles.implementationImageSection}>
            <Image
              source={{ uri: ideaDetail.beforeImplementationImagePath }}
              style={styles.implementationImage}
              contentFit="cover"
            />
          </View>
        </View>
      )}

      {/* Remarks Section */}
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

      {/* Implementation Form Section - Collapsible */}
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setImplementationFormExpanded(!implementationFormExpanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.collapsibleHeaderText}>{isEditing ? 'Edit' : 'Submit'} Implementation Details</Text>
        <Ionicons
          name={implementationFormExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color="#2c5aa0"
        />
      </TouchableOpacity>

      {implementationFormExpanded && (
        <View style={styles.cardDetail}>
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
          <View style={styles.fileInputRow}>
            <TouchableOpacity
              style={styles.chooseFileButton}
              onPress={() => setShowFileOptions(true)}
            >
              <Text style={styles.chooseFileText}>Choose File</Text>
            </TouchableOpacity>
            <Text style={styles.fileNameDisplay}>{afterImageName || 'No file chosen'}</Text>
          </View>

          {afterImage && afterImageType === 'image' && (
            <TouchableOpacity
              onPress={() => setShowImagePreview(true)}
              style={styles.eyeIconContainer}
            >
              <Feather name="eye" size={20} color="#2196F3" />
              <Text style={styles.previewText}>Preview Image</Text>
            </TouchableOpacity>
          )}

          {afterImage && afterImageType === 'pdf' && (
            <View style={styles.pdfInfoContainer}>
              <Feather name="file-text" size={20} color="#FF5722" />
              <Text style={styles.pdfInfoText}>PDF Selected</Text>
            </View>
          )}
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitImplementButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitImplementButtonText}>{isEditing ? 'Update' : 'Submit'} Implementation</Text>
        )}
      </TouchableOpacity>

      {/* File Options Modal */}
      <Modal visible={showFileOptions} transparent={true} animationType="slide">
        <View style={styles.imageOptionsContainer}>
          <View style={styles.imageOptionsContent}>
            <Text style={styles.imageOptionsTitle}>Choose File Source</Text>
            <TouchableOpacity
              style={styles.imageOptionButton}
              onPress={pickImageFromCamera}
            >
              <Feather name="camera" size={24} color="#2196F3" />
              <Text style={styles.imageOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imageOptionButton}
              onPress={pickImageFromGallery}
            >
              <Feather name="image" size={24} color="#4CAF50" />
              <Text style={styles.imageOptionText}>Choose Image from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imageOptionButton}
              onPress={pickPDF}
            >
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
                  <View style={styles.noDataContainer}>
                    <Ionicons name="time-outline" size={40} color="#ccc" />
                    <Text style={styles.noDataText}>No timeline data available</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
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
          <ScrollView
            contentContainerStyle={styles.imageScrollContent}
            maximumZoomScale={3}
            minimumZoomScale={0.5}
          >
            {afterImage && (
              <Image
                source={{ uri: afterImage }}
                style={[styles.fullImagePreview, { transform: [{ scale: imageScale }] }]}
                resizeMode="contain"
              />
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5"
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    backgroundColor: '#2c5aa0',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  ideaNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8
  },
  typeTag: {
    backgroundColor: '#f0ad4e',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500'
  },
  cardContent: {
    padding: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center'
  },
  rowDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: 'flex-start'
  },
  rowDetailWithBorder: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    marginBottom: 10,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  label: {
    color: '#555',
    fontWeight: '500',
    fontSize: 14
  },
  value: {
    color: '#333',
    fontSize: 14,
    maxWidth: '65%',
    textAlign: 'right'
  },
  statusBadge: {
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 200,
    textAlign: 'center'
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 12
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 6,
    elevation: 2
  },
  editButton: {
    backgroundColor: "#607D8B"
  },
  deleteButton: {
    backgroundColor: "#F44336"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15
  },
  fullModal: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  modalHeader: {
    backgroundColor: '#fff',
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 4
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c5aa0'
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center"
  },
  timelineButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2c5aa0',
    marginBottom: 12
  },
  timelineButtonText: {
    color: '#2c5aa0',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 30
  },
  cardDetail: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#2c5aa0"
  },
  labelDetail: {
    fontWeight: "600",
    color: "#555",
    width: "45%",
    fontSize: 14
  },
  valueDetail: {
    color: "#222",
    width: "50%",
    textAlign: "right",
    fontSize: 14
  },
  statusBadgeDetail: {
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 200,
    textAlign: 'center'
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  thumbnailSmall: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  pdfThumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF5722',
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pdfThumbnailText: {
    fontSize: 10,
    color: '#FF5722',
    fontWeight: 'bold',
    marginTop: 2
  },
  imageErrorContainer: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageErrorText: {
    fontSize: 9,
    color: '#999',
    marginTop: 2,
    textAlign: 'center'
  },
  implementationImageSection: {
    marginTop: 12,
    marginBottom: 12
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8
  },
  implementationImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  remarkCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2c5aa0'
  },
  remarkTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 6
  },
  remarkComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 6
  },
  remarkDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic'
  },
  noRemarksText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 10
  },
  timelineModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c5aa0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    elevation: 4
  },
  timelineModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  closeButtonTimeline: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center"
  },
  timelineCardContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2
  },
  timelineContainer: {
    paddingLeft: 4,
    paddingTop: 4
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 15,
    width: 20
  },
  timelineCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 2
  },
  timelineLine: {
    width: 3,
    backgroundColor: "#E0E0E0",
    flex: 1,
    marginTop: 4
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 5
  },
  timelineStatus: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4
  },
  timelineDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
    lineHeight: 18
  },
  timelineDate: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic"
  },
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
  imageModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center"
  },
  closeButtonImage: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center"
  },
  fullImage: {
    width: "90%",
    height: "70%"
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)"
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
  eyeIconContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start'
  },
  previewText: {
    marginLeft: 6,
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500'
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
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 12
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 30
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
  zoomButton: {
    padding: 8
  },
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
});