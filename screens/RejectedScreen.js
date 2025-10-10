// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   ScrollView,
//   Modal,
//   Image,
// } from "react-native";
// import { Ionicons } from '@expo/vector-icons';
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { REJECTED_BY_ME_URL, IDEA_DETAIL_URL } from "../src/context/api";

// function TimelineItem({ status, date, description, isLast, isFirst }) {
//   const getCircleColor = (status) => {
//     const s = status?.toLowerCase() || '';
//     if (s.includes('created')) return "#2196F3";
//     if (s.includes('edited')) return "#9C27B0";
//     if (s.includes('approved')) return "#4CAF50";
//     if (s.includes('pending')) return "#FF9800";
//     if (s.includes('implementation')) return "#9C27B0";
//     if (s.includes('rejected')) return "#F44336";
//     return "#9E9E9E";
//   };

//   return (
//     <View style={styles.timelineItem}>
//       <View style={styles.timelineLeft}>
//         <View style={[styles.timelineCircle, { backgroundColor: getCircleColor(status) }]} />
//         {!isLast && <View style={styles.timelineLine} />}
//       </View>
//       <View style={styles.timelineContent}>
//         <Text style={styles.timelineStatus}>{status}</Text>
//         {description && (
//           <Text style={styles.timelineDescription}>{description}</Text>
//         )}
//         {date && (
//           <Text style={styles.timelineDate}>
//             {new Date(date).toLocaleDateString('en-IN', {
//               day: 'numeric',
//               month: 'short',
//               year: 'numeric',
//               hour: '2-digit',
//               minute: '2-digit'
//             })}
//           </Text>
//         )}
//       </View>
//     </View>
//   );
// }

// function RemarksCard({ title, comment, date }) {
//   return (
//     <View style={styles.remarkCard}>
//       <Text style={styles.remarkTitle}>{title}</Text>
//       <Text style={styles.remarkComment}>{comment}</Text>
//       <Text style={styles.remarkDate}>{date}</Text>
//     </View>
//   );
// }

// const getStatusColor = (status) => {
//   if (!status) return "gray";
//   const s = status.toLowerCase();
//   if (s === "draft") return "blue";
//   if (s === "published") return "green";
//   if (s === "pending") return "orange";
//   if (s === "approved" || s === "closed") return "gray";
//   if (s === "rejected") return "red";
//   if (s === "hold" || s === "on hold") return "yellow";
//   return "gray";
// };

// export default function RejectedByMeScreen() {
//   const [ideas, setIdeas] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [totalItems, setTotalItems] = useState(0);
//   const [showFilters, setShowFilters] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const [selectedIdea, setSelectedIdea] = useState(null);
//   const [showImage, setShowImage] = useState(false);
//   const [loadingDetail, setLoadingDetail] = useState(false);
//   const [ideaDetail, setIdeaDetail] = useState(null);
//   const [showTimelineModal, setShowTimelineModal] = useState(false);

//   useEffect(() => {
//     fetchIdeas();
//   }, [searchTerm, statusFilter, fromDate, toDate]);

//   const fetchIdeas = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem("token");
//       const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

//       let url = `${REJECTED_BY_ME_URL.split('?')[0]}?sortOrder=desc&page=1&pageSize=1000`;
      
//       if (searchTerm.trim()) {
//         url += `&searchTerm=${encodeURIComponent(searchTerm.trim())}`;
//       }
      
//       if (statusFilter && statusFilter !== "All Status") {
//         url += `&statusFilter=${encodeURIComponent(statusFilter)}`;
//       }
      
//       if (fromDate.trim()) {
//         url += `&startDate=${fromDate.trim()}`;
//       }
//       if (toDate.trim()) {
//         url += `&endDate=${toDate.trim()}`;
//       }

//       const response = await axios.get(url, {
//         headers: authHeaders,
//       });

//       if (
//         response.data &&
//         response.data.data &&
//         Array.isArray(response.data.data.items)
//       ) {
//         setIdeas(response.data.data.items);
//         setTotalItems(response.data.data.totalItems || response.data.data.total || 0);
//       } else {
//         setIdeas([]);
//         setTotalItems(0);
//       }
//     } catch (error) {
//       console.error("Error fetching rejected ideas:", error);
//       Alert.alert("Error", "Failed to load rejected ideas.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchIdeaDetail = async (ideaId) => {
//     console.log("Fetching detail for ideaId:", ideaId);
//     if (!ideaId) return;
//     try {
//       setLoadingDetail(true);
//       const token = await AsyncStorage.getItem('token');
//       const headers = token ? { Authorization: `Bearer ${token}` } : {};

//      // const { data: response } = await axios.get(`${IDEA_DETAIL_URL}/${encodeURIComponent(ideaId)}`, { headers });
//      const { data: response } = await axios.get(`${IDEA_DETAIL_URL}?ideaId=${encodeURIComponent(ideaId)}`, { headers });
//      console.log(" Idea Detail API Response:", response);
//      console.log("Keys in response.data:", Object.keys(response.data));
//       if (response?.success && response?.data) {
//         setIdeaDetail(response.data);
//         setSelectedIdea(response.data);
//       } else {
//         Alert.alert("Error", response?.message || "Idea details not found.");
//       }
//     } catch (error) {
//       console.error("Error fetching idea detail:", error);
//       Alert.alert("Error", "Failed to fetch idea details.");
//     } finally {
//       setLoadingDetail(false);
//     }
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setStatusFilter("");
//     setFromDate("");
//     setToDate("");
//   };

//   const applyFilters = () => {
//     setShowFilters(false);
//     fetchIdeas();
//   };

//   const safeRenderValue = (value) => {
//     if (value === null || value === undefined) return "N/A";
//     if (typeof value === "object") return JSON.stringify(value);
//     return String(value);
//   };

//   const parseRemarks = (remarkData) => {
//     if (!remarkData) return [];
    
//     if (Array.isArray(remarkData)) {
//       return remarkData;
//     }
    
//     if (typeof remarkData === "object") {
//       const keys = Object.keys(remarkData);
//       if (keys.length > 0 && keys.every(k => !isNaN(k))) {
//         return Object.values(remarkData);
//       }
//       return [remarkData];
//     }
    
//     return [];
//   };

//   const handleStatusSelect = () => {
//     Alert.alert(
//       "Select Status",
//       "",
//       [
//         { text: "All Status", onPress: () => setStatusFilter("") },
//         { text: "Draft", onPress: () => setStatusFilter("Draft") },
//         { text: "Published", onPress: () => setStatusFilter("Published") },
//         { text: "Pending", onPress: () => setStatusFilter("Pending") },
//         { text: "Closed", onPress: () => setStatusFilter("Closed") },
//         { text: "Rejected", onPress: () => setStatusFilter("Rejected") },
//         { text: "On Hold", onPress: () => setStatusFilter("On Hold") },
//         { text: "Cancel", style: "cancel" }
//       ]
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Rejected Idea</Text>
//         <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
//           <Text style={styles.filterButtonText}>{showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}</Text>
//           <Text style={styles.filterArrow}>{showFilters ? "▲" : "▼"}</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.searchSection}>
//         <View style={styles.searchContainer}>
//           <Text style={styles.searchLabel}>Search:</Text>
//           <TextInput
//             placeholder="Idea Number / Owner / Description"
//             style={styles.searchInput}
//             value={searchTerm}
//             onChangeText={(text) => setSearchTerm(text)}
//             placeholderTextColor="#999"
//           />
//         </View>
//       </View>

//       {showFilters && (
//         <View style={styles.filtersContainer}>
//           <View style={styles.dateFilterRow}>
//             <View style={styles.dateInputContainer}>
//               <Text style={styles.dateLabel}>Create Date</Text>
//               <TextInput
//                 placeholder="DD/MM/YYYY - DD/MM/YYYY"
//                 style={styles.dateInput}
//                 value={fromDate && toDate ? `${fromDate} - ${toDate}` : ""}
//                 editable={false}
//               />
//             </View>
//           </View>
          
//           <View style={styles.datePickerRow}>
//             <View style={styles.dateInputContainer}>
//               <TextInput
//                 placeholder="From: DD/MM/YYYY"
//                 style={styles.datePickerInput}
//                 value={fromDate}
//                 onChangeText={(text) => setFromDate(text)}
//               />
//             </View>
//             <View style={styles.dateInputContainer}>
//               <TextInput
//                 placeholder="To: DD/MM/YYYY"
//                 style={styles.datePickerInput}
//                 value={toDate}
//                 onChangeText={(text) => setToDate(text)}
//               />
//             </View>
//           </View>

//           <View style={styles.statusFilterRow}>
//             <Text style={styles.dateLabel}>Status</Text>
//             <TouchableOpacity 
//               style={styles.pickerWrapper}
//               onPress={handleStatusSelect}
//             >
//               <Text style={styles.pickerText}>{statusFilter || "All Status"}</Text>
//               <View style={styles.pickerButton}>
//                 <Ionicons name="chevron-down" size={18} color="#666" />
//               </View>
//             </TouchableOpacity>
//           </View>

//           <View style={styles.filterButtons}>
//             <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
//               <Text style={styles.btnText}>Apply</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.resetBtn} onPress={clearFilters}>
//               <Text style={styles.btnText}>Reset</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {loading ? (
//         <ActivityIndicator size="large" color="#0A5064" style={{ marginTop: 20 }} />
//       ) : (
//         <ScrollView contentContainerStyle={styles.scrollContainer}>
//           {ideas.length === 0 ? (
//             <Text style={styles.noDataText}>No rejected ideas found.</Text>
//           ) : (
//             <>
//               {ideas.map((idea, index) => (
//                 <TouchableOpacity
//                   key={index}
//                   activeOpacity={0.8}
//                   style={styles.cardContainer}
//                   // onPress={() => fetchIdeaDetail(idea.id || idea.ideaNumber)}
//                   onPress={() => {
//                     console.log("Selected idea object:", idea);
//                     setSelectedIdea(idea);
//                     fetchIdeaDetail(idea.id || idea.ideaNumber);
//                     console.log("Fetching detail for ideaId:", idea.id || idea.ideaNumber);

//                   }}
                  
//                 >
//                   <View style={styles.cardHeader}>
//                     <Text style={styles.ideaNumber} numberOfLines={2}>{idea.itemNumber || "N/A"}</Text>
//                     <View style={styles.typeTag}>
//                       <Text style={styles.typeText}>{idea.type || "N/A"}</Text>
//                     </View>
//                   </View>
                  
//                   <View style={styles.cardContent}>
//                     <View style={styles.row}>
//                       <Text style={styles.label}>Owner:</Text>
//                       <Text style={styles.value} numberOfLines={2}>{idea.ownerName || "N/A"}</Text>
//                     </View>
//                     <View style={styles.row}>
//                       <Text style={styles.label}>Location:</Text>
//                       <Text style={styles.value}>{idea.location || "N/A"}</Text>
//                     </View>
//                     <View style={styles.row}>
//                       <Text style={styles.label}>Department:</Text>
//                       <Text style={styles.value}>{idea.department || "N/A"}</Text>
//                     </View>
//                     <View style={styles.descriptionRow}>
//                       <Text style={styles.label}>Description:</Text>
//                       <Text style={styles.description} numberOfLines={3}>{idea.description || "N/A"}</Text>
//                     </View>
//                     <View style={styles.dateRow}>
//                       <View style={styles.dateColumn}>
//                         <Text style={styles.label}>Created:</Text>
//                         <Text style={styles.dateText}>
//                           {idea.creationDate ? new Date(idea.creationDate).toLocaleDateString() : "N/A"}
//                         </Text>
//                       </View>
//                       <View style={styles.dateColumn}>
//                         <Text style={styles.label}>Status:</Text>
//                         <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(idea.status) }]}>
//                           {idea.status || "N/A"}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               ))}
              
//               <View style={styles.totalContainer}>
//                 <Text style={styles.totalText}>Total Ideas: {totalItems}</Text>
//               </View>
//             </>
//           )}
//         </ScrollView>
//       )}

//       {loadingDetail && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#0A5064" />
//         </View>
//       )}

//       <Modal visible={!!selectedIdea} animationType="slide">
//         <View style={styles.fullModal}>
//           <View style={styles.modalHeader}>
//             <View style={styles.modalHeaderContent}>
//               <Text style={styles.modalHeaderTitle}>Idea Details</Text>
//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={() => { setSelectedIdea(null); setIdeaDetail(null); }}
//               >
//                 <Ionicons name="close" size={20} color="#666" />
//               </TouchableOpacity>
//             </View>
//             <TouchableOpacity 
//               style={styles.timelineButtonHeader}
//               onPress={() => setShowTimelineModal(true)}
//             >
//               <Ionicons name="time-outline" size={18} color="#2c5aa0" />
//               <Text style={styles.timelineButtonText}>View Progress Timeline</Text>
//             </TouchableOpacity>
//           </View>

//           <ScrollView contentContainerStyle={styles.modalScrollContent}>
//             {selectedIdea && ideaDetail && (
//               <>
//                 <View style={styles.cardDetail}>
//                   <Text style={styles.cardHeading}>Employee Information</Text>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Employee Name:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerName || ideaDetail.ownerName || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Employee Number:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerEmployeeNo || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Employee Email:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerEmail || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Department:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerDepartment || ideaDetail.department || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Mobile:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.mobileNumber || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Reporting Manager:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.reportingManagerName || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Manager Email:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.managerEmail || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Employee Location:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.location || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Sub Department:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerSubDepartment || "N/A"}</Text>
//                   </View>
//                 </View>

//                 <View style={styles.cardDetail}>
//                   <Text style={styles.cardHeading}>Idea Information</Text>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Idea No:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.ideaNumber || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Solution Category:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.solutionCategory || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Creation Date:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.ideaCreationDate || ideaDetail.creationDate ? 
//                         new Date(ideaDetail.ideaCreationDate || ideaDetail.creationDate).toLocaleDateString() : "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Planned Duration Date:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.plannedImplementationDuration
//                       ? new Date(ideaDetail.plannedImplementationDuration).toLocaleDateString()
//                       : "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Status:</Text>
//                     <Text style={[styles.statusBadgeDetail, { backgroundColor: getStatusColor(ideaDetail.ideaStatus || ideaDetail.status) }]}>
//                       {ideaDetail.ideaStatus || ideaDetail.status || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Idea Description:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.ideaDescription || ideaDetail.description || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Proposed Solution:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.proposedSolution || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Process Improvement/Cost Benefit:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.tentativeBenefit || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Team Members:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.teamMembers || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Mobile Number:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.mobileNumber || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Idea Theme:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.ideaTheme || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Type:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.type || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Before Implementation:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.beforeImplementationImagePath || "N/A"}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>BE Team Support Needed:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.isBETeamSupportNeeded ? "Yes" : "No"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Can Be Implemented To Other Locations:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.canBeImplementedToOtherLocation ? "Yes" : "No"}
//                     </Text>
//                   </View>
//                 </View>

//                 <View style={styles.cardDetail}>
//                   <Text style={styles.cardHeading}>Remarks</Text>
//                   {(() => {
//                     const remarks = parseRemarks(ideaDetail.remark || ideaDetail.remarks);
//                     if (remarks.length === 0) {
//                       return <Text style={styles.noRemarksText}>No remarks available</Text>;
//                     }
//                     return remarks.map((remark, index) => (
//                       <RemarksCard
//                         key={index}
//                         title={remark.approverName || remark.title || "Unknown"}
//                         comment={remark.comments || remark.comment || "No comment"}
//                         date={remark.approvalDate || remark.date ? 
//                           new Date(remark.approvalDate || remark.date).toLocaleDateString('en-IN', {
//                             day: 'numeric',
//                             month: 'short',
//                             year: 'numeric',
//                             hour: '2-digit',
//                             minute: '2-digit'
//                           }) : ""}
//                       />
//                     ));
//                   })()}
//                 </View>

//                 {ideaDetail.beforeImplementationImagePath && (
//                   <TouchableOpacity
//                     style={styles.imageWrapper}
//                     onPress={() => setShowImage(true)}
//                   >
//                     <Image source={{ uri: ideaDetail.beforeImplementationImagePath }} style={styles.thumbnail} />
//                     <Text style={styles.viewImageText}>Tap to view full image</Text>
//                   </TouchableOpacity>
//                 )}
//               </>
//             )}
//           </ScrollView>
//         </View>
//       </Modal>

//       <Modal visible={showTimelineModal} animationType="slide">
//         <View style={styles.fullModal}>
//           <View style={styles.timelineModalHeader}>
//             <Text style={styles.timelineModalTitle}>Progress Timeline</Text>
//             <TouchableOpacity
//               style={styles.closeButtonTimeline}
//               onPress={() => setShowTimelineModal(false)}
//             >
//               <Ionicons name="close" size={20} color="#fff" />
//             </TouchableOpacity>
//           </View>

//           <ScrollView contentContainerStyle={styles.modalScrollContent}>
//             <View style={styles.timelineCardContainer}>
//               <View style={styles.timelineContainer}>
//                 {ideaDetail?.timeline && Array.isArray(ideaDetail.timeline) && ideaDetail.timeline.length > 0 ? (
//                   ideaDetail.timeline.map((item, idx) => (
//                     <TimelineItem
//                       key={idx}
//                       status={safeRenderValue(item.status || item.approvalStage || item.approvalstage || "N/A")}
//                       date={item.date || item.approvalDate}
//                       description={safeRenderValue(item.description || item.comments)}
//                       isLast={idx === ideaDetail.timeline.length - 1}
//                       isFirst={idx === 0}
//                     />
//                   ))
//                 ) : (
//                   <View style={styles.noTimelineContainer}>
//                     <Ionicons name="time-outline" size={48} color="#ccc" />
//                     <Text style={styles.noTimelineText}>No timeline data available</Text>
//                   </View>
//                 )}
//               </View>
//             </View>
//           </ScrollView>
//         </View>
//       </Modal>

//       <Modal visible={showImage} transparent animationType="fade">
//         <View style={styles.imageModal}>
//           <TouchableOpacity
//             style={styles.closeButtonImage}
//             onPress={() => setShowImage(false)}
//           >
//             <Ionicons name="close" size={24} color="#fff" />
//           </TouchableOpacity>
//           <Image
//             source={{ uri: ideaDetail?.beforeImplementationImagePath }}
//             style={styles.fullImage}
//             resizeMode="contain"
//           />
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f5f5f5" },
//   header: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', elevation: 2 },
//   headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c5aa0' },
//   filterButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#e8e8e8', borderRadius: 4 },
//   filterButtonText: { fontSize: 11, color: '#000', marginRight: 6, fontWeight: '600' },
//   filterArrow: { fontSize: 10, color: '#000', fontWeight: 'bold' },
//   searchSection: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
//   searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 },
//   searchLabel: { fontSize: 16, color: '#333', marginRight: 8, fontWeight: '500' },
//   searchInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, backgroundColor: '#fff' },
//   filtersContainer: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
//   dateFilterRow: { marginBottom: 12 },
//   dateInputContainer: { flex: 1 },
//   dateLabel: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
//   dateInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 10, backgroundColor: '#fff', fontSize: 14, color: '#666' },
//   datePickerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, gap: 10 },
//   datePickerInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 10, backgroundColor: '#fff', fontSize: 13 },
//   statusFilterRow: { marginBottom: 12 },
//   pickerWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 4, backgroundColor: '#fff', paddingLeft: 12 },
//   pickerText: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 10 },
//   pickerButton: { padding: 10, paddingLeft: 12, paddingRight: 12 },
//   filterButtons: { flexDirection: 'row', marginTop: 8, gap: 10 },
//   applyBtn: { flex: 1, backgroundColor: '#0A5064', padding: 12, borderRadius: 4, alignItems: 'center' },
//   resetBtn: { flex: 1, backgroundColor: '#6c757d', padding: 12, borderRadius: 4, alignItems: 'center' },
//   btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
//   scrollContainer: { padding: 16, paddingBottom: 30 },
//   cardContainer: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
//   cardHeader: { backgroundColor: '#2c5aa0', padding: 12, borderTopLeftRadius: 8, borderTopRightRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
//   ideaNumber: { color: '#fff', fontSize: 14, fontWeight: 'bold', flex: 1, marginRight: 8 },
//   typeTag: { backgroundColor: '#f0ad4e', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
//   typeText: { color: '#fff', fontSize: 12, fontWeight: '500' },
//   cardContent: { padding: 12 },
//   row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
//   label: { color: '#555', fontWeight: '500', fontSize: 14 },
//   value: { color: '#333', fontSize: 14,  maxWidth: '65%', textAlign: 'right' },
//   descriptionRow: { marginTop: 6 },
//   description: { color: '#333', fontSize: 14 },
//   dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
// dateColumn: { flexDirection: 'column' },
// dateText: { color: '#333', fontSize: 12 },
// statusBadge: { color: "#fff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, overflow: "hidden" },
// totalContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginTop: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0' },
// totalText: { fontSize: 16, fontWeight: 'bold', color: '#2c5aa0' },
// noDataText: { textAlign: "center", marginTop: 20, color: "#777", fontSize: 16 },
// loadingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.6)" },
// fullModal: { flex: 1, backgroundColor: "#f5f5f5" },
// modalHeader: { backgroundColor: '#fff', paddingTop: 24, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', elevation: 4 },
// modalHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
// modalHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c5aa0' },
// closeButton: { backgroundColor: '#f0f0f0', borderRadius: 18, width: 32, height: 32, justifyContent: "center", alignItems: "center" },
// timelineButtonHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e3f2fd', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2c5aa0' },
// timelineButtonText: { color: '#2c5aa0', fontSize: 14, fontWeight: '600', marginLeft: 6 },
// modalScrollContent: { padding: 16, paddingBottom: 30 },
// cardDetail: { backgroundColor: "#fff", padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2 },
// cardHeading: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#2c5aa0" },
// rowDetail: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, flexWrap: 'wrap' },
// labelDetail: { fontWeight: "600", color: "#555", width: "45%", fontSize: 14 },
// valueDetail: { color: "#222", width: "50%", textAlign: "right", fontSize: 14 },
// statusBadgeDetail: { color: "#fff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, overflow: "hidden", alignSelf: 'flex-end' },
// remarkCard: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#2c5aa0' },
// remarkTitle: { fontSize: 15, fontWeight: 'bold', color: '#2c5aa0', marginBottom: 6 },
// remarkComment: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 6 },
// remarkDate: { fontSize: 12, color: '#999', fontStyle: 'italic' },
// noRemarksText: { textAlign: 'center', color: '#999', fontSize: 14, fontStyle: 'italic', paddingVertical: 10 },
// timelineModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c5aa0', paddingHorizontal: 10, paddingVertical: 12, paddingTop: 25, elevation: 4 },
// timelineModalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
// closeButtonTimeline: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18, width: 32, height: 32, justifyContent: "center", alignItems: "center" },
// timelineCardContainer: { backgroundColor: "#fff", padding: 16, borderRadius: 10, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2 },
// timelineContainer: { paddingLeft: 4, paddingTop: 4 },
// timelineItem: { flexDirection: "row", marginBottom: 20 },
// timelineLeft: { alignItems: "center", marginRight: 15, width: 20 },
// timelineCircle: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: "#fff", elevation: 2 },
// timelineLine: { width: 3, backgroundColor: "#E0E0E0", flex: 1, marginTop: 4 },
// timelineContent: { flex: 1, paddingBottom: 5 },
// timelineStatus: { fontSize: 15, fontWeight: "bold", color: "#333", marginBottom: 4 },
// timelineDescription: { fontSize: 13, color: "#666", marginBottom: 6, lineHeight: 18 },
// timelineDate: { fontSize: 12, color: "#999", fontStyle: "italic" },
// noTimelineContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
// noTimelineText: { color: "#999", textAlign: "center", marginTop: 10, fontSize: 15, fontStyle: 'italic' },
// imageWrapper: { alignItems: "center", backgroundColor: '#fff', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2 },
// thumbnail: { width: 150, height: 150, borderRadius: 8 },
// viewImageText: { marginTop: 8, color: '#2c5aa0', fontSize: 14, fontWeight: '500' },
// imageModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
// closeButtonImage: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 22, width: 44, height: 44, justifyContent: "center", alignItems: "center" },
// fullImage: { width: "80%", height: "60%" },
// });

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
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REJECTED_BY_ME_URL, IDEA_DETAIL_URL } from "../src/context/api";

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

function TimelineItem({ status, date, description, isLast, isFirst }) {
  const getCircleColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('created')) return "#2196F3";
    if (s.includes('edited')) return "#9C27B0";
    if (s.includes('approved')) return "#4CAF50";
    if (s.includes('pending')) return "#FF9800";
    if (s.includes('implementation')) return "#9C27B0";
    if (s.includes('rejected')) return "#F44336";
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
        {description && (
          <Text style={styles.timelineDescription}>{description}</Text>
        )}
        {date && (
          <Text style={styles.timelineDate}>{formatDateTime(date)}</Text>
        )}
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
  if (s === "draft") return "blue";
  if (s === "published") return "green";
  if (s === "pending") return "orange";
  if (s === "approved" || s === "closed") return "gray";
  if (s === "rejected") return "red";
  if (s === "hold" || s === "on hold") return "yellow";
  return "gray";
};

export default function RejectedByMeScreen() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [ideaDetail, setIdeaDetail] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  useEffect(() => {
    fetchIdeas();
  }, [searchTerm, fromDate, toDate]);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      let url = `${REJECTED_BY_ME_URL.split('?')[0]}?sortOrder=desc&page=1&pageSize=1000`;
      
      if (searchTerm.trim()) {
        url += `&searchTerm=${encodeURIComponent(searchTerm.trim())}`;
      }
      
      if (fromDate) {
        const formattedFrom = fromDate.toISOString().split("T")[0];
        url += `&startDate=${formattedFrom}`;
      }
      if (toDate) {
        const formattedTo = toDate.toISOString().split("T")[0];
        url += `&endDate=${formattedTo}`;
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
        setTotalItems(response.data.data.totalItems || response.data.data.total || 0);
      } else {
        setIdeas([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching rejected ideas:", error);
      Alert.alert("Error", "Failed to load rejected ideas.");
    } finally {
      setLoading(false);
    }
  };

  const fetchIdeaDetail = async (ideaId) => {
    console.log("Fetching detail for ideaId:", ideaId);
    if (!ideaId) return;
    try {
      setLoadingDetail(true);
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // ✅ FIXED: Using correct endpoint format
      const { data: response } = await axios.get(
        `${IDEA_DETAIL_URL}/${encodeURIComponent(ideaId)}`, 
        { headers }
      );

      console.log("Idea Detail API Response:", response);
      
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
    setSearchTerm("");
    setFromDate(null);
    setToDate(null);
  };

  const applyFilters = () => {
    setShowFilters(false);
    fetchIdeas();
  };

  const safeRenderValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const parseRemarks = (remarkData) => {
    if (!remarkData) return [];
    
    if (Array.isArray(remarkData)) {
      return remarkData;
    }
    
    if (typeof remarkData === "object") {
      const keys = Object.keys(remarkData);
      if (keys.length > 0 && keys.every(k => !isNaN(k))) {
        return Object.values(remarkData);
      }
      return [remarkData];
    }
    
    return [];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rejected Idea</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterButtonText}>{showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}</Text>
          <Ionicons name={showFilters ? "chevron-up" : "chevron-down"} size={16} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Search:</Text>
          <TextInput
            placeholder="Idea Number / Owner / Description"
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={(text) => setSearchTerm(text)}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Create Date Range</Text>
          
          <View style={styles.datePickerRow}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>From Date:</Text>
              <TouchableOpacity
                style={styles.datePickerInput}
                onPress={() => setShowFromPicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {fromDate ? formatDateTime(fromDate).split(',')[0] : "DD-MM-YYYY"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>To Date:</Text>
              <TouchableOpacity
                style={styles.datePickerInput}
                onPress={() => setShowToPicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {toDate ? formatDateTime(toDate).split(',')[0] : "DD-MM-YYYY"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

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
            <TouchableOpacity style={styles.resetBtn} onPress={clearFilters}>
              <Text style={styles.btnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#0A5064" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {ideas.length === 0 ? (
            <Text style={styles.noDataText}>No rejected ideas found.</Text>
          ) : (
            <>
              {ideas.map((idea, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  style={styles.cardContainer}
                  onPress={() => {
                    console.log("Selected idea object:", idea);
                    setSelectedIdea(idea);
                    // ✅ FIXED: Using correct ideaId
                    fetchIdeaDetail(idea.ideaId || idea.id || idea.ideaNumber);
                  }}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.ideaNumber} numberOfLines={2}>
                      {idea.ideaNumber || idea.itemNumber || "N/A"}
                    </Text>
                    <View style={styles.typeTag}>
                      <Text style={styles.typeText}>{idea.type || "N/A"}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.cardContent}>
                    <View style={styles.row}>
                      <Text style={styles.label}>Owner:</Text>
                      <Text style={styles.value} numberOfLines={2}>{idea.ownerName || "N/A"}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Location:</Text>
                      <Text style={styles.value}>{idea.location || "N/A"}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Department:</Text>
                      <Text style={styles.value}>{idea.department || "N/A"}</Text>
                    </View>
                    <View style={styles.descriptionRow}>
                      <Text style={styles.label}>Description:</Text>
                      <Text style={styles.description} numberOfLines={3}>{idea.description || "N/A"}</Text>
                    </View>
                    <View style={styles.dateRow}>
                      <View style={styles.dateColumn}>
                        <Text style={styles.label}>Created:</Text>
                        <Text style={styles.dateText}>
                          {idea.creationDate ? new Date(idea.creationDate).toLocaleDateString() : "N/A"}
                        </Text>
                      </View>
                      <View style={styles.dateColumn}>
                        <Text style={styles.label}>Status:</Text>
                        <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(idea.status) }]}>
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

      {loadingDetail && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0A5064" />
        </View>
      )}

      <Modal visible={!!selectedIdea} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalHeaderTitle}>Idea Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => { setSelectedIdea(null); setIdeaDetail(null); }}
              >
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
                    <Text style={styles.valueDetail}>
                      {ideaDetail.ideaCreationDate || ideaDetail.creationDate ? 
                        new Date(ideaDetail.ideaCreationDate || ideaDetail.creationDate).toLocaleDateString() : "N/A"}
                    </Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Planned Duration Date:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.plannedImplementationDuration
                      ? new Date(ideaDetail.plannedImplementationDuration).toLocaleDateString()
                      : "N/A"}</Text>
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
                    <Text style={styles.labelDetail}>Before Implementation:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.beforeImplementationImagePath || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>BE Team Support Needed:</Text>
                    <Text style={styles.valueDetail}>
                      {ideaDetail.isBETeamSupportNeeded ? "Yes" : "No"}
                    </Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Can Be Implemented To Other Locations:</Text>
                    <Text style={styles.valueDetail}>
                      {ideaDetail.canBeImplementedToOtherLocation ? "Yes" : "No"}
                    </Text>
                  </View>
                </View>

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

                {ideaDetail.beforeImplementationImagePath && (
                  <TouchableOpacity
                    style={styles.imageWrapper}
                    onPress={() => setShowImage(true)}
                  >
                    <Image source={{ uri: ideaDetail.beforeImplementationImagePath }} style={styles.thumbnail} />
                    <Text style={styles.viewImageText}>Tap to view full image</Text>
                  </TouchableOpacity>
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
                      status={safeRenderValue(item.status || item.approvalStage || item.approvalstage || "N/A")}
                      date={item.date || item.approvalDate}
                      description={safeRenderValue(item.description || item.comments)}
                      isLast={idx === ideaDetail.timeline.length - 1}
                      isFirst={idx === 0}
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

      <Modal visible={showImage} transparent animationType="fade">
        <View style={styles.imageModal}>
          <TouchableOpacity
            style={styles.closeButtonImage}
            onPress={() => setShowImage(false)}
          >
            <Ionicons name="close" size={24} color="#fff" />
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
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c5aa0' },
  filterButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#e8e8e8', borderRadius: 4 },
  filterButtonText: { fontSize: 11, color: '#000', marginRight: 6, fontWeight: '600' },
  searchSection: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  searchLabel: { fontSize: 16, color: '#333', marginRight: 8, fontWeight: '500' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, backgroundColor: '#fff' },
  filtersContainer: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  filterLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' },
  datePickerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10, gap: 10 },
  dateInputContainer: { flex: 1 },
  dateLabel: { fontSize: 12, fontWeight: "600", color: "#333", marginBottom: 5 },
  datePickerInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, backgroundColor: '#f9f9f9', justifyContent: 'center' },
  datePickerText: { fontSize: 14, color: '#333' },
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
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: '#555', fontWeight: '500', fontSize: 14 },
  value: { color: '#333', fontSize: 14,  maxWidth: '65%', textAlign: 'right' },
  descriptionRow: { marginTop: 6 },
  description: { color: '#333', fontSize: 14 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  dateColumn: { flexDirection: 'column' },
  dateText: { color: '#333', fontSize: 12 },
  statusBadge: { color: "#fff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, overflow: "hidden" },
  totalContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginTop: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0' },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#2c5aa0' },
  noDataText: { textAlign: "center", marginTop: 20, color: "#777", fontSize: 16 },
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
  rowDetail: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, flexWrap: 'wrap' },
  labelDetail: { fontWeight: "600", color: "#555", width: "45%", fontSize: 14 },
  valueDetail: { color: "#222", width: "50%", textAlign: "right", fontSize: 14 },
  statusBadgeDetail: { color: "#fff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, overflow: "hidden", alignSelf: 'flex-end' },
  remarkCard: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#2c5aa0' },
  remarkTitle: { fontSize: 15, fontWeight: 'bold', color: '#2c5aa0', marginBottom: 6 },
  remarkComment: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 6 },
  remarkDate: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  noRemarksText: { textAlign: 'center', color: '#999', fontSize: 14, fontStyle: 'italic', paddingVertical: 10 },
  timelineModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c5aa0', paddingHorizontal: 10, paddingVertical: 12, paddingTop: 25, elevation: 4 },
  timelineModalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  closeButtonTimeline: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18, width: 32, height: 32, justifyContent: "center", alignItems: "center" },
  timelineCardContainer: { backgroundColor: "#fff", padding: 16, borderRadius: 10, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2 },
  timelineContainer: { paddingLeft: 4, paddingTop: 4 },
  timelineItem: { flexDirection: "row", marginBottom: 20 },
  timelineLeft: { alignItems: "center", marginRight: 15, width: 20 },
  timelineCircle: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: "#fff", elevation: 2 },
  timelineLine: { width: 3, backgroundColor: "#E0E0E0", flex: 1, marginTop: 4 },
  timelineContent: { flex: 1, paddingBottom: 5 },
  timelineStatus: { fontSize: 15, fontWeight: "bold", color: "#333", marginBottom: 4 },
  timelineDescription: { fontSize: 13, color: "#666", marginBottom: 6, lineHeight: 18 },
  timelineDate: { fontSize: 12, color: "#999", fontStyle: "italic" },
  noTimelineContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  noTimelineText: { color: "#999", textAlign: "center", marginTop: 10, fontSize: 15, fontStyle: 'italic' },
  imageWrapper: { alignItems: "center", backgroundColor: '#fff', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2 },
  thumbnail: { width: 150, height: 150, borderRadius: 8 },
  viewImageText: { marginTop: 8, color: '#2c5aa0', fontSize: 14, fontWeight: '500' },
  imageModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
  closeButtonImage: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 22, width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  fullImage: { width: "80%", height: "60%" },
});