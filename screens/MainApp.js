// import React, { useState, useEffect } from "react";
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
// import { createStackNavigator } from "@react-navigation/stack";
// import {
//   Ionicons,
//   MaterialIcons,
//   FontAwesome5,
//   AntDesign,
//   Feather,
// } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";

// // Import API
// import { GET_PENDING_COUNT_URL } from "../src/context/api";

// // Import Screens
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
// import EditIdeaScreen from "./EditIdeaScreen";

// const Drawer = createDrawerNavigator();
// const Stack = createStackNavigator();

// function CustomDrawerContent(props) {
//   const [manageExpanded, setManageExpanded] = useState(false);
//   const [approvalExpanded, setApprovalExpanded] = useState(false);
//   const [logoutVisible, setLogoutVisible] = useState(false);

//   // Counts state
//   const [pendingCount, setPendingCount] = useState(0);
//   const [holdCount, setHoldCount] = useState(0);
//   const [rejectedCount, setRejectedCount] = useState(0);
//   const [totalApprovalCount, setTotalApprovalCount] = useState(0);

//   const [roleFlags, setRoleFlags] = useState({
//     isManager: false,
//     isHod: false,
//     isBETeamMember: false,
//   });

//   // Fetch role flags once on mount
//   useEffect(() => {
//     const fetchRoleFlags = async () => {
//       const isManager =
//         JSON.parse(await AsyncStorage.getItem("isManager")) || false;
//       const isHod = JSON.parse(await AsyncStorage.getItem("isHod")) || false;
//       const isBETeamMember =
//         JSON.parse(await AsyncStorage.getItem("isBETeamMember")) || false;
//       setRoleFlags({ isManager, isHod, isBETeamMember });
//     };
//     fetchRoleFlags();
//   }, []);

//   useEffect(() => {

//     if (roleFlags.isManager || roleFlags.isHod || roleFlags.isBETeamMember) {
//       // Initial fetch
//       fetchCounts();
//       const unsubscribeFocus = props.navigation.addListener('focus', () => {
//         fetchCounts();
//       });

//       const unsubscribeState = props.navigation.addListener('state', () => {
//         fetchCounts();
//       });

//       const intervalId = setInterval(() => {
//         fetchCounts();
//       }, 30000);

//       return () => {
//         unsubscribeFocus();
//         unsubscribeState();
//         clearInterval(intervalId);
//       };
//     }
//   }, [roleFlags, props.navigation]);

//   const fetchCounts = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
      
//       if (!token) {
//         return;
//       }

//       const response = await axios.get(GET_PENDING_COUNT_URL, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       let pending = 0;
//       if (roleFlags.isHod) {
//         const managerPending = response.data.pendingDetails?.managerPendingCount || 0;
//         const beTeamPending = response.data.pendingDetails?.beTeamPendingCount || 0;
//         pending = managerPending + beTeamPending;
//       } else if (roleFlags.isBETeamMember) {
//         pending = response.data.pendingDetails?.beTeamPendingCount || 0;
//       } else if (roleFlags.isManager) {
//         pending = response.data.pendingDetails?.managerPendingCount || 0;
//       }

//       const hold = response.data.pendingDetails?.holdCount || 0;
//       const rejected = response.data.pendingDetails?.rejectedCount || 0;
      
//       setPendingCount(pending);
//       setHoldCount(hold);
//       setRejectedCount(rejected);
//       setTotalApprovalCount(pending + hold + rejected);
//     } catch (error) {
//       if (error.response) {
//       }
//     }
//   };

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
//         <Ionicons
//           name="grid-outline"
//           size={20}
//           color="#fff"
//           style={{ marginRight: 15 }}
//         />
//         <Text style={{ fontSize: 16, color: "#fff" }}>Dashboard</Text>
//       </TouchableOpacity>

//       {/* Manage Idea (Expandable) */}
//       <TouchableOpacity
//         style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
//         onPress={() => setManageExpanded(!manageExpanded)}
//       >
//         <MaterialIcons
//           name="lightbulb-outline"
//           size={20}
//           color="#fff"
//           style={{ marginRight: 15 }}
//         />
//         <Text style={{ fontSize: 16, color: "#fff" }}>
//           Manage Idea {manageExpanded ? "▲" : "▼"}
//         </Text>
//       </TouchableOpacity>

//       {manageExpanded && (
//         <>
//           {/* Create Idea - All roles */}
//           <TouchableOpacity
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               paddingLeft: 50,
//               paddingVertical: 12,
//             }}
//             onPress={() => props.navigation.navigate("Create Idea")}
//           >
//             <MaterialIcons
//               name="add-circle-outline"
//               size={18}
//               color="#fff"
//               style={{ marginRight: 10 }}
//             />
//             <Text style={{ fontSize: 14, color: "#fff" }}>Create Idea</Text>
//           </TouchableOpacity>

//           {/* My Ideas - All roles */}
//           <TouchableOpacity
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               paddingLeft: 50,
//               paddingVertical: 12,
//             }}
//             onPress={() => props.navigation.navigate("My Ideas")}
//           >
//             <Feather
//               name="user"
//               size={18}
//               color="#fff"
//               style={{ marginRight: 10 }}
//             />
//             <Text style={{ fontSize: 14, color: "#fff" }}>My Ideas</Text>
//           </TouchableOpacity>

//           {/* Team Ideas - Manager, HOD, or BE Team */}
//           {(roleFlags.isManager || roleFlags.isHod || roleFlags.isBETeamMember) && (
//             <TouchableOpacity
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 paddingLeft: 50,
//                 paddingVertical: 12,
//               }}
//               onPress={() => props.navigation.navigate("Team Ideas")}
//             >
//               <FontAwesome5
//                 name="users"
//                 size={18}
//                 color="#fff"
//                 style={{ marginRight: 10 }}
//               />
//               <Text style={{ fontSize: 14, color: "#fff" }}>Team Ideas</Text>
//             </TouchableOpacity>
//           )}

//           {/* All Ideas - Only BE Team Members */}
//           {roleFlags.isBETeamMember && (
//             <TouchableOpacity
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 paddingLeft: 50,
//                 paddingVertical: 12,
//               }}
//               onPress={() => props.navigation.navigate("All Ideas")}
//             >
//               <MaterialIcons
//                 name="list-alt"
//                 size={18}
//                 color="#fff"
//                 style={{ marginRight: 10 }}
//               />
//               <Text style={{ fontSize: 14, color: "#fff" }}>All Ideas</Text>
//             </TouchableOpacity>
//           )}
//         </>
//       )}

//       {/* Approval Section - HOD, Manager, or BE Team */}
//       {(roleFlags.isHod || roleFlags.isManager || roleFlags.isBETeamMember) && (
//         <>
//           <TouchableOpacity
//             style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
//             onPress={() => setApprovalExpanded(!approvalExpanded)}
//           >
//             <Ionicons
//               name="checkmark-done-outline"
//               size={20}
//               color="#fff"
//               style={{ marginRight: 15 }}
//             />
//             <Text style={{ fontSize: 16, color: "#fff" }}>
//               Approval {approvalExpanded ? "▲" : "▼"}
//             </Text>
//             {totalApprovalCount > 0 && (
//               <View style={styles.badge}>
//                 <Text style={styles.badgeText}>{totalApprovalCount}</Text>
//               </View>
//             )}
//           </TouchableOpacity>

//           {approvalExpanded && (
//             <>
//               {/* Approved Ideas */}
//               <TouchableOpacity
//                 style={{
//                   flexDirection: "row",
//                   alignItems: "center",
//                   paddingLeft: 50,
//                   paddingVertical: 12,
//                 }}
//                 onPress={() => props.navigation.navigate("Approved Ideas")}
//               >
//                 <Ionicons
//                   name="checkmark-circle"
//                   size={18}
//                   color="#fff"
//                   style={{ marginRight: 10 }}
//                 />
//                 <Text style={{ fontSize: 14, color: "#fff" }}>Approved</Text>
//               </TouchableOpacity>

//               {/* Rejected Ideas */}
//               <TouchableOpacity
//                 style={{
//                   flexDirection: "row",
//                   alignItems: "center",
//                   paddingLeft: 50,
//                   paddingVertical: 12,
//                 }}
//                 onPress={() => props.navigation.navigate("Rejected Ideas")}
//               >
//                 <Ionicons
//                   name="close-circle-outline"
//                   size={18}
//                   color="#fff"
//                   style={{ marginRight: 10 }}
//                 />
//                 <Text style={{ fontSize: 14, color: "#fff" }}>Rejected</Text>
//                 {rejectedCount > 0 && (
//                   <View style={styles.badge}>
//                     <Text style={styles.badgeText}>{rejectedCount}</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>

//               {/* Pending Ideas */}
//               <TouchableOpacity
//                 style={{
//                   flexDirection: "row",
//                   alignItems: "center",
//                   paddingLeft: 50,
//                   paddingVertical: 12,
//                 }}
//                 onPress={() => props.navigation.navigate("Pending Ideas")}
//               >
//                 <Ionicons
//                   name="time-outline"
//                   size={18}
//                   color="#fff"
//                   style={{ marginRight: 10 }}
//                 />
//                 <Text style={{ fontSize: 14, color: "#fff" }}>Pending</Text>
//                 {pendingCount > 0 && (
//                   <View style={styles.badge}>
//                     <Text style={styles.badgeText}>{pendingCount}</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>

//               {/* Hold Ideas */}
//               <TouchableOpacity
//                 style={{
//                   flexDirection: "row",
//                   alignItems: "center",
//                   paddingLeft: 50,
//                   paddingVertical: 12,
//                 }}
//                 onPress={() => props.navigation.navigate("Hold Ideas")}
//               >
//                 <Ionicons
//                   name="pause-circle-outline"
//                   size={18}
//                   color="#fff"
//                   style={{ marginRight: 10 }}
//                 />
//                 <Text style={{ fontSize: 14, color: "#fff" }}>Hold</Text>
//                 {holdCount > 0 && (
//                   <View style={styles.badge}>
//                     <Text style={styles.badgeText}>{holdCount}</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//             </>
//           )}
//         </>
//       )}

//       {/* Help */}
//       <TouchableOpacity
//         style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
//         onPress={() =>
//           Linking.openURL(
//             "https://ideabank.abisaio.com/manuals/User_Manuals.pdf"
//           )
//         }
//       >
//         <FontAwesome5
//           name="question-circle"
//           size={20}
//           color="#fff"
//           style={{ marginRight: 15 }}
//         />
//         <Text style={{ fontSize: 16, color: "#fff" }}>Help</Text>
//       </TouchableOpacity>

//       {/* Study Material */}
//       <TouchableOpacity
//         style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
//         onPress={() => {
//           const url = "https://lms.abisaio.com/";
//           Linking.canOpenURL(url)
//             .then((supported) => {
//               if (supported) Linking.openURL(url);
//               else Alert.alert("Error", "Cannot open the URL");
//             })
//             .catch((err) => console.error("An error occurred", err));
//         }}
//       >
//         <FontAwesome5
//           name="book-reader"
//           size={20}
//           color="#fff"
//           style={{ marginRight: 15 }}
//         />
//         <Text style={{ fontSize: 16, color: "#fff" }}>Study Material</Text>
//       </TouchableOpacity>

//       {/* Logout */}
//       <TouchableOpacity
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           padding: 15,
//           marginTop: 2,
//         }}
//         onPress={() => setLogoutVisible(true)}
//       >
//         <AntDesign
//           name="logout"
//           size={20}
//           color="#fff"
//           style={{ marginRight: 15 }}
//         />
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
//             <Image
//               source={require("../assets/logout.png")}
//               style={{ width: 50, height: 50, marginBottom: 15 }}
//             />
//             <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
//               Logout
//             </Text>
//             <Text style={{ fontSize: 14, color: "#555", marginBottom: 20 }}>
//               Are you sure you want to logout?
//             </Text>
//             <View
//               style={{ flexDirection: "row", justifyContent: "space-between" }}
//             >
//               <TouchableOpacity
//                 style={styles.cancelBtn}
//                 onPress={() => setLogoutVisible(false)}
//               >
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

// // DrawerScreens Component
// function DrawerScreens() {
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
//             <TouchableOpacity
//               onPress={() => {
//                 if (navigation.canGoBack()) navigation.goBack();
//                 else navigation.navigate("Dashboard");
//               }}
//               style={{ marginLeft: 10 }}
//             >
//               <Ionicons name="arrow-back" size={24} color="#fff" />
//             </TouchableOpacity>
//           ) : null,
//       })}
//     >
//       <Drawer.Screen
//         name="Dashboard"
//         component={DashboardScreen}
//         options={{ headerShown: false }}
//       />
//       <Drawer.Screen name="Create Idea" component={CreateIdeaScreen} />
//       <Drawer.Screen name="My Ideas" component={MyIdeasScreen} />
//       <Drawer.Screen name="Team Ideas" component={TeamIdeasScreen} />
//       <Drawer.Screen name="All Ideas" component={AllIdeasScreen} />
//       <Drawer.Screen name="Approval" component={ApprovalScreen} />
//       <Drawer.Screen name="Study Material" component={StudyMaterialScreen} />
//       <Drawer.Screen name="Approved Ideas" component={ApprovedScreen} />
//       <Drawer.Screen name="Rejected Ideas" component={RejectedScreen} />
//       <Drawer.Screen name="Pending Ideas" component={PendingScreen} />
//       <Drawer.Screen name="Hold Ideas" component={HoldScreen} />
//     </Drawer.Navigator>
//   );
// }

// // Main App Component
// export default function MainApp() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="HomeDrawer" component={DrawerScreens} />
//       <Stack.Screen
//         name="Edit Idea"
//         component={EditIdeaScreen}
//         options={{
//           headerShown: true,
//           title: "Edit Idea Form",
//           headerStyle: { backgroundColor: "#0f4c5c" },
//           headerTintColor: "#fff",
//           headerTitleStyle: { fontWeight: "bold" },
//         }}
//       />
//     </Stack.Navigator>
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
//   badge: {
//     backgroundColor: "#ff0000",
//     borderRadius: 10,
//     minWidth: 20,
//     height: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 8,
//     paddingHorizontal: 6,
//   },
//   badgeText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "bold",
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
import { createStackNavigator } from "@react-navigation/stack";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  AntDesign,
  Feather,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Import API
import { GET_PENDING_COUNT_URL } from "../src/context/api";

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
import EditIdeaScreen from "./EditIdeaScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function CustomDrawerContent(props) {
  const [manageExpanded, setManageExpanded] = useState(false);
  const [approvalExpanded, setApprovalExpanded] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  // Counts state - ONLY Pending and Hold
  const [pendingCount, setPendingCount] = useState(0);
  const [holdCount, setHoldCount] = useState(0);
  const [totalApprovalCount, setTotalApprovalCount] = useState(0);

  const [roleFlags, setRoleFlags] = useState({
    isManager: false,
    isHod: false,
    isBETeamMember: false,
  });

  // Fetch role flags once on mount
  useEffect(() => {
    const fetchRoleFlags = async () => {
      const isManager =
        JSON.parse(await AsyncStorage.getItem("isManager")) || false;
      const isHod = JSON.parse(await AsyncStorage.getItem("isHod")) || false;
      const isBETeamMember =
        JSON.parse(await AsyncStorage.getItem("isBETeamMember")) || false;
      setRoleFlags({ isManager, isHod, isBETeamMember });
    };
    fetchRoleFlags();
  }, []);

  useEffect(() => {
    if (roleFlags.isManager || roleFlags.isHod || roleFlags.isBETeamMember) {
      // Initial fetch
      fetchCounts();
      const unsubscribeFocus = props.navigation.addListener('focus', () => {
        fetchCounts();
      });

      const unsubscribeState = props.navigation.addListener('state', () => {
        fetchCounts();
      });

      const intervalId = setInterval(() => {
        fetchCounts();
      }, 30000);

      return () => {
        unsubscribeFocus();
        unsubscribeState();
        clearInterval(intervalId);
      };
    }
  }, [roleFlags, props.navigation]);

  const fetchCounts = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        return;
      }

      const response = await axios.get(GET_PENDING_COUNT_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let pending = 0;
      if (roleFlags.isHod) {
        const managerPending = response.data.pendingDetails?.managerPendingCount || 0;
        const beTeamPending = response.data.pendingDetails?.beTeamPendingCount || 0;
        pending = managerPending + beTeamPending;
      } else if (roleFlags.isBETeamMember) {
        pending = response.data.pendingDetails?.beTeamPendingCount || 0;
      } else if (roleFlags.isManager) {
        pending = response.data.pendingDetails?.managerPendingCount || 0;
      }

      const hold = response.data.pendingDetails?.holdCount || 0;
      
      // FIXED: Only Pending + Hold count, NO rejected count
      setPendingCount(pending);
      setHoldCount(hold);
      setTotalApprovalCount(pending + hold);
    } catch (error) {
      if (error.response) {
        console.error("Error fetching counts:", error.response.data);
      }
    }
  };

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
        <Ionicons
          name="grid-outline"
          size={20}
          color="#fff"
          style={{ marginRight: 15 }}
        />
        <Text style={{ fontSize: 16, color: "#fff" }}>Dashboard</Text>
      </TouchableOpacity>

      {/* Manage Idea (Expandable) */}
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
        onPress={() => setManageExpanded(!manageExpanded)}
      >
        <MaterialIcons
          name="lightbulb-outline"
          size={20}
          color="#fff"
          style={{ marginRight: 15 }}
        />
        <Text style={{ fontSize: 16, color: "#fff" }}>
          Manage Idea {manageExpanded ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>

      {manageExpanded && (
        <>
          {/* Create Idea - All roles */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingLeft: 50,
              paddingVertical: 12,
            }}
            onPress={() => props.navigation.navigate("Create Idea")}
          >
            <MaterialIcons
              name="add-circle-outline"
              size={18}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={{ fontSize: 14, color: "#fff" }}>Create Idea</Text>
          </TouchableOpacity>

          {/* My Ideas - All roles */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingLeft: 50,
              paddingVertical: 12,
            }}
            onPress={() => props.navigation.navigate("My Ideas")}
          >
            <Feather
              name="user"
              size={18}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={{ fontSize: 14, color: "#fff" }}>My Ideas</Text>
          </TouchableOpacity>

          {/* Team Ideas - Manager, HOD, or BE Team */}
          {(roleFlags.isManager || roleFlags.isHod || roleFlags.isBETeamMember) && (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingLeft: 50,
                paddingVertical: 12,
              }}
              onPress={() => props.navigation.navigate("Team Ideas")}
            >
              <FontAwesome5
                name="users"
                size={18}
                color="#fff"
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 14, color: "#fff" }}>Team Ideas</Text>
            </TouchableOpacity>
          )}

          {/* All Ideas - Only BE Team Members */}
          {roleFlags.isBETeamMember && (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingLeft: 50,
                paddingVertical: 12,
              }}
              onPress={() => props.navigation.navigate("All Ideas")}
            >
              <MaterialIcons
                name="list-alt"
                size={18}
                color="#fff"
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 14, color: "#fff" }}>All Ideas</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Approval Section - HOD, Manager, or BE Team */}
      {(roleFlags.isHod || roleFlags.isManager || roleFlags.isBETeamMember) && (
        <>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
            onPress={() => setApprovalExpanded(!approvalExpanded)}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={20}
              color="#fff"
              style={{ marginRight: 15 }}
            />
            <Text style={{ fontSize: 16, color: "#fff" }}>
              Approval {approvalExpanded ? "▲" : "▼"}
            </Text>
            {/* FIXED: Only show badge if total count > 0 */}
            {totalApprovalCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalApprovalCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {approvalExpanded && (
            <>
              {/* Approved Ideas - NO BADGE */}
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingLeft: 50,
                  paddingVertical: 12,
                }}
                onPress={() => props.navigation.navigate("Approved Ideas")}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
                <Text style={{ fontSize: 14, color: "#fff" }}>Approved</Text>
              </TouchableOpacity>

              {/* Rejected Ideas - NO BADGE */}
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingLeft: 50,
                  paddingVertical: 12,
                }}
                onPress={() => props.navigation.navigate("Rejected Ideas")}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
                <Text style={{ fontSize: 14, color: "#fff" }}>Rejected</Text>
              </TouchableOpacity>

              {/* Pending Ideas - WITH BADGE */}
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingLeft: 50,
                  paddingVertical: 12,
                }}
                onPress={() => props.navigation.navigate("Pending Ideas")}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
                <Text style={{ fontSize: 14, color: "#fff" }}>Pending</Text>
                {pendingCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{pendingCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Hold Ideas - WITH BADGE */}
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingLeft: 50,
                  paddingVertical: 12,
                }}
                onPress={() => props.navigation.navigate("Hold Ideas")}
              >
                <Ionicons
                  name="pause-circle-outline"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
                <Text style={{ fontSize: 14, color: "#fff" }}>Hold</Text>
                {holdCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{holdCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </>
          )}
        </>
      )}

      {/* Help */}
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
        onPress={() =>
          Linking.openURL(
            "https://ideabank.abisaio.com/manuals/User_Manuals.pdf"
          )
        }
      >
        <FontAwesome5
          name="question-circle"
          size={20}
          color="#fff"
          style={{ marginRight: 15 }}
        />
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
        <FontAwesome5
          name="book-reader"
          size={20}
          color="#fff"
          style={{ marginRight: 15 }}
        />
        <Text style={{ fontSize: 16, color: "#fff" }}>Study Material</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 15,
          marginTop: 2,
        }}
        onPress={() => setLogoutVisible(true)}
      >
        <AntDesign
          name="logout"
          size={20}
          color="#fff"
          style={{ marginRight: 15 }}
        />
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
            <Image
              source={require("../assets/logout.png")}
              style={{ width: 50, height: 50, marginBottom: 15 }}
            />
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
              Logout
            </Text>
            <Text style={{ fontSize: 14, color: "#555", marginBottom: 20 }}>
              Are you sure you want to logout?
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setLogoutVisible(false)}
              >
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

// DrawerScreens Component
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
            <TouchableOpacity
              onPress={() => {
                if (navigation.canGoBack()) navigation.goBack();
                else navigation.navigate("Dashboard");
              }}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ) : null,
      })}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
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

// Main App Component
export default function MainApp() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeDrawer" component={DrawerScreens} />
      <Stack.Screen
        name="Edit Idea"
        component={EditIdeaScreen}
        options={{
          headerShown: true,
          title: "Edit Idea Form",
          headerStyle: { backgroundColor: "#0f4c5c" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  cancelBtn: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 6,
    marginRight: 10,
  },
  logoutConfirmBtn: {
    padding: 10,
    backgroundColor: "#0f4c5c",
    borderRadius: 6,
  },
  badge: {
    backgroundColor: "#ff0000",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});