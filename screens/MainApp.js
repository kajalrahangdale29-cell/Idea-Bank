import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons, MaterialIcons, FontAwesome5, Entypo, AntDesign, Feather } from '@expo/vector-icons';

import DashboardScreen from './DashboardScreen';
import CreateIdeaScreen from './CreateIdeaScreen';
import MyIdeasScreen from './MyIdeasScreen';
import TeamIdeasScreen from './TeamIdeasScreen';
import ApprovalScreen from './ApprovalScreen';
import HelpScreen from './HelpScreen';
import StudyMaterialScreen from './StudyMaterialScreen';

const Drawer = createDrawerNavigator();

function LogoutScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Are you sure you want to logout?</Text>
      <TouchableOpacity
        onPress={() => navigation.replace('Login')}
        style={{
          backgroundColor: '#d32f2f',
          padding: 12,
          borderRadius: 10,
          width: 200,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

function CustomDrawerContent(props) {
  const [manageExpanded, setManageExpanded] = useState(false);
  const [approvalExpanded, setApprovalExpanded] = useState(false);

  return (
    <DrawerContentScrollView {...props}>
      

      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}
        onPress={() => props.navigation.navigate('Dashboard')}
      >
        <MaterialIcons name="dashboard" size={20} style={{ marginRight: 15 }} />
        <Text>Dashboard</Text>
      </TouchableOpacity>

      {/* Manage Idea */}
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}
        onPress={() => setManageExpanded(!manageExpanded)}
      >
        <MaterialIcons name="lightbulb-outline" size={20} style={{ marginRight: 15 }} />
        <Text>Manage Idea {manageExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {manageExpanded && (
        <>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 50, paddingVertical: 10 }}
            onPress={() => props.navigation.navigate('Create Idea')}
          >
            <MaterialIcons name="add-circle-outline" size={18} style={{ marginRight: 10 }} />
            <Text>Create Idea</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 50, paddingVertical: 10 }}
            onPress={() => props.navigation.navigate('My Ideas')}
          >
            <Feather name="user" size={18} style={{ marginRight: 10 }} />
            <Text>My Ideas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 50, paddingVertical: 10 }}
            onPress={() => props.navigation.navigate('Team Ideas')}
          >
            <FontAwesome5 name="users" size={18} style={{ marginRight: 10 }} />
            <Text>Team Ideas</Text>
          </TouchableOpacity>
        </>
      )}

      
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}
        onPress={() => setApprovalExpanded(!approvalExpanded)}
      >
        <Ionicons name="checkmark-done-outline" size={20} style={{ marginRight: 15 }} />
        <Text>Approval {approvalExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {approvalExpanded && (
        <>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 50, paddingVertical: 10 }}
            onPress={() => props.navigation.navigate('Approval', { filter: 'Approved' })}
          >
            <Ionicons name="checkmark-circle-outline" size={18} style={{ marginRight: 10 }} />
            <Text>Approved</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 50, paddingVertical: 10 }}
            onPress={() => props.navigation.navigate('Approval', { filter: 'Rejected' })}
          >
            <Ionicons name="close-circle-outline" size={18} style={{ marginRight: 10 }} />
            <Text>Rejected</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 50, paddingVertical: 10 }}
            onPress={() => props.navigation.navigate('Approval', { filter: 'Hold' })}
          >
            <Ionicons name="pause-circle-outline" size={18} style={{ marginRight: 10 }} />
            <Text>Hold</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 50, paddingVertical: 10 }}
            onPress={() => props.navigation.navigate('Approval', { filter: 'Pending' })}
          >
            <Ionicons name="time-outline" size={18} style={{ marginRight: 10 }} />
            <Text>Pending</Text>
          </TouchableOpacity>
        </>
      )}

      
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}
        onPress={() => props.navigation.navigate('Help')}
      >
        <Entypo name="help-with-circle" size={20} style={{ marginRight: 15 }} />
        <Text>Help</Text>
      </TouchableOpacity>

      
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}
        onPress={() => props.navigation.navigate('Study Material')}
      >
        <FontAwesome5 name="book-reader" size={20} style={{ marginRight: 15 }} />
        <Text>Study Material</Text>
      </TouchableOpacity>

      
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}
        onPress={() => props.navigation.navigate('Logout')}
      >
        <AntDesign name="logout" size={20} style={{ marginRight: 15 }} />
        <Text>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

export default function MainApp() {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Drawer.Screen name="Create Idea" component={CreateIdeaScreen} />
      <Drawer.Screen name="My Ideas" component={MyIdeasScreen} />
      <Drawer.Screen name="Team Ideas" component={TeamIdeasScreen} />
      <Drawer.Screen name="Approval" component={ApprovalScreen} />
      <Drawer.Screen name="Help" component={HelpScreen} />
      <Drawer.Screen name="Study Material" component={StudyMaterialScreen} />
      <Drawer.Screen name="Logout" component={LogoutScreen} />
    </Drawer.Navigator>
  );
}