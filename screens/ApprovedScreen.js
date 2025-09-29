// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   SafeAreaView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   ScrollView,
//   Modal,
//   Alert,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { APPROVED_BY_ME_URL } from '../src/context/api';

// // Improved Timeline Item with better styling
// function TimelineItem({ status, description, date, isLast }) {
//   const getCircleColor = (status) => {
//     if (!status) return '#9E9E9E';
//     const s = status.toLowerCase();
//     if (s.includes('created')) return '#2196F3'; // Blue
//     if (s.includes('edited')) return '#9C27B0'; // Purple
//     if (s.includes('approved')) return '#4CAF50'; // Green
//     if (s.includes('pending')) return '#FF9800'; // Orange
//     if (s.includes('implementation')) return '#3F51B5'; // Indigo
//     if (s.includes('rejected')) return '#f44336'; // Red
//     return '#9E9E9E'; // Gray
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

// // Remarks Card Component
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
//   if (s === "hold") return "yellow";
//   return "gray";
// };//kkk

// const ApprovedScreen = () => {
//   const [searchText, setSearchText] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedIdea, setSelectedIdea] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingDetail, setLoadingDetail] = useState(false);
//   const [ideaDetail, setIdeaDetail] = useState(null);
//   const [ideas, setIdeas] = useState([]);
// //
//   const [showTimelineModal, setShowTimelineModal] = useState(false);
//   const [showImage, setShowImage] = useState(false);

//  const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalItems, setTotalItems] = useState(0);
//   const [hasNextPage, setHasNextPage] = useState(false);

//   const [fromDate, setFromDate] = useState(null);
//   const [toDate, setToDate] = useState(null);
//   const [showFromPicker, setShowFromPicker] = useState(false);
//   const [showToPicker, setShowToPicker] = useState(false);

//   const fetchApprovedIdeas = async (from, to) => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem('token');
//       const headers = token ? { Authorization: `Bearer ${token}` } : {};

//       let url = APPROVED_BY_ME_URL;
//       const params = [];
//       if (from) params.push(`fromDate=${from}`);
//       if (to) params.push(`toDate=${to}`);
//       if (params.length > 0) url += `?${params.join('&')}`;

//       const response = await axios.get(url, { headers });
//       const items = response.data?.data?.items || [];
//       console.log("Idea Detail Response:", response.data);

//       let filteredByDate = items;
//       if (from || to) {
//         const fromTime = from ? new Date(from).getTime() : null;
//         const toTime = to ? new Date(to).getTime() : null;

//         filteredByDate = items.filter(item => {
//           if (!item.approvalDate) return false;
//           const approvalTime = new Date(item.approvalDate).getTime();
//           if (fromTime !== null && approvalTime < fromTime) return false;
//           if (toTime !== null && approvalTime > toTime) return false;
//           return true;
//         });
//       }

//       setIdeas(filteredByDate);
//     } catch (error) {
//       console.error("Error fetching approved ideas:", error);
//       Alert.alert("Error", "Failed to load approved ideas.");
//       setIdeas([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchApprovedIdeas(); }, []);

//   const filteredIdeas = Array.isArray(ideas)
//     ? ideas.filter(idea => {
//         const searchLower = searchText.trim().toLowerCase();
//         return (
//           searchLower === '' ||
//           (idea.ideaNumber && idea.ideaNumber.toLowerCase().includes(searchLower)) ||
//           (idea.ownerName && idea.ownerName.toLowerCase().includes(searchLower)) ||
//           (idea.description && idea.description.toLowerCase().includes(searchLower))
//         );
//       })
//     : [];

//     const fetchIdeaDetail = async (ideaId) => {
//       if (!ideaId) return;
    
//       try {
//         setLoadingDetail(true);
    
//         // Find the idea from your state
//         const idea = ideas.find(i => i.ideaId === ideaId || i.ideaNumber === ideaId);
    
//         if (!idea) {
//           Alert.alert("Error", "Idea details not found.");
//           return;
//         }
    
//         const timeline = [];
    
//         // 1️⃣ Created
//         if (idea.creationDate || idea.creation_date) {
//           timeline.push({
//             status: 'Created',
//             date: idea.creationDate || idea.creation_date,
//             description: 'Idea was created and submitted'
//           });
//         }
    
//         // 2️⃣ Edited
//         if (idea.editedDate || idea.edited_date) {
//           timeline.push({
//             status: 'Edited',
//             date: idea.editedDate || idea.edited_date,
//             description: 'Idea details were edited'
//           });
//         }
    
//         // 3️⃣ Approved
//         if (idea.approvalDate || idea.approval_date) {
//           timeline.push({
//             status: 'Approved',
//             date: idea.approvalDate || idea.approval_date,
//             description: idea.remarks || 'Idea has been approved'
//           });
//         }
    
//         // 4️⃣ Implementation
//         if (idea.implementationDate || idea.implementation_date) {
//           timeline.push({
//             status: 'Implementation',
//             date: idea.implementationDate || idea.implementation_date,
//             description: 'Idea is under implementation'
//           });
//         }
    
//         // 5️⃣ Rejected
//         if (idea.rejectedDate || idea.rejected_date) {
//           timeline.push({
//             status: 'Rejected',
//             date: idea.rejectedDate || idea.rejected_date,
//             description: idea.rejectionRemarks || 'Idea has been rejected'
//           });
//         }
    
//         // 6️⃣ Closed
//         if (idea.closedDate || idea.closed_date) {
//           timeline.push({
//             status: 'Closed',
//             date: idea.closedDate || idea.closed_date,
//             description: 'Idea has been closed'
//           });
//         }
    
//         // 7️⃣ Timeline events from backend
//         if (Array.isArray(idea.timelineEvents)) {
//           idea.timelineEvents.forEach(event => {
//             const eventDate = event.eventDate || event.event_date || event.timestamp || event.date;
//             if (!eventDate) return;
    
//             timeline.push({
//               status: event.status || event.eventType || 'Update',
//               date: eventDate,
//               description: event.description || event.remarks || 'Update'
//             });
//           });
//         }
    
//         // 8️⃣ Remove duplicates & sort by date
//         const uniqueTimeline = [];
//         const seen = new Set();
//         timeline.forEach(evt => {
//           const key = `${evt.status}-${evt.date}`;
//           if (!seen.has(key)) {
//             uniqueTimeline.push(evt);
//             seen.add(key);
//           }
//         });
    
//         uniqueTimeline.sort((a, b) => new Date(a.date) - new Date(b.date));
    
//         // 9️⃣ Set enhanced idea detail
//         const ideaWithTimeline = {
//           ...idea,
//           timeline: uniqueTimeline,
//           currentStatus: idea.status
//         };
    
//         setIdeaDetail(ideaWithTimeline);
//         setSelectedIdea(ideaWithTimeline);
    
//         console.log("Final Timeline:", uniqueTimeline);
    
//       } catch (error) {
//         console.error("Error fetching idea detail:", error);
//         Alert.alert("Error", "Failed to fetch idea details.");
//       } finally {
//         setLoadingDetail(false);
//       }
//     };
  
//   const applyFilters = () => {
//     let from = fromDate ? fromDate.toISOString().split('T')[0] : null;
//     let to = toDate ? toDate.toISOString().split('T')[0] : null;
//     fetchApprovedIdeas(from, to);
//     setShowFilters(false);
//   };

//   const resetFilters = () => {
//     setFromDate(null);
//     setToDate(null);
//     fetchApprovedIdeas();
//   };

//   const renderIdeaCard = ({ item }) => (
//     <TouchableOpacity
//       activeOpacity={0.8}
//       style={styles.cardContainer}
//       onPress={() => fetchIdeaDetail(item.ideaId || item.ideaNumber)}
//     >
//       <View style={styles.cardHeader}>
//         <Text style={styles.ideaNumber} numberOfLines={2}>{item.itemNumber}</Text>
//         <View style={styles.typeTag}>
//           <Text style={styles.typeText}>{item.type}</Text>
//         </View>
//       </View>
//       <View style={styles.cardContent}>
//         <View style={styles.row}>
//           <Text style={styles.label}>Owner:</Text>
//           <Text style={styles.value} numberOfLines={2}>{item.ownerName}</Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Location:</Text>
//           <Text style={styles.value}>{item.location}</Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Department:</Text>
//           <Text style={styles.value}>{item.department}</Text>
//         </View>
//         <View style={styles.row}>
//         <Text style={styles.label}>Status:</Text>
//         <Text style={styles.value}>{item.status}</Text>
//       </View>
//       <View style={styles.row}>
//         <Text style={styles.label}>Approval Stage:</Text>
//         <Text style={styles.value}>{item.approvalStage}</Text>
//       </View>

//         <View style={styles.descriptionRow}>
//           <Text style={styles.label}>Description:</Text>
//           <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
//         </View>
//         <View style={styles.dateRow}>
//           <View style={styles.dateColumn}>
//             <Text style={styles.label}>Approved:</Text>
//             <Text style={styles.dateText}>{item.approvalDate}</Text>
//           </View>
//           <View style={styles.dateColumn}>
//             <Text style={styles.label}>Created:</Text>
//             <Text style={styles.dateText}>{item.creationDate}</Text>
//           </View>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Approved Ideas</Text>
//         <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
//           <Text style={styles.filterButtonText}>{showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}</Text>
//           <Ionicons name={showFilters ? "chevron-up" : "chevron-down"} size={16} color="#666" />
//         </TouchableOpacity>
//       </View>

//       {/* Filter Panel */}
//       {showFilters && (
//         <View style={styles.filterPanel}>
//           <Text style={styles.filterLabel}>Create Date Range</Text>

//           {/* From Date */}
//           <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromPicker(true)}>
//             <Text style={styles.dateText}>{fromDate ? fromDate.toLocaleDateString() : "Select From Date"}</Text>
//           </TouchableOpacity>
//           {showFromPicker && (
//             <DateTimePicker
//               value={fromDate || new Date()}
//               mode="date"
//               display="default"
//               onChange={(e, date) => { setShowFromPicker(false); if(date){setFromDate(date); if(toDate && date>toDate){setToDate(null)}} }}
//               maximumDate={toDate || undefined}
//             />
//           )}

//           {/* To Date */}
//           <TouchableOpacity style={styles.dateInput} onPress={() => setShowToPicker(true)}>
//             <Text style={styles.dateText}>{toDate ? toDate.toLocaleDateString() : "Select To Date"}</Text>
//           </TouchableOpacity>
//           {showToPicker && (
//             <DateTimePicker
//               value={toDate || (fromDate || new Date())}
//               mode="date"
//               display="default"
//               onChange={(e, date) => { setShowToPicker(false); if(date){setToDate(date)} }}
//               minimumDate={fromDate || undefined}
//             />
//           )}

//           <View style={styles.filterButtons}>
//             <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}><Text style={styles.btnText}>Apply</Text></TouchableOpacity>
//             <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}><Text style={styles.btnText}>Reset</Text></TouchableOpacity>
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

//       {/* List */}
//       {loading ? (
//         <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
//       ) : (
//         filteredIdeas.length > 0 ? (
//           <FlatList
//             data={filteredIdeas}
//             renderItem={renderIdeaCard}
//             keyExtractor={(item) => (item.ideaId?.toString() || item.ideaNumber?.toString() || Math.random().toString())}
//             style={styles.list}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.listContent}
//           />
//         ) : (
//           <View style={styles.noResultContainer}><Text style={styles.noResultText}>No results found.</Text></View>
//         )
//       )}

      
//       {loadingDetail && (
//         <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#0000ff" /></View>
//       )}

//       {/* Modal */}
//       <Modal visible={!!selectedIdea} animationType="slide">
//         <SafeAreaView style={styles.fullModal}>
//           <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedIdea(null)}>
//             <Text style={styles.closeText}>✕</Text>
//           </TouchableOpacity>
//           <ScrollView contentContainerStyle={styles.modalContent}>
//             {ideaDetail && (
//               <View>
//                 {/* Employee Details */}
//                 <View style={styles.sectionCard}>
//                   <Text style={styles.sectionTitle}>👨🏻‍💻Employee Details</Text>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Employee Name:</Text><Text style={styles.valueDetail}>{ideaDetail.ownerName}</Text></View>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Employee Email:</Text><Text style={styles.valueDetail}>{ideaDetail.ownerEmail}</Text></View>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Department:</Text><Text style={styles.valueDetail}>{ideaDetail.department}</Text></View>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Location:</Text><Text style={styles.valueDetail}>{ideaDetail.location}</Text></View>
//                 </View>

//                 {/* Idea Information */}
//                 <View style={[styles.sectionCard, { marginTop: 16 }]}>
//                   <Text style={styles.sectionTitle}>💡Idea Information</Text>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Idea Number:</Text><Text style={styles.valueDetail}>{ideaDetail.itemNumber}</Text></View>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Description:</Text><Text style={styles.valueDetail}>{ideaDetail.description}</Text></View>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Owner ID:</Text><Text style={styles.valueDetail}>{ideaDetail.ownerId}</Text></View>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Type:</Text><Text style={styles.valueDetail}>{ideaDetail.type}</Text></View>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Approval Date:</Text><Text style={styles.valueDetail}>{ideaDetail.approvalDate}</Text></View>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Owner Name:</Text><Text style={styles.valueDetail}>{ideaDetail.ownerName}</Text></View>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Idea ID:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaId}</Text></View>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Status:</Text><Text style={styles.valueDetail}>{ideaDetail.status}</Text></View>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Creation Date:</Text><Text style={styles.valueDetail}>{ideaDetail.creationDate}</Text></View>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Approval Stage:</Text><Text style={styles.valueDetail}>{ideaDetail.approvalStage}</Text></View>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Location:</Text><Text style={styles.valueDetail}>{ideaDetail.location}</Text></View>
//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Department:</Text><Text style={styles.valueDetail}>{ideaDetail.department}</Text></View>


//                   <View style={styles.rowDetail}><Text style={styles.labelDetail}>Remarks:</Text><Text style={styles.valueDetail}>{ideaDetail.remarks}</Text></View>
//                 </View>

//                 {/* Enhanced Progress Timeline */}
//                 <View style={[styles.sectionCard, { marginTop: 16, marginBottom: 32 }]}>
//                   <Text style={styles.sectionTitle}>📈Progress Timeline</Text>
//                   <View style={styles.timelineContainer}>
//                     {ideaDetail.timeline && ideaDetail.timeline.length > 0 ? (
//                       ideaDetail.timeline.map((evt, idx) => (
//                         <TimelineItem
//                           key={idx}
//                           status={evt.status}
//                           description={evt.description}
//                           date={evt.date}
//                           isLast={idx === ideaDetail.timeline.length - 1}
//                         />
//                       ))
//                     ) : (
//                       <View>
//                         <Text style={styles.noTimelineText}>Creating timeline from available data...</Text>
//                         {ideaDetail.creationDate && (
//                           <TimelineItem
//                             status="Created"
//                             date={ideaDetail.creationDate}
//                             description="Idea was created and submitted"
//                             isLast={!ideaDetail.approvalDate}
//                           />
//                         )}
//                         {ideaDetail.approvalDate && (
//                           <TimelineItem
//                             status="Approved"
//                             date={ideaDetail.approvalDate}
//                             description={ideaDetail.remarks || "Idea has been approved"}
//                             isLast={true}
//                           />
//                         )}
//                       </View>
//                     )}
//                   </View>
//                 </View>
//               </View>
//             )}
//           </ScrollView>
//         </SafeAreaView>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f5f5' },
//   header: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
//   headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
//   filterButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 4 },
//   filterButtonText: { fontSize: 12, color: '#666', marginRight: 4, fontWeight: '500' },
//   filterPanel: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
//   filterLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' },
//   dateInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, marginBottom: 10, backgroundColor: '#f9f9f9' },
//   dateText: { fontSize: 14, color: '#333' },
//   filterButtons: { flexDirection: 'row', marginTop: 12 },
//   applyBtn: { flex: 1, backgroundColor: '#004b6f', padding: 12, borderRadius: 6, alignItems: 'center', marginRight: 8 },
//   resetBtn: { flex: 1, backgroundColor: '#777', padding: 12, borderRadius: 6, alignItems: 'center' },
//   btnText: { color: '#fff', fontWeight: '600' },
//   searchSection: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
//   searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 },
//   searchLabel: { fontSize: 16, color: '#333', marginRight: 8, fontWeight: '500' },
//   searchInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, backgroundColor: '#fff' },
//   list: { flex: 1 }, listContent: { padding: 16 },
//   cardContainer: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
//   cardHeader: { backgroundColor: '#2c5aa0', padding: 12, borderTopLeftRadius: 8, borderTopRightRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
//   ideaNumber: { color: '#fff', fontSize: 14, fontWeight: 'bold', flex: 1, marginRight: 8 },
//   typeTag: { backgroundColor: '#f0ad4e', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
//   typeText: { color: '#fff', fontSize: 12, fontWeight: '500' },
//   cardContent: { padding: 12 },
//   row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
//   label: { color: '#555', fontWeight: '500', fontSize: 14 },
//   value: { color: '#333', fontSize: 14, maxWidth: '65%', textAlign: 'right' },
//   descriptionRow: { marginTop: 6 },
//   description: { color: '#333', fontSize: 14 },
//   dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
//   dateColumn: { flexDirection: 'column' },
//   dateText: { color: '#333', fontSize: 12 },
//   loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
//   fullModal: { flex: 1, backgroundColor: '#f5f5f5' },
//   closeButton: { position: 'absolute', top: 16, right: 16, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', elevation: 5 },
//   closeText: { fontSize: 20, color: 'gray', fontWeight: 'bold' },
//   modalContent: { padding: 16 },
//   sectionCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
//   sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
//   labelDetail: { fontSize: 14, fontWeight: '600', color: '#555', flex: 1 },
//   valueDetail: { fontSize: 14, color: '#222', flex: 1, textAlign: 'right' },
//   rowDetail: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },

//   // Enhanced Timeline Styles - matching AllIdeas
//   timelineContainer: {
//     paddingLeft: 5,
//   },
//   timelineItem: {
//     flexDirection: "row",
//     marginBottom: 16,
//   },
//   timelineLeft: {
//     alignItems: "center",
//     marginRight: 15,
//   },
//   timelineCircle: {
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     borderWidth: 2,
//     borderColor: "#fff",
//   },
//   timelineLine: {
//     width: 2,
//     backgroundColor: "#E0E0E0",
//     flex: 1,
//     marginTop: 5,
//   },
//   timelineContent: {
//     flex: 1,
//     paddingBottom: 10,
//   },
//   timelineStatus: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 2,
//   },
//   timelineDescription: {
//     fontSize: 12,
//     color: "#666",
//     marginBottom: 4,
//     lineHeight: 16,
//   },
//   timelineDate: {
//     fontSize: 11,
//     color: "#999",
//     fontStyle: "italic",
//   },
//   noTimelineText: {
//     color: "#777",
//     textAlign: "center",
//     marginTop: 10,
//     fontSize: 14,
//     fontStyle: 'italic'
//   },

//   noResultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   noResultText: { fontSize: 16, color: '#555' },
// });

// export default ApprovedScreen;



import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { APPROVED_BY_ME_URL } from '../src/context/api';

// Timeline Component
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

// Remarks Card Component
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
  if (s === "hold") return "yellow";
  return "gray";
};

const ApprovedScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [ideaDetail, setIdeaDetail] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showImage, setShowImage] = useState(false);


  
 const [currentPage, setCurrentPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [totalItems, setTotalItems] = useState(0);
 const [hasNextPage, setHasNextPage] = useState(false);


  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const fetchApprovedIdeas = async (from, to, page = 1) => {
    try {
      if (page === 1) 
      setLoading(true);
      
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let url = APPROVED_BY_ME_URL;
      const params = [];
      if (from) params.push(`fromDate=${from}`);
      if (to) params.push(`toDate=${to}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await axios.get(url, { headers });
      const items = response.data?.data?.items || [`page=${page}`, `pageSize=10`];

      let filteredByDate = items;
      if (from || to) {
        const fromTime = from ? new Date(from).getTime() : null;
        const toTime = to ? new Date(to).getTime() : null;

        filteredByDate = items.filter(item => {
          if (!item.approvalDate) return false;
          const approvalTime = new Date(item.approvalDate).getTime();
          if (fromTime !== null && approvalTime < fromTime) return false;
          if (toTime !== null && approvalTime > toTime) return false;
          return true;
        });
      }

  //     setIdeas(filteredByDate);
  //   } catch (error) {
  //     console.error("Error fetching approved ideas:", error);
  //     Alert.alert("Error", "Failed to load approved ideas.");
  //     setIdeas([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

   // Append or set depending on page
   setIdeas(prev => (page === 1 ? filteredByDate : [...prev, ...filteredByDate]));

   // Update pagination info
   setCurrentPage(response.data.currentPage || page);
   setTotalPages(response.data.totalPages || 1);
   setTotalItems(response.data.totalItems || filteredByDate.length);
   setHasNextPage(response.data.hasNextPage || false);

 } catch (error) {
   console.error("Error fetching approved ideas:", error);
   Alert.alert("Error", "Failed to load approved ideas.");
 } finally {
   setLoading(false);
 }
};

  useEffect(() => { fetchApprovedIdeas(); }, []);

  const filteredIdeas = Array.isArray(ideas)
    ? ideas.filter(idea => {
        const searchLower = searchText.trim().toLowerCase();
        return (
          searchLower === '' ||
          (idea.ideaNumber && idea.ideaNumber.toLowerCase().includes(searchLower)) ||
          (idea.itemNumber && idea.itemNumber.toLowerCase().includes(searchLower)) ||
          (idea.ownerName && idea.ownerName.toLowerCase().includes(searchLower)) ||
          (idea.description && idea.description.toLowerCase().includes(searchLower))
        );
      })
    : [];

  const fetchIdeaDetail = async (ideaId) => {
    if (!ideaId) return;
    
    try {
      setLoadingDetail(true);
      
      const idea = ideas.find(i => i.ideaId === ideaId || i.ideaNumber === ideaId);
      
      if (!idea) {
        Alert.alert("Error", "Idea details not found.");
        return;
      }

      const timeline = [];

      // Created
      if (idea.creationDate || idea.creation_date) {
        timeline.push({
          status: 'Created',
          date: idea.creationDate || idea.creation_date,
          description: 'Idea was created and submitted'
        });
      }

      // Edited
      if (idea.editedDate || idea.edited_date) {
        timeline.push({
          status: 'Edited',
          date: idea.editedDate || idea.edited_date,
          description: 'Idea details were edited'
        });
      }

      // Approved
      if (idea.approvalDate || idea.approval_date) {
        timeline.push({
          status: 'Approved',
          date: idea.approvalDate || idea.approval_date,
          description: idea.remarks || 'Idea has been approved'
        });
      }

      // Implementation
      if (idea.implementationDate || idea.implementation_date) {
        timeline.push({
          status: 'Implementation',
          date: idea.implementationDate || idea.implementation_date,
          description: 'Idea is under implementation'
        });
      }

      // Rejected
      if (idea.rejectedDate || idea.rejected_date) {
        timeline.push({
          status: 'Rejected',
          date: idea.rejectedDate || idea.rejected_date,
          description: idea.rejectionRemarks || 'Idea has been rejected'
        });
      }

      // Closed
      if (idea.closedDate || idea.closed_date) {
        timeline.push({
          status: 'Closed',
          date: idea.closedDate || idea.closed_date,
          description: 'Idea has been closed'
        });
      }

      // Timeline events from backend
      if (Array.isArray(idea.timelineEvents)) {
        idea.timelineEvents.forEach(event => {
          const eventDate = event.eventDate || event.event_date || event.timestamp || event.date;
          if (!eventDate) return;

          timeline.push({
            status: event.status || event.eventType || 'Update',
            date: eventDate,
            description: event.description || event.remarks || 'Update'
          });
        });
      }

      // Remove duplicates & sort by date
      const uniqueTimeline = [];
      const seen = new Set();
      timeline.forEach(evt => {
        const key = `${evt.status}-${evt.date}`;
        if (!seen.has(key)) {
          uniqueTimeline.push(evt);
          seen.add(key);
        }
      });

      uniqueTimeline.sort((a, b) => new Date(a.date) - new Date(b.date));

      const ideaWithTimeline = {
        ...idea,
        timeline: uniqueTimeline,
        currentStatus: idea.status
      };

      setIdeaDetail(ideaWithTimeline);
      setSelectedIdea(ideaWithTimeline);

    } catch (error) {
      console.error("Error fetching idea detail:", error);
      Alert.alert("Error", "Failed to fetch idea details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const applyFilters = () => {
    let from = fromDate ? fromDate.toISOString().split('T')[0] : null;
    let to = toDate ? toDate.toISOString().split('T')[0] : null;
    fetchApprovedIdeas(from, to);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFromDate(null);
    setToDate(null);
    fetchApprovedIdeas();
  };

  // Parse remarks
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

  const safeRenderValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Approved Ideas</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterButtonText}>{showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}</Text>
          <Ionicons name={showFilters ? "chevron-up" : "chevron-down"} size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Search:</Text>
          <TextInput
            placeholder="Idea Number / Owner / Description"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Filters */}
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
              onChange={(e, date) => { setShowFromPicker(false); if(date){setFromDate(date); if(toDate && date>toDate){setToDate(null)}} }}
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
              onChange={(e, date) => { setShowToPicker(false); if(date){setToDate(date)} }}
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

      {/* Cards List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filteredIdeas.length === 0 ? (
            <Text style={styles.noDataText}>No ideas found.</Text>
          ) : (
            filteredIdeas.map((idea, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                style={styles.cardContainer}
                onPress={() => fetchIdeaDetail(idea.ideaId || idea.ideaNumber)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.ideaNumber} numberOfLines={2}>{idea.itemNumber || idea.ideaNumber || "N/A"}</Text>
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
            ))
          )}
        </ScrollView>
      )}

      {/* Loading overlay */}
      {loadingDetail && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {/* Fullscreen Modal with Details */}
      <Modal visible={!!selectedIdea} animationType="slide">
        <View style={styles.fullModal}>
          {/* Modal Header */}
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
                {/* Employee Information */}
                <View style={styles.cardDetail}>
                  <Text style={styles.cardHeading}>👤 Employee Information</Text>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Employee Name:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.ownerName || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Employee Email:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.ownerEmail || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Department:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.department || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Location:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.location || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Owner ID:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.ownerId || "N/A"}</Text>
                  </View>
                </View>

                {/* Idea Information */}
                <View style={styles.cardDetail}>
                  <Text style={styles.cardHeading}>💡 Idea Information</Text>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Idea No:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.itemNumber || ideaDetail.ideaNumber || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Creation Date:</Text>
                    <Text style={styles.valueDetail}>
                      {ideaDetail.creationDate ? new Date(ideaDetail.creationDate).toLocaleDateString() : "N/A"}
                    </Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Approval Date:</Text>
                    <Text style={styles.valueDetail}>
                      {ideaDetail.approvalDate ? new Date(ideaDetail.approvalDate).toLocaleDateString() : "N/A"}
                    </Text>
                  </View>
                  {/* <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Status:</Text>
                    <Text style={[styles.statusBadgeDetail, { backgroundColor: getStatusColor(ideaDetail.status) }]}>
                      {ideaDetail.status || "N/A"}
                    </Text>
                  </View> */}

                    <View style={styles.rowDetail}>
                      <Text style={styles.labelDetail}>Status:</Text>
                      <Text
                        style={[
                          styles.statusBadgeDetail,
                          { backgroundColor: getStatusColor(ideaDetail?.status) || "#ccc" }, // fallback color
                        ]}
                      >
                        {ideaDetail?.status || "N/A"}
                      </Text>
                    </View>

                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Approval Stage:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.approvalStage || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Idea Description:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.description || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Type:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.type || "N/A"}</Text>
                  </View>
                  <View style={styles.rowDetail}>
                    <Text style={styles.labelDetail}>Idea ID:</Text>
                    <Text style={styles.valueDetail}>{ideaDetail.ideaId || "N/A"}</Text>
                  </View>
                </View>

                {/* Remarks */}
                <View style={styles.cardDetail}>
                  <Text style={styles.cardHeading}>📝 Remarks</Text>
                  {(() => {
                    const remarks = parseRemarks(ideaDetail.remark || ideaDetail.remarks);
                    if (remarks.length === 0) {
                      return <Text style={styles.noRemarksText}>No remarks available</Text>;
                    }
                    return remarks.map((remark, index) => (
                      <RemarksCard
                        key={index}
                        title={remark.approverName || remark.title || "Unknown"}
                        comment={remark.comments || remark.comment || ideaDetail.remarks || "No comment"}
                        date={remark.approvalDate || remark.date ? 
                          new Date(remark.approvalDate || remark.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ""}
                      />
                    ));
                  })()}
                </View>

                {/* Image */}
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

      {/* Progress Timeline Modal */}
      <Modal visible={showTimelineModal} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.timelineModalHeader}>
            <Text style={styles.timelineModalTitle}>📈 Progress Timeline</Text>
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
                      status={safeRenderValue(item.status || "N/A")}
                      date={item.date}
                      description={safeRenderValue(item.description)}
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

      {/* Image Modal */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c5aa0'
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
    fontWeight: '500'
  },

  searchSection: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12
  },
  searchLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
    fontWeight: '500'
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff'
  },

  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333'
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  dateInputText: {
    fontSize: 14,
    color: '#333',
  },
  filterButtons: {
    flexDirection: 'row',
    marginTop: 12
  },
  applyBtn: {
    flex: 1,
    backgroundColor: '#004b6f',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 8
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#777',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  btnText: {
    color: '#fff',
    fontWeight: '600'
  },

  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },

  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 6
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
  descriptionRow: {
    marginTop: 6
  },
  description: {
    color: '#333',
    fontSize: 14
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  dateColumn: {
    flexDirection: 'column'
  },
  dateText: {
    color: '#333',
    fontSize: 12
  },
  statusBadge: {
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    backgroundColor: "#f5f5f5",
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
  rowDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    flexWrap: 'wrap',
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
    paddingHorizontal: 10,
    paddingVertical: 12,
    paddingTop: 25,
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
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 15,
    width: 20,
  },
  timelineCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 2,
  },
  timelineLine: {
    width: 3,
    backgroundColor: "#E0E0E0",
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 5,
  },
  timelineStatus: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
    lineHeight: 18,
  },
  timelineDate: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
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

  imageWrapper: {
    alignItems: "center",
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2,
  },
  thumbnail: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  viewImageText: {
    marginTop: 8,
    color: '#2c5aa0',
    fontSize: 14,
    fontWeight: '500',
  },
  imageModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
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
});

export default ApprovedScreen;