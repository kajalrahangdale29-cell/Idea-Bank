import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Image, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MY_IDEAS_URL, IDEA_DETAIL_URL } from '../src/context/api';

const Tab = createMaterialTopTabNavigator();

function TimelineItem({ status, date, description, isLast }) {
  // Colored circle for each status
  const getCircleColor = (status) => {
    if (!status) return "#9E9E9E";
    const s = status.toLowerCase();
    if (s.includes("created")) return "#2196F3";      // Blue
    if (s.includes("edited")) return "#9C27B0";       // Purple
    if (s.includes("approved")) return "#4CAF50";     // Green
    if (s.includes("implementation")) return "#3F51B5"; // Indigo
    if (s.includes("rejected")) return "#F44336";     // Red
    return "#9E9E9E";                                // Default Gray
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
        {date && <Text style={{ fontSize: 11, color: "#999" }}>{new Date(date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}</Text>}
      </View>
    </View>
  );
}


const getStatusColor = (status) => {
  if (!status) return "gray";
  const s = status.toLowerCase();
  if (s === "draft") return "blue";
  if (s === "published") return "green";
  if (s === "closed") return "#00ACC1";

  return "gray";
};

function IdeasList({ ideas, editIdea, deleteIdea }) {
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [ideaDetail, setIdeaDetail] = useState(null);

  const fetchIdeaDetail = async (ideaId) => {
    if (!ideaId) return;
    try {
      setLoadingDetail(true);
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log("Fetching idea detail for ID:", ideaId);

      const { data: response } = await axios.get(`${IDEA_DETAIL_URL}/${encodeURIComponent(ideaId)}`, { headers });

      if (response?.success && response?.data) {
        setIdeaDetail(response.data);
        setSelectedIdea(response.data);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {ideas.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
          No ideas found
        </Text>
      ) : (
        ideas.map((idea, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            style={styles.card}
            onPress={() => fetchIdeaDetail(idea.id )}
          >
            <View style={styles.row}>
              <Text style={styles.label}>Idea No</Text>
              <Text style={styles.value}>{idea.ideaNumber || "N/A"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>{idea.solutionCategory || "N/A"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>
                {idea.ideaCreationDate ? new Date(idea.ideaCreationDate).toLocaleDateString() : "N/A"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Status</Text>
              <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(idea.ideaStatus) }]}>
                {idea.ideaStatus || "N/A"}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      {loadingDetail && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {/* Fullscreen Modal with 3 Cards */}
      <Modal visible={!!selectedIdea} animationType="slide">
        <View style={styles.fullModal}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => { setSelectedIdea(null); setIdeaDetail(null); }}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {selectedIdea && ideaDetail && (
              <>
                {/* Card 1: Employee Information */}
                <View style={styles.cardDetail}>
                  <Text style={styles.cardHeading}>👤 Employee Information</Text>
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

                {/* Card 2: Idea Information */}
                <View style={styles.cardDetail}>
                  <Text style={styles.cardHeading}>💡 Idea Information</Text>
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
                    <Text style={styles.valueDetail}>{ideaDetail.ideaCreationDate ? new Date(ideaDetail.ideaCreationDate).toLocaleDateString() : "N/A"}</Text>
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
                    <Text style={styles.labelDetail}>beforeImplementation:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.beforeImplementationImagePath || "N/A"}</Text>
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

                {/* Card 3: Progress Timeline */}
{/* Progress Timeline Card */}
<View style={styles.cardDetail}>
  <Text style={styles.cardHeading}>📈 Progress Timeline</Text>
  {ideaDetail.timeline && ideaDetail.timeline.length > 0 ? (
    ideaDetail.timeline.map((item, idx) => (
      <TimelineItem
        key={idx}
        status={item.status}
        description={item.description}
        date={item.date}
        isLast={idx === ideaDetail.timeline.length - 1}
      />
    ))
  ) : (
    <Text style={{ color: "#777", marginTop: 8 }}>No timeline data available</Text>
  )}
</View>

                {/* Image */}
                {ideaDetail.beforeImplementationImagePath && (
                  <TouchableOpacity
                    style={styles.imageWrapper}
                    onPress={() => setShowImage(true)}
                  >
                    <Image source={{ uri: ideaDetail.beforeImplementationImagePath }} style={styles.thumbnail} />
                    <Text style={{ textAlign: "center", marginTop: 5, color: "blue" }}>View Image</Text>
                  </TouchableOpacity>
                )}

                {/* Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() => { editIdea(ideaDetail); setSelectedIdea(null); setIdeaDetail(null); }}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={() => { deleteIdea(ideaDetail); setSelectedIdea(null); }}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showImage} transparent animationType="fade">
        <View style={styles.imageModal}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowImage(false)}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: ideaDetail?.beforeImplementationImagePath }}
            style={styles.fullImage}
            resizeMode="contain"
          />
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
        setIdeas(response.data.data.ideas);
      } else {
        setIdeas([]);
      }
    } catch (error) {
      console.error("Error fetching ideas:", error);
      Alert.alert("Error", "Failed to load ideas from server.");
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  useEffect(() => {
    if (route.params?.newIdea) {
      const ideaWithStatus = { ...route.params.newIdea, ideaStatus: "Pending" };
      setIdeas((prevIdeas) => [...prevIdeas, ideaWithStatus]);
    }
  }, [route.params?.newIdea]);

  const deleteIdea = (idea) => {
    Alert.alert(
      "Delete Idea",
      "Are you sure you want to delete this idea?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setIdeas((prevIdeas) => prevIdeas.filter((i) => i !== idea));
          },
        },
      ]
    );
  };

  // ✅ Updated editIdea function
  const editIdea = (idea) => {
    console.log("Navigating to Edit Idea with data:", idea);

    navigation.navigate("EditIdea", {
      ideaId: idea.id ,
      ideaData: idea,
    });
  };

  const filterIdeas = (status) => {
    return ideas.filter((idea) => {
      const s = (idea.ideaStatus || "").toLowerCase();
      switch (status.toLowerCase()) {
        case "pending":
          return ["pending", "approval pending", "rm approval pending", "under review by be team", "be_team approval pending", "published", "draft"].includes(s);
        case "approved":
          return s === "closed";
        case "hold":
          return ["hold", "idea hold by be team", "implementation hold by be team", "idea hold by manager", "implementation hold by manager"].includes(s);
        case "rejected":
          return ["rejected", "implementation rejected by manager", "idea rejected by be team", "implementation rejected by be team", "idea rejected by manager"].includes(s);
        case "cancelled":
          return s === "cancelled";
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
        tabBarScrollEnabled: true,
      }}
    >
      <Tab.Screen name="Pending">{() => <IdeasList ideas={filterIdeas("Pending")} editIdea={editIdea} deleteIdea={deleteIdea} />}</Tab.Screen>
      <Tab.Screen name="Closed">{() => <IdeasList ideas={filterIdeas("Approved")} editIdea={editIdea} deleteIdea={deleteIdea} />}</Tab.Screen>
      <Tab.Screen name="Hold">{() => <IdeasList ideas={filterIdeas("Hold")} editIdea={editIdea} deleteIdea={deleteIdea} />}</Tab.Screen>
      <Tab.Screen name="Rejected">{() => <IdeasList ideas={filterIdeas("Rejected")} editIdea={editIdea} deleteIdea={deleteIdea} />}</Tab.Screen>
      <Tab.Screen name="Cancelled">{() => <IdeasList ideas={filterIdeas("Cancelled")} editIdea={editIdea} deleteIdea={deleteIdea} />}</Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: "#F2F4F9" },
  card: { backgroundColor: "#fff", borderRadius: 8, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: "#E0E0E0" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, borderBottomWidth: 0.5, borderColor: "#eee", paddingBottom: 4 },
  label: { fontSize: 14, color: "#555", fontWeight: "600" },
  value: { fontSize: 14, color: "#222", maxWidth: "60%", textAlign: "right" },
  statusBadge: { color: "#fff", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, fontSize: 12, overflow: "hidden" },
  buttonRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  button: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, marginLeft: 8 },
  editButton: { backgroundColor: "#4CAF50" },
  deleteButton: { backgroundColor: "#F44336" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  fullModal: { flex: 1, backgroundColor: "#fff" },
  closeButton: { position: "absolute", top: 10, right: 10, zIndex: 10 },
  closeText: { fontSize: 24, color: "#333" },
  cardDetail: { backgroundColor: "#F9FAFB", padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: "#E0E0E0" },
  cardHeading: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  rowDetail: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  labelDetail: { fontWeight: "600", color: "#555", width: "45%" },
  valueDetail: { color: "#222", width: "50%", textAlign: "right" },
  statusBadgeDetail: { color: "#fff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, overflow: "hidden" },
  imageWrapper: { alignItems: "center", marginVertical: 10 },
  thumbnail: { width: 120, height: 120, borderRadius: 8 },
  imageModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
  fullImage: { width: "90%", height: "70%" },
  loadingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.6)" }
});
