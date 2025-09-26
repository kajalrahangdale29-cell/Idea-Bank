// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Modal,
//   Image,
//   StyleSheet,
//   Alert,
//   Linking,
// } from "react-native";
// import {
//   createDrawerNavigator,
//   DrawerContentScrollView,
// } from "@react-navigation/drawer";
// import {
//   Ionicons,
//   MaterialIcons,
//   FontAwesome5,
//   AntDesign,
//   Feather,
// } from "@expo/vector-icons";

// import DashboardScreen from "./DashboardScreen";
// import CreateIdeaScreen from "./CreateIdeaScreen";
// import MyIdeasScreen from "./MyIdeasScreen";
// import TeamIdeasScreen from "./TeamIdeasScreen";
// import AllIdeasScreen from "./AllIdeasScreen";
// import ApprovalScreen from "./ApprovalScreen";
// import StudyMaterialScreen from "./StudyMaterialScreen";
// import ApprovedScreen from "./ApprovedScreen";
// import RejectedScreen from "./RejectedScreen";
// import PendingScreen from "./PendingScreen";
// import HoldScreen from "./HoldScreen";

// const Drawer = createDrawerNavigator();

// function CustomDrawerContent(props) {
//   const [manageExpanded, setManageExpanded] = useState(false);
//   const [approvalExpanded, setApprovalExpanded] = useState(false);
//   const [logoutVisible, setLogoutVisible] = useState(false);

//   return (
//     <DrawerContentScrollView
//       {...props}
//       contentContainerStyle={{ paddingVertical: 10, backgroundColor: "#0f4c5c" }}
//     >
//       {/* Dashboard */}
//       <TouchableOpacity
//         style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
//         onPress={() => props.navigation.navigate("Dashboard")}
//       >
//         <Ionicons name="grid-outline" size={20} color="#fff" style={{ marginRight: 15 }} />
//         <Text style={{ fontSize: 16, color: "#fff" }}>Dashboard</Text>
//       </TouchableOpacity>

//       {/* Manage Idea */}
//       <TouchableOpacity
//         style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
//         onPress={() => setManageExpanded(!manageExpanded)}
//       >
//         <MaterialIcons name="lightbulb-outline" size={20} color="#fff" style={{ marginRight: 15 }} />
//         <Text style={{ fontSize: 16, color: "#fff" }}>
//           Manage Idea {manageExpanded ? "▲" : "▼"}
//         </Text>
//       </TouchableOpacity>

//       {manageExpanded && (
//         <>
//           <TouchableOpacity
//             style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
//             onPress={() => props.navigation.navigate("Create Idea")}
//           >
//             <MaterialIcons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
//             <Text style={{ fontSize: 14, color: "#fff" }}>Create Idea</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
//             onPress={() => props.navigation.navigate("My Ideas")}
//           >
//             <Feather name="user" size={18} color="#fff" style={{ marginRight: 10 }} />
//             <Text style={{ fontSize: 14, color: "#fff" }}>My Ideas</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
//             onPress={() => props.navigation.navigate("Team Ideas")}
//           >
//             <FontAwesome5 name="users" size={18} color="#fff" style={{ marginRight: 10 }} />
//             <Text style={{ fontSize: 14, color: "#fff" }}>Team Ideas</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
//             onPress={() => props.navigation.navigate("All Ideas")}
//           >
//             <MaterialIcons name="list-alt" size={18} color="#fff" style={{ marginRight: 10 }} />
//             <Text style={{ fontSize: 14, color: "#fff" }}>All Ideas</Text>
//           </TouchableOpacity>
//         </>
//       )}

//       {/* Approval */}
//       <TouchableOpacity
//         style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
//         onPress={() => setApprovalExpanded(!approvalExpanded)}
//       >
//         <Ionicons name="checkmark-done-outline" size={20} color="#fff" style={{ marginRight: 15 }} />
//         <Text style={{ fontSize: 16, color: "#fff" }}>
//           Approval {approvalExpanded ? "▲" : "▼"}
//         </Text>
//       </TouchableOpacity>

//       {approvalExpanded && (
//         <>
//           {/* Approved Ideas */}
//           <TouchableOpacity
//             style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
//             onPress={() => props.navigation.navigate("Approved Ideas")}
//           >
//             <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 10 }} />
//             <Text style={{ fontSize: 14, color: "#fff" }}>Approved</Text>
//           </TouchableOpacity>

//           {/* Rejected Ideas */}
//           <TouchableOpacity
//             style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
//             onPress={() => props.navigation.navigate("Rejected Ideas")}
//           >
//             <Ionicons name="close-circle-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
//             <Text style={{ fontSize: 14, color: "#fff" }}>Rejected</Text>
//           </TouchableOpacity>

//           {/* Pending Ideas */}
//           <TouchableOpacity
//             style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
//             onPress={() => props.navigation.navigate("Pending Ideas")}
//           >
//             <Ionicons name="time-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
//             <Text style={{ fontSize: 14, color: "#fff" }}>Pending</Text>
//           </TouchableOpacity>

//           {/* Hold Ideas */}
//           <TouchableOpacity
//             style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
//             onPress={() => props.navigation.navigate("Hold Ideas")}
//           >
//             <Ionicons name="pause-circle-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
//             <Text style={{ fontSize: 14, color: "#fff" }}>Hold</Text>
//           </TouchableOpacity>
//         </>
//       )}

//       {/* Help */}
//       <TouchableOpacity
//         style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
//         onPress={() => Linking.openURL("https://ideabank.abisaio.com/manuals/User_Manuals.pdf")}
//       >
//         <FontAwesome5 name="question-circle" size={20} color="#fff" style={{ marginRight: 15 }} />
//         <Text style={{ fontSize: 16, color: "#fff" }}>Help</Text>
//       </TouchableOpacity>

//       {/* Study Material */}
//       <TouchableOpacity
//         style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
//         onPress={() => {
//           const url = "https://lms.abisaio.com/";
//           Linking.canOpenURL(url)
//             .then((supported) => {
//               if (supported) {
//                 Linking.openURL(url);
//               } else {
//                 Alert.alert("Error", "Cannot open the URL");
//               }
//             })
//             .catch((err) => console.error("An error occurred", err));
//         }}
//       >
//         <FontAwesome5 name="book-reader" size={20} color="#fff" style={{ marginRight: 15 }} />
//         <Text style={{ fontSize: 16, color: "#fff" }}>Study Material</Text>
//       </TouchableOpacity>

//       {/* Logout */}
//       <TouchableOpacity
//         style={{ flexDirection: "row", alignItems: "center", padding: 15, marginTop: 20 }}
//         onPress={() => setLogoutVisible(true)}
//       >
//         <AntDesign name="logout" size={20} color="#fff" style={{ marginRight: 15 }} />
//         <Text style={{ fontSize: 16, color: "#fff" }}>Logout</Text>
//       </TouchableOpacity>

//       {/* Logout Modal */}
//       <Modal
//         transparent
//         visible={logoutVisible}
//         animationType="fade"
//         onRequestClose={() => setLogoutVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalBox}>
//             <Image source={require("../assets/logout.png")} style={{ width: 50, height: 50, marginBottom: 15 }} />
//             <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Logout</Text>
//             <Text style={{ fontSize: 14, color: "#555", marginBottom: 20 }}>
//               Are you sure you want to logout?
//             </Text>

//             <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
//               <TouchableOpacity style={styles.cancelBtn} onPress={() => setLogoutVisible(false)}>
//                 <Text style={{ color: "#0f4c5c" }}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.logoutConfirmBtn}
//                 onPress={() => {
//                   setLogoutVisible(false);
//                   props.navigation.replace("Login");
//                 }}
//               >
//                 <Text style={{ color: "#fff" }}>Logout</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </DrawerContentScrollView>
//   );
// }

// export default function MainApp() {
//   return (
//     <Drawer.Navigator
//       drawerContent={(props) => <CustomDrawerContent {...props} />}
//       screenOptions={({ navigation, route }) => ({
//         headerStyle: { backgroundColor: "#0f4c5c" },
//         headerTintColor: "#fff",
//         headerTitleStyle: { fontWeight: "bold" },
//         drawerStyle: { backgroundColor: "#0f4c5c" },
//         drawerActiveBackgroundColor: "#4aa3c0",
//         drawerInactiveTintColor: "#fff",
//         drawerActiveTintColor: "#fff",
//         headerLeft: () =>
//           route.name !== "Dashboard" ? (
//             <TouchableOpacity onPress={() => {
//               if (navigation.canGoBack()) {
//                 navigation.goBack();
//               } else {
//                 navigation.navigate("Dashboard");
//               }
//             }} style={{ marginLeft: 10 }}>
//               <Ionicons name="arrow-back" size={24} color="#fff" />
//             </TouchableOpacity>
//           ) : null,
//       })}
//     >
//       <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
//       <Drawer.Screen name="Create Idea" component={CreateIdeaScreen} />
//       <Drawer.Screen name="My Ideas" component={MyIdeasScreen} />
//       <Drawer.Screen name="Team Ideas" component={TeamIdeasScreen} />
//       <Drawer.Screen name="All Ideas" component={AllIdeasScreen} />
//       <Drawer.Screen name="Approval" component={ApprovalScreen} />
//       <Drawer.Screen name="Study Material" component={StudyMaterialScreen} />
      
//       {/* All Approval Screens */}
//       <Drawer.Screen
//         name="Approved Ideas"
//         component={ApprovedScreen}
//         options={{
//           headerTitle: "Approved Ideas",
//           headerTitleAlign: "left"
//         }}
//       />
//       <Drawer.Screen
//         name="Rejected Ideas"
//         component={RejectedScreen}
//         options={{
//           headerTitle: "Rejected Ideas",
//           headerTitleAlign: "left"
//         }}
//       />
//       <Drawer.Screen
//         name="Pending Ideas"
//         component={PendingScreen}
//         options={{
//           headerTitle: "Pending Ideas",
//           headerTitleAlign: "left"
//         }}
//       />
//       <Drawer.Screen
//         name="Hold Ideas"
//         component={HoldScreen}
//         options={{
//           headerTitle: "Hold Ideas",
//           headerTitleAlign: "left"
//         }}
//       />
//     </Drawer.Navigator>
//   );
// }

// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalBox: {
//     width: 280,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//     alignItems: "center",
//   },
//   cancelBtn: {
//     padding: 10,
//     backgroundColor: "#eee",
//     borderRadius: 6,
//     marginRight: 10,
//   },
//   logoutConfirmBtn: {
//     padding: 10,
//     backgroundColor: "#0f4c5c",
//     borderRadius: 6,
//   },
// });
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack"; // ✅ Added
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  AntDesign,
  Feather,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import Screens
import DashboardScreen from "./DashboardScreen";
import CreateIdeaScreen from "./CreateIdeaScreen";
import MyIdeasScreen from "./MyIdeasScreen";
import TeamIdeasScreen from "./TeamIdeasScreen";
import AllIdeasScreen from "./AllIdeasScreen";
import ApprovalScreen from "./ApprovalScreen";
import StudyMaterialScreen from "./StudyMaterialScreen";
import ApprovedScreen from "./ApprovedScreen";
import RejectedScreen from "./RejectedScreen";
import PendingScreen from "./PendingScreen";
import HoldScreen from "./HoldScreen";
import EditIdeaScreen from "./EditIdeaScreen"; // ✅ Import Edit Idea

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function CustomDrawerContent(props) {
  const [manageExpanded, setManageExpanded] = useState(false);
  const [approvalExpanded, setApprovalExpanded] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [roleFlags, setRoleFlags] = useState({
    isManager: false,
    isHod: false,
    isBETeamMember: false,
  });

  useEffect(() => {
    const fetchRoleFlags = async () => {
      const isManager = JSON.parse(await AsyncStorage.getItem("isManager")) || false;
      const isHod = JSON.parse(await AsyncStorage.getItem("isHod")) || false;
      const isBETeamMember = JSON.parse(await AsyncStorage.getItem("isBETeamMember")) || false;
      setRoleFlags({ isManager, isHod, isBETeamMember });
    };
    fetchRoleFlags();
  }, []);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingVertical: 10, backgroundColor: "#0f4c5c" }}
    >
      {/* Dashboard */}
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
        onPress={() => props.navigation.navigate("Dashboard")}
      >
        <Ionicons name="grid-outline" size={20} color="#fff" style={{ marginRight: 15 }} />
        <Text style={{ fontSize: 16, color: "#fff" }}>Dashboard</Text>
      </TouchableOpacity>

      {/* Manage Idea (Expandable) */}
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
        onPress={() => setManageExpanded(!manageExpanded)}
      >
        <MaterialIcons name="lightbulb-outline" size={20} color="#fff" style={{ marginRight: 15 }} />
        <Text style={{ fontSize: 16, color: "#fff" }}>
          Manage Idea {manageExpanded ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>

      {manageExpanded && (
        <>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
            onPress={() => props.navigation.navigate("Create Idea")}
          >
            <MaterialIcons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ fontSize: 14, color: "#fff" }}>Create Idea</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
            onPress={() => props.navigation.navigate("My Ideas")}
          >
            <Feather name="user" size={18} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ fontSize: 14, color: "#fff" }}>My Ideas</Text>
          </TouchableOpacity>

          {(roleFlags.isManager || roleFlags.isHod) && (
            <>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
                onPress={() => props.navigation.navigate("Team Ideas")}
              >
                <FontAwesome5 name="users" size={18} color="#fff" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 14, color: "#fff" }}>Team Ideas</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
                onPress={() => props.navigation.navigate("All Ideas")}
              >
                <MaterialIcons name="list-alt" size={18} color="#fff" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 14, color: "#fff" }}>All Ideas</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}

      {/* Approval Expandable */}
      {(roleFlags.isHod || roleFlags.isManager) && (
        <>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
            onPress={() => setApprovalExpanded(!approvalExpanded)}
          >
            <Ionicons name="checkmark-done-outline" size={20} color="#fff" style={{ marginRight: 15 }} />
            <Text style={{ fontSize: 16, color: "#fff" }}>
              Approval {approvalExpanded ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {approvalExpanded && (
            <>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
                onPress={() => props.navigation.navigate("Approved Ideas")}
              >
                <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 14, color: "#fff" }}>Approved</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
                onPress={() => props.navigation.navigate("Rejected Ideas")}
              >
                <Ionicons name="close-circle-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 14, color: "#fff" }}>Rejected</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
                onPress={() => props.navigation.navigate("Pending Ideas")}
              >
                <Ionicons name="time-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 14, color: "#fff" }}>Pending</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
                onPress={() => props.navigation.navigate("Hold Ideas")}
              >
                <Ionicons name="pause-circle-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 14, color: "#fff" }}>Hold</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}

      {/* Help */}
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
        onPress={() => Linking.openURL("https://ideabank.abisaio.com/manuals/User_Manuals.pdf")}
      >
        <FontAwesome5 name="question-circle" size={20} color="#fff" style={{ marginRight: 15 }} />
        <Text style={{ fontSize: 16, color: "#fff" }}>Help</Text>
      </TouchableOpacity>

      {/* Study Material */}
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
        onPress={() => {
          const url = "https://lms.abisaio.com/";
          Linking.canOpenURL(url)
            .then((supported) => {
              if (supported) Linking.openURL(url);
              else Alert.alert("Error", "Cannot open the URL");
            })
            .catch((err) => console.error("An error occurred", err));
        }}
      >
        <FontAwesome5 name="book-reader" size={20} color="#fff" style={{ marginRight: 15 }} />
        <Text style={{ fontSize: 16, color: "#fff" }}>Study Material</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", padding: 15, marginTop: 20 }}
        onPress={() => setLogoutVisible(true)}
      >
        <AntDesign name="logout" size={20} color="#fff" style={{ marginRight: 15 }} />
        <Text style={{ fontSize: 16, color: "#fff" }}>Logout</Text>
      </TouchableOpacity>

      {/* Logout Modal */}
      <Modal
        transparent
        visible={logoutVisible}
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Image source={require("../assets/logout.png")} style={{ width: 50, height: 50, marginBottom: 15 }} />
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Logout</Text>
            <Text style={{ fontSize: 14, color: "#555", marginBottom: 20 }}>
              Are you sure you want to logout?
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setLogoutVisible(false)}>
                <Text style={{ color: "#0f4c5c" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutConfirmBtn}
                onPress={() => {
                  setLogoutVisible(false);
                  props.navigation.replace("Login");
                }}
              >
                <Text style={{ color: "#fff" }}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </DrawerContentScrollView>
  );
}

// ✅ Create a stack wrapper to handle Drawer + Edit Idea
function DrawerScreens() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation, route }) => ({
        headerStyle: { backgroundColor: "#0f4c5c" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        drawerStyle: { backgroundColor: "#0f4c5c" },
        drawerActiveBackgroundColor: "#4aa3c0",
        drawerInactiveTintColor: "#fff",
        drawerActiveTintColor: "#fff",
        headerLeft: () =>
          route.name !== "Dashboard" ? (
            <TouchableOpacity onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate("Dashboard");
            }} style={{ marginLeft: 10 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ) : null,
      })}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Drawer.Screen name="Create Idea" component={CreateIdeaScreen} />
      <Drawer.Screen name="My Ideas" component={MyIdeasScreen} />
      <Drawer.Screen name="Team Ideas" component={TeamIdeasScreen} />
      <Drawer.Screen name="All Ideas" component={AllIdeasScreen} />
      <Drawer.Screen name="Approval" component={ApprovalScreen} />
      <Drawer.Screen name="Study Material" component={StudyMaterialScreen} />
      <Drawer.Screen name="Approved Ideas" component={ApprovedScreen} />
      <Drawer.Screen name="Rejected Ideas" component={RejectedScreen} />
      <Drawer.Screen name="Pending Ideas" component={PendingScreen} />
      <Drawer.Screen name="Hold Ideas" component={HoldScreen} />
    </Drawer.Navigator>
  );
}

// ✅ Main App with Stack + Drawer
export default function MainApp() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeDrawer" component={DrawerScreens} />
      <Stack.Screen
        name="Edit Idea"
        component={EditIdeaScreen}
        options={{
          headerShown: true,
          title: "Edit Idea",
          headerStyle: { backgroundColor: "#1E88E5" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: 280, backgroundColor: "#fff", borderRadius: 12, padding: 20, alignItems: "center" },
  cancelBtn: { padding: 10, backgroundColor: "#eee", borderRadius: 6, marginRight: 10 },
  logoutConfirmBtn: { padding: 10, backgroundColor: "#0f4c5c", borderRadius: 6 },
});
