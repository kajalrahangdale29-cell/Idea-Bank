// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   SafeAreaView,
//   Alert,
//   Modal,
//   Image,
//   ActivityIndicator,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { REJECTED_BY_ME_URL } from '../src/context/api'; 

// function TimelineItem({ status, date, current }) {
//   const getCircleColor = (status) => {
//     if (status === "Created") return "#4CAF50";
//     if (status === "Rejected") return "#2196F3";
//     return "#ccc";
//   };

//   return (
//     <View style={{ flexDirection: "row", marginVertical: 8, alignItems: "flex-start" }}>
//       <View style={{
//         width: 16,
//         height: 16,
//         borderRadius: 8,
//         backgroundColor: getCircleColor(status),
//         marginRight: 10,
//         marginTop: 2
//       }} />
//       <View>
//         <Text style={{
//           fontWeight: (status === "Created" || status === "Approved") ? "bold" : "normal",
//           fontSize: 14
//         }}>
//           {status}
//         </Text>
//         <Text style={{ color: "#000080", fontSize: 12 }}>
//           {(status === "Created" || status === "Approved") && date ? new Date(date).toLocaleDateString() : ""}
//         </Text>
//       </View>
//     </View>
//   );
// }

// const RejectedScreen = () => {
//   const [searchText, setSearchText] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedIdea, setSelectedIdea] = useState(null);
//   const [showImage, setShowImage] = useState(false);
//   const [loadingDetail, setLoadingDetail] = useState(false);
//   const [ideaDetail, setIdeaDetail] = useState(null);

//   const [ideas, setIdeas] = useState([]);
//   const [loadingList, setLoadingList] = useState(false);
//   const [errorList, setErrorList] = useState(null);
//   const [token, setToken] = useState(null);

//   // Date range filter states
//   const [fromDate, setFromDate] = useState(null);
//   const [toDate, setToDate] = useState(null);
//   const [showFromPicker, setShowFromPicker] = useState(false);
//   const [showToPicker, setShowToPicker] = useState(false);

//   const loadToken = async () => {
//     try {
//       const tok = await AsyncStorage.getItem('userToken');  
//       if (tok) {
//         setToken(tok);
//       }
//     } catch (e) {
//       console.error("Error reading token from storage", e);
//     }
//   };

//   const fetchRejectedIdeas = async (from, to) => {
//     if (!token) {
//       console.log("Token not available yet");
//       return; 
//     }
//     try {
//       setLoadingList(true);
//       setErrorList(null);
//       let url = REJECTED_BY_ME_URL;
//       const params = [];
//       if (from) {
//         params.push(`fromDate=${from}`);
//       }
//       if (to) {
//         params.push(`toDate=${to}`);
//       }
//       if (params.length > 0) {
//         url += `?${params.join('&')}`;
//       }
//       console.log("Calling API:", url);
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json',
//           'Content-Type': 'application/json',
//         },
//       });
//       console.log("API response status:", response.status);
//       if (!response.ok) {
//         throw new Error(`API call failed: ${response.status}`);
//       }
//       const data = await response.json();
//       console.log("API response body:", data);

//       const ideaList = data.items || data.ideas || data;
//       setIdeas(ideaList);
//     } catch (err) {
//       console.error("Error fetching rejected ideas:", err);
//       setErrorList(err.message);
//     } finally {
//       setLoadingList(false);
//     }
//   };

//   useEffect(() => {
//     loadToken();
//   }, []);

//   useEffect(() => {
//     if (token) {
//       fetchRejectedIdeas();
//     }
//   }, [token]);

//   const filteredIdeas = ideas.filter(idea =>
//     (idea.ideaNumber || '').toLowerCase().includes(searchText.toLowerCase()) ||
//     (idea.ownerName || '').toLowerCase().includes(searchText.toLowerCase()) ||
//     (idea.description || '').toLowerCase().includes(searchText.toLowerCase())
//   );

//   const fetchIdeaDetail = async (ideaId) => {
   
//   };

  
//   const applyFilters = () => {
//     let from = null;
//     let to = null;
//     if (fromDate) {
//       from = fromDate.toISOString().split('T')[0];
//     }
//     if (toDate) {
//       to = toDate.toISOString().split('T')[0];
//     }
//     fetchRejectedIdeas(from, to);
//     setShowFilters(false);
//   };

//   const resetFilters = () => {
//     setFromDate(null);
//     setToDate(null);
//     fetchRejectedIdeas();
//   };

//   const renderIdeaCard = ({ item }) => (
//     <TouchableOpacity
//       activeOpacity={0.8}
//       style={styles.cardContainer}
//       onPress={() => fetchIdeaDetail(item.id || item.ideaNumber)}
//     >
//       <View style={styles.cardHeader}>
//         <Text style={styles.ideaNumber} numberOfLines={2}>{item.ideaNumber}</Text>
//         <View style={styles.typeTag}>
//           <Text style={styles.typeText}>{item.type || "N/A"}</Text>
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
//           <Text style={styles.description} numberOfLines={3}>{item.description || "N/A"}</Text>
//         </View>
        
//         <View style={styles.dateRow}>
//           <View style={styles.dateColumn}>
//             <Text style={styles.label}>Rejected:</Text>
//             <Text style={styles.dateText}>{item.rejectedOn || "N/A"}</Text>
//           </View>
//           <View style={styles.dateColumn}>
//             <Text style={styles.label}>Created:</Text>
//             <Text style={styles.dateText}>{item.createdOn || "N/A"}</Text>
//           </View>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Rejected Ideas</Text>
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
//           <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromPicker(true)}>
//             <Text style={styles.dateText}>
//               {fromDate ? fromDate.toLocaleDateString() : "Select From Date"}
//             </Text>
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
//                     setToDate(null);
//                   }
//                 }
//               }}
//               maximumDate={toDate || undefined}
//             />
//           )}

//           {/* To Date */}
//           <TouchableOpacity style={styles.dateInput} onPress={() => setShowToPicker(true)}>
//             <Text style={styles.dateText}>
//               {toDate ? toDate.toLocaleDateString() : "Select To Date"}
//             </Text>
//           </TouchableOpacity>
//           {showToPicker && (
//             <DateTimePicker
//               value={toDate || (fromDate || new Date())}
//               mode="date"
//               display="default"
//               onChange={(e, date) => {
//                 setShowToPicker(false);
//                 if (date) {
//                   setToDate(date);
//                 }
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

//       {/* Search Section */}
//       <View style={styles.searchSection}>
//         <View style={styles.searchContainer}>
//           <Text style={styles.searchLabel}>Search:</Text>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Idea Number"
//             value={searchText}
//             onChangeText={setSearchText}
//             placeholderTextColor="#999"
//           />
//         </View>
//       </View>

//       {/* Ideas List */}
//       { loadingList ? (
//         <View style={{ flex:1, justifyContent: 'center', alignItems: 'center' }}>
//           <ActivityIndicator size="large" color="#0000ff" />
//         </View>
//       ) : errorList ? (
//         <View style={{ padding: 20, alignItems: 'center' }}>
//           <Text style={{ color: 'red' }}>Error: {errorList}</Text>
//           <TouchableOpacity onPress={() => fetchRejectedIdeas(fromDate?.toISOString().split('T')[0], toDate?.toISOString().split('T')[0])} style={{ marginTop: 10 }}>
//             <Text style={{ color: 'blue' }}>Try Again</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <FlatList
//           data={filteredIdeas}
//           renderItem={renderIdeaCard}
//           keyExtractor={(item) => (item.id || item.ideaNumber).toString()}
//           style={styles.list}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.listContent}
//         />
//       )}

//       {/* Optionally modal and image parts if present */}

//     </SafeAreaView>
//   );
// };

// export default RejectedScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     backgroundColor: '#fff',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   filterButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 4,
//   },
//   filterButtonText: {
//     fontSize: 12,
//     color: '#666',
//     marginRight: 4,
//     fontWeight: '500',
//   },

//   // New filter panel styles (same as previous)
//   filterPanel: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
//   filterLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' },
//   dateInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, marginBottom: 10, backgroundColor: '#f9f9f9' },
//   dateText: { fontSize: 14, color: '#333' },
//   filterButtons: { flexDirection: 'row', marginTop: 12 },
//   applyBtn: { flex: 1, backgroundColor: '#004b6f', padding: 12, borderRadius: 6, alignItems: 'center', marginRight: 8 },
//   resetBtn: { flex: 1, backgroundColor: '#777', padding: 12, borderRadius: 6, alignItems: 'center' },
//   btnText: { color: '#fff', fontWeight: '600' },

//   searchSection: {
//     backgroundColor: '#fff',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   searchContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   searchLabel: {
//     fontSize: 16,
//     color: '#333',
//     marginRight: 8,
//     fontWeight: '500',
//   },
//   searchInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 4,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     fontSize: 14,
//     backgroundColor: '#fff',
//   },
//   list: {
//     flex: 1,
//   },
//   listContent: {
//     padding: 16,
//   },
//   cardContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardHeader: {
//     backgroundColor: '#2c5aa0',
//     padding: 12,
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   ideaNumber: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: 'bold',
//     flex: 1,
//     marginRight: 8,
//   },
//   typeTag: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   typeText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   cardContent: {
//     padding: 12,
//   },
//   row: {
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   descriptionRow: {
//     marginBottom: 12,
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#333',
//     width: 80,
//     marginRight: 8,
//   },
//   value: {
//     fontSize: 13,
//     color: '#666',
//     flex: 1,
//   },
//   description: {
//     fontSize: 13,
//     color: '#666',
//     marginTop: 4,
//     lineHeight: 18,
//   },
//   dateRow: {
//     flexDirection: 'row',
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//     paddingTop: 12,
//   },
//   dateColumn: {
//     flex: 1,
//   },
//   dateText: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//   },
// });


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REJECTED_BY_ME_URL } from '../src/context/api'; 

const RejectedScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [ideas, setIdeas] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState(null);
  const [token, setToken] = useState(null);

  // Date range filter states
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const loadToken = async () => {
    try {
      const tok = await AsyncStorage.getItem('userToken');  
      if (tok) {
        setToken(tok);
      }
    } catch (e) {
      console.error("Error reading token from storage", e);
    }
  };

  const fetchRejectedIdeas = async (from, to) => {
    if (!token) return; 
    try {
      setLoadingList(true);
      setErrorList(null);
      let url = REJECTED_BY_ME_URL;

      const params = [];
      if (from) params.push(`fromDate=${from}`);
      if (to) params.push(`toDate=${to}`);

      if (params.length > 0) url += `?${params.join('&')}`;

      console.log("Calling API:", url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response body:", data);

      const ideaList = data.items || data.ideas || data;
      setIdeas(ideaList);
    } catch (err) {
      console.error("Error fetching rejected ideas:", err);
      setErrorList(err.message);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchRejectedIdeas();
    }
  }, [token]);

  const filteredIdeas = ideas.filter(idea =>
    (idea.ideaNumber || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (idea.ownerName || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (idea.description || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const applyFilters = () => {
    const from = fromDate ? fromDate.toISOString().split('T')[0] : null;
    const to = toDate ? toDate.toISOString().split('T')[0] : null;
    fetchRejectedIdeas(from, to);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFromDate(null);
    setToDate(null);
    fetchRejectedIdeas();
    setShowFilters(false);
  };

  const renderIdeaCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.cardContainer}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.ideaNumber} numberOfLines={2}>{item.ideaNumber}</Text>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{item.type || "N/A"}</Text>
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
          <Text style={styles.description} numberOfLines={3}>{item.description || "N/A"}</Text>
        </View>
        
        <View style={styles.dateRow}>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>Rejected:</Text>
            <Text style={styles.dateText}>{item.rejectedOn || "N/A"}</Text>
          </View>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.dateText}>{item.createdOn || "N/A"}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rejected Ideas</Text>
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

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Create Date Range</Text>

          {/* From Date */}
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromPicker(true)}>
            <Text style={styles.dateText}>
              {fromDate ? fromDate.toLocaleDateString() : "Select From Date"}
            </Text>
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
                    setToDate(null);
                  }
                }
              }}
              maximumDate={toDate || undefined}
            />
          )}

          {/* To Date */}
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowToPicker(true)}>
            <Text style={styles.dateText}>
              {toDate ? toDate.toLocaleDateString() : "Select To Date"}
            </Text>
          </TouchableOpacity>
          {showToPicker && (
            <DateTimePicker
              value={toDate || (fromDate || new Date())}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setShowToPicker(false);
                if (date) {
                  setToDate(date);
                }
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

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Search:</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Idea Number"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Ideas List */}
      { loadingList ? (
        <View style={{ flex:1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : errorList ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: 'red' }}>Error: {errorList}</Text>
          <TouchableOpacity onPress={() => fetchRejectedIdeas()} style={{ marginTop: 10 }}>
            <Text style={{ color: 'blue' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredIdeas}
          renderItem={renderIdeaCard}
          keyExtractor={(item) => (item.id || item.ideaNumber).toString()}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

export default RejectedScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  filterButtonText: { fontSize: 12, color: '#666', marginRight: 4, fontWeight: '500' },
  filterPanel: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  filterLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' },
  dateInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, marginBottom: 10, backgroundColor: '#f9f9f9' },
  dateText: { fontSize: 14, color: '#333' },
  filterButtons: { flexDirection: 'row', marginTop: 12 },
  applyBtn: { flex: 1, backgroundColor: '#004b6f', padding: 12, borderRadius: 6, alignItems: 'center', marginRight: 8 },
  resetBtn: { flex: 1, backgroundColor: '#777', padding: 12, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  searchSection: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  searchLabel: { fontSize: 16, color: '#333', marginRight: 8, fontWeight: '500' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, backgroundColor: '#fff' },
  list: { flex: 1 },
  listContent: { padding: 16 },
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
    alignItems: 'flex-start',
  },
  ideaNumber: { color: '#fff', fontSize: 14, fontWeight: 'bold', flex: 1, marginRight: 8 },
  typeTag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  typeText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  cardContent: { padding: 12 },
  row: { flexDirection: 'row', marginBottom: 8 },
  descriptionRow: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', width: 80, marginRight: 8 },
  value: { fontSize: 13, color: '#666', flex: 1 },
  description: { fontSize: 13, color: '#666', marginTop: 4, lineHeight: 18 },
  dateRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  dateColumn: { flex: 1 },
  dateText: { fontSize: 12, color: '#666', marginTop: 2 },
});
