import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
} from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Entypo,
  AntDesign,
  Feather,
} from "@expo/vector-icons";

import DashboardScreen from "./DashboardScreen";
import { Linking, Alert } from "react-native";
import CreateIdeaScreen from "./CreateIdeaScreen";
import MyIdeasScreen from "./MyIdeasScreen";
import TeamIdeasScreen from "./TeamIdeasScreen";
import AllIdeasScreen from "./AllIdeasScreen";
import ApprovalScreen from "./ApprovalScreen";
import HelpScreen from "./HelpScreen";
import StudyMaterialScreen from "./StudyMaterialScreen";

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const [manageExpanded, setManageExpanded] = useState(false);
  const [approvalExpanded, setApprovalExpanded] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

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
{/* Manage Idea */}
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
    {/* Create Idea */}
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

    {/* My Ideas */}
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

    {/* Team Ideas */}
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

    {/* All Ideas  👇 (NEW) */}
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
  </>
)}


      {/* Approval */}
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
            onPress={() => props.navigation.navigate("Approval", { filter: "Approved" })}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ fontSize: 14, color: "#fff" }}>Approved</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
            onPress={() => props.navigation.navigate("Approval", { filter: "Rejected" })}
          >
            <Ionicons name="close-circle-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ fontSize: 14, color: "#fff" }}>Rejected</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
            onPress={() => props.navigation.navigate("Approval", { filter: "Hold" })}
          >
            <Ionicons name="pause-circle-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ fontSize: 14, color: "#fff" }}>Hold</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", paddingLeft: 50, paddingVertical: 12 }}
            onPress={() => props.navigation.navigate("Approval", { filter: "Pending" })}
          >
            <Ionicons name="time-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ fontSize: 14, color: "#fff" }}>Pending</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Help */}
      {/* <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
        onPress={() => props.navigation.navigate("Help")}
      >
        <Entypo name="help-with-circle" size={20} color="#fff" style={{ marginRight: 15 }} />
        <Text style={{ fontSize: 16, color: "#fff" }}>Help</Text>
      </TouchableOpacity> */}
      <TouchableOpacity
  style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
  onPress={() => Linking.openURL("https://ideabank.abisaio.com/manuals/User_Manuals.pdf")}
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
      {/* <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
        onPress={() => props.navigation.navigate("Study Material")}
      >
        <FontAwesome5 name="book-reader" size={20} color="#fff" style={{ marginRight: 15 }} />
        <Text style={{ fontSize: 16, color: "#fff" }}>Study Material</Text>
      </TouchableOpacity> */}
      <TouchableOpacity
  style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
  onPress={() => {
    const url = "https://lms.abisaio.com/";
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Error", "Cannot open the URL");
        }
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

      {/* Custom Logout Modal */}
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
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Logout</Text>
            <Text style={{ fontSize: 14, color: "#555", marginBottom: 20 }}>
              Are you sure you want to logout?
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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

export default function MainApp() {
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
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
    </Drawer.Navigator>
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
});