// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// const Tab = createMaterialTopTabNavigator();

// function IdeasList({ ideas, editIdea, deleteIdea }) {
//   const [selectedIdea, setSelectedIdea] = useState(null);

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
//             onPress={() => setSelectedIdea(idea)}
//           >
//             {/* Short Info */}
//             <View style={styles.row}>
//               <Text style={styles.label}>Title</Text>
//               <Text style={styles.value}>{idea.title}</Text>
//             </View>
//             <View style={styles.row}>
//               <Text style={styles.label}>Category</Text>
//               <Text style={styles.value}>{idea.category}</Text>
//             </View>
//             <View style={styles.row}>
//               <Text style={styles.label}>Date</Text>
//               <Text style={styles.value}>{idea.date}</Text>
//             </View>
//             <View style={styles.row}>
//               <Text style={styles.label}>Status</Text>
//               <Text style={styles.statusBadge}>{idea.status}</Text>
//             </View>
//           </TouchableOpacity>
//         ))
//       )}

//       {/* Fullscreen Modal */}
//       <Modal visible={!!selectedIdea} transparent animationType="fade">
//         <View style={styles.modalBackground}>
//           <View style={styles.modalCard}>
//             <ScrollView>
//               {selectedIdea && (
//                 <>
//                   <Text style={styles.modalTitle}>{selectedIdea.title}</Text>
//                   <Text><Text style={styles.bold}>Category:</Text> {selectedIdea.category}</Text>
//                   <Text><Text style={styles.bold}>Date:</Text> {selectedIdea.date}</Text>
//                   <Text><Text style={styles.bold}>Status:</Text> {selectedIdea.status}</Text>
//                   <Text><Text style={styles.bold}>Description:</Text> {selectedIdea.description}</Text>
//                   <Text><Text style={styles.bold}>Solution:</Text> {selectedIdea.solution}</Text>
//                   <Text><Text style={styles.bold}>Benefit:</Text> {selectedIdea.benefit}</Text>
//                   <Text><Text style={styles.bold}>Team Members:</Text> {selectedIdea.teamMembers}</Text>
//                   <Text><Text style={styles.bold}>Mobile:</Text> {selectedIdea.mobileNumber}</Text>
//                   <Text><Text style={styles.bold}>BE Support:</Text> {selectedIdea.beSupportNeeded}</Text>
//                   <Text><Text style={styles.bold}>Other Location:</Text> {selectedIdea.canImplementOtherLocation}</Text>

//                   {/* Buttons */}
//                   <View style={styles.buttonRow}>
//                     <TouchableOpacity
//                       style={[styles.button, styles.editButton]}
//                       onPress={() => {
//                         editIdea(selectedIdea);
//                         setSelectedIdea(null);
//                       }}
//                     >
//                       <Text style={styles.buttonText}>Edit</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       style={[styles.button, styles.deleteButton]}
//                       onPress={() => {
//                         deleteIdea(selectedIdea);
//                         setSelectedIdea(null);
//                       }}
//                     >
//                       <Text style={styles.buttonText}>Delete</Text>
//                     </TouchableOpacity>
//                   </View>

//                   {/* Close */}
//                   <TouchableOpacity
//                     style={{ marginTop: 15 }}
//                     onPress={() => setSelectedIdea(null)}
//                   >
//                     <Text style={{ color: "blue", textAlign: "center" }}>Close</Text>
//                   </TouchableOpacity>
//                 </>
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
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

//   const deleteIdea = (idea) => {
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
//               prevIdeas.filter((i) => i !== idea)
//             );
//           },
//         },
//       ]
//     );
//   };

//   const editIdea = (idea) => {
//     navigation.navigate("Create Idea", {
//       ideaToEdit: idea,
//       isEditing: true,
//     });
//   };

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
//     padding: 10,
//     backgroundColor: "#F2F4F9",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     padding: 15,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//     borderBottomWidth: 0.5,
//     borderColor: "#eee",
//     paddingBottom: 4,
//   },
//   label: {
//     fontSize: 14,
//     color: "#555",
//     fontWeight: "600",
//   },
//   value: {
//     fontSize: 14,
//     color: "#222",
//     maxWidth: "60%",
//     textAlign: "right",
//   },
//   statusBadge: {
//     color: "#fff",
//     backgroundColor: "green",
//     paddingHorizontal: 10,
//     paddingVertical: 3,
//     borderRadius: 12,
//     fontSize: 12,
//     overflow: "hidden",
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
//   modalBackground: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)", // blur/dim effect
//     justifyContent: "center",
//     padding: 20,
//   },
//   modalCard: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 20,
//     maxHeight: "80%",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   bold: {
//     fontWeight: "bold",
//   },
// });
// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Image } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// const Tab = createMaterialTopTabNavigator();

// function IdeasList({ ideas, editIdea, deleteIdea }) {
//   const [selectedIdea, setSelectedIdea] = useState(null);
//   const [showImage, setShowImage] = useState(false);

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
//             onPress={() => setSelectedIdea(idea)}
//           >
//             {/* Short Info */}
//             <View style={styles.row}>
//               <Text style={styles.label}>Title</Text>
//               <Text style={styles.value}>{idea.title}</Text>
//             </View>
//             <View style={styles.row}>
//               <Text style={styles.label}>Category</Text>
//               <Text style={styles.value}>{idea.category}</Text>
//             </View>
//             <View style={styles.row}>
//               <Text style={styles.label}>Date</Text>
//               <Text style={styles.value}>{idea.date}</Text>
//             </View>
//             <View style={styles.row}>
//               <Text style={styles.label}>Status</Text>
//               <Text style={styles.statusBadge}>{idea.status}</Text>
//             </View>
//           </TouchableOpacity>
//         ))
//       )}

//       {/* Fullscreen Modal */}
//       <Modal visible={!!selectedIdea} animationType="slide">
//         <View style={styles.fullModal}>
//           {/* Close button */}
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setSelectedIdea(null)}
//           >
//             <Text style={styles.closeText}>✕</Text>
//           </TouchableOpacity>

//           <ScrollView contentContainerStyle={{ padding: 20 }}>
//             {selectedIdea && (
//               <>
//                 <Text style={styles.modalTitle}>{selectedIdea.title}</Text>
//                 <Text><Text style={styles.bold}>Category:</Text> {selectedIdea.category}</Text>
//                 <Text><Text style={styles.bold}>Date:</Text> {selectedIdea.date}</Text>
//                 <Text><Text style={styles.bold}>Status:</Text> {selectedIdea.status}</Text>
//                 <Text><Text style={styles.bold}>Description:</Text> {selectedIdea.description}</Text>
//                 <Text><Text style={styles.bold}>Solution:</Text> {selectedIdea.solution}</Text>
//                 <Text><Text style={styles.bold}>Benefit:</Text> {selectedIdea.benefit}</Text>
//                 <Text><Text style={styles.bold}>Team Members:</Text> {selectedIdea.teamMembers}</Text>
//                 <Text><Text style={styles.bold}>Mobile:</Text> {selectedIdea.mobileNumber}</Text>
//                 <Text><Text style={styles.bold}>BE Support:</Text> {selectedIdea.beSupportNeeded}</Text>
//                 <Text><Text style={styles.bold}>Other Location:</Text> {selectedIdea.canImplementOtherLocation}</Text>

//                 {/* Image section */}
//                 {selectedIdea.image && (
//                   <TouchableOpacity
//                     style={styles.imageWrapper}
//                     onPress={() => setShowImage(true)}
//                   >
//                     <Image
//                       source={{ uri: selectedIdea.image }}
//                       style={styles.thumbnail}
//                     />
//                     <Text style={{ textAlign: "center", marginTop: 5, color: "blue" }}>
//                       View Image
//                     </Text>
//                   </TouchableOpacity>
//                 )}
                
//                 {/* Buttons */}
//                 <View style={styles.buttonRow}>
//                   <TouchableOpacity
//                     style={[styles.button, styles.editButton]}
//                     onPress={() => {
//                       editIdea(selectedIdea);
//                       setSelectedIdea(null);
//                     }}
//                   >
//                     <Text style={styles.buttonText}>Edit</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={[styles.button, styles.deleteButton]}
//                     onPress={() => {
//                       deleteIdea(selectedIdea);
//                       setSelectedIdea(null);
//                     }}
//                   >
//                     <Text style={styles.buttonText}>Delete</Text>
//                   </TouchableOpacity>
//                 </View>
//               </>
//             )}
//           </ScrollView>
//         </View>
//       </Modal>

//       {/* Fullscreen Image Modal */}
//       <Modal visible={showImage} transparent animationType="fade">
//         <View style={styles.imageModal}>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setShowImage(false)}
//           >
//             <Text style={styles.closeText}>✕</Text>
//           </TouchableOpacity>
//           <Image
//             source={{ uri: selectedIdea?.image }}
//             style={styles.fullImage}
//             resizeMode="contain"
//           />
//         </View>
//       </Modal>
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

//   const deleteIdea = (idea) => {
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
//               prevIdeas.filter((i) => i !== idea)
//             );
//           },
//         },
//       ]
//     );
//   };

//   const editIdea = (idea) => {
//     navigation.navigate("Create Idea", {
//       ideaToEdit: idea,
//       isEditing: true,
//     });
//   };

//   const filterIdeas = (status) => ideas.filter((idea) => idea.status === status);

//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarActiveTintColor: "#000000",
//         tabBarInactiveTintColor: "#333333",
//         tabBarStyle: { backgroundColor: "#CED8E7" },
//         tabBarIndicatorStyle: { backgroundColor: "#5A6FAE" },
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
//     padding: 10,
//     backgroundColor: "#F2F4F9",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     padding: 15,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//     borderBottomWidth: 0.5,
//     borderColor: "#eee",
//     paddingBottom: 4,
//   },
//   label: {
//     fontSize: 14,
//     color: "#555",
//     fontWeight: "600",
//   },
//   value: {
//     fontSize: 14,
//     color: "#222",
//     maxWidth: "60%",
//     textAlign: "right",
//   },
//   statusBadge: {
//     color: "#fff",
//     backgroundColor: "green",
//     paddingHorizontal: 10,
//     paddingVertical: 3,
//     borderRadius: 12,
//     fontSize: 12,
//     overflow: "hidden",
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
//   fullModal: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   closeButton: {
//     position: "absolute",
//     top: 40,
//     right: 20,
//     zIndex: 10,
//     backgroundColor: "#000",
//     borderRadius: 20,
//     padding: 5,
//   },
//   closeText: {
//     color: "#fff",
//     fontSize: 18,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   bold: {
//     fontWeight: "bold",
//   },
//   imageWrapper: {
//     marginTop: 15,
//     alignItems: "center",
//   },
//   thumbnail: {
//     width: 120,
//     height: 120,
//     borderRadius: 10,
//   },
//   imageModal: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.9)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   fullImage: {
//     width: "100%",
//     height: "80%",
//   },
// });
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

function IdeasList({ ideas, editIdea, deleteIdea }) {
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showImage, setShowImage] = useState(false);

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
            onPress={() => setSelectedIdea(idea)}
          >
            {/* Short Info */}
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
          </TouchableOpacity>
        ))
      )}

      {/* Fullscreen Modal */}
      <Modal visible={!!selectedIdea} animationType="slide">
        <View style={styles.fullModal}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedIdea(null)}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {selectedIdea && (
              <>
                <Text style={styles.modalTitle}>{selectedIdea.title}</Text>
                <Text><Text style={styles.bold}>Category:</Text> {selectedIdea.category}</Text>
                <Text><Text style={styles.bold}>Date:</Text> {selectedIdea.date}</Text>
                <Text><Text style={styles.bold}>Status:</Text> {selectedIdea.status}</Text>
                <Text><Text style={styles.bold}>Description:</Text> {selectedIdea.description}</Text>
                <Text><Text style={styles.bold}>Solution:</Text> {selectedIdea.solution}</Text>
                <Text><Text style={styles.bold}>Benefit:</Text> {selectedIdea.benefit}</Text>
                <Text><Text style={styles.bold}>Team Members:</Text> {selectedIdea.teamMembers}</Text>
                <Text><Text style={styles.bold}>Mobile:</Text> {selectedIdea.mobileNumber}</Text>
                <Text><Text style={styles.bold}>BE Support:</Text> {selectedIdea.beSupportNeeded}</Text>
                <Text><Text style={styles.bold}>Other Location:</Text> {selectedIdea.canImplementOtherLocation}</Text>

                {/* Image section */}
                {selectedIdea.image && (
                  <TouchableOpacity
                    style={styles.imageWrapper}
                    onPress={() => setShowImage(true)}
                  >
                    <Image
                      source={{ uri: selectedIdea.image }}
                      style={styles.thumbnail}
                    />
                    <Text style={{ textAlign: "center", marginTop: 5, color: "blue" }}>
                      View Image
                    </Text>
                  </TouchableOpacity>
                )}
                
                {/* Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() => {
                      editIdea(selectedIdea);
                      setSelectedIdea(null);
                    }}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={() => {
                      deleteIdea(selectedIdea);
                      setSelectedIdea(null);
                    }}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Fullscreen Image Modal */}
      <Modal visible={showImage} transparent animationType="fade">
        <View style={styles.imageModal}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowImage(false)}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: selectedIdea?.image }}
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

  useEffect(() => {
    if (route.params?.newIdea) {
      const ideaWithStatus = { ...route.params.newIdea, status: "Pending" };
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
            setIdeas((prevIdeas) =>
              prevIdeas.filter((i) => i !== idea)
            );
          },
        },
      ]
    );
  };

  const editIdea = (idea) => {
    navigation.navigate("Create Idea", {
      ideaToEdit: idea,
      isEditing: true,
    });
  };

  const filterIdeas = (status) => ideas.filter((idea) => idea.status === status);

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
  fullModal: {
    flex: 1,
    backgroundColor: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "#000",
    borderRadius: 20,
    padding: 5,
  },
  closeText: {
    color: "#fff",
    fontSize: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  bold: {
    fontWeight: "bold",
  },
  imageWrapper: {
    marginTop: 15,
    alignItems: "center",
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  imageModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "80%",
  },
});
