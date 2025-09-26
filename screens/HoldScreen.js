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
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { HOLD_BY_ME_URL } from "../src/context/api";

// const HoldScreen = () => {
//   const [searchText, setSearchText] = useState("");
//   const [ideas, setIdeas] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [token, setToken] = useState(null);

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
//       const items = data?.data?.items || data.items || data.ideas || [];
//       setIdeas(items);
//     } catch (error) {
//       console.error("Fetch hold error:", error);
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
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

//   const renderIdeaCard = ({ item }) => (
//     <TouchableOpacity style={styles.cardContainer}>
//       <View style={styles.cardHeader}>
//         <Text style={styles.ideaNumber}>{item.ideaNumber || "–"}</Text>
//         <View style={styles.typeTag}>
//           <Text style={styles.typeText}>On Hold</Text>
//         </View>
//       </View>
//       <View style={styles.cardContent}>
//         <View style={styles.row}>
//           <Text style={styles.label}>Owner:</Text>
//           <Text style={styles.value}>{item.ownerName || "N/A"}</Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Location:</Text>
//           <Text style={styles.value}>
//             {item.location || item.department || "N/A"}
//           </Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.label}>Description:</Text>
//           <Text numberOfLines={3} style={styles.description}>
//             {item.description || "N/A"}
//           </Text>
//         </View>
//         <View style={styles.dateRow}>
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
//         <Text style={styles.headerTitle}>Hold Ideas</Text>
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
//                   if (toDate && date > toDate) {
//                     setToDate(null);
//                   }
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

//       {/* Search */}
//       <View style={styles.searchSection}>
//         <Text style={styles.searchLabel}>Search:</Text>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Idea Number"
//           value={searchText}
//           onChangeText={setSearchText}
//           placeholderTextColor="#999"
//         />
//       </View>

//       {/* Idea List */}
//       {loading ? (
//         <View style={styles.loadingWrapper}>
//           <ActivityIndicator size="large" color="#0000ff" />
//         </View>
//       ) : (
//         <FlatList
//           data={filtered}
//           renderItem={renderIdeaCard}
//           keyExtractor={(item, idx) =>
//             (item.id?.toString() || idx.toString())
//           }
//           contentContainerStyle={{ padding: 16 }}
//           showsVerticalScrollIndicator={false}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default HoldScreen;

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
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#333",
//   },
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
//   dateText: {
//     fontSize: 14,
//     color: "#333",
//   },
//   filterButtons: {
//     flexDirection: "row",
//     marginTop: 12,
//   },
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
//   btnText: {
//     color: "#fff",
//     fontWeight: "600",
//   },

//   searchSection: {
//     backgroundColor: "#fff",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e0e0e0",
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
//     backgroundColor: "#2c5aa0",
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
//   typeText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "500",
//   },
//   cardContent: {
//     padding: 12,
//   },
//   row: {
//     flexDirection: "row",
//     marginBottom: 8,
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#333",
//     width: 80,
//     marginRight: 8,
//   },
//   value: {
//     fontSize: 13,
//     color: "#666",
//     flex: 1,
//   },
//   description: {
//     fontSize: 13,
//     color: "#666",
//     marginTop: 4,
//     lineHeight: 18,
//   },
//   dateRow: {
//     flexDirection: "row",
//     borderTopWidth: 1,
//     borderTopColor: "#f0f0f0",
//     paddingTop: 12,
//   },
//   dateColumn: {
//     flex: 1,
//   },
//   dateText: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 2,
//   },
//   loadingWrapper: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { HOLD_BY_ME_URL } from "../src/context/api";

const HoldScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  // Filter states
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
      fetchHoldIdeas();
    }
  }, [token]);

  const fetchHoldIdeas = async (from, to) => {
    setLoading(true);
    try {
      let url = HOLD_BY_ME_URL;
      const params = [];
      if (from) params.push(`fromDate=${from}`);
      if (to) params.push(`toDate=${to}`);
      if (params.length > 0) url += `&${params.join("&")}`;

      console.log("Fetch URL:", url);
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

      // 🔹 Frontend date filtering (based on createdOn)
      if (from || to) {
        const fromTime = from ? new Date(from).getTime() : null;
        const toTime = to ? new Date(to).getTime() : null;

        items = items.filter((item) => {
          const createdTime = item.createdOn
            ? new Date(item.createdOn).getTime()
            : null;
          if (!createdTime) return false;
          if (fromTime && createdTime < fromTime) return false;
          if (toTime && createdTime > toTime) return false;
          return true;
        });
      }

      setIdeas(items);
    } catch (error) {
      console.error("Fetch hold error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const from = fromDate ? fromDate.toISOString().split("T")[0] : null;
    const to = toDate ? toDate.toISOString().split("T")[0] : null;
    fetchHoldIdeas(from, to);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFromDate(null);
    setToDate(null);
    fetchHoldIdeas();
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
    <TouchableOpacity style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Text style={styles.ideaNumber}>{item.ideaNumber || "–"}</Text>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>On Hold</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <Text style={styles.label}>Owner:</Text>
          <Text style={styles.value}>{item.ownerName || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>
            {item.location || item.department || "N/A"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Description:</Text>
          <Text numberOfLines={3} style={styles.description}>
            {item.description || "N/A"}
          </Text>
        </View>
        <View style={styles.dateRow}>
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
        <Text style={styles.headerTitle}>Hold Ideas</Text>
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
                  if (toDate && date > toDate) {
                    setToDate(null);
                  }
                }
              }}
              maximumDate={toDate || undefined}
            />
          )}

          {/* To Date */}
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

      {/* Search */}
      <View style={styles.searchSection}>
        <Text style={styles.searchLabel}>Search:</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Idea Number"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      {/* Idea List */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderIdeaCard}
          keyExtractor={(item, idx) =>
            (item.id?.toString() || idx.toString())
          }
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default HoldScreen;

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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
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
  dateText: {
    fontSize: 14,
    color: "#333",
  },
  filterButtons: {
    flexDirection: "row",
    marginTop: 12,
  },
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
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

  searchSection: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
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
    backgroundColor: "#2c5aa0",
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
  typeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  cardContent: {
    padding: 12,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    width: 80,
    marginRight: 8,
  },
  value: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    lineHeight: 18,
  },
  dateRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  dateColumn: {
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
