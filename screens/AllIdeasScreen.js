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
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ALL_TEAM_IDEAS_URL, IDEA_DETAIL_URL } from "../src/context/api";

function TimelineItem({ status, date, description, isLast, isFirst }) {
  const getCircleColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('created')) return "#2196F3"; // Blue
    if (s.includes('edited')) return "#9C27B0"; // Purple
    if (s.includes('approved')) return "#4CAF50"; // Green
    if (s.includes('pending')) return "#FF9800"; // Orange
    if (s.includes('implementation')) return "#9C27B0"; // Purple
    if (s.includes('rejected')) return "#F44336"; // Red
    return "#9E9E9E"; // Gray
  };

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineCircle, { backgroundColor: getCircleColor(status) }]} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={styles.timelineStatus}>{status}</Text>
        {description && (
          <Text style={styles.timelineDescription}>{description}</Text>
        )}
        {date && (
          <Text style={styles.timelineDate}>
            {new Date(date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        )}
      </View>
    </View>
  );
}

const getStatusColor = (status) => {
  if (!status) return "gray";
  const s = status.toLowerCase();
  if (s === "draft") return "blue";
  if (s === "published") return "green";
  if (s === "pending") return "orange";
  if (s === "approved" || s === "closed") return "gray";
  if (s === "rejected") return "red";
  if (s === "hold") return "yellow";
  return "gray";
};

export default function AllTeamIdeasScreen() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [searchIdeaNumber, setSearchIdeaNumber] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modal states
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [ideaDetail, setIdeaDetail] = useState(null);

  useEffect(() => {
    fetchIdeas();
  }, [page, searchIdeaNumber, fromDate, toDate]);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      // Build URL with pagination & search query params
      let url = `${ALL_TEAM_IDEAS_URL}?page=${page}&pageSize=${pageSize}`;
      if (searchIdeaNumber.trim()) {
        url += `&ideaNumber=${searchIdeaNumber.trim()}`;
      }
      if (fromDate.trim()) {
        url += `&fromDate=${fromDate.trim()}`;
      }
      if (toDate.trim()) {
        url += `&toDate=${toDate.trim()}`;
      }

      const response = await axios.get(url, {
        headers: authHeaders,
      });

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.items)
      ) {
        setIdeas(response.data.data.items);
        setTotalItems(response.data.data.total || 0);
      } else {
        setIdeas([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching all team ideas:", error);
      Alert.alert("Error", "Failed to load team ideas.");
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

  const clearFilters = () => {
    setSearchIdeaNumber("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageButtons = [];
    for (let i = 1; i <= totalPages; i++) {
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
          style={[
            styles.pageButton,
            page === 1 && { opacity: 0.5 },
          ]}
        >
          <Text style={styles.pageButtonText}>Previous</Text>
        </TouchableOpacity>

        {pageButtons}

        <TouchableOpacity
          disabled={page === totalPages}
          onPress={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          style={[
            styles.pageButton,
            page === totalPages && { opacity: 0.5 },
          ]}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>All Team Ideas</Text> */}
      {/* Search and Filter Controls Row */}
      <View style={styles.controlsRow}>
        <TextInput
          placeholder="Search by Idea Number"
          style={styles.searchInput}
          value={searchIdeaNumber}
          onChangeText={(text) => setSearchIdeaNumber(text)}
        />
        <TouchableOpacity
          style={styles.filterToggleBtn}
          onPress={() => setShowFilters((prev) => !prev)}
        >
          <Text style={styles.filterToggleText}>
            SHOW FILTERS {showFilters ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters Section */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.dateFilterRow}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>From Date:</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                style={styles.dateInput}
                value={fromDate}
                onChangeText={(text) => setFromDate(text)}
              />
            </View>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>To Date:</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                style={styles.dateInput}
                value={toDate}
                onChangeText={(text) => setToDate(text)}
              />
            </View>
          </View>
          <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cards List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {ideas.length === 0 ? (
            <Text style={styles.noDataText}>No ideas found.</Text>
          ) : (
            ideas.map((idea, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                style={styles.card}
                onPress={() => fetchIdeaDetail(idea.id || idea.ideaNumber)}
              >
                <View style={styles.row}>
                  <Text style={styles.label}>Idea No</Text>
                  <Text style={styles.value}>{idea.ideaNumber || "N/A"}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Owner Name</Text>
                  <Text style={styles.value}>{idea.ownerName || "N/A"}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Location</Text>
                  <Text style={styles.value}>{idea.location || "N/A"}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Department</Text>
                  <Text style={styles.value}>{idea.department || "N/A"}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Description</Text>
                  <Text style={styles.value} numberOfLines={2}>{idea.description || "N/A"}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Type</Text>
                  <Text style={styles.value}>{idea.type || "N/A"}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Created Date</Text>
                  <Text style={styles.value}>
                    {idea.creationDate ? new Date(idea.creationDate).toLocaleDateString() : "N/A"}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Status</Text>
                  <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(idea.status) }]}>
                    {idea.status || "N/A"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* Loading overlay for detail fetch */}
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
                    <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerName || ideaDetail.ownerName || "N/A"}</Text>
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
                    <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerDepartment || ideaDetail.department || "N/A"}</Text>
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
                    <Text style={styles.valueDetail}>
                      {ideaDetail.ideaCreationDate || ideaDetail.creationDate ? 
                        new Date(ideaDetail.ideaCreationDate || ideaDetail.creationDate).toLocaleDateString() : "N/A"}
                    </Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Status:</Text>
                    <Text style={[styles.statusBadgeDetail, { backgroundColor: getStatusColor(ideaDetail.ideaStatus || ideaDetail.status) }]}>
                      {ideaDetail.ideaStatus || ideaDetail.status || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Idea Description:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.ideaDescription || ideaDetail.description || "N/A"}</Text>
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
                    <Text style={styles.labelDetail}>Type:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.type || "N/A"}</Text>
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
                <View style={styles.cardDetail}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.cardHeading}>📈Progress Timeline</Text>
                  </View>
                  <View style={styles.timelineContainer}>
                    {ideaDetail.timeline && ideaDetail.timeline.length > 0 ? (
                      ideaDetail.timeline.map((item, idx) => (
                        <TimelineItem
                          key={idx}
                          status={item.status}
                          date={item.date}
                          description={item.description}
                          isLast={idx === ideaDetail.timeline.length - 1}
                          isFirst={idx === 0}
                        />
                      ))
                    ) : (
                      <Text style={styles.noTimelineText}>No timeline data available</Text>
                    )}
                  </View>
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
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Image Modal */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 10,
    backgroundColor: "#F2F4F9",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  filterToggleBtn: {
    backgroundColor: "#cccccc",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  filterToggleText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  filtersContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dateFilterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dateInputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  dateInput: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    fontSize: 14,
  },
  clearFiltersBtn: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: "center",
  },
  clearFiltersText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
    paddingBottom: 4,
  },
  label: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },
  value: {
    fontSize: 14,
    color: "#222",
    maxWidth: "60%",
    textAlign: "right",
  },
  statusBadge: {
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 12,
    overflow: "hidden",
  },
  noDataText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 15,
    flexWrap: "wrap",
  },
  pageButton: {
    marginHorizontal: 5,
    marginVertical: 3,
    backgroundColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  pageButtonActive: {
    backgroundColor: "#0A5064",
  },
  pageButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  pageButtonTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  fullModal: {
    flex: 1,
    backgroundColor: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  closeText: {
    fontSize: 20,
    color: "gray",
    fontWeight: "bold",
  },
  cardDetail: {
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 1,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  rowDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  labelDetail: {
    fontWeight: "600",
    color: "#555",
    width: "45%",
  },
  valueDetail: {
    color: "#222",
    width: "50%",
    textAlign: "right",
  },
  statusBadgeDetail: {
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    overflow: "hidden",
  },
  
  // Timeline Styles
  timelineHeader: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: -15,
    marginTop: -15,
    marginBottom: 15,
  },
  timelineContainer: {
    paddingLeft: 5,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 15,
  },
  timelineCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  timelineLine: {
    width: 2,
    backgroundColor: "#E0E0E0",
    flex: 1,
    marginTop: 5,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 10,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  timelineDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    lineHeight: 16,
  },
  timelineDate: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },
 noTimelineText: {
    color: "#777",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },

  imageWrapper: {
    alignItems: "center",
    marginVertical: 10,
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  imageModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
  },
});
