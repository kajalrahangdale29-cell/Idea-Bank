// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   ScrollView,
//   Image,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import axios from "axios";
// import { HOLD_BY_ME_URL, IDEA_DETAIL_URL, UPDATE_STATUS_URL } from "../src/context/api";

// const formatDateToDDMMYYYY = (dateString) => {
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
//     const s = status?.toLowerCase() || '';
//     if (s.includes('created')) return "#2196F3";
//     if (s.includes('edited')) return "#9C27B0";
//     if (s.includes('approved')) return "#4CAF50";
//     if (s.includes('pending')) return "#FF9800";
//     if (s.includes('implementation')) return "#9C27B0";
//     if (s.includes('rejected')) return "#F44336";
//     if (s.includes('hold')) return "#FFC107";
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
//           <Text style={styles.timelineDate}>{formatDateTime(date)}</Text>
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
//   if (!status) return "#9E9E9E";
//   const s = status.toLowerCase();
//   if (s === "draft") return "#2196F3";
//   if (s.includes("publish")) return "#4CAF50";
//   if (s === "pending") return "#FF9800";
//   if (s === "approved" || s === "closed") return "#607D8B";
//   if (s === "rejected") return "#F44336";
//   if (s === "hold" || s === "on hold") return "#FFC107";
//   return "#9E9E9E";
// };

// const HoldScreen = () => {
//   const [searchText, setSearchText] = useState("");
//   const [ideas, setIdeas] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [token, setToken] = useState(null);
//   const [totalItems, setTotalItems] = useState(0);

//   const [showFilters, setShowFilters] = useState(false);
//   const [fromDate, setFromDate] = useState(null);
//   const [toDate, setToDate] = useState(null);
//   const [showFromPicker, setShowFromPicker] = useState(false);
//   const [showToPicker, setShowToPicker] = useState(false);

//   const [selectedIdea, setSelectedIdea] = useState(null);
//   const [ideaDetail, setIdeaDetail] = useState(null);
//   const [loadingDetail, setLoadingDetail] = useState(false);
//   const [showTimelineModal, setShowTimelineModal] = useState(false);
//   const [showImage, setShowImage] = useState(false);

  
//   const [showRemarkModal, setShowRemarkModal] = useState(false);
//   const [remarkType, setRemarkType] = useState("");
//   const [remarkText, setRemarkText] = useState("");
//   const [submittingStatus, setSubmittingStatus] = useState(false);

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
//       fetchHoldIdeas();
//     }
//   }, [token]);

//   const fetchHoldIdeas = async (from, to) => {
//     setLoading(true);
//     try {
//       let url = HOLD_BY_ME_URL;
//       const params = [];
//       if (from) params.push(`fromDate=${from}`);
//       if (to) params.push(`toDate=${to}`);
//       if (params.length > 0) url += `&${params.join("&")}`;

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

//       if (from || to) {
//         const fromTime = from ? new Date(from).getTime() : null;
//         const toTime = to ? new Date(to).getTime() : null;

//         items = items.filter((item) => {
//           const createdTime = item.createdOn
//             ? new Date(item.createdOn).getTime()
//             : null;
//           if (!createdTime) return false;
//           if (fromTime && createdTime < fromTime) return false;
//           if (toTime && createdTime > toTime) return false;
//           return true;
//         });
//       }

//       setIdeas(items);
//       setTotalItems(items.length);
//     } catch (error) {
//       console.error("Fetch hold error:", error);
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchIdeaDetail = async (ideaId) => {
//     if (!ideaId) return;
//     try {
//       setLoadingDetail(true);
//       const headers = token ? { Authorization: `Bearer ${token}` } : {};

//       // ✅ FIXED: Using correct endpoint format like PendingScreen
//       const { data: response } = await axios.get(
//         `${IDEA_DETAIL_URL}/${encodeURIComponent(ideaId)}`, 
//         { headers }
//       );

//       console.log("API Response:", response);

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

//     // Get the original idea from the list
//     const originalIdea = ideas.find(i => 
//       i.ideaId === (ideaDetail?.ideaId || ideaDetail?.id) || 
//       i.id === (ideaDetail?.ideaId || ideaDetail?.id)
//     );

//     if (!originalIdea?.id && !ideaDetail?.id) {
//       Alert.alert("Error", "Unable to find idea record. Please refresh and try again.");
//       return;
//     }

//     setSubmittingStatus(true);

//     try {
//       const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

//       const statusMap = {
//         approve: "Approved",
//         reject: "Rejected",
//       };

//       console.log("=== Debug Info ===");
//       console.log("Original Idea:", JSON.stringify(originalIdea, null, 2));
//       console.log("Idea Detail:", JSON.stringify(ideaDetail, null, 2));
//       console.log("Action:", remarkType);

//       // ✅ Multiple payload attempts like PendingScreen
//       const payloads = [
//         // Payload 1: Simple with ideaId
//         {
//           ideaId: originalIdea?.ideaId || ideaDetail.id,
//           status: statusMap[remarkType],
//           remarks: remarkText.trim(),
//           approvalStage: originalIdea?.approvalStage || ideaDetail?.approvalStage || "Manager"
//         },
//         // Payload 2: With approval id from list
//         {
//           id: originalIdea?.id,
//           status: statusMap[remarkType],
//           remarks: remarkText.trim()
//         },
//         // Payload 3: With ideaNumber
//         {
//           ideaNumber: originalIdea?.ideaNumber || ideaDetail.ideaNumber,
//           status: statusMap[remarkType],
//           remarks: remarkText.trim(),
//           approvalStage: originalIdea?.approvalStage || "Manager"
//         },
//         // Payload 4: Complete payload
//         {
//           id: originalIdea?.id,
//           ideaId: originalIdea?.ideaId || ideaDetail.id,
//           ideaNumber: originalIdea?.ideaNumber || ideaDetail.ideaNumber,
//           approvalStage: originalIdea?.approvalStage || ideaDetail?.approvalStage || "Manager",
//           status: statusMap[remarkType],
//           remarks: remarkText.trim(),
//           comment: remarkText.trim()
//         },
//         // Payload 5: With approvalId key
//         {
//           approvalId: originalIdea?.id,
//           ideaId: originalIdea?.ideaId || ideaDetail.id,
//           status: statusMap[remarkType],
//           remarks: remarkText.trim()
//         },
//         // Payload 6: Backend might need action key
//         {
//           id: originalIdea?.id,
//           ideaId: originalIdea?.ideaId || ideaDetail.id,
//           action: remarkType,
//           status: statusMap[remarkType],
//           remarks: remarkText.trim(),
//           approvalStage: originalIdea?.approvalStage || "Manager"
//         }
//       ];

//       let success = false;
//       let lastError = null;

//       for (let i = 0; i < payloads.length; i++) {
//         try {
//           console.log(`\n=== Trying Payload ${i + 1}/${payloads.length} ===`);
//           console.log(JSON.stringify(payloads[i], null, 2));

//           const response = await axios.post(UPDATE_STATUS_URL, payloads[i], {
//             headers: {
//               ...authHeaders,
//               'Content-Type': 'application/json'
//             }
//           });

//           console.log(`✅ Payload ${i + 1} Success:`, JSON.stringify(response.data, null, 2));

//           if (response.data && (response.data.success === true || response.status === 200)) {
//             success = true;
//             Alert.alert(
//               "Success",
//               response.data.message || `Idea ${remarkType}d successfully!`,
//               [
//                 {
//                   text: "OK",
//                   onPress: () => {
//                     closeRemarkModal();
//                     setSelectedIdea(null);
//                     setIdeaDetail(null);
//                     fetchHoldIdeas();
//                   }
//                 }
//               ]
//             );
//             break;
//           }
//         } catch (err) {
//           console.log(`❌ Payload ${i + 1} failed:`, err.response?.status, "-", err.response?.data?.message || err.message);
//           lastError = err;
//         }
//       }

//       if (!success && lastError) {
//         throw lastError;
//       }

//     } catch (error) {
//       console.error("\n=== Final Error ===");
//       console.error("Status:", error.response?.status);
//       console.error("Message:", error.response?.data?.message || error.message);
      
//       let errorMessage = "Failed to update idea status.";
      
//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }

//       Alert.alert(
//         "Error", 
//         `${errorMessage}\n\n📋 Debug Info:\n` +
//         `• Idea ID: ${ideaDetail?.id || ideaDetail?.ideaId}\n` +
//         `• Idea Number: ${ideaDetail?.ideaNumber}\n` +
//         `• HTTP Status: ${error.response?.status}`
//       );
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

//   const applyFilters = () => {
//     const from = fromDate ? fromDate.toISOString().split("T")[0] : null;
//     const to = toDate ? toDate.toISOString().split("T")[0] : null;
//     fetchHoldIdeas(from, to);
//     setShowFilters(false);
//   };

//   const resetFilters = () => {
//     setFromDate(null);
//     setToDate(null);
//     fetchHoldIdeas();
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

//   const parseRemarks = (remarkData) => {
//     if (!remarkData) return [];
//     if (Array.isArray(remarkData)) return remarkData;
//     if (typeof remarkData === "object") {
//       const keys = Object.keys(remarkData);
//       if (keys.length > 0 && keys.every((k) => !isNaN(k))) {
//         return Object.values(remarkData);
//       }
//       return [remarkData];
//     }
//     return [];
//   };

//   const safeRenderValue = (value) => {
//     if (value === null || value === undefined) return "N/A";
//     if (typeof value === "object") return JSON.stringify(value);
//     return String(value);
//   };

//   const getRemarkModalTitle = () => {
//     if (remarkType === "approve") return "Enter Remark for Approved";
//     if (remarkType === "reject") return "Enter Remark for Rejected";
//     return "Enter Remark";
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Hold Ideas</Text>
//         <TouchableOpacity
//           style={styles.filterButton}
//           onPress={() => setShowFilters(!showFilters)}
//         >
//           <Text style={styles.filterButtonText}>
//             {showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}
//           </Text>
//           <Ionicons name={showFilters ? "chevron-up" : "chevron-down"} size={16} color="#666" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.searchSection}>
//         <View style={styles.searchContainer}>
//           <Text style={styles.searchLabel}>Search:</Text>
//           <TextInput
//             placeholder="Idea Number / Owner / Description"
//             style={styles.searchInput}
//             value={searchText}
//             onChangeText={setSearchText}
//             placeholderTextColor="#999"
//           />
//         </View>
//       </View>

//       {showFilters && (
//         <View style={styles.filtersContainer}>
//           <Text style={styles.filterLabel}>Create Date Range</Text>
          
//           <View style={styles.datePickerRow}>
//             <View style={styles.dateInputContainer}>
//               <Text style={styles.dateLabel}>From Date:</Text>
//               <TouchableOpacity
//                 style={styles.datePickerInput}
//                 onPress={() => setShowFromPicker(true)}
//               >
//                 <Text style={styles.datePickerText}>
//                   {fromDate ? formatDateToDDMMYYYY(fromDate) : "DD-MM-YYYY"}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             <View style={styles.dateInputContainer}>
//               <Text style={styles.dateLabel}>To Date:</Text>
//               <TouchableOpacity
//                 style={styles.datePickerInput}
//                 onPress={() => setShowToPicker(true)}
//               >
//                 <Text style={styles.datePickerText}>
//                   {toDate ? formatDateToDDMMYYYY(toDate) : "DD-MM-YYYY"}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>

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

//       {loading ? (
//         <ActivityIndicator size="large" color="#0A5064" style={{ marginTop: 20 }} />
//       ) : (
//         <ScrollView contentContainerStyle={styles.scrollContainer}>
//           {filtered.length === 0 ? (
//             <Text style={styles.noDataText}>No hold ideas found.</Text>
//           ) : (
//             <>
//               {filtered.map((idea, index) => (
//                 <TouchableOpacity
//                   key={index}
//                   activeOpacity={0.8}
//                   style={styles.cardContainer}
//                   onPress={() => {
//                     console.log("Selected idea object:", idea);
//                     setSelectedIdea(idea);
//                     // ✅ FIXED: Using ideaId or id correctly
//                     fetchIdeaDetail(idea.ideaId || idea.id || idea.ideaNumber);
//                   }}
//                 >
//                   <View style={styles.cardHeader}>
//                     <Text style={styles.ideaNumber} numberOfLines={2}>
//                       {idea.ideaNumber || idea.itemNumber || "N/A"}
//                     </Text>
//                     <View style={styles.typeTag}>
//                       <Text style={styles.typeText}>{idea.type || "On Hold"}</Text>
//                     </View>
//                   </View>

//                   <View style={styles.cardContent}>
//                     <View style={styles.row}>
//                       <Text style={styles.label}>Owner:</Text>
//                       <Text style={styles.value} numberOfLines={2}>
//                         {idea.ownerName || "N/A"}
//                       </Text>
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
//                       <Text style={styles.description} numberOfLines={3}>
//                         {idea.description || "N/A"}
//                       </Text>
//                     </View>
//                     <View style={styles.row}>
//                       <Text style={styles.label}>Created On:</Text>
//                       <Text style={styles.value}>
//                         {formatDateToDDMMYYYY(idea.createdOn || idea.creationDate)}
//                       </Text>
//                     </View>
//                     <View style={styles.row}>
//                       <Text style={styles.label}>Status:</Text>
//                       <View style={styles.statusBadgeContainer}>
//                         <Text
//                           style={[
//                             styles.statusBadge,
//                             { backgroundColor: getStatusColor(idea.status) },
//                           ]}
//                           numberOfLines={1}
//                         >
//                           {idea.status || "On Hold"}
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
//                 onPress={() => {
//                   setSelectedIdea(null);
//                   setIdeaDetail(null);
//                 }}
//               >
//                 <Ionicons name="close" size={20} color="#666" />
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity
//               style={styles.timelineButtonHeader}
//               onPress={() => setShowTimelineModal(true)}
//             >
//               <Ionicons name="time-outline" size={18} color="#2c5aa0" />
//               <Text style={styles.timelineButtonText}>
//                 View Progress Timeline
//               </Text>
//             </TouchableOpacity>
//           </View>

//           <ScrollView contentContainerStyle={styles.modalScrollContent}>
//             {selectedIdea && ideaDetail && (
//               <>
//                 <View style={styles.cardDetail}>
//                   <Text style={styles.cardHeading}>Employee Information</Text>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Employee Name:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.ideaOwnerName || ideaDetail.ownerName || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Employee Number:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.ideaOwnerEmployeeNo || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Employee Email:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.ideaOwnerEmail || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Department:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.ideaOwnerDepartment ||
//                         ideaDetail.department ||
//                         "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Mobile:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.mobileNumber || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Reporting Manager:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.reportingManagerName || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Manager Email:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.managerEmail || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Employee Location:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.location || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Sub Department:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.ideaOwnerSubDepartment || "N/A"}
//                     </Text>
//                   </View>
//                 </View>

//                 <View style={styles.cardDetail}>
//                   <Text style={styles.cardHeading}>Idea Information</Text>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Idea No:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.ideaNumber || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Solution Category:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.solutionCategory || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Creation Date:</Text>
//                     <Text style={styles.valueDetail}>
//                       {formatDateToDDMMYYYY(ideaDetail.ideaCreationDate || ideaDetail.creationDate)}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>
//                       Planned Duration Date:
//                     </Text>
//                     <Text style={styles.valueDetail}>
//                       {formatDateToDDMMYYYY(ideaDetail.plannedImplementationDuration)}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Status:</Text>
//                     <Text
//                       style={[
//                         styles.statusBadgeDetail,
//                         {
//                           backgroundColor: getStatusColor(
//                             ideaDetail.ideaStatus || ideaDetail.status
//                           ),
//                         },
//                       ]}
//                     >
//                       {ideaDetail.ideaStatus || ideaDetail.status || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Idea Description:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.ideaDescription ||
//                         ideaDetail.description ||
//                         "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Proposed Solution:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.proposedSolution || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>
//                       Process Improvement/Cost Benefit:
//                     </Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.tentativeBenefit || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Team Members:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.teamMembers || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Mobile Number:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.mobileNumber || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Idea Theme:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.ideaTheme || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Type:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.type || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>Before Implementation:</Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.beforeImplementationImagePath || "N/A"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>
//                       BE Team Support Needed:
//                     </Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.isBETeamSupportNeeded ? "Yes" : "No"}
//                     </Text>
//                   </View>
//                   <View style={styles.rowDetail}>
//                     <Text style={styles.labelDetail}>
//                       Can Be Implemented To Other Locations:
//                     </Text>
//                     <Text style={styles.valueDetail}>
//                       {ideaDetail.canBeImplementedToOtherLocation
//                         ? "Yes"
//                         : "No"}
//                     </Text>
//                   </View>
//                 </View>

//                 <View style={styles.cardDetail}>
//                   <Text style={styles.cardHeading}>Remarks</Text>
//                   {(() => {
//                     const remarks = parseRemarks(
//                       ideaDetail.remark || ideaDetail.remarks
//                     );
//                     if (remarks.length === 0) {
//                       return (
//                         <Text style={styles.noRemarksText}>
//                           No remarks available
//                         </Text>
//                       );
//                     }
//                     return remarks.map((remark, index) => (
//                       <RemarksCard
//                         key={index}
//                         title={
//                           remark.approverName || remark.title || "Unknown"
//                         }
//                         comment={
//                           remark.comments || remark.comment || "No comment"
//                         }
//                         date={remark.approvalDate || remark.date ? formatDateTime(remark.approvalDate || remark.date) : ""}
//                       />
//                     ));
//                   })()}
//                 </View>

//                 {ideaDetail.beforeImplementationImagePath && (
//                   <TouchableOpacity
//                     style={styles.imageWrapper}
//                     onPress={() => setShowImage(true)}
//                   >
//                     <Image
//                       source={{
//                         uri: ideaDetail.beforeImplementationImagePath,
//                       }}
//                       style={styles.thumbnail}
//                     />
//                     <Text style={styles.viewImageText}>
//                       Tap to view full image
//                     </Text>
//                   </TouchableOpacity>
//                 )}
//               </>
//             )}
//           </ScrollView>

//           <View style={styles.actionButtonsContainer}>
//             <TouchableOpacity
//               style={styles.approveButton}
//               onPress={handleApprove}
//             >
//               <Ionicons name="checkmark-circle" size={18} color="#fff" />
//               <Text style={styles.actionButtonText}>Approve</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.rejectButton}
//               onPress={handleReject}
//             >
//               <Ionicons name="close-circle" size={18} color="#fff" />
//               <Text style={styles.actionButtonText}>Reject</Text>
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
//                 {ideaDetail?.timeline &&
//                 Array.isArray(ideaDetail.timeline) &&
//                 ideaDetail.timeline.length > 0 ? (
//                   ideaDetail.timeline.map((item, idx) => (
//                     <TimelineItem
//                       key={idx}
//                       status={safeRenderValue(
//                         item.status ||
//                           item.approvalStage ||
//                           item.approvalstage ||
//                           "N/A"
//                       )}
//                       date={item.date || item.approvalDate}
//                       description={safeRenderValue(
//                         item.description || item.comments
//                       )}
//                       isLast={idx === ideaDetail.timeline.length - 1}
//                     />
//                   ))
//                 ) : (
//                   <View style={styles.noTimelineContainer}>
//                     <Ionicons name="time-outline" size={48} color="#ccc" />
//                     <Text style={styles.noTimelineText}>
//                       No timeline data available
//                     </Text>
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
// };

// export default HoldScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f5f5f5" },
//   header: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', elevation: 2 },
//   headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
//   filterButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#e8e8e8', borderRadius: 4 },
//   filterButtonText: { fontSize: 11, color: '#000', marginRight: 6, fontWeight: '600' },
//   searchSection: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
//   searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 },
//   searchLabel: { fontSize: 16, color: '#333', marginRight: 8, fontWeight: '500' },
//   searchInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, backgroundColor: '#fff' },
//   filtersContainer: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
//   filterLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' },
//   datePickerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10, gap: 10 },
//   dateInputContainer: { flex: 1 },
//   dateLabel: { fontSize: 12, fontWeight: "600", color: "#333", marginBottom: 5 },
//   datePickerInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, backgroundColor: '#f9f9f9', justifyContent: 'center' },
//   datePickerText: { fontSize: 14, color: '#333' },
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
//   label: { color: '#555', fontWeight: '500', fontSize: 14 },
//   value: { color: '#333', fontSize: 14, maxWidth: '65%', textAlign: 'right' },
//   descriptionRow: { marginTop: 6, marginBottom: 6 },
//   description: { color: '#333', fontSize: 14, marginTop: 4 },
//   statusBadgeContainer: { flexDirection: 'row', alignItems: 'center', maxWidth: '65%', justifyContent: 'flex-end' },
//   statusBadge: { color: "#fff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 11, fontWeight: '600', textAlign: "center", overflow: "hidden" },
//   totalContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginTop: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0' },
//   totalText: { fontSize: 16, fontWeight: 'bold', color: '#2c5aa0' },
//   noDataText: { textAlign: "center", marginTop: 20, color: "#777", fontSize: 16 },
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
//   rowDetail: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' },
//   labelDetail: { fontWeight: "600", color: "#555", width: "45%", fontSize: 14 },
//   valueDetail: { color: "#222", width: "50%", textAlign: "right", fontSize: 14 },
//   statusBadgeDetail: { color: "#fff", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, fontSize: 11, fontWeight: '600', textAlign: "center", alignSelf: 'flex-start' },
//   remarkCard: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#2c5aa0' },
//   remarkTitle: { fontSize: 15, fontWeight: 'bold', color: '#2c5aa0', marginBottom: 6 },
//   remarkComment: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 6 },
//   remarkDate: { fontSize: 12, color: '#999', fontStyle: 'italic' },
//   noRemarksText: { textAlign: 'center', color: '#999', fontSize: 14, fontStyle: 'italic', paddingVertical: 10 },
//   timelineModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c5aa0', paddingHorizontal: 10, paddingVertical: 12, paddingTop: 25, elevation: 4 },
//   timelineModalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
//   closeButtonTimeline: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18, width: 32, height: 32, justifyContent: "center", alignItems: "center" },
//   timelineCardContainer: { backgroundColor: "#fff", padding: 16, borderRadius: 10, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2 },
//   timelineContainer: { paddingLeft: 4, paddingTop: 4 },
//   timelineItem: { flexDirection: "row", marginBottom: 20 },
//   timelineLeft: { alignItems: "center", marginRight: 15, width: 20 },
//   timelineCircle: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: "#fff", elevation: 2 },
//   timelineLine: { width: 3, backgroundColor: "#E0E0E0", flex: 1, marginTop: 4 },
//   timelineContent: { flex: 1, paddingBottom: 5 },
//   timelineStatus: { fontSize: 15, fontWeight: "bold", color: "#333", marginBottom: 4 },
//   timelineDescription: { fontSize: 13, color: "#666", marginBottom: 6, lineHeight: 18 },
//   timelineDate: { fontSize: 12, color: "#999", fontStyle: "italic" },
//   noTimelineContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
//   noTimelineText: { color: "#999", textAlign: "center", marginTop: 10, fontSize: 15, fontStyle: 'italic' },
//   imageWrapper: { alignItems: "center", backgroundColor: '#fff', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2, marginBottom: 12 },
//   thumbnail: { width: 150, height: 150, borderRadius: 8 },
//   viewImageText: { marginTop: 8, color: '#2c5aa0', fontSize: 14, fontWeight: '500' },
//   imageModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
//   closeButtonImage: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 22, width: 44, height: 44, justifyContent: "center", alignItems: "center" },
//   fullImage: { width: "80%", height: "60%" },
//   actionButtonsContainer: { flexDirection: "row", backgroundColor: '#fff', paddingHorizontal: 22, paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#e0e0e0', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, gap: 10 },
//   approveButton: { flex: 1, backgroundColor: "#4CAF50", paddingVertical: 14, borderRadius: 8, alignItems: "center", elevation: 2, flexDirection: 'row', justifyContent: 'center', gap: 6 },
//   rejectButton: { flex: 1, backgroundColor: "#F44336", paddingVertical: 14, borderRadius: 8, alignItems: "center", elevation: 2, flexDirection: 'row', justifyContent: 'center', gap: 6 },
//   actionButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold", textTransform: 'uppercase' },
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

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { HOLD_BY_ME_URL, IDEA_DETAIL_URL, UPDATE_STATUS_URL } from "../src/context/api";

const formatDateToDDMMYYYY = (dateString) => {
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
    const s = status?.toLowerCase() || '';
    if (s.includes('created')) return "#2196F3";
    if (s.includes('edited')) return "#9C27B0";
    if (s.includes('approved')) return "#4CAF50";
    if (s.includes('pending')) return "#FF9800";
    if (s.includes('implementation')) return "#9C27B0";
    if (s.includes('rejected')) return "#F44336";
    if (s.includes('hold')) return "#FFC107";
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
  if (!status) return "#9E9E9E";
  const s = status.toLowerCase();
  if (s === "draft") return "#2196F3";
  if (s.includes("publish")) return "#4CAF50";
  if (s === "pending") return "#FF9800";
  if (s === "approved" || s === "closed") return "#607D8B";
  if (s === "rejected") return "#F44336";
  if (s === "hold" || s === "on hold") return "#FFC107";
  return "#9E9E9E";
};

const HoldScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ideaDetail, setIdeaDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remarkType, setRemarkType] = useState("");
  const [remarkText, setRemarkText] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const fetchHoldIdeas = async (from, to) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      let url = HOLD_BY_ME_URL;
      const params = [];
      if (from) params.push(`fromDate=${from}`);
      if (to) params.push(`toDate=${to}`);
      if (params.length > 0) url += `?${params.join('&')}`;
      const response = await axios.get(url, { headers });
      const items = response.data?.data?.items || [];
      let filteredByDate = items;
      if (from || to) {
        const fromTime = from ? new Date(from).getTime() : null;
        const toTime = to ? new Date(to).getTime() : null;
        filteredByDate = items.filter(item => {
          if (!item.createdOn) return false;
          const createdTime = new Date(item.createdOn).getTime();
          if (fromTime !== null && createdTime < fromTime) return false;
          if (toTime !== null && createdTime > toTime) return false;
          return true;
        });
      }
      setIdeas(filteredByDate);
      setTotalItems(filteredByDate.length);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to load hold ideas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHoldIdeas(); }, []);

  const filteredIdeas = Array.isArray(ideas) ? ideas.filter(idea => {
    const searchLower = searchText.trim().toLowerCase();
    return searchLower === '' || (idea.ideaNumber && idea.ideaNumber.toLowerCase().includes(searchLower)) || (idea.itemNumber && idea.itemNumber.toLowerCase().includes(searchLower)) || (idea.ownerName && idea.ownerName.toLowerCase().includes(searchLower)) || (idea.description && idea.description.toLowerCase().includes(searchLower));
  }) : [];

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
      Alert.alert("Error", "Failed to fetch idea details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const applyFilters = () => {
    let from = fromDate ? fromDate.toISOString().split('T')[0] : null;
    let to = toDate ? toDate.toISOString().split('T')[0] : null;
    fetchHoldIdeas(from, to);
    setShowFilters(false);
  };

  const resetFilters = () => { setFromDate(null); setToDate(null); fetchHoldIdeas(); };

  const openRemarkModal = (type) => { setRemarkType(type); setRemarkText(""); setShowRemarkModal(true); };
  const closeRemarkModal = () => { setShowRemarkModal(false); setRemarkType(""); setRemarkText(""); };

  const submitStatusUpdate = async () => {
    if (!remarkText.trim()) { Alert.alert("Required", "Please enter a remark before submitting."); return; }
    const originalIdea = ideas.find(i => i.ideaId === (ideaDetail?.ideaId || ideaDetail?.id) || i.id === (ideaDetail?.ideaId || ideaDetail?.id));
    if (!originalIdea?.id && !ideaDetail?.id) { Alert.alert("Error", "Unable to find idea record."); return; }
    setSubmittingStatus(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      const statusMap = { approve: "Approved", reject: "Rejected" };
      const payload = { id: originalIdea?.id, ideaId: originalIdea?.ideaId || ideaDetail.id, status: statusMap[remarkType], remarks: remarkText.trim(), approvalStage: originalIdea?.approvalStage || ideaDetail?.approvalStage || "Manager" };
      const response = await axios.post(UPDATE_STATUS_URL, payload, { headers: { ...authHeaders, 'Content-Type': 'application/json' } });
      if (response.data && (response.data.success === true || response.status === 200)) {
        Alert.alert("Success", response.data.message || `Idea ${remarkType}d successfully!`, [{ text: "OK", onPress: () => { closeRemarkModal(); setSelectedIdea(null); setIdeaDetail(null); fetchHoldIdeas(); } }]);
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update.");
    } finally {
      setSubmittingStatus(false);
    }
  };

  const parseRemarks = (remarkData) => {
    if (!remarkData) return [];
    if (Array.isArray(remarkData)) return remarkData;
    if (typeof remarkData === "object") {
      const keys = Object.keys(remarkData);
      if (keys.length > 0 && keys.every((k) => !isNaN(k))) return Object.values(remarkData);
      return [remarkData];
    }
    return [];
  };

  const safeRenderValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const renderIdeaCard = ({ item }) => (
    <TouchableOpacity activeOpacity={0.8} style={styles.cardContainer} onPress={() => fetchIdeaDetail(item.ideaId || item.id || item.ideaNumber)}>
      <View style={styles.cardHeader}>
        <Text style={styles.ideaNumber} numberOfLines={2}>{item.itemNumber || item.ideaNumber || "N/A"}</Text>
        <View style={styles.typeTag}><Text style={styles.typeText}>{item.type || "On Hold"}</Text></View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.row}><Text style={styles.label}>Description:</Text><Text style={styles.value} numberOfLines={2}>{item.description || "N/A"}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Owner:</Text><Text style={styles.value}>{item.ownerName || "N/A"}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Created:</Text><Text style={styles.value}>{formatDateToDDMMYYYY(item.createdOn || item.creationDate)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Status:</Text><Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>{item.status || "On Hold"}</Text></View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hold Ideas</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterButtonText}>{showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}</Text>
          <Text style={styles.filterArrow}>{showFilters ? "▲" : "▼"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Search:</Text>
          <TextInput placeholder="Idea Number / Owner / Description" style={styles.searchInput} value={searchText} onChangeText={setSearchText} placeholderTextColor="#999" />
        </View>
      </View>
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Create Date Range</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromPicker(true)}><Text style={styles.dateInputText}>{fromDate ? fromDate.toLocaleDateString() : "Select From Date"}</Text></TouchableOpacity>
          {showFromPicker && <DateTimePicker value={fromDate || new Date()} mode="date" display="default" onChange={(e, date) => { setShowFromPicker(false); if (date) { setFromDate(date); if (toDate && date > toDate) { setToDate(null) } } }} maximumDate={toDate || undefined} />}
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowToPicker(true)}><Text style={styles.dateInputText}>{toDate ? toDate.toLocaleDateString() : "Select To Date"}</Text></TouchableOpacity>
          {showToPicker && <DateTimePicker value={toDate || (fromDate || new Date())} mode="date" display="default" onChange={(e, date) => { setShowToPicker(false); if (date) { setToDate(date) } }} minimumDate={fromDate || undefined} />}
          <View style={styles.filterButtons}>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}><Text style={styles.btnText}>Apply</Text></TouchableOpacity>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}><Text style={styles.btnText}>Reset</Text></TouchableOpacity>
          </View>
        </View>
      )}
      {loading ? (<ActivityIndicator size="large" color="#2c5aa0" style={{ marginTop: 20 }} />) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filteredIdeas.length === 0 ? (<Text style={styles.noDataText}>No ideas found.</Text>) : (
            <>{filteredIdeas.map((idea, index) => (<View key={index}>{renderIdeaCard({ item: idea })}</View>))}<View style={styles.totalContainer}><Text style={styles.totalText}>Total Ideas: {totalItems}</Text></View></>
          )}
        </ScrollView>
      )}
      {loadingDetail && <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#2c5aa0" /></View>}
      <Modal visible={!!selectedIdea} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalHeaderTitle}>Idea Details</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => { setSelectedIdea(null); setIdeaDetail(null); }}><Ionicons name="close" size={20} color="#666" /></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.timelineButtonHeader} onPress={() => setShowTimelineModal(true)}><Ionicons name="time-outline" size={18} color="#2c5aa0" /><Text style={styles.timelineButtonText}>View Progress Timeline</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            {selectedIdea && ideaDetail && (
              <>
                <View style={styles.cardDetail}>
                  <Text style={styles.cardHeading}>Employee Information</Text>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Employee Name:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaOwnerName || ideaDetail.ownerName || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Employee Number:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaOwnerEmployeeNo || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Employee Email:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaOwnerEmail || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Department:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaOwnerDepartment || ideaDetail.department || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Mobile:</Text><Text style={styles.valueDetail}>{ideaDetail.mobileNumber || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Reporting Manager:</Text><Text style={styles.valueDetail}>{ideaDetail.reportingManagerName || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Manager Email:</Text><Text style={styles.valueDetail}>{ideaDetail.managerEmail || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Employee Location:</Text><Text style={styles.valueDetail}>{ideaDetail.location || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Sub Department:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaOwnerSubDepartment || "N/A"}</Text></View>
                </View>
                <View style={styles.cardDetail}>
                  <Text style={styles.cardHeading}>Idea Information</Text>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Idea No:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaNumber || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Solution Category:</Text><Text style={styles.valueDetail}>{ideaDetail.solutionCategory || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Creation Date:</Text><Text style={styles.valueDetail}>{formatDateToDDMMYYYY(ideaDetail.ideaCreationDate || ideaDetail.creationDate)}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Planned Completion:</Text><Text style={styles.valueDetail}>{formatDateToDDMMYYYY(ideaDetail.plannedImplementationDuration)}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Status:</Text><Text style={[styles.statusBadgeDetail, { backgroundColor: getStatusColor(ideaDetail.ideaStatus || ideaDetail.status) }]}>{ideaDetail.ideaStatus || ideaDetail.status || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Idea Description:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaDescription || ideaDetail.description || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Proposed Solution:</Text><Text style={styles.valueDetail}>{ideaDetail.proposedSolution || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Process Improvement/Cost Benefit:</Text><Text style={styles.valueDetail}>{ideaDetail.tentativeBenefit || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Team Members:</Text><Text style={styles.valueDetail}>{ideaDetail.teamMembers || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Mobile Number:</Text><Text style={styles.valueDetail}>{ideaDetail.mobileNumber || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Idea Theme:</Text><Text style={styles.valueDetail}>{ideaDetail.ideaTheme || "N/A"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>IsBETeamSupportNeeded:</Text><Text style={styles.valueDetail}>{ideaDetail.isBETeamSupportNeeded ? "Yes" : "No"}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>CanBeImplementedToOtherLocations:</Text><Text style={styles.valueDetail}>{ideaDetail.canBeImplementedToOtherLocation ? "Yes" : "No"}</Text></View>
                </View>
                <View style={styles.cardDetail}>
                  <Text style={styles.cardHeading}>Remarks</Text>
                  {(() => {
                    const remarks = parseRemarks(ideaDetail.remark || ideaDetail.remarks);
                    if (remarks.length === 0) return <Text style={styles.noRemarksText}>No remarks available</Text>;
                    return remarks.map((remark, index) => (<RemarksCard key={index} title={remark.approverName || remark.title || "Unknown"} comment={remark.comments || remark.comment || "No comment"} date={remark.approvalDate || remark.date ? formatDateTime(remark.approvalDate || remark.date) : ""} />));
                  })()}
                </View>
                {ideaDetail.beforeImplementationImagePath && (
                  <TouchableOpacity style={styles.imageWrapper} onPress={() => setShowImage(true)}><Image source={{ uri: ideaDetail.beforeImplementationImagePath }} style={styles.thumbnail} /><Text style={styles.viewImageText}>Tap to view full image</Text></TouchableOpacity>
                )}
              </>
            )}
          </ScrollView>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.approveButton} onPress={() => openRemarkModal("approve")}><Ionicons name="checkmark-circle" size={18} color="#fff" /><Text style={styles.actionButtonText}>Approve</Text></TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton} onPress={() => openRemarkModal("reject")}><Ionicons name="close-circle" size={18} color="#fff" /><Text style={styles.actionButtonText}>Reject</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showRemarkModal} transparent animationType="fade">
        <View style={styles.remarkModalOverlay}>
          <View style={styles.remarkModalContainer}>
            <View style={styles.remarkModalHeader}>
              <Text style={styles.remarkModalTitle}>{remarkType === "approve" ? "Enter Remark for Approved" : "Enter Remark for Rejected"}</Text>
              <TouchableOpacity style={styles.remarkCloseButton} onPress={closeRemarkModal}><Ionicons name="close" size={20} color="#fff" /></TouchableOpacity>
            </View>
            <View style={styles.remarkModalBody}>
              <Text style={styles.remarkLabel}>Remark *</Text>
              <TextInput style={styles.remarkTextArea} placeholder="Enter your remark here..." placeholderTextColor="#999" multiline numberOfLines={6} textAlignVertical="top" value={remarkText} onChangeText={setRemarkText} />
            </View>
            <View style={styles.remarkModalFooter}>
              <TouchableOpacity style={styles.remarkCancelButton} onPress={closeRemarkModal} disabled={submittingStatus}><Text style={styles.remarkCancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.remarkSubmitButton} onPress={submitStatusUpdate} disabled={submittingStatus}>{submittingStatus ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.remarkSubmitText}>Submit</Text>}</TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={showTimelineModal} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.timelineModalHeader}>
            <Text style={styles.timelineModalTitle}>Progress Timeline</Text>
            <TouchableOpacity style={styles.closeButtonTimeline} onPress={() => setShowTimelineModal(false)}><Ionicons name="close" size={20} color="#fff" /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.timelineCardContainer}>
              <View style={styles.timelineContainer}>
                {ideaDetail?.timeline && Array.isArray(ideaDetail.timeline) && ideaDetail.timeline.length > 0 ? (
                  ideaDetail.timeline.map((item, idx) => (<TimelineItem key={idx} status={safeRenderValue(item.status || item.approvalStage || item.approvalstage || "N/A")} date={item.date || item.approvalDate} description={safeRenderValue(item.description || item.comments)} isLast={idx === ideaDetail.timeline.length - 1} />))
                ) : (
                  <View style={styles.noTimelineContainer}><Ionicons name="time-outline" size={48} color="#ccc" /><Text style={styles.noTimelineText}>No timeline data available</Text></View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
      <Modal visible={showImage} transparent animationType="fade">
        <View style={styles.imageModal}>
          <TouchableOpacity style={styles.closeButtonImage} onPress={() => setShowImage(false)}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          <Image source={{ uri: ideaDetail?.beforeImplementationImagePath }} style={styles.fullImage} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
};

export default HoldScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
  label: { color: '#555', fontWeight: '500', fontSize: 14 },
  value: { color: '#333', fontSize: 14, maxWidth: '65%', textAlign: 'right' },
    descriptionRow: { marginTop: 6, marginBottom: 6 },
    description: { color: '#333', fontSize: 14, marginTop: 4 },
    statusBadgeContainer: { flexDirection: 'row', alignItems: 'center', maxWidth: '65%', justifyContent: 'flex-end' },
    statusBadge: { color: "#fff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 11, fontWeight: '600', textAlign: "center", overflow: "hidden" },
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
    modalScrollContent: { padding: 16, paddingBottom: 90 },
    cardDetail: { backgroundColor: "#fff", padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2 },
    cardHeading: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#2c5aa0" },
    rowDetail: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' },
    labelDetail: { fontWeight: "600", color: "#555", width: "45%", fontSize: 14 },
    valueDetail: { color: "#222", width: "50%", textAlign: "right", fontSize: 14 },
    statusBadgeDetail: { color: "#fff", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, fontSize: 11, fontWeight: '600', textAlign: "center", alignSelf: 'flex-start' },
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
    imageWrapper: { alignItems: "center", backgroundColor: '#fff', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2, marginBottom: 12 },
    thumbnail: { width: 150, height: 150, borderRadius: 8 },
    viewImageText: { marginTop: 8, color: '#2c5aa0', fontSize: 14, fontWeight: '500' },
    imageModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
    closeButtonImage: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 22, width: 44, height: 44, justifyContent: "center", alignItems: "center" },
    fullImage: { width: "80%", height: "60%" },
    actionButtonsContainer: { flexDirection: "row", backgroundColor: '#fff', paddingHorizontal: 22, paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#e0e0e0', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, gap: 10 },
    approveButton: { flex: 1, backgroundColor: "#4CAF50", paddingVertical: 14, borderRadius: 8, alignItems: "center", elevation: 2, flexDirection: 'row', justifyContent: 'center', gap: 6 },
    rejectButton: { flex: 1, backgroundColor: "#F44336", paddingVertical: 14, borderRadius: 8, alignItems: "center", elevation: 2, flexDirection: 'row', justifyContent: 'center', gap: 6 },
    actionButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold", textTransform: 'uppercase' },
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
    remarkSubmitText: { color: '#fff', fontSize: 14, fontWeight: '600' }
  });