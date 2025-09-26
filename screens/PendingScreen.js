// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   SafeAreaView,
//   Alert,
//   ActivityIndicator,
//   ScrollView,
//   Modal,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import DateTimePicker from "@react-native-community/datetimepicker";

// const PENDING_APPROVALS_URL =
//   "https://ideabank-api-dev.abisaio.com/pending-approvals?sortOrder=desc&page=1&pageSize=10";

// // --- Timeline Item with Icons and Attractive Style ---
// function TimelineItem({ status, date, isCurrent }) {
//   const getColor = () => {
//     if (status === 'Created') return '#2196F3';
//     if (status.includes('Approved')) return '#4CAF50';
//     if (status === 'Pending') return '#FF9800';
//     if (status === 'Rejected') return '#f44336';
//     return '#ccc';
//   };

//   const getIcon = () => {
//     if (status === 'Created') return '📝';
//     if (status.includes('Approved')) return '✅';
//     if (status === 'Pending') return '⏳';
//     if (status === 'Rejected') return '❌';
//     return '⚪';
//   };

//   return (
//     <View style={styles.timelineItem}>
//       <View style={[styles.timelineDot, { backgroundColor: getColor() }]} />
//       <View style={styles.timelineTextContainer}>
//         <Text style={[styles.timelineStatus, isCurrent ? styles.timelineStatusCurrent : null]}>
//           {getIcon()} {status}
//         </Text>
//         {date && (
//           <Text style={styles.timelineDate}>
//             {new Date(date).toLocaleString()}
//           </Text>
//         )}
//       </View>
//     </View>
//   );
// }

// const PendingScreen = () => {
//   const [searchText, setSearchText] = useState("");
//   const [ideas, setIdeas] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [loadingDetail, setLoadingDetail] = useState(false);
//   const [token, setToken] = useState(null);
//   const [selectedIdea, setSelectedIdea] = useState(null);
//   const [ideaDetail, setIdeaDetail] = useState(null);

//   // Filter states
//   const [showFilters, setShowFilters] = useState(false);
//   const [fromDate, setFromDate] = useState(null);
//   const [toDate, setToDate] = useState(null);
//   const [showFromPicker, setShowFromPicker] = useState(false);
//   const [showToPicker, setShowToPicker] = useState(false);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const tok = await AsyncStorage.getItem("token");
//         if (!tok) throw new Error("Token not found");
//         setToken(tok);
//       } catch (e) {
//         Alert.alert("Error", "Auth token missing");
//       }
//     };
//     load();
//   }, []);

//   useEffect(() => {
//     if (token) {
//       fetchPending();
//     }
//   }, [token]);

//   const fetchPending = async (from, to) => {
//     setLoading(true);
//     try {
//       let url = PENDING_APPROVALS_URL;
//       const params = [];
//       if (from) params.push(`fromDate=${from}`);
//       if (to) params.push(`toDate=${to}`);
//       if (params.length > 0) url += `&${params.join("&")}`;

//       console.log("Fetch URL:", url);
//       const response = await fetch(url, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) throw new Error(`HTTP error ${response.status}`);
//       const data = await response.json();
//       let items = data?.data?.items || data.items || data.ideas || [];

//       // Frontend date filtering (creationDate)
//       if (from || to) {
//         const fromTime = from ? new Date(from).getTime() : null;
//         const toTime = to ? new Date(to).getTime() : null;

//         items = items.filter((item) => {
//           const createdTime = item.creationDate
//             ? new Date(item.creationDate).getTime()
//             : null;
//           if (!createdTime) return false;
//           if (fromTime && createdTime < fromTime) return false;
//           if (toTime && createdTime > toTime) return false;
//           return true;
//         });
//       }

//       setIdeas(items);
//     } catch (error) {
//       console.error("Fetch pending error:", error);
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchIdeaDetail = async (ideaId) => {
//     if (!ideaId) return;
//     try {
//       setLoadingDetail(true);
      
//       const idea = ideas.find(i => i.ideaId === ideaId || i.id === ideaId || i.ideaNumber === ideaId);
//       if (idea) {
//         // Create timeline from available data
//         const timeline = [];
        
//         // Add Created status
//         if (idea.creationDate) {
//           timeline.push({
//             status: 'Created',
//             date: idea.creationDate
//           });
//         }
        
//         // Add current status (Pending)
//         if (idea.status === 'Pending') {
//           timeline.push({
//             status: `Pending at ${idea.approvalStage || 'Review'}`,
//             date: idea.creationDate // Using creation date as placeholder
//           });
//         }
        
//         // Sort timeline by date
//         timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
        
//         // Set timeline in ideaDetail
//         const ideaWithTimeline = {
//           ...idea,
//           timeline: timeline,
//           currentStatus: idea.status
//         };
        
//         setIdeaDetail(ideaWithTimeline);
//         setSelectedIdea(ideaWithTimeline);
//         console.log("Timeline Events:", timeline);
//       } else {
//         Alert.alert("Error", "Idea details not found.");
//       }
//     } catch (error) {
//       console.error("Error fetching idea detail:", error);
//       Alert.alert("Error", "Failed to fetch idea details.");
//     } finally { 
//       setLoadingDetail(false); 
//     }
//   };

//   const applyFilters = () => {
//     const from = fromDate ? fromDate.toISOString().split("T")[0] : null;
//     const to = toDate ? toDate.toISOString().split("T")[0] : null;
//     fetchPending(from, to);
//     setShowFilters(false);
//   };

//   const resetFilters = () => {
//     setFromDate(null);
//     setToDate(null);
//     fetchPending();
//   };

//   const filtered = ideas.filter(
//     (idea) =>
//       (idea.ideaNumber || "")
//         .toLowerCase()
//         .includes(searchText.toLowerCase()) ||
//       (idea.ownerName || "")
//         .toLowerCase()
//         .includes(searchText.toLowerCase()) ||
//       (idea.description || "")
//         .toLowerCase()
//         .includes(searchText.toLowerCase())
//   );

//   const renderIdeaCard = ({ item }) => (
//     <TouchableOpacity 
//       style={styles.cardContainer}
//       activeOpacity={0.8}
//       onPress={() => fetchIdeaDetail(item.ideaId || item.id)}
//     >
//       <View style={styles.cardHeader}>
//         <Text style={styles.ideaNumber} numberOfLines={2}>
//           {item.ideaNumber || "–"}
//         </Text>
//         <View style={styles.typeTag}>
//           <Text style={styles.typeText}>{item.type || "Pending"}</Text>
//         </View>
//       </View>
//       <View style={styles.cardContent}>
//         <View style={styles.row}>
//           <Text style={styles.label}>Owner:</Text>
//           <Text style={styles.value} numberOfLines={2}>{item.ownerName || "N/A"}</Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Location:</Text>
//           <Text style={styles.value}>{item.location || "N/A"}</Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Department:</Text>
//           <Text style={styles.value}>{item.department || "N/A"}</Text>
//         </View>
//         <View style={styles.descriptionRow}>
//           <Text style={styles.label}>Description:</Text>
//           <Text numberOfLines={3} style={styles.description}>
//             {item.description || "N/A"}
//           </Text>
//         </View>
//         <View style={styles.dateRow}>
//           <View style={styles.dateColumn}>
//             <Text style={styles.label}>Status:</Text>
//             <Text style={styles.dateText}>{item.status || "Pending"}</Text>
//           </View>
//           <View style={styles.dateColumn}>
//             <Text style={styles.label}>Created:</Text>
//             <Text style={styles.dateText}>
//               {item.creationDate ? new Date(item.creationDate).toLocaleDateString() : "N/A"}
//             </Text>
//           </View>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Pending Ideas</Text>
//         <TouchableOpacity
//           style={styles.filterButton}
//           onPress={() => setShowFilters(!showFilters)}
//         >
//           <Text style={styles.filterButtonText}>
//             {showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}
//           </Text>
//           <Ionicons
//             name={showFilters ? "chevron-up" : "chevron-down"}
//             size={16}
//             color="#666"
//           />
//         </TouchableOpacity>
//       </View>

//       {/* Filter Panel */}
//       {showFilters && (
//         <View style={styles.filterPanel}>
//           <Text style={styles.filterLabel}>Create Date Range</Text>

//           {/* From Date */}
//           <TouchableOpacity
//             style={styles.dateInput}
//             onPress={() => setShowFromPicker(true)}
//           >
//             <Text style={styles.dateText}>
//               {fromDate ? fromDate.toLocaleDateString() : "Select From Date"}
//             </Text>
//           </TouchableOpacity>
//           {showFromPicker && (
//             <DateTimePicker
//               value={fromDate || new Date()}
//               mode="date"
//               display="default"
//               onChange={(_, date) => {
//                 setShowFromPicker(false);
//                 if (date) {
//                   setFromDate(date);
//                   if (toDate && date > toDate) setToDate(null);
//                 }
//               }}
//               maximumDate={toDate || undefined}
//             />
//           )}

//           {/* To Date */}
//           <TouchableOpacity
//             style={styles.dateInput}
//             onPress={() => setShowToPicker(true)}
//           >
//             <Text style={styles.dateText}>
//               {toDate ? toDate.toLocaleDateString() : "Select To Date"}
//             </Text>
//           </TouchableOpacity>
//           {showToPicker && (
//             <DateTimePicker
//               value={toDate || (fromDate || new Date())}
//               mode="date"
//               display="default"
//               onChange={(_, date) => {
//                 setShowToPicker(false);
//                 if (date) setToDate(date);
//               }}
//               minimumDate={fromDate || undefined}
//             />
//           )}

//           <View style={styles.filterButtons}>
//             <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
//               <Text style={styles.btnText}>Apply</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
//               <Text style={styles.btnText}>Reset</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {/* Search */}
//       <View style={styles.searchSection}>
//         <View style={styles.searchContainer}>
//           <Text style={styles.searchLabel}>Search:</Text>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Idea Number / Owner / Description"
//             value={searchText}
//             onChangeText={setSearchText}
//             placeholderTextColor="#999"
//           />
//         </View>
//       </View>

//       {/* Idea List */}
//       {loading ? (
//         <View style={styles.loadingWrapper}>
//           <ActivityIndicator size="large" color="#0000ff" />
//         </View>
//       ) : (
//         filtered.length > 0 ? (
//           <FlatList
//             data={filtered}
//             renderItem={renderIdeaCard}
//             keyExtractor={(item, idx) =>
//               (item.ideaId?.toString() || item.id?.toString() || idx.toString())
//             }
//             contentContainerStyle={{ padding: 16 }}
//             showsVerticalScrollIndicator={false}
//           />
//         ) : (
//           <View style={styles.noResultContainer}>
//             <Text style={styles.noResultText}>No results found.</Text>
//           </View>
//         )
//       )}

//       {loadingDetail && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#0000ff" />
//         </View>
//       )}

//       {/* Modal */}
//       <Modal visible={!!selectedIdea} animationType="slide">
//         <SafeAreaView style={styles.fullModal}>
//           <TouchableOpacity 
//             style={styles.closeButton} 
//             onPress={() => setSelectedIdea(null)}
//           >
//             <Text style={styles.closeText}>X</Text>
//           </TouchableOpacity>
//           <ScrollView contentContainerStyle={styles.modalContent}>
//             {ideaDetail && (
//               <View>
//                 {/* Employee Details */}
//                 <View style={styles.sectionCard}>
//                   <Text style={styles.sectionTitle}>👨🏻‍💻Employee Details</Text>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Employee Name:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.ownerName}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Employee No:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.ownerEmployeeNo || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Department:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.department}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Location:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.location}</Text>
//                   </View>
                  
//                 </View>

//                 {/* Idea Information */}
//                 <View style={[styles.sectionCard, { marginTop: 16 }]}>
//                   <Text style={styles.sectionTitle}>💡Idea Information</Text>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Idea Number:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.ideaNumber}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Status:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.status}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Type:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.type}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Creation Date:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.creationDate ? new Date(ideaDetail.creationDate).toLocaleString() : "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Description:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.description}</Text>
//                   </View>
//                 </View>

//                 {/* Progress Timeline */}
//                 <View style={[styles.sectionCard, { marginTop: 16, marginBottom: 32 }]}>
//                   <Text style={styles.sectionTitle}>⏱️Progress Timeline</Text>
//                   {ideaDetail.timeline && ideaDetail.timeline.length > 0 ? (
//                     ideaDetail.timeline.map((evt, idx) => (
//                       <TimelineItem
//                         key={idx}
//                         status={evt.status}
//                         date={evt.date}
//                         isCurrent={evt.status.includes(ideaDetail.currentStatus)}
//                       />
//                     ))
//                   ) : (
//                     <View>
//                       <Text style={{ fontStyle: 'italic', marginBottom: 10 }}>
//                         Creating timeline from available data...
//                       </Text>
//                       {ideaDetail.creationDate && (
//                         <TimelineItem
//                           status="Created"
//                           date={ideaDetail.creationDate}
//                           isCurrent={false}
//                         />
//                       )}
//                       <TimelineItem
//                         status={`Pending at ${ideaDetail.approvalStage || 'Review'}`}
//                         date={ideaDetail.creationDate}
//                         isCurrent={true}
//                       />
//                     </View>
//                   )}
//                 </View>
//               </View>
//             )}
//           </ScrollView>
//         </SafeAreaView>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default PendingScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f5f5f5" },
//   header: {
//     backgroundColor: "#fff",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e0e0e0",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
//   filterButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f0f0f0",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 4,
//   },
//   filterButtonText: {
//     fontSize: 12,
//     color: "#666",
//     marginRight: 4,
//     fontWeight: "500",
//   },
//   filterPanel: {
//     backgroundColor: "#fff",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e0e0e0",
//   },
//   filterLabel: {
//     fontSize: 16,
//     fontWeight: "500",
//     marginBottom: 8,
//     color: "#333",
//   },
//   dateInput: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 6,
//     padding: 12,
//     marginBottom: 10,
//     backgroundColor: "#f9f9f9",
//   },
//   dateText: { fontSize: 14, color: "#333" },
//   filterButtons: { flexDirection: "row", marginTop: 12 },
//   applyBtn: {
//     flex: 1,
//     backgroundColor: "#004b6f",
//     padding: 12,
//     borderRadius: 6,
//     alignItems: "center",
//     marginRight: 8,
//   },
//   resetBtn: {
//     flex: 1,
//     backgroundColor: "#777",
//     padding: 12,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
//   searchSection: {
//     backgroundColor: "#fff",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e0e0e0",
//   },
//   searchContainer: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   searchLabel: {
//     fontSize: 16,
//     color: "#333",
//     marginRight: 8,
//     fontWeight: "500",
//   },
//   searchInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 4,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     fontSize: 14,
//     backgroundColor: "#fff",
//   },
//   cardContainer: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     marginBottom: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardHeader: {
//     backgroundColor: "#4169E1", 
//     padding: 12,
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//   },
//   ideaNumber: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//     flex: 1,
//     marginRight: 8,
//   },
//   typeTag: {
//     backgroundColor: "rgba(255,255,255,0.2)",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   typeText: { color: "#fff", fontSize: 12, fontWeight: "500" },
//   cardContent: { padding: 12 },
//   row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
//   label: { color: "#555", fontWeight: "500", fontSize: 14 },
//   value: { color: "#333", fontSize: 14, maxWidth: "65%", textAlign: "right" },
//   descriptionRow: { marginTop: 6 },
//   description: { color: "#333", fontSize: 14 },
//   dateRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 8,
//   },
//   dateColumn: { flexDirection: "column" },
//   dateText: { color: "#333", fontSize: 12 },
//   loadingWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
//   loadingOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.3)",
//   },
//   fullModal: { flex: 1, backgroundColor: "#f5f5f5" },
//   closeButton: {
//     position: "absolute",
//     top: 16,
//     right: 16,
//     zIndex: 10,
//     backgroundColor: "#000",
//     borderRadius: 20,
//     padding: 5,
//   },
//   closeText: { color: "#fff", fontSize: 16 },
//   modalContent: { padding: 16 },
//   sectionCard: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     padding: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 12,
//     color: "#333",
//   },
//   labelDetail: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#555",
//     flex: 1,
//   },
//   valueDetail: {
//     fontSize: 14,
//     color: "#222",
//     flex: 1,
//     textAlign: "right",
//   },
//   rowDetail: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   timelineItem: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginBottom: 12,
//   },
//   timelineDot: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     marginRight: 12,
//     marginTop: 4,
//   },
//   timelineTextContainer: { flex: 1 },
//   timelineStatus: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   timelineStatusCurrent: { color: "#FF9800" },
//   timelineDate: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 2,
//   },
//   noResultContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   noResultText: { fontSize: 16, color: "#555" },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

const PENDING_APPROVALS_URL =
  "https://ideabank-api-dev.abisaio.com/pending-approvals?sortOrder=desc&page=1&pageSize=10";

function TimelineItem({ status, date, isCurrent }) {
  const getColor = () => {
    if (status === 'Created') return '#2196F3';
    if (status.includes('Approved')) return '#4CAF50';
    if (status === 'Pending') return '#FF9800';
    if (status === 'Rejected') return '#f44336';
    return '#ccc';
  };

  const getIcon = () => {
    if (status === 'Created') return '📝';
    if (status.includes('Approved')) return '✅';
    if (status === 'Pending') return '⏳';
    if (status === 'Rejected') return '❌';
    return '⚪';
  };

  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineDot, { backgroundColor: getColor() }]} />
      <View style={styles.timelineTextContainer}>
        <Text style={[styles.timelineStatus, isCurrent ? styles.timelineStatusCurrent : null]}>
          {getIcon()} {status}
        </Text>
        {date && (
          <Text style={styles.timelineDate}>
            {new Date(date).toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );
}

const PendingScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [token, setToken] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ideaDetail, setIdeaDetail] = useState(null);

  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const tok = await AsyncStorage.getItem("token");
        if (!tok) throw new Error("Token not found");
        setToken(tok);
      } catch (e) {
        Alert.alert("Error", "Auth token missing");
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (token) {
      fetchPending();
    }
  }, [token]);

  const fetchPending = async (from, to) => {
    setLoading(true);
    try {
      let url = PENDING_APPROVALS_URL;
      const params = [];
      if (from) params.push(`fromDate=${from}`);
      if (to) params.push(`toDate=${to}`);
      if (params.length > 0) url += `&${params.join("&")}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      let items = data?.data?.items || data.items || data.ideas || [];

      if (from || to) {
        const fromTime = from ? new Date(from).getTime() : null;
        const toTime = to ? new Date(to).getTime() : null;

        items = items.filter((item) => {
          const createdTime = item.creationDate
            ? new Date(item.creationDate).getTime()
            : null;
          if (!createdTime) return false;
          if (fromTime && createdTime < fromTime) return false;
          if (toTime && createdTime > toTime) return false;
          return true;
        });
      }

      setIdeas(items);
    } catch (error) {
      console.error("Fetch pending error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchIdeaDetail = async (ideaId) => {
    if (!ideaId) return;
    try {
      setLoadingDetail(true);
      
      const idea = ideas.find(i => i.ideaId === ideaId || i.id === ideaId || i.ideaNumber === ideaId);
      if (idea) {
        const timeline = [];
        if (idea.creationDate) {
          timeline.push({ status: 'Created', date: idea.creationDate });
        }
        if (idea.status === 'Pending') {
          timeline.push({
            status: `Pending at ${idea.approvalStage || 'Review'}`,
            date: idea.creationDate
          });
        }
        timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
        const ideaWithTimeline = {
          ...idea,
          timeline,
          currentStatus: idea.status
        };
        setIdeaDetail(ideaWithTimeline);
        setSelectedIdea(ideaWithTimeline);
        // Reset collapse when opening
        setShowEmployeeDetails(false);
      } else {
        Alert.alert("Error", "Idea details not found.");
      }
    } catch (error) {
      console.error("Error fetching idea detail:", error);
      Alert.alert("Error", "Failed to fetch idea details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const applyFilters = () => {
    const from = fromDate ? fromDate.toISOString().split("T")[0] : null;
    const to = toDate ? toDate.toISOString().split("T")[0] : null;
    fetchPending(from, to);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFromDate(null);
    setToDate(null);
    fetchPending();
  };

  const filtered = ideas.filter(
    (idea) =>
      (idea.ideaNumber || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (idea.ownerName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (idea.description || "")
        .toLowerCase()
        .includes(searchText.toLowerCase())
  );

  const renderIdeaCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.cardContainer}
      activeOpacity={0.8}
      onPress={() => fetchIdeaDetail(item.ideaId || item.id)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.ideaNumber} numberOfLines={2}>
          {item.ideaNumber || "–"}
        </Text>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{item.type || "Pending"}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <Text style={styles.label}>Owner:</Text>
          <Text style={styles.value} numberOfLines={2}>{item.ownerName || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{item.location || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Department:</Text>
          <Text style={styles.value}>{item.department || "N/A"}</Text>
        </View>
        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Description:</Text>
          <Text numberOfLines={3} style={styles.description}>
            {item.description || "N/A"}
          </Text>
        </View>
        <View style={styles.dateRow}>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.dateText}>{item.status || "Pending"}</Text>
          </View>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.dateText}>
              {item.creationDate ? new Date(item.creationDate).toLocaleDateString() : "N/A"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pending Ideas</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>
            {showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}
          </Text>
          <Ionicons
            name={showFilters ? "chevron-up" : "chevron-down"}
            size={16}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Create Date Range</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowFromPicker(true)}
          >
            <Text style={styles.dateText}>
              {fromDate ? fromDate.toLocaleDateString() : "Select From Date"}
            </Text>
          </TouchableOpacity>
          {showFromPicker && (
            <DateTimePicker
              value={fromDate || new Date()}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowFromPicker(false);
                if (date) {
                  setFromDate(date);
                  if (toDate && date > toDate) setToDate(null);
                }
              }}
              maximumDate={toDate || undefined}
            />
          )}
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowToPicker(true)}
          >
            <Text style={styles.dateText}>
              {toDate ? toDate.toLocaleDateString() : "Select To Date"}
            </Text>
          </TouchableOpacity>
          {showToPicker && (
            <DateTimePicker
              value={toDate || (fromDate || new Date())}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowToPicker(false);
                if (date) setToDate(date);
              }}
              minimumDate={fromDate || undefined}
            />
          )}
          <View style={styles.filterButtons}>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
              <Text style={styles.btnText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
              <Text style={styles.btnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Search:</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Idea Number / Owner / Description"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        filtered.length > 0 ? (
          <FlatList
            data={filtered}
            renderItem={renderIdeaCard}
            keyExtractor={(item, idx) =>
              (item.ideaId?.toString() || item.id?.toString() || idx.toString())
            }
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noResultContainer}>
            <Text style={styles.noResultText}>No results found.</Text>
          </View>
        )
      )}

      {loadingDetail && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      <Modal visible={!!selectedIdea} animationType="slide">
        <SafeAreaView style={styles.fullModal}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setSelectedIdea(null)}
          >
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {ideaDetail && (
              <View>
                {/* Collapsible Employee Details Section */}
                <TouchableOpacity
                  style={styles.collapsibleHeader}
                  onPress={() => setShowEmployeeDetails(!showEmployeeDetails)}
                >
               
                  <Text style={styles.sectionTitle}>👨🏻‍💻 Employee Details</Text>
                  <Ionicons
                    name={ showEmployeeDetails ? "chevron-down" : "chevron-forward" }
                    size={20}
                    color="#333"
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>

                { showEmployeeDetails && (
                  <View style={styles.sectionCard}>
                    <View style={styles.rowDetail}>
                      <Text style={styles.labelDetail}>Employee Name:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerName}</Text>
                    </View>
                    <View style={styles.rowDetail}>
                      <Text style={styles.labelDetail}>Employee No:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.ownerEmployeeNo || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetail}>
                      <Text style={styles.labelDetail}>Department:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.department}</Text>
                    </View>
                    <View style={styles.rowDetail}>
                      <Text style={styles.labelDetail}>Location:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.location}</Text>
                    </View>
                  </View>
                )}

                {/* Idea Information (always visible below) */}
                <View style={[styles.sectionCard, { marginTop: 16 }]}>
                  <Text style={styles.sectionTitle}>💡 Idea Information</Text>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Idea Number:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.ideaNumber}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Status:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.status}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Type:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.type}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Creation Date:</Text>
                    <Text style={styles.valueDetail}>
                      {ideaDetail.creationDate ? new Date(ideaDetail.creationDate).toLocaleString() : "N/A"}
                    </Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Description:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.description}</Text>
                  </View>
                </View>

                {/* Progress Timeline */}
                <View style={[styles.sectionCard, { marginTop: 16, marginBottom: 32 }]}>
                  <Text style={styles.sectionTitle}>⏱️ Progress Timeline</Text>
                  {ideaDetail.timeline && ideaDetail.timeline.length > 0 ? (
                    ideaDetail.timeline.map((evt, idx) => (
                      <TimelineItem
                        key={idx}
                        status={evt.status}
                        date={evt.date}
                        isCurrent={evt.status.includes(ideaDetail.currentStatus)}
                      />
                    ))
                  ) : (
                    <View>
                      <Text style={{ fontStyle: 'italic', marginBottom: 10 }}>
                        Creating timeline from available data...
                      </Text>
                      {ideaDetail.creationDate && (
                        <TimelineItem
                          status="Created"
                          date={ideaDetail.creationDate}
                          isCurrent={false}
                        />
                      )}
                      <TimelineItem
                        status={`Pending at ${ideaDetail.approvalStage || 'Review'}`}
                        date={ideaDetail.creationDate}
                        isCurrent={true}
                      />
                    </View>
                  )}
                </View>

              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default PendingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  filterButtonText: {
    fontSize: 12,
    color: "#666",
    marginRight: 4,
    fontWeight: "500",
  },
  filterPanel: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  dateText: { fontSize: 14, color: "#333" },
  filterButtons: { flexDirection: "row", marginTop: 12 },
  applyBtn: {
    flex: 1,
    backgroundColor: "#004b6f",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginRight: 8,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: "#777",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
  searchSection: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  searchLabel: {
    fontSize: 16,
    color: "#333",
    marginRight: 8,
    fontWeight: "500",
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    backgroundColor: "#4169E1",
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  ideaNumber: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  typeTag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  cardContent: { padding: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { color: "#555", fontWeight: "500", fontSize: 14 },
  value: { color: "#333", fontSize: 14, maxWidth: "65%", textAlign: "right" },
  descriptionRow: { marginTop: 6 },
  description: { color: "#333", fontSize: 14 },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  dateColumn: { flexDirection: "column" },
  dateText: { color: "#333", fontSize: 12 },
  loadingWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  fullModal: { flex: 1, backgroundColor: "#f5f5f5" },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "#000",
    borderRadius: 20,
    padding: 5,
  },
  closeText: { color: "#fff", fontSize: 16 },
  modalContent: { padding: 16 },
  collapsibleHeader: {
    flexDirection: "row",
    alignItems: "center",
    // paddingVertical: 8,
    // backgroundColor: "#eee",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  labelDetail: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    flex: 1,
  },
  valueDetail: {
    fontSize: 14,
    color: "#222",
    flex: 1,
    textAlign: "right",
  },
  rowDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  timelineTextContainer: { flex: 1 },
  timelineStatus: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  timelineStatusCurrent: { color: "#FF9800" },
  timelineDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  noResultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noResultText: { fontSize: 16, color: "#555" },
});
