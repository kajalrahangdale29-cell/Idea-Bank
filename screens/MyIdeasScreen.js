import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Image, ActivityIndicator, TextInput, Vibration,   Platform, } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MY_IDEAS_URL, IDEA_DETAIL_URL, DELETE_IDEA_URL, SUBMIT_URL } from '../src/context/api';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
const Tab = createMaterialTopTabNavigator();


// Ensure all image paths are absolute URLs
const normalizeImageUrl = (path, fallbackUrl) => {
  if (!path) return null;

  // Already absolute? just return
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Derive the base from beforeImplementationImagePath if available
  if (fallbackUrl && (fallbackUrl.startsWith('http://') || fallbackUrl.startsWith('https://'))) {
    try {
      const base = new URL(fallbackUrl).origin;
      return `${base}${path.startsWith('/') ? path : `/${path}`}`;
    } catch (e) {
      // fallback to default
    }
  }

  // Default API base (update this if your API host changes)
  const BASE_URL = 'https://ideabank-api-dev.abisaio.com';
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
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

function IdeasList({ ideas, editIdea, deleteIdea, refreshIdeas }) {
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [ideaDetail, setIdeaDetail] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showImplementationForm, setShowImplementationForm] = useState(false);

  const fetchIdeaDetail = async (ideaId) => {
    if (!ideaId) return;
    try {
      setLoadingDetail(true);
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const { data: response } = await axios.get(`${IDEA_DETAIL_URL}/${encodeURIComponent(ideaId)}`, { headers });

      if (response?.success && response?.data) {
    
        console.log('📸 Image fields:', {
          imagePath: response.data.imagePath,
          beforePath: response.data.beforeImplementationImagePath,
          afterPath: response.data.afterImplementationImagePath,
        });

        setIdeaDetail(response.data);
        setSelectedIdea(response.data);

        if (isImplementationPhase(response.data.ideaStatus)) {
          setShowImplementationForm(true);
        }
      } else {
        Alert.alert("Error", response?.message || "Idea details not found.");
      }
    } catch (error) {
      console.error("Error fetching idea detail:", error);
      Alert.alert("Error", "Failed to fetch idea details.");
    } finally {
      setLoadingDetail(false);
    }
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

  const closeModal = () => {
    setSelectedIdea(null);
    setIdeaDetail(null);
    setShowImplementationForm(false);
  };

  const openImagePreview = (imageUrl, fallbackBeforeUrl) => {
    const finalUrl = normalizeImageUrl(imageUrl, fallbackBeforeUrl);
    setCurrentImageUrl(finalUrl);
    setShowImage(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {ideas.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
          No ideas found
        </Text>
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
                <Text style={styles.ideaNumber} numberOfLines={2}>{idea.ideaNumber || "N/A"}</Text>
                <View style={styles.typeTag}>
                  <Text style={styles.typeText}>{idea.ideaType || "N/A"}</Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.rowDetail}>
                  <Text style={styles.label}>Idea Description:</Text>
                  <Text style={styles.value} numberOfLines={2}>{idea.ideaDescription || "N/A"}</Text>
                </View>

                <View style={styles.rowDetail}>
                  <Text style={styles.label}>Proposed Solution:</Text>
                  <Text style={styles.value} numberOfLines={2}>{idea.proposedSolution || "N/A"}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Created Date:</Text>
                  <Text style={styles.value}>{formatDate(idea.ideaCreationDate)}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Status:</Text>
                  <Text
                    style={[styles.statusBadge, { backgroundColor: getStatusColor(idea.ideaStatus) }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {idea.ideaStatus || "N/A"}
                  </Text>
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

      <Modal visible={showImplementationForm && !!selectedIdea} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalHeaderTitle}>Submit Implementation</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <ImplementationForm
            ideaDetail={ideaDetail}
            onClose={closeModal}
            refreshIdeas={refreshIdeas}
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
                <View style={styles.cardDetail}>
                  <Text style={styles.cardHeading}>Employee Information</Text>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Employee Name:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerName || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Employee Number:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerEmployeeNo || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Employee Email:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerEmail || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Department:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerDepartment || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Mobile:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.mobileNumber || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Reporting Manager:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.reportingManagerName || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Manager Email:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.managerEmail || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Employee Location:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.location || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Sub Department:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerSubDepartment || "N/A"}</Text>
                  </View>
                </View>

                <View style={styles.cardDetail}>
                  <Text style={styles.cardHeading}>Idea Information</Text>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Idea No:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.ideaNumber || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Solution Category:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.solutionCategory || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Creation Date:</Text>
                    <Text style={styles.valueDetail}>{formatDate(ideaDetail.ideaCreationDate)}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Planned Completion:</Text>
                    <Text style={styles.valueDetail}>{formatDate(ideaDetail.plannedImplementationDuration)}</Text>
                  </View>

                  {/* ✅ FIXED: Before Implementation Image */}
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Before Implementation:</Text>
                    {(ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath) ? (
                      <TouchableOpacity
                        style={styles.imagePreviewContainer}
                        onPress={() => openImagePreview(ideaDetail.afterImplementationImagePath, ideaDetail.beforeImplementationImagePath)}
                      >
                        <Image
                          source={{ uri: ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath }}
                          style={styles.thumbnailSmall}
                          onError={(e) => console.log('❌ Image error:', e.nativeEvent.error)}
                          onLoad={() => console.log('✅ Image loaded')}
                        />
                        <Text style={styles.tapToEnlargeText}></Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.valueDetail}>N/A</Text>
                    )}
                  </View>

                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Status:</Text>
                    <Text style={[styles.statusBadgeDetail, { backgroundColor: getStatusColor(ideaDetail.ideaStatus) }]}>
                      {ideaDetail.ideaStatus || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Idea Description:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.ideaDescription || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Proposed Solution:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.proposedSolution || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Process Improvement/Cost Benefit:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.tentativeBenefit || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Team Members:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.teamMembers || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Mobile Number:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.mobileNumber || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Idea Theme:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.ideaTheme || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>IsBETeamSupportNeeded:</Text>
                    <Text style={styles.valueDetail}>
                      {ideaDetail.isBETeamSupportNeeded ? "Yes" : "No"}
                    </Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>CanBeImplementedToOtherLocations:</Text>
                    <Text style={styles.valueDetail}>
                      {ideaDetail.canBeImplementedToOtherLocation ? "Yes" : "No"}
                    </Text>
                  </View>
                </View>

                {/* ✅ NEW: Implementation Summary - Shows completed implementation */}
                {(ideaDetail.implementationDetail || ideaDetail.implementation) && (
                  <View style={styles.cardDetail}>
                    <Text style={styles.cardHeading}>✅ Implementation Summary</Text>

                    <View style={styles.rowDetail}>
                      <Text style={styles.labelDetail}>Implementation Status:</Text>
                      <Text style={[styles.statusBadgeDetail, { backgroundColor: getStatusColor(ideaDetail.ideaStatus) }]}>
                        {ideaDetail.ideaStatus || "N/A"}
                      </Text>
                    </View>

                    <View style={styles.rowDetail}>
                      <Text style={styles.labelDetail}>Implementation Details:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.implementationDetail || ideaDetail.implementation || "Not provided"}
                      </Text>
                    </View>

                    <View style={styles.rowDetail}>
                      <Text style={styles.labelDetail}>Benefits Achieved:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.implementationOutcome || ideaDetail.outcome || "Not provided"}
                      </Text>
                    </View>

                    {ideaDetail.implementationDate && (
                      <View style={styles.rowDetail}>
                        <Text style={styles.labelDetail}>Completed On:</Text>
                        <Text style={styles.valueDetail}>
                          {formatDate(ideaDetail.implementationDate)}
                        </Text>
                      </View>
                    )}

                    {/* Before Image */}
                    {(ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath) && (
                      <View style={styles.implementationImageSection}>
                        <Text style={styles.imageLabel}>Before Implementation:</Text>
                        <TouchableOpacity onPress={() => openImagePreview(ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath, ideaDetail.beforeImplementationImagePath)}>
                          <Image
                            source={{ uri: ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath }}
                            style={styles.implementationImage}
                            onError={(e) => console.log('❌ Before image error:', e.nativeEvent.error)}
                          />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* After Image */}
                    {ideaDetail.afterImplementationImagePath && (
                      <View style={styles.implementationImageSection}>
                        <Text style={styles.imageLabel}>After Implementation:</Text>
                        <TouchableOpacity onPress={() =>
  openImagePreview(
    ideaDetail.afterImplementationImagePath,
    ideaDetail.beforeImplementationImagePath
  )
}>
<Image
  source={{
    uri: normalizeImageUrl(
      ideaDetail.afterImplementationImagePath,
      ideaDetail.beforeImplementationImagePath
    ),
  }}
  style={styles.implementationImage}
/>
</TouchableOpacity>
                      </View>
                    )}
                  </View>
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

                {!isImplementationPhase(ideaDetail.ideaStatus) && (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.button, styles.editButton]}
                      onPress={() => {
                        editIdea(ideaDetail);
                        closeModal();
                      }}
                    >
                      <Ionicons name="create-outline" size={18} color="#fff" />
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
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
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

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

      {/* ✅ FIXED: Image Preview Modal */}
      <Modal visible={showImage} transparent animationType="fade">
        <View style={styles.imageModal}>
          <TouchableOpacity
            style={styles.closeButtonImage}
            onPress={() => {
              setShowImage(false);
              setCurrentImageUrl(null);
            }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          {currentImageUrl ? (
            <Image
              source={{ uri: currentImageUrl }}
              style={styles.fullImage}
              resizeMode="contain"
              onError={(e) => {
                console.log('❌ Full image error:', e.nativeEvent.error);
                Alert.alert('Error', 'Failed to load image');
              }}
              onLoad={() => console.log('✅ Full image loaded')}
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
      const response = await axios.get(MY_IDEAS_URL, { headers });

      if (response.data && response.data.data && Array.isArray(response.data.data.ideas)) {
        const fetchedIdeas = response.data.data.ideas;
        setIdeas(fetchedIdeas);
      } else {
        setIdeas([]);
      }
    } catch (error) {
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

              const response = await axios.post(
                DELETE_IDEA_URL(idea.id),
                {},
                { headers }
              );

              if (response.data?.success) {
                Alert.alert("Success", "Idea deleted successfully!");
                if (callback) callback();
                fetchIdeas();
              } else {
                Alert.alert("Error", response.data?.message || "Failed to delete idea.");
              }
            } catch (error) {
              console.error("Error deleting idea:", error);
              Alert.alert("Error", "Failed to delete idea. Please try again.");
            }
          },
        },
      ]
    );
  };

  const editIdea = (idea) => {
    navigation.navigate("EditIdea", {
      ideaId: idea.id,
      ideaData: idea,
    });
  };

  const filterIdeas = (status) => {
    const filtered = ideas.filter((idea) => {
      const s = (idea.ideaStatus || "").toLowerCase().trim();

      switch (status.toLowerCase()) {
        case "pending":
          const isPending = [
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
          return isPending;
        case "approved":
          const isClosed = s === "closed";
          return isClosed;

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

        case "cancelled":
          return s === "cancelled";

        default:
          return false;
      }
    });
    return filtered;
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#333333",
        tabBarStyle: { backgroundColor: "#CED8E7" },
        tabBarIndicatorStyle: { backgroundColor: "#5A6FAE" },
        tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        tabBarScrollEnabled: true,
      }}
    >
      <Tab.Screen name="Pending">{() => <IdeasList ideas={filterIdeas("Pending")} editIdea={editIdea} deleteIdea={deleteIdea} refreshIdeas={fetchIdeas} />}</Tab.Screen>
      <Tab.Screen name="Closed">{() => <IdeasList ideas={filterIdeas("Approved")} editIdea={editIdea} deleteIdea={deleteIdea} refreshIdeas={fetchIdeas} />}</Tab.Screen>
      <Tab.Screen name="Hold">{() => <IdeasList ideas={filterIdeas("Hold")} editIdea={editIdea} deleteIdea={deleteIdea} refreshIdeas={fetchIdeas} />}</Tab.Screen>
      <Tab.Screen name="Rejected">{() => <IdeasList ideas={filterIdeas("Rejected")} editIdea={editIdea} deleteIdea={deleteIdea} refreshIdeas={fetchIdeas} />}</Tab.Screen>
      <Tab.Screen name="Cancelled">{() => <IdeasList ideas={filterIdeas("Cancelled")} editIdea={editIdea} deleteIdea={deleteIdea} refreshIdeas={fetchIdeas} />}</Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f5f5f5" },
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
    alignItems: 'center',
  },
  rowDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    flexWrap: 'wrap',
    alignItems: 'center'
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
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    lineHeight: 14,
    maxWidth: 150,
    overflow: "hidden",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 6,
    elevation: 2,
  },
  editButton: {
    backgroundColor: "#4CAF50"
  },
  deleteButton: {
    backgroundColor: "#F44336"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
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
    elevation: 4,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c5aa0',
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
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
  },
  timelineButtonText: {
    color: '#2c5aa0',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  timelineButtonHeaderImplementation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2c5aa0',
    marginBottom: 16,
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  cardDetail: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#2c5aa0",
  },
  labelDetail: {
    fontWeight: "600",
    color: "#555",
    width: "45%",
    fontSize: 14,
  },
  valueDetail: {
    color: "#222",
    width: "50%",
    textAlign: "right",
    fontSize: 14,
  },
  statusBadgeDetail: {
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    overflow: "hidden",
    alignSelf: 'flex-end',
  },
  // ✅ NEW STYLES
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thumbnailSmall: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tapToEnlargeText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '500',
  },
  implementationImageSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  implementationImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  remarkCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2c5aa0',
  },
  remarkTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 6,
  },
  remarkComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 6,
  },
  remarkDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  noRemarksText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  timelineModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c5aa0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    elevation: 4,
  },
  timelineModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButtonTimeline: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineCardContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2,
  },
  timelineContainer: {
    paddingLeft: 4,
    paddingTop: 4,
  },
  noTimelineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noTimelineText: {
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    fontSize: 15,
    fontStyle: 'italic',
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
    alignItems: "center",
  },
  fullImage: {
    width: "80%",
    height: "60%"
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
  implementationFormContainer: {
    padding: 16,
    paddingBottom: 30,
    backgroundColor: '#f5f5f5',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoCardHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 11,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    width: '48%',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    width: '50%',
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  infoStatusBadge: {
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 200,
    overflow: 'hidden',
  },
  fieldLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#F44336',
    fontSize: 16,
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
    minHeight: 100,
  },
  fileInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  chooseFileButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  chooseFileText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  fileNameDisplay: {
    flex: 1,
    paddingHorizontal: 12,
    color: '#666',
    fontSize: 14,
  },
  eyeIconContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  previewText: {
    marginLeft: 6,
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  pdfInfoContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  pdfInfoText: {
    marginLeft: 8,
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '500',
  },
  imageOptionsContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  imageOptionsContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  imageOptionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  imageOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginLeft: 15,
  },
  cancelButton: {
    backgroundColor: '#FFE5E5',
    marginTop: 10,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    textAlign: 'center',
  },
  remarkItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2c5aa0',
  },
  remarkTitleText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 4,
  },
  remarkCommentText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 4,
  },
  remarkDateText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 30,
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
    shadowRadius: 3,
  },
  submitImplementButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  imagePreviewModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  imagePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  zoomButton: {
    padding: 8,
  },
  zoomText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 15,
    minWidth: 50,
    textAlign: 'center',
  },
  imageScrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImagePreview: {
    width: 350,
    height: 500,
  },
});

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
  if (s === "draft") return "blue";
  if (s === "published") return "green";
  if (s === "closed") return "#00ACC1";
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

function ImplementationForm({ ideaDetail, onClose, refreshIdeas }) {
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
        setShowFileOptions(false);
      }
    } catch (error) {
      console.log('Error picking PDF:', error);
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

      // if (afterImageType === 'pdf') {
      //   formData.append('afterImplementationImage', {
      //     uri: afterImage,
      //     type: 'application/pdf',
      //     name: afterImageName || 'after_document.pdf',
      //   });
      // } else {
      //   formData.append('afterImplementationImage', {
      //     uri: afterImage,
      //     type: 'image/jpeg',
      //     name: afterImageName || 'after_image.jpg',
      //   });
      // }

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
          name: cleanName,
        });
      }
      

      console.log('Submitting implementation for Idea ID:', ideaDetail.id);

      const response = await axios.post(
        SUBMIT_URL,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Implementation Submit Response:', response.data);

      if (response.data?.success) {
        const pattern = [0, 100, 50, 100];
        Vibration.vibrate(pattern);

        Alert.alert('Success', response.data?.message || 'Implementation submitted successfully!', [
          {
            text: 'OK',
            onPress: () => {
              refreshIdeas();
              onClose();
            }
          }
        ]);
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to submit implementation');
      }
    } catch (error) {
      console.error('Error submitting implementation:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit implementation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  const handleZoomIn = () => {
    setImageScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setImageScale(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <ScrollView contentContainerStyle={styles.implementationFormContainer}>
      <TouchableOpacity
        style={styles.timelineButtonHeaderImplementation}
        onPress={() => setShowTimelineModal(true)}
      >
        <Ionicons name="time-outline" size={18} color="#2c5aa0" />
        <Text style={styles.timelineButtonText}>View Progress Timeline</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardHeading}>Employee Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Employee Name:</Text>
          <Text style={styles.infoValue}>{ideaDetail.ideaOwnerName || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Employee Number:</Text>
          <Text style={styles.infoValue}>{ideaDetail.ideaOwnerEmployeeNo || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Employee Email:</Text>
          <Text style={styles.infoValue}>{ideaDetail.ideaOwnerEmail || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Department:</Text>
          <Text style={styles.infoValue}>{ideaDetail.ideaOwnerDepartment || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mobile:</Text>
          <Text style={styles.infoValue}>{ideaDetail.mobileNumber || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Reporting Manager:</Text>
          <Text style={styles.infoValue}>{ideaDetail.reportingManagerName || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Manager Email:</Text>
          <Text style={styles.infoValue}>{ideaDetail.managerEmail || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Employee Location:</Text>
          <Text style={styles.infoValue}>{ideaDetail.location || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sub Department:</Text>
          <Text style={styles.infoValue}>{ideaDetail.ideaOwnerSubDepartment || "N/A"}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardHeading}>Idea Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Idea No:</Text>
          <Text style={styles.infoValue}>{ideaDetail.ideaNumber || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Solution Category:</Text>
          <Text style={styles.infoValue}>{ideaDetail.solutionCategory || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Creation Date:</Text>
          <Text style={styles.infoValue}>{formatDate(ideaDetail.ideaCreationDate)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Planned Completion:</Text>
          <Text style={styles.infoValue}>{formatDate(ideaDetail.plannedImplementationDuration)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={[styles.infoStatusBadge, { backgroundColor: getStatusColor(ideaDetail.ideaStatus) }]}>
              {ideaDetail.ideaStatus || "N/A"}
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Idea Description:</Text>
          <Text style={styles.infoValue}>{ideaDetail.ideaDescription || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Proposed Solution:</Text>
          <Text style={styles.infoValue}>{ideaDetail.proposedSolution || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Process Improvement:</Text>
          <Text style={styles.infoValue}>{ideaDetail.tentativeBenefit || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Team Members:</Text>
          <Text style={styles.infoValue}>{ideaDetail.teamMembers || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Idea Theme:</Text>
          <Text style={styles.infoValue}>{ideaDetail.ideaTheme || "N/A"}</Text>
        </View>
      </View>

      {/* Before Implementation Image */}
      {ideaDetail.beforeImplementationImagePath && (
        <View style={styles.infoCard}>
          <Text style={styles.infoCardHeading}>Before Implementation Image</Text>
          <View style={styles.implementationImageSection}>
            <Image
              source={{ uri: ideaDetail.beforeImplementationImagePath }}
              style={styles.implementationImage}
              resizeMode="cover"
            />
          </View>
        </View>
      )}

      {/* Remarks Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardHeading}>Remarks</Text>
        {(() => {
          const remarks = parseRemarks(ideaDetail.remark || ideaDetail.remarks);
          if (remarks.length === 0) {
            return <Text style={styles.noDataText}>No remarks available</Text>;
          }
          return remarks.map((remark, index) => (
            <View key={index} style={styles.remarkItem}>
              <Text style={styles.remarkTitleText}>{remark.approverName || remark.title || "Unknown"}</Text>
              <Text style={styles.remarkCommentText}>{remark.comments || remark.comment || "No comment"}</Text>
              {(remark.approvalDate || remark.date) && (
                <Text style={styles.remarkDateText}>{formatDateTime(remark.approvalDate || remark.date)}</Text>
              )}
            </View>
          ));
        })()}
      </View>

      {/* Implementation Details Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardHeading}>Implementation Details</Text>

        <Text style={styles.fieldLabel}>
          Implementation Details<Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={styles.textInputArea}
          multiline
          numberOfLines={5}
          value={implementationDetails}
          onChangeText={setImplementationDetails}
          placeholder="Enter implementation details..."
          placeholderTextColor="#999"
        />

        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
          Outcome/Benefits Achieved<Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={styles.textInputArea}
          multiline
          numberOfLines={5}
          value={outcomesBenefits}
          onChangeText={setOutcomesBenefits}
          placeholder="Enter outcome/benefits achieved..."
          placeholderTextColor="#999"
        />

        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
          After Implementation Image (JPG, PNG, PDF)<Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.fileInputRow}>
          <TouchableOpacity style={styles.chooseFileButton} onPress={() => setShowFileOptions(true)}>
            <Text style={styles.chooseFileText}>Choose File</Text>
          </TouchableOpacity>
          <Text style={styles.fileNameDisplay}>{afterImageName || 'No file chosen'}</Text>
        </View>

        {afterImage && afterImageType === 'image' && (
          <TouchableOpacity onPress={() => setShowImagePreview(true)} style={styles.eyeIconContainer}>
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
      </View>

      {/* Submit Button */}
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

      {/* Image Preview Modal with Zoom */}
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