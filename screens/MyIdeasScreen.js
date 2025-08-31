// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// const Tab = createMaterialTopTabNavigator();

// function IdeasList({ ideas, editIdea, deleteIdea }) {
//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {ideas.length === 0 ? (
//         <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
//           No ideas found
//         </Text>
//       ) : (
//         ideas.map((idea, index) => (
//           <View key={index} style={styles.card}>
//             <Text style={styles.title}>{idea.title}</Text>
//             <Text style={styles.text}>Description: {idea.description}</Text>
//             <Text style={styles.text}>Proposed Solution: {idea.solution}</Text>
//             <Text style={styles.text}>Category: {idea.category}</Text>
//             <Text style={styles.text}>Benefit: {idea.benefit}</Text>
//                 <Text style={styles.text}>Team Members: {idea.teamMembers}</Text>
//                 <Text style={styles.text}>Mobile: {idea.mobileNumber}</Text>
//                 <Text style={styles.text}>BE Support Needed: {idea.beSupportNeeded}</Text>
//                 <Text style={styles.text}>Can Implement Other Location: {idea.canImplementOtherLocation}</Text>
//                 <Text style={styles.text}>Date: {idea.date}</Text>
//             <View style={styles.buttonRow}>
//               <TouchableOpacity
//                 style={[styles.button, styles.editButton]}
//                 onPress={() => editIdea(idea, index)}
//               >
//                 <Text style={styles.buttonText}>Edit</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.button, styles.deleteButton]}
//                 onPress={() => deleteIdea(index)}
//               >
//                 <Text style={styles.buttonText}>Delete</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         ))
//       )}
//     </ScrollView>
//   );
// }

// export default function MyIdeasScreen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const [ideas, setIdeas] = useState([]);

//   useEffect(() => {
//     if (route.params?.newIdea) {
//       const ideaWithStatus = { ...route.params.newIdea, status: "Pending" };
//       setIdeas((prevIdeas) => [...prevIdeas, ideaWithStatus]);
//     }
//   }, [route.params?.newIdea]);

//   const deleteIdea = (index) => {
//     Alert.alert(
//       "Delete Idea",
//       "Are you sure you want to delete this idea?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: () => {
//             setIdeas((prevIdeas) =>
//               prevIdeas.filter((_, i) => i !== index)
//             );
//           },
//         },
//       ]
//     );
//   };

//   const editIdea = (idea, index) => {
//     navigation.navigate("Create Idea", {
//       ideaToEdit: idea,
//       ideaIndex: index,
//       isEditing: true,
//     });
//   };

//   // Filter ideas by status
//   const filterIdeas = (status) => ideas.filter((idea) => idea.status === status);

//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarActiveTintColor: "#fff",
//         tabBarInactiveTintColor: "#ddd",
//         tabBarStyle: { backgroundColor: "#4CAF50" },
//         tabBarIndicatorStyle: { backgroundColor: "#FFD700" },
//         tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
//         tabBarScrollEnabled: true,
//       }}
//     >
//       <Tab.Screen name="Pending">
//         {() => (
//           <IdeasList
//             ideas={filterIdeas("Pending")}
//             editIdea={editIdea}
//             deleteIdea={deleteIdea}
//           />
//         )}
//       </Tab.Screen>
//       <Tab.Screen name="Approved">
//         {() => (
//           <IdeasList
//             ideas={filterIdeas("Approved")}
//             editIdea={editIdea}
//             deleteIdea={deleteIdea}
//           />
//         )}
//       </Tab.Screen>
//       <Tab.Screen name="Hold">
//         {() => (
//           <IdeasList
//             ideas={filterIdeas("Hold")}
//             editIdea={editIdea}
//             deleteIdea={deleteIdea}
//           />
//         )}
//       </Tab.Screen>
//       <Tab.Screen name="Rejected">
//         {() => (
//           <IdeasList
//             ideas={filterIdeas("Rejected")}
//             editIdea={editIdea}
//             deleteIdea={deleteIdea}
//           />
//         )}
//       </Tab.Screen>
//       <Tab.Screen name="Cancelled">
//         {() => (
//           <IdeasList
//             ideas={filterIdeas("Cancelled")}
//             editIdea={editIdea}
//             deleteIdea={deleteIdea}
//           />
//         )}
//       </Tab.Screen>
//     </Tab.Navigator>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: "#F8FAFF",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 15,
//     elevation: 3,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   text: {
//     fontSize: 14,
//     marginBottom: 4,
//     color: "#444",
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 10,
//   },
//   button: {
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 8,
//     marginLeft: 8,
//   },
//   editButton: {
//     backgroundColor: "#4CAF50",
//   },
//   deleteButton: {
//     backgroundColor: "#E53935",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
// });
// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// const Tab = createMaterialTopTabNavigator();

// function IdeasList({ ideas, editIdea, deleteIdea }) {
//   const [expandedIndex, setExpandedIndex] = useState(null); // track konsa card open hai

//   const toggleExpand = (index) => {
//     setExpandedIndex(expandedIndex === index ? null : index);
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {ideas.length === 0 ? (
//         <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
//           No ideas found
//         </Text>
//       ) : (
//         ideas.map((idea, index) => (
//           <TouchableOpacity
//             key={index}
//             activeOpacity={0.8}
//             style={styles.card}
//             onPress={() => toggleExpand(index)}
//           >
//             {/* --- Short Info Always Visible --- */}
//             <Text style={styles.title}>{idea.title}</Text>
//             <Text style={styles.text}>Category: {idea.category}</Text>
//             <Text style={styles.text}>Date: {idea.date}</Text>

//             {/* --- Extra Details Only if Expanded --- */}
//             {expandedIndex === index && (
//               <View style={{ marginTop: 10 }}>
//                 <Text style={styles.text}>Description: {idea.description}</Text>
//                 <Text style={styles.text}>Proposed Solution: {idea.solution}</Text>
//                 <Text style={styles.text}>Benefit: {idea.benefit}</Text>
//                 <Text style={styles.text}>Team Members: {idea.teamMembers}</Text>
//                 <Text style={styles.text}>Mobile: {idea.mobileNumber}</Text>
//                 <Text style={styles.text}>BE Support Needed: {idea.beSupportNeeded}</Text>
//                 <Text style={styles.text}>Can Implement Other Location: {idea.canImplementOtherLocation}</Text>

//                 {/* Buttons Only in Expanded State */}
//                 <View style={styles.buttonRow}>
//                   <TouchableOpacity
//                     style={[styles.button, styles.editButton]}
//                     onPress={() => editIdea(idea, index)}
//                   >
//                     <Text style={styles.buttonText}>Edit</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={[styles.button, styles.deleteButton]}
//                     onPress={() => deleteIdea(index)}
//                   >
//                     <Text style={styles.buttonText}>Delete</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}
//           </TouchableOpacity>
//         ))
//       )}
//     </ScrollView>
//   );
// }

// export default function MyIdeasScreen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const [ideas, setIdeas] = useState([]);

//   useEffect(() => {
//     if (route.params?.newIdea) {
//       const ideaWithStatus = { ...route.params.newIdea, status: "Pending" };
//       setIdeas((prevIdeas) => [...prevIdeas, ideaWithStatus]);
//     }
//   }, [route.params?.newIdea]);

//   const deleteIdea = (index) => {
//     Alert.alert(
//       "Delete Idea",
//       "Are you sure you want to delete this idea?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: () => {
//             setIdeas((prevIdeas) =>
//               prevIdeas.filter((_, i) => i !== index)
//             );
//           },
//         },
//       ]
//     );
//   };

//   const editIdea = (idea, index) => {
//     navigation.navigate("Create Idea", {
//       ideaToEdit: idea,
//       ideaIndex: index,
//       isEditing: true,
//     });
//   };

//   // Filter ideas by status
//   const filterIdeas = (status) => ideas.filter((idea) => idea.status === status);

//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarActiveTintColor: "#fff",
//         tabBarInactiveTintColor: "#ddd",
//         tabBarStyle: { backgroundColor: "#4CAF50" },
//         tabBarIndicatorStyle: { backgroundColor: "#FFD700" },
//         tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
//         tabBarScrollEnabled: true,
//       }}
//     >
//       <Tab.Screen name="Pending">
//         {() => (
//           <IdeasList
//             ideas={filterIdeas("Pending")}
//             editIdea={editIdea}
//             deleteIdea={deleteIdea}
//           />
//         )}
//       </Tab.Screen>
//       <Tab.Screen name="Approved">
//         {() => (
//           <IdeasList
//             ideas={filterIdeas("Approved")}
//             editIdea={editIdea}
//             deleteIdea={deleteIdea}
//           />
//         )}
//       </Tab.Screen>
//       <Tab.Screen name="Hold">
//         {() => (
//           <IdeasList
//             ideas={filterIdeas("Hold")}
//             editIdea={editIdea}
//             deleteIdea={deleteIdea}
//           />
//         )}
//       </Tab.Screen>
//       <Tab.Screen name="Rejected">
//         {() => (
//           <IdeasList
//             ideas={filterIdeas("Rejected")}
//             editIdea={editIdea}
//             deleteIdea={deleteIdea}
//           />
//         )}
//       </Tab.Screen>
//       <Tab.Screen name="Cancelled">
//         {() => (
//           <IdeasList
//             ideas={filterIdeas("Cancelled")}
//             editIdea={editIdea}
//             deleteIdea={deleteIdea}
//           />
//         )}
//       </Tab.Screen>
//     </Tab.Navigator>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: "#F8FAFF",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 15,
//     elevation: 3,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   text: {
//     fontSize: 14,
//     marginBottom: 4,
//     color: "#444",
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 10,
//   },
//   button: {
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 8,
//     marginLeft: 8,
//   },
//   editButton: {
//     backgroundColor: "#4CAF50",
//   },
//   deleteButton: {
//     backgroundColor: "#E53935",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
// });
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

function IdeasList({ ideas, editIdea, deleteIdea }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
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
            onPress={() => toggleExpand(index)}
          >
            {/* --- Always visible short info --- */}
            <View style={styles.row}>
              <Text style={styles.label}>Title</Text>
              <Text style={styles.value}>{idea.title}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>{idea.category}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{idea.date}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.statusBadge}>{idea.status}</Text>
            </View>

            {/* --- Expanded details --- */}
            {expandedIndex === index && (
              <View style={{ marginTop: 10 }}>
                <View style={styles.row}>
                  <Text style={styles.label}>Description</Text>
                  <Text style={styles.value}>{idea.description}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Solution</Text>
                  <Text style={styles.value}>{idea.solution}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Benefit</Text>
                  <Text style={styles.value}>{idea.benefit}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Team Members</Text>
                  <Text style={styles.value}>{idea.teamMembers}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Mobile</Text>
                  <Text style={styles.value}>{idea.mobileNumber}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>BE Support</Text>
                  <Text style={styles.value}>{idea.beSupportNeeded}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Other Location</Text>
                  <Text style={styles.value}>{idea.canImplementOtherLocation}</Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() => editIdea(idea, index)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={() => deleteIdea(index)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

export default function MyIdeasScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    if (route.params?.newIdea) {
      const ideaWithStatus = { ...route.params.newIdea, status: "Pending" };
      setIdeas((prevIdeas) => [...prevIdeas, ideaWithStatus]);
    }
  }, [route.params?.newIdea]);

  const deleteIdea = (index) => {
    Alert.alert(
      "Delete Idea",
      "Are you sure you want to delete this idea?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setIdeas((prevIdeas) =>
              prevIdeas.filter((_, i) => i !== index)
            );
          },
        },
      ]
    );
  };

  const editIdea = (idea, index) => {
    navigation.navigate("Create Idea", {
      ideaToEdit: idea,
      ideaIndex: index,
      isEditing: true,
    });
  };

  const filterIdeas = (status) => ideas.filter((idea) => idea.status === status);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#ddd",
        tabBarStyle: { backgroundColor: "#4CAF50" },
        tabBarIndicatorStyle: { backgroundColor: "#FFD700" },
        tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        tabBarScrollEnabled: true,
      }}
    >
      <Tab.Screen name="Pending">
        {() => (
          <IdeasList
            ideas={filterIdeas("Pending")}
            editIdea={editIdea}
            deleteIdea={deleteIdea}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Approved">
        {() => (
          <IdeasList
            ideas={filterIdeas("Approved")}
            editIdea={editIdea}
            deleteIdea={deleteIdea}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Hold">
        {() => (
          <IdeasList
            ideas={filterIdeas("Hold")}
            editIdea={editIdea}
            deleteIdea={deleteIdea}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Rejected">
        {() => (
          <IdeasList
            ideas={filterIdeas("Rejected")}
            editIdea={editIdea}
            deleteIdea={deleteIdea}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Cancelled">
        {() => (
          <IdeasList
            ideas={filterIdeas("Cancelled")}
            editIdea={editIdea}
            deleteIdea={deleteIdea}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#F2F4F9",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
    backgroundColor: "green",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 12,
    overflow: "hidden",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "#4CAF50",
  },
  deleteButton: {
    backgroundColor: "#E53935",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
