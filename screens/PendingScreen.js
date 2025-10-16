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
// import { useNavigation } from '@react-navigation/native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { 
//   PENDING_APPROVALS_URL, 
//   IDEA_DETAIL_URL, 
//   UPDATE_STATUS_URL
// } from "../src/context/api";

// const formatDate = (dateString) => {
//   if (!dateString) return "N/A";
//   const date = new Date(dateString);
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = date.getFullYear();
//   return `${day}-${month}-${year}`;
// };

// const formatDateTime = (dateString) => {
//   if (!dateString) return "";
//   const date = new Date(dateString);
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = date.toLocaleString('en-IN', { month: 'short' });
//   const year = date.getFullYear();
//   const hours = String(date.getHours()).padStart(2, '0');
//   const minutes = String(date.getMinutes()).padStart(2, '0');
//   return `${day} ${month} ${year}, ${hours}:${minutes}`;
// };

// function TimelineItem({ status, date, description, isLast }) {
//   const getCircleColor = (status) => {
//     if (!status) return "#9E9E9E";
//     const s = status.toLowerCase();
//     if (s.includes("created")) return "#2196F3";
//     if (s.includes("edited")) return "#9C27B0";
//     if (s.includes("approved")) return "#4CAF50";
//     if (s.includes("implementation")) return "#3F51B5";
//     if (s.includes("rejected")) return "#F44336";
//     if (s.includes("pending")) return "#FF9800";
//     return "#9E9E9E";
//   };

//   return (
//     <View style={{ flexDirection: "row", marginBottom: 12 }}>
//       <View style={{ alignItems: "center", marginRight: 12 }}>
//         <View style={{
//           width: 14,
//           height: 14,
//           borderRadius: 7,
//           backgroundColor: getCircleColor(status),
//           borderWidth: 2,
//           borderColor: "#fff",
//         }} />
//         {!isLast && <View style={{ width: 2, flex: 1, backgroundColor: "#E0E0E0", marginTop: 2 }} />}
//       </View>
//       <View style={{ flex: 1 }}>
//         <Text style={{ fontWeight: "bold", fontSize: 14, color: "#333" }}>{status}</Text>
//         {description && <Text style={{ fontSize: 12, color: "#555", marginVertical: 2 }}>{description}</Text>}
//         {date && <Text style={{ fontSize: 11, color: "#999" }}>{formatDateTime(date)}</Text>}
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
//   if (s === "closed") return "#00ACC1";
//   if (s === "pending") return "#FF9800";
//   return "gray";
// };

// const parseRemarks = (remarkData) => {
//   if (!remarkData) return [];
//   if (Array.isArray(remarkData)) return remarkData;
//   if (typeof remarkData === "object") {
//     const keys = Object.keys(remarkData);
//     if (keys.length > 0 && keys.every(k => !isNaN(k))) {
//       return Object.values(remarkData);
//     }
//     return [remarkData];
//   }
//   return [];
// };

// export default function PendingScreen() {
//   const navigation = useNavigation();
//   const [ideas, setIdeas] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [pageSize] = useState(10);
//   const [totalItems, setTotalItems] = useState(0);
//   const [showFilters, setShowFilters] = useState(false);
//   const [searchIdeaNumber, setSearchIdeaNumber] = useState("");
//   const [fromDate, setFromDate] = useState(null);
//   const [toDate, setToDate] = useState(null);
//   const [showFromPicker, setShowFromPicker] = useState(false);
//   const [showToPicker, setShowToPicker] = useState(false);

//   const [selectedIdea, setSelectedIdea] = useState(null);
//   const [showImage, setShowImage] = useState(false);
//   const [loadingDetail, setLoadingDetail] = useState(false);
//   const [ideaDetail, setIdeaDetail] = useState(null);
//   const [showTimelineModal, setShowTimelineModal] = useState(false);

//   const [showRemarkModal, setShowRemarkModal] = useState(false);
//   const [remarkType, setRemarkType] = useState(""); 
//   const [remarkText, setRemarkText] = useState("");
//   const [submittingStatus, setSubmittingStatus] = useState(false);

//   useEffect(() => {
//     fetchIdeas();
//   }, [page, searchIdeaNumber, fromDate, toDate]);

//   const fetchIdeas = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem("token");
//       const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

//       let url = `${PENDING_APPROVALS_URL}?page=${page}&pageSize=${pageSize}`;
//       if (searchIdeaNumber.trim()) {
//         url += `&ideaNumber=${searchIdeaNumber.trim()}`;
//       }
//       if (fromDate) {
//         url += `&fromDate=${fromDate.toISOString().split('T')[0]}`;
//       }
//       if (toDate) {
//         url += `&toDate=${toDate.toISOString().split('T')[0]}`;
//       }

//       const response = await axios.get(url, {
//         headers: authHeaders,
//       });

//       if (
//         response.data &&
//         response.data.data &&
//         Array.isArray(response.data.data.items)
//       ) {
//         const items = response.data.data.items;
//         setIdeas(items);
//         setTotalItems(items.length);
//       } else {
//         setIdeas([]);
//         setTotalItems(0);
//       }
//     } catch (error) {
//       console.error("Error fetching all team ideas:", error);
//       Alert.alert("Error", "Failed to load team ideas.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchIdeaDetail = async (ideaId) => {
//     if (!ideaId) return;
//     try {
//       setLoadingDetail(true);
//       const token = await AsyncStorage.getItem('token');
//       const headers = token ? { Authorization: `Bearer ${token}` } : {};

//       const { data: response } = await axios.get(`${IDEA_DETAIL_URL}/${encodeURIComponent(ideaId)}`, { headers });

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

//   const openRemarkModal = (type) => {
//     setRemarkType(type);
//     setRemarkText("");
//     setShowRemarkModal(true);
//   };

//   const closeRemarkModal = () => {
//     setShowRemarkModal(false);
//     setRemarkType("");
//     setRemarkText("");
//   };

//   const submitStatusUpdate = async () => {
//     if (!remarkText.trim()) {
//       Alert.alert("Required", "Please enter a remark before submitting.");
//       return;
//     }
//     const originalIdea = ideas.find(i => 
//       i.ideaId === (ideaDetail?.ideaId || ideaDetail?.id) || 
//       i.id === (ideaDetail?.ideaId || ideaDetail?.id)
//     );

//     if (!originalIdea?.id) {
//       Alert.alert("Error", "Unable to find approval record. Please refresh and try again.");
//       return;
//     }

//     setSubmittingStatus(true);

//     try {
//       const token = await AsyncStorage.getItem("token");
//       const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

//       const statusMap = {
//         approve: "Approved",
//         reject: "Rejected",
//         hold: "On Hold"
//       };

//       console.log("=== Submitting Status Update ===");
//       console.log("Idea ID:", ideaDetail.id);
//       console.log("Approval Stage:", originalIdea.approvalStage);
//       console.log("Action:", remarkType);
//       console.log("Status:", statusMap[remarkType]);

      
//       const formData = new FormData();
//       formData.append('id', ideaDetail.id.toString()); 
//       formData.append('status', statusMap[remarkType]);
//       formData.append('approvalstage', originalIdea.approvalStage || 'Manager'); 
//       formData.append('comments', remarkText.trim());

//       console.log("=== FormData Fields ===");
//       console.log("id:", ideaDetail.id);
//       console.log("status:", statusMap[remarkType]);
//       console.log("approvalstage:", originalIdea.approvalStage || 'Manager');
//       console.log("comments:", remarkText.trim());

//       const response = await axios.post(UPDATE_STATUS_URL, formData, {
//         headers: {
//           ...authHeaders,
//           'Content-Type': 'multipart/form-data'
//         }
//       });
//       if (response.data && (response.data.success === true || response.status === 200)) {
//         Alert.alert(
//           "Success",
//           response.data.message || `Idea ${remarkType}d successfully!`,
//           [
//             {
//               text: "OK",
//               onPress: () => {
//                 closeRemarkModal();
//                 setSelectedIdea(null);
//                 setIdeaDetail(null);
//                 fetchIdeas();
//               }
//             }
//           ]
//         );
//       } else {
//         throw new Error(response.data?.message || "Failed to update status");
//       }
//     } catch (error) {
//       console.error("=== Error Submitting Status ===");
//       console.error("Status:", error.response?.status);
//       console.error("Message:", error.response?.data?.message || error.message);
//       console.error("Full Response:", JSON.stringify(error.response?.data, null, 2));
      
//       let errorMessage = "Failed to update idea status.";
      
//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }

//       Alert.alert("Error", errorMessage);
//     } finally {
//       setSubmittingStatus(false);
//     }
//   };

//   const handleApprove = () => {
//     openRemarkModal("approve");
//   };

//   const handleReject = () => {
//     openRemarkModal("reject");
//   };

//   const handleHold = () => {
//     openRemarkModal("hold");
//   };

//   const applyFilters = () => {
//     fetchIdeas();
//     setShowFilters(false);
//   };

//   const clearFilters = () => {
//     setSearchIdeaNumber("");
//     setFromDate(null);
//     setToDate(null);
//     setPage(1);
//   };

//   const totalPages = Math.ceil(totalItems / pageSize);

//   const renderPagination = () => {
//     if (totalPages <= 1) return null;

//     const maxButtonsToShow = 5;
//     const pageButtons = [];
    
//     let startPage = Math.max(1, page - Math.floor(maxButtonsToShow / 2));
//     let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);
    
//     if (endPage - startPage < maxButtonsToShow - 1) {
//       startPage = Math.max(1, endPage - maxButtonsToShow + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pageButtons.push(
//         <TouchableOpacity
//           key={i}
//           style={[styles.pageButton, page === i && styles.pageButtonActive]}
//           onPress={() => setPage(i)}
//         >
//           <Text style={page === i ? styles.pageButtonTextActive : styles.pageButtonText}>
//             {i}
//           </Text>
//         </TouchableOpacity>
//       );
//     }

//     return (
//       <View style={styles.paginationContainer}>
//         <TouchableOpacity
//           disabled={page === 1}
//           onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
//           style={[
//             styles.pageButton,
//             page === 1 && { opacity: 0.5 },
//           ]}
//         >
//           <Text style={styles.pageButtonText}>Previous</Text>
//         </TouchableOpacity>

//         {startPage > 1 && (
//           <>
//             <TouchableOpacity
//               style={styles.pageButton}
//               onPress={() => setPage(1)}
//             >
//               <Text style={styles.pageButtonText}>1</Text>
//             </TouchableOpacity>
//             {startPage > 2 && (
//               <Text style={styles.pageButtonText}>...</Text>
//             )}
//           </>
//         )}

//         {pageButtons}

//         {endPage < totalPages && (
//           <>
//             {endPage < totalPages - 1 && (
//               <Text style={styles.pageButtonText}>...</Text>
//             )}
//             <TouchableOpacity
//               style={styles.pageButton}
//               onPress={() => setPage(totalPages)}
//             >
//               <Text style={styles.pageButtonText}>{totalPages}</Text>
//             </TouchableOpacity>
//           </>
//         )}

//         <TouchableOpacity
//           disabled={page === totalPages}
//           onPress={() => setPage((prev) => Math.min(prev + 1, totalPages))}
//           style={[
//             styles.pageButton,
//             page === totalPages && { opacity: 0.5 },
//           ]}
//         >
//           <Text style={styles.pageButtonText}>Next</Text>
//         </TouchableOpacity>
        
//         <View style={styles.pageInfo}>
//           <Text style={styles.pageInfoText}>
//             Page {page} of {totalPages} ({totalItems} items)
//           </Text>
//         </View>
//       </View>
//     );
//   };

//   const getRemarkModalTitle = () => {
//     if (remarkType === "approve") return "Enter Remark for Approved";
//     if (remarkType === "reject") return "Enter Remark for Rejected";
//     if (remarkType === "hold") return "Enter Remark for On Hold";
//     return "Enter Remark";
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Pending Approvals</Text>
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
//             value={searchIdeaNumber}
//             onChangeText={(text) => setSearchIdeaNumber(text)}
//             placeholderTextColor="#999"
//           />
//         </View>
//       </View>

//       {showFilters && (
//         <View style={styles.filtersContainer}>
//           <Text style={styles.filterLabel}>Create Date Range</Text>

//           <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromPicker(true)}>
//             <Text style={styles.dateInputText}>{fromDate ? fromDate.toLocaleDateString() : "Select From Date"}</Text>
//           </TouchableOpacity>
//           {showFromPicker && (
//             <DateTimePicker
//               value={fromDate || new Date()}
//               mode="date"
//               display="default"
//               onChange={(e, date) => { 
//                 setShowFromPicker(false); 
//                 if (date) { 
//                   setFromDate(date); 
//                   if (toDate && date > toDate) { 
//                     setToDate(null) 
//                   } 
//                 } 
//               }}
//               maximumDate={toDate || undefined}
//             />
//           )}

//           <TouchableOpacity style={styles.dateInput} onPress={() => setShowToPicker(true)}>
//             <Text style={styles.dateInputText}>{toDate ? toDate.toLocaleDateString() : "Select To Date"}</Text>
//           </TouchableOpacity>
//           {showToPicker && (
//             <DateTimePicker
//               value={toDate || (fromDate || new Date())}
//               mode="date"
//               display="default"
//               onChange={(e, date) => { 
//                 setShowToPicker(false); 
//                 if (date) { 
//                   setToDate(date) 
//                 } 
//               }}
//               minimumDate={fromDate || undefined}
//             />
//           )}

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
//         <ActivityIndicator size="large" color="#2c5aa0" style={{ marginTop: 20 }} />
//       ) : (
//         <ScrollView contentContainerStyle={styles.scrollContainer}>
//           {ideas.length === 0 ? (
//             <Text style={styles.noDataText}>No pending approvals found.</Text>
//           ) : (
//             <>
//               {ideas.map((idea, index) => (
//                 <TouchableOpacity
//                   key={index}
//                   activeOpacity={0.8}
//                   style={styles.cardContainer}
//                   onPress={() => fetchIdeaDetail(idea.ideaId || idea.id)}
//                 >
                  
//                   <View style={styles.cardHeader}>
//                     <Text style={styles.ideaNumber} numberOfLines={2}>{idea.ideaNumber || "N/A"}</Text>
//                     <View style={styles.typeTag}>
//                       <Text style={styles.typeText}>{idea.type || "N/A"}</Text>
//                     </View>
//                   </View>
                  
//                   <View style={styles.cardContent}>
//                     <View style={styles.rowDetail}>
//                       <Text style={styles.label}>Description:</Text>
//                       <Text style={styles.value} numberOfLines={2}>{idea.description || "N/A"}</Text>
//                     </View>

//                     <View style={styles.row}>
//                       <Text style={styles.label}>Owner:</Text>
//                       <Text style={styles.value}>{idea.ownerName || "N/A"}</Text>
//                     </View>

//                     <View style={styles.row}>
//                       <Text style={styles.label}>Created:</Text>
//                       <Text style={styles.value}>{formatDate(idea.creationDate)}</Text>
//                     </View>

//                     <View style={styles.rowDetail}>
//                       <Text style={styles.label}>Status:</Text>
//                       <View style={{ flex: 1, alignItems: 'flex-end' }}>
//                         <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(idea.status) }]} numberOfLines={2}>
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

//       {renderPagination()}

//       {loadingDetail && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#2c5aa0" />
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
//                     <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerName || "N/A"}</Text>
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
//                     <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerDepartment || "N/A"}</Text>
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
//                     <Text style={styles.valueDetail}>{formatDate(ideaDetail.ideaCreationDate)}</Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Planned Completion:</Text>
//                     <Text style={styles.valueDetail}>{formatDate(ideaDetail.plannedImplementationDuration)}</Text>
//                   </View>

                  
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Before Implementation:</Text>
//                     {ideaDetail.beforeImplementationImagePath ? (
//                       <TouchableOpacity style={styles.imagePreviewContainer} onPress={() => setShowImage(true)}>
//                         <Image source={{ uri: ideaDetail.beforeImplementationImagePath }} style={styles.thumbnailSmall} />
//                         <Text style={styles.tapToEnlargeText}>Tap to image</Text>
//                       </TouchableOpacity>
//                     ) : <Text style={styles.valueDetail}>N/A</Text>}
//                   </View>

//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Status:</Text>
//                     <View style={{ flex: 1, alignItems: 'flex-end' }}>
//                       <Text style={[styles.statusBadgeDetail, { backgroundColor: getStatusColor(ideaDetail.ideaStatus) }]}>
//                         {ideaDetail.ideaStatus || "N/A"}
//                       </Text>
//                     </View>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Idea Description:</Text>
//                     <Text style={styles.valueDetail}>{ideaDetail.ideaDescription || "N/A"}</Text>
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
//                     <Text style={styles.labelDetail}>IsBETeamSupportNeeded:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.isBETeamSupportNeeded ? "Yes" : "No"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>CanBeImplementedToOtherLocations:</Text>
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
//                         date={remark.approvalDate || remark.date ? formatDateTime(remark.approvalDate || remark.date) : ""}
//                       />
//                     ));
//                   })()}
//                 </View>

//                 {/* {ideaDetail.beforeImplementationImagePath && (
//                   <TouchableOpacity
//                     style={styles.imageWrapper}
//                     onPress={() => setShowImage(true)}
//                   >
//                     <Image source={{ uri: ideaDetail.beforeImplementationImagePath }} style={styles.thumbnail} />
//                     <Text style={styles.viewImageText}>Tap to view full image</Text>
//                   </TouchableOpacity>
//                 )} */}
//               </>
//             )}
//           </ScrollView>

//           <View style={styles.actionButtonsContainer}>
//             <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
//               <Ionicons name="checkmark-circle" size={18} color="#fff" />
//               <Text style={styles.actionButtonText}>Approve</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
//               <Ionicons name="close-circle" size={18} color="#fff" />
//               <Text style={styles.actionButtonText}>Reject</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.holdButton} onPress={handleHold}>
//               <Ionicons name="pause-circle" size={18} color="#fff" />
//               <Text style={styles.actionButtonText}>Hold</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Remark Modal */}
//       <Modal visible={showRemarkModal} transparent animationType="fade">
//         <View style={styles.remarkModalOverlay}>
//           <View style={styles.remarkModalContainer}>
//             <View style={styles.remarkModalHeader}>
//               <Text style={styles.remarkModalTitle}>{getRemarkModalTitle()}</Text>
//               <TouchableOpacity
//                 style={styles.remarkCloseButton}
//                 onPress={closeRemarkModal}
//               >
//                 <Ionicons name="close" size={20} color="#fff" />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.remarkModalBody}>
//               <Text style={styles.remarkLabel}>Remark *</Text>
//               <TextInput
//                 style={styles.remarkTextArea}
//                 placeholder="Enter your remark here..."
//                 placeholderTextColor="#999"
//                 multiline
//                 numberOfLines={6}
//                 textAlignVertical="top"
//                 value={remarkText}
//                 onChangeText={setRemarkText}
//               />
//             </View>

//             <View style={styles.remarkModalFooter}>
//               <TouchableOpacity
//                 style={styles.remarkCancelButton}
//                 onPress={closeRemarkModal}
//                 disabled={submittingStatus}
//               >
//                 <Text style={styles.remarkCancelText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.remarkSubmitButton}
//                 onPress={submitStatusUpdate}
//                 disabled={submittingStatus}
//               >
//                 {submittingStatus ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Text style={styles.remarkSubmitText}>Submit</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Timeline Modal */}
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
//                       status={item.status || item.approvalStage || "N/A"}
//                       date={item.date || item.approvalDate}
//                       description={item.description || item.comments}
//                       isLast={idx === ideaDetail.timeline.length - 1}
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

//       {/* Image Modal */}
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
//   headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
//   filterButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#e8e8e8', borderRadius: 4 },
//   filterButtonText: { fontSize: 11, color: '#000', marginRight: 6, fontWeight: '600' },
//   filterArrow: { fontSize: 10, color: '#000', fontWeight: 'bold' },
//   searchSection: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
//   searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 },
//   searchLabel: { fontSize: 16, color: '#333', marginRight: 8, fontWeight: '500' },
//   searchInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, backgroundColor: '#fff' },
//   filtersContainer: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
//   filterLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' },
//   dateInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, backgroundColor: '#f9f9f9', marginBottom: 10 },
//   dateInputText: { fontSize: 14, color: '#333' },
//   filterButtons: { flexDirection: 'row', marginTop: 12 },
//   applyBtn: { flex: 1, backgroundColor: '#0A5064', padding: 12, borderRadius: 6, alignItems: 'center', marginRight: 8 },
//   resetBtn: { flex: 1, backgroundColor: '#6c757d', padding: 12, borderRadius: 6, alignItems: 'center' },
//   btnText: { color: '#fff', fontWeight: '600' },
//   scrollContainer: { padding: 16, paddingBottom: 30 },
//   cardContainer: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
//   cardHeader: { backgroundColor: '#2c5aa0', padding: 12, borderTopLeftRadius: 8, borderTopRightRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
//   ideaNumber: { color: '#fff', fontSize: 14, fontWeight: 'bold', flex: 1, marginRight: 8 },
//   typeTag: { backgroundColor: '#f0ad4e', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
//   typeText: { color: '#fff', fontSize: 12, fontWeight: '500' },
//   cardContent: { padding: 12 },
//   row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
//   rowDetail: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, alignItems: 'flex-start' },
//   label: { color: '#555', fontWeight: '500', fontSize: 14 },
//   value: { color: '#333', fontSize: 14, maxWidth: '65%', textAlign: 'right' },
//   statusBadge: { color: "#fff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 11, fontWeight: '600', maxWidth: 200, textAlign: 'center' },
//   totalContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginTop: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0' },
//   totalText: { fontSize: 16, fontWeight: 'bold', color: '#2c5aa0' },
//   noDataText: { textAlign: "center", marginTop: 20, color: "#777", fontSize: 16 },
//   paginationContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: 15, flexWrap: "wrap", paddingBottom: 10, paddingHorizontal: 10 },
//   pageButton: { marginHorizontal: 5, marginVertical: 3, backgroundColor: "#ddd", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
//   pageButtonActive: { backgroundColor: "#0A5064" },
//   pageButtonText: { color: "#000", fontWeight: "bold" },
//   pageButtonTextActive: { color: "#fff", fontWeight: "bold" },
//   pageInfo: { width: "100%", alignItems: "center", marginTop: 8 },
//   pageInfoText: { fontSize: 12, color: "#666", fontWeight: "500" },
//   loadingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.6)" },
//   fullModal: { flex: 1, backgroundColor: "#f5f5f5" },
//   modalHeader: { backgroundColor: '#fff', paddingTop: 24, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', elevation: 4 },
//   modalHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
//   modalHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c5aa0' },
//   closeButton: { backgroundColor: '#f0f0f0', borderRadius: 18, width: 32, height: 32, justifyContent: "center", alignItems: "center" },
//   timelineButtonHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e3f2fd', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2c5aa0' },
//   timelineButtonText: { color: '#2c5aa0', fontSize: 14, fontWeight: '600', marginLeft: 6 },
//   modalScrollContent: { padding: 16, paddingBottom: 90 },
//   cardDetail: { backgroundColor: "#fff", padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2 },
//   cardHeading: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#2c5aa0" },
//   labelDetail: { fontWeight: "600", color: "#555", width: "45%", fontSize: 14 },
//   valueDetail: { color: "#222", width: "50%", textAlign: "right", fontSize: 14 },
//   statusBadgeDetail: { color: "#fff", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, fontSize: 11, fontWeight: '600', maxWidth: 200, textAlign: 'center' },
//   remarkCard: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#2c5aa0' },
//   remarkTitle: { fontSize: 15, fontWeight: 'bold', color: '#2c5aa0', marginBottom: 6 },
//   remarkComment: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 6 },
//   remarkDate: { fontSize: 12, color: '#999', fontStyle: 'italic' },
//   noRemarksText: { textAlign: 'center', color: '#999', fontSize: 14, fontStyle: 'italic', paddingVertical: 10 },
//   timelineModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c5aa0', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 40, elevation: 4 },
//   timelineModalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
//   closeButtonTimeline: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18, width: 32, height: 32, justifyContent: "center", alignItems: "center" },
//   timelineCardContainer: { backgroundColor: "#fff", padding: 16, borderRadius: 10, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2 },
//   timelineContainer: { paddingLeft: 4, paddingTop: 4 },
//   noTimelineContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
//   noTimelineText: { color: "#999", textAlign: "center", marginTop: 10, fontSize: 15, fontStyle: 'italic' },
//   imageWrapper: { alignItems: "center", backgroundColor: '#fff', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2 },
//   thumbnail: { width: 150, height: 150, borderRadius: 8 },
//   viewImageText: { marginTop: 8, color: '#2c5aa0', fontSize: 14, fontWeight: '500' },
//   imageModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
//   closeButtonImage: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 22, width: 44, height: 44, justifyContent: "center", alignItems: "center" },
//   fullImage: { width: "80%", height: "60%" },
//   actionButtonsContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, gap: 10 },
//   approveButton: { flex: 1, backgroundColor: '#4CAF50', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, elevation: 2 },
//   rejectButton: { flex: 1, backgroundColor: '#F44336', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, elevation: 2 },
//   holdButton: { flex: 1, backgroundColor: '#FFC107', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, elevation: 2 },
//   actionButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase' },
//   remarkModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
//   remarkModalContainer: { backgroundColor: '#fff', borderRadius: 12, width: '100%', maxWidth: 500, overflow: 'hidden', elevation: 5 },
//   remarkModalHeader: { backgroundColor: '#2c5aa0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
//   remarkModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1 },
//   remarkCloseButton: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
//   remarkModalBody: { padding: 20 },
//   remarkLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
//   remarkTextArea: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#333', minHeight: 120, backgroundColor: '#f9f9f9' },
//   remarkModalFooter: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0', gap: 10 },
//   remarkCancelButton: { flex: 1, backgroundColor: '#6c757d', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
//   remarkCancelText: { color: '#fff', fontSize: 14, fontWeight: '600' },
//   remarkSubmitButton: { flex: 1, backgroundColor: '#2c5aa0', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
//   remarkSubmitText: { color: '#fff', fontSize: 14, fontWeight: '600' }
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
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  PENDING_APPROVALS_URL, 
  IDEA_DETAIL_URL, 
  UPDATE_STATUS_URL
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
  if (s === "draft") return "blue";
  if (s === "published") return "green";
  if (s === "closed") return "#00ACC1";
  if (s === "pending") return "#FF9800";
  return "gray";
};

const shouldShowImplementationDetails = (ideaType) => {
  if (!ideaType) return false;
  return ideaType.toLowerCase().trim() === "implementation";
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

  const [employeeInfoExpanded, setEmployeeInfoExpanded] = useState(true);
  const [ideaInfoExpanded, setIdeaInfoExpanded] = useState(false);
  const [showImplementationDetails, setShowImplementationDetails] = useState(false);

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
      Alert.alert("Required", "Please enter a remark before submitting.");
      return;
    }
    const originalIdea = ideas.find(i => 
      i.ideaId === (ideaDetail?.ideaId || ideaDetail?.id) || 
      i.id === (ideaDetail?.ideaId || ideaDetail?.id)
    );

    if (!originalIdea?.id) {
      Alert.alert("Error", "Unable to find approval record. Please refresh and try again.");
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

      console.log("=== Submitting Status Update ===");
      console.log("Idea ID:", ideaDetail.id);
      console.log("Approval Stage:", originalIdea.approvalStage);
      console.log("Action:", remarkType);
      console.log("Status:", statusMap[remarkType]);

      
      const formData = new FormData();
      formData.append('id', ideaDetail.id.toString()); 
      formData.append('status', statusMap[remarkType]);
      formData.append('approvalstage', originalIdea.approvalStage || 'Manager'); 
      formData.append('comments', remarkText.trim());

      console.log("=== FormData Fields ===");
      console.log("id:", ideaDetail.id);
      console.log("status:", statusMap[remarkType]);
      console.log("approvalstage:", originalIdea.approvalStage || 'Manager');
      console.log("comments:", remarkText.trim());

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
                setSelectedIdea(null);
                setIdeaDetail(null);
                fetchIdeas();
              }
            }
          ]
        );
      } else {
        throw new Error(response.data?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("=== Error Submitting Status ===");
      console.error("Status:", error.response?.status);
      console.error("Message:", error.response?.data?.message || error.message);
      console.error("Full Response:", JSON.stringify(error.response?.data, null, 2));
      
      let errorMessage = "Failed to update idea status.";
      
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

  const handleApprove = () => {
    openRemarkModal("approve");
  };

  const handleReject = () => {
    openRemarkModal("reject");
  };

  const handleHold = () => {
    openRemarkModal("hold");
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
          style={[
            styles.pageButton,
            page === 1 && { opacity: 0.5 },
          ]}
        >
          <Text style={styles.pageButtonText}>Previous</Text>
        </TouchableOpacity>

        {startPage > 1 && (
          <>
            <TouchableOpacity
              style={styles.pageButton}
              onPress={() => setPage(1)}
            >
              <Text style={styles.pageButtonText}>1</Text>
            </TouchableOpacity>
            {startPage > 2 && (
              <Text style={styles.pageButtonText}>...</Text>
            )}
          </>
        )}

        {pageButtons}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <Text style={styles.pageButtonText}>...</Text>
            )}
            <TouchableOpacity
              style={styles.pageButton}
              onPress={() => setPage(totalPages)}
            >
              <Text style={styles.pageButtonText}>{totalPages}</Text>
            </TouchableOpacity>
          </>
        )}

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
    setEmployeeInfoExpanded(true);
    setIdeaInfoExpanded(false);
    setShowImplementationDetails(false);
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

      <Modal visible={!!selectedIdea} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalHeaderTitle}>Idea Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
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
                    <View style={styles.rowDetail}>
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
                          <Text style={styles.tapToEnlargeText}>Tap to view</Text>
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
                      <Text style={styles.labelDetail}>Type:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.ideaType || "N/A"}</Text>
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
                )}

                {shouldShowImplementationDetails(ideaDetail.ideaType) && (
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
                        <View style={styles.rowDetail}>
                          <Text style={styles.labelDetail}>Implementation Details:</Text>
                          <Text style={styles.valueDetail}>
                            {ideaDetail.implementationCycle?.implementation || 
                             ideaDetail.implementationDetail || 
                             ideaDetail.implementation || 
                             "Not provided"}
                          </Text>
                        </View>
                        <View style={styles.rowDetail}>
                          <Text style={styles.labelDetail}>Outcome/Benefits:</Text>
                          <Text style={styles.valueDetail}>
                            {ideaDetail.implementationCycle?.outcome || 
                             ideaDetail.implementationOutcome || 
                             ideaDetail.outcome || 
                             "Not provided"}
                          </Text>
                        </View>
                        {(ideaDetail.implementationCycle?.startDate || ideaDetail.implementationDate) && (
                          <View style={styles.rowDetail}>
                            <Text style={styles.labelDetail}>Completed On:</Text>
                            <Text style={styles.valueDetail}>
                              {formatDate(ideaDetail.implementationCycle?.startDate || ideaDetail.implementationDate)}
                            </Text>
                          </View>
                        )}
                        {(ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath) && (
                          <View style={styles.implementationImageSection}>
                            <Text style={styles.imageLabel}>Before Implementation:</Text>
                            <TouchableOpacity onPress={() => openImagePreview(ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath)}>
                              <Image 
                                source={{ uri: ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath }} 
                                style={styles.implementationImage} 
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                        {(ideaDetail.implementationCycle?.afterImplementationImagePath || ideaDetail.afterImplementationImagePath) && (
                          <View style={styles.implementationImageSection}>
                            <Text style={styles.imageLabel}>After Implementation:</Text>
                            <TouchableOpacity onPress={() => openImagePreview(ideaDetail.implementationCycle?.afterImplementationImagePath || ideaDetail.afterImplementationImagePath)}>
                              <Image 
                                source={{ uri: ideaDetail.implementationCycle?.afterImplementationImagePath || ideaDetail.afterImplementationImagePath }} 
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

      {/* Image Modal */}
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
  modalScrollContent: { padding: 16, paddingBottom: 90 },
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
  implementationImage: { width: '100%', height: 200, borderRadius: 8, resizeMode: 'cover' },
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
  fullImage: { width: "80%", height: "60%" },
  actionButtonsContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, gap: 10 },
  approveButton: { flex: 1, backgroundColor: '#4CAF50', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, elevation: 2 },
  rejectButton: { flex: 1, backgroundColor: '#F44336', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, elevation: 2 },
  holdButton: { flex: 1, backgroundColor: '#FFC107', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, elevation: 2 },
  actionButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase' },
  remarkModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  remarkModalContainer: { backgroundColor: '#fff', borderRadius: 12, width: '100%', maxWidth: 500, overflow: 'hidden', elevation: 5 },
  remarkModalHeader: { backgroundColor: '#2c5aa0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  remarkModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1 },
  remarkCloseButton: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  remarkModalBody: { padding: 20 },
  remarkLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  remarkTextArea: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#333', minHeight: 120, backgroundColor: '#f9f9f9' },
  remarkModalFooter: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0', gap: 10 },
  remarkCancelButton: { flex: 1, backgroundColor: '#6c757d', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  remarkCancelText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  remarkSubmitButton: { flex: 1, backgroundColor: '#2c5aa0', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  remarkSubmitText: { color: '#fff', fontSize: 14, fontWeight: '600' },
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
});