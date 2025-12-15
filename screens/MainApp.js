import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  Linking,
  BackHandler,
} from "react-native";
import { Image } from 'expo-image';
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
import { GET_PENDING_COUNT_URL } from "../src/context/api";
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
import ManagerEditIdeaScreen from "./ManagerEditIdeaScreen";
import ImplementationDetailsScreen from "../src/context/ImplementationDetailsScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function CustomDrawerContent(props) {
  const [manageExpanded, setManageExpanded] = useState(false);
  const [approvalExpanded, setApprovalExpanded] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [holdCount, setHoldCount] = useState(0);
  const [totalApprovalCount, setTotalApprovalCount] = useState(0);

  const [roleFlags, setRoleFlags] = useState({
    isManager: false,
    isHod: false,
    isBETeamMember: false,
  });
  
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
        style={styles.drawerItem}
        onPress={() => props.navigation.navigate("Dashboard")}
      >
        <Ionicons
          name="grid-outline"
          size={20}
          color="#fff"
          style={styles.drawerIcon}
        />
        <Text style={styles.drawerText}>Dashboard</Text>
      </TouchableOpacity>

      {/* Manage Idea */}
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => setManageExpanded(!manageExpanded)}
      >
        <MaterialIcons
          name="lightbulb-outline"
          size={20}
          color="#fff"
          style={styles.drawerIcon}
        />
        <Text style={styles.drawerText}>Manage Idea</Text>
        <Text style={styles.expandIcon}>{manageExpanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {manageExpanded && (
        <>
          {/* Create Idea */}
          <TouchableOpacity
            style={styles.subDrawerItem}
            onPress={() => props.navigation.navigate("Create Idea")}
          >
            <MaterialIcons
              name="add-circle-outline"
              size={18}
              color="#fff"
              style={styles.subDrawerIcon}
            />
            <Text style={styles.subDrawerText}>Create Idea</Text>
          </TouchableOpacity>

          {/* My Ideas */}
          <TouchableOpacity
            style={styles.subDrawerItem}
            onPress={() => props.navigation.navigate("My Ideas")}
          >
            <Feather
              name="user"
              size={18}
              color="#fff"
              style={styles.subDrawerIcon}
            />
            <Text style={styles.subDrawerText}>My Ideas</Text>
          </TouchableOpacity>

          {/* Team Ideas */}
          {roleFlags.isManager && (
            <TouchableOpacity
              style={styles.subDrawerItem}
              onPress={() => props.navigation.navigate("Team Ideas")}
            >
              <FontAwesome5
                name="users"
                size={18}
                color="#fff"
                style={styles.subDrawerIcon}
              />
              <Text style={styles.subDrawerText}>Team Ideas</Text>
            </TouchableOpacity>
          )}

          {/* All Ideas */}
          {roleFlags.isBETeamMember && (
            <TouchableOpacity
              style={styles.subDrawerItem}
              onPress={() => props.navigation.navigate("All Ideas")}
            >
              <MaterialIcons
                name="list-alt"
                size={18}
                color="#fff"
                style={styles.subDrawerIcon}
              />
              <Text style={styles.subDrawerText}>All Ideas</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Approval Section */}
      {(roleFlags.isHod || roleFlags.isManager || roleFlags.isBETeamMember) && (
        <>
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => setApprovalExpanded(!approvalExpanded)}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={20}
              color="#fff"
              style={styles.drawerIcon}
            />
            <Text style={styles.drawerText}>Approval</Text>
            <Text style={styles.expandIcon}>{approvalExpanded ? "▲" : "▼"}</Text>
            {totalApprovalCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalApprovalCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {approvalExpanded && (
            <>
              {/* Approved */}
              <TouchableOpacity
                style={styles.subDrawerItem}
                onPress={() => props.navigation.navigate("Approved Ideas")}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#fff"
                  style={styles.subDrawerIcon}
                />
                <Text style={styles.subDrawerText}>Approved</Text>
              </TouchableOpacity>

              {/* Rejected */}
              <TouchableOpacity
                style={styles.subDrawerItem}
                onPress={() => props.navigation.navigate("Rejected Ideas")}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color="#fff"
                  style={styles.subDrawerIcon}
                />
                <Text style={styles.subDrawerText}>Rejected</Text>
              </TouchableOpacity>

              {/* Pending */}
              <TouchableOpacity
                style={styles.subDrawerItem}
                onPress={() => props.navigation.navigate("Pending Ideas")}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color="#fff"
                  style={styles.subDrawerIcon}
                />
                <Text style={styles.subDrawerText}>Pending</Text>
                {pendingCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{pendingCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Hold */}
              <TouchableOpacity
                style={styles.subDrawerItem}
                onPress={() => props.navigation.navigate("Hold Ideas")}
              >
                <Ionicons
                  name="pause-circle-outline"
                  size={18}
                  color="#fff"
                  style={styles.subDrawerIcon}
                />
                <Text style={styles.subDrawerText}>Hold</Text>
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
        style={styles.drawerItem}
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
          style={styles.drawerIcon}
        />
        <Text style={styles.drawerText}>Help</Text>
      </TouchableOpacity>

      {/* Study Material */}
      <TouchableOpacity
        style={styles.drawerItem}
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
          style={styles.drawerIcon}
        />
        <Text style={styles.drawerText}>Study Material</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => setLogoutVisible(true)}
      >
        <AntDesign
          name="logout"
          size={20}
          color="#fff"
          style={styles.drawerIcon}
        />
        <Text style={styles.drawerText}>Logout</Text>
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
              contentFit="contain"
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
                onPress={async () => {
                  setLogoutVisible(false);
                  await AsyncStorage.clear();
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

function DrawerScreens() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation, route }) => ({
        headerStyle: { backgroundColor: "#0f4c5c" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        drawerStyle: { 
          backgroundColor: "#0f4c5c",
          width: 280, 
        },
        drawerActiveBackgroundColor: "#4aa3c0",
        drawerInactiveTintColor: "#fff",
        drawerActiveTintColor: "#fff",
        headerLeft: () =>
          route.name !== "Dashboard" ? (
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="menu" size={24} color="#fff" />
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

function DrawerScreensWithBackHandler() {
  const navigationRef = React.useRef();

  useEffect(() => {
    const backAction = () => {
      if (navigationRef.current) {
        const state = navigationRef.current.getState();
        const currentRoute = state.routes[state.index];
        
        if (currentRoute.name === 'Dashboard') {
          Alert.alert(
            'Exit App',
            'Are you sure you want to exit?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Exit', onPress: () => BackHandler.exitApp() }
            ]
          );
          return true;
        }
        
        navigationRef.current.openDrawer();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return <DrawerScreens ref={navigationRef} />;
}

export default function MainApp() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeDrawer" component={DrawerScreensWithBackHandler} />
      
      <Stack.Screen
        name="EditIdea"
        component={EditIdeaScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Edit Idea Form",
          headerStyle: { backgroundColor: "#0f4c5c" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="ManagerEditIdea"
        component={ManagerEditIdeaScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Edit Idea (Manager)",
          headerStyle: { backgroundColor: "#0f4c5c" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="ImplementationDetails"
        component={ImplementationDetailsScreen}
        options={({ navigation }) => ({
          headerShown: false,
          title: "Implementation Details",
          headerStyle: { backgroundColor: "#0f4c5c" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingRight: 10,
  },
  drawerIcon: {
    marginRight: 15,
    width: 20,
  },
  drawerText: {
    fontSize: 16,
    color: "#fff",
    flex: 1,
    flexWrap: "wrap",
  },
  expandIcon: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 5,
  },

  subDrawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 50,
    paddingRight: 10,
    paddingVertical: 12,
  },
  subDrawerIcon: {
    marginRight: 10,
    width: 18,
  },
  subDrawerText: {
    fontSize: 14,
    color: "#fff",
    flex: 1,
    flexWrap: "wrap",
  },

  badge: {
    backgroundColor: "#ff0000",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },

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
});

// Old code:
 // {(roleFlags.isManager || roleFlags.isHod || roleFlags.isBETeamMember) && (
 //   <TouchableOpacity onPress={() => props.navigation.navigate("Team Ideas")}>
  //     <Text>Team Ideas</Text>
  //   </TouchableOpacity>
  // )}