// import { useNavigation, useRoute } from '@react-navigation/native';
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
//   Image,
//   Modal
// } from 'react-native';
// import { EMPLOYEE_GET_URL } from '../src/context/api';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Picker } from '@react-native-picker/picker';
// import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import * as ImagePicker from 'expo-image-picker';

// export default function EditIdeaScreen() {
//   const navigation = useNavigation();
//   const route = useRoute();

//   const ideaData = route.params?.ideaData || {};

//   const [activeTab, setActiveTab] = useState('idea');
//   const [userDetails, setUserDetails] = useState(null);

//   const [ideaDescription, setIdeaDescription] = useState(ideaData.ideaDescription || '');
//   const [proposedSolution, setProposedSolution] = useState(ideaData.proposedSolution || '');
//   const [solutionCategory, setSolutionCategory] = useState(ideaData.solutionCategory || '');
//   const [ideaTheme, setIdeaTheme] = useState(ideaData.ideaTheme || '');
//   const [benefit, setBenefit] = useState(ideaData.tentativeBenefit || '');
//   const [teamMembers, setTeamMembers] = useState(ideaData.teamMembers || '');
//   const [mobileNumber, setMobileNumber] = useState(ideaData.mobileNumber || '');
//   const [date, setDate] = useState(
//     ideaData.plannedImplementationDuration
//       ? new Date(ideaData.plannedImplementationDuration)
//       : new Date()
//   );

//   const [image, setImage] = useState(ideaData.imagePath || null);
//   const [beSupportNeeded, setBeSupportNeeded] = useState(ideaData.isBETeamSupportNeeded || null);
//   const [canImplementOtherLocation, setCanImplementOtherLocation] = useState(
//     ideaData.canBeImplementedToOtherLocations || null
//   );

//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showPreview, setShowPreview] = useState(false);
//   const [fullScreen, setFullScreen] = useState(false);

//   useEffect(() => {
//     const fetchEmployeeDetails = async () => {
//       if (activeTab !== 'employee') return;
//       try {
//         const token = await AsyncStorage.getItem('token');
//         if (!token) return;
//         const response = await fetch(EMPLOYEE_GET_URL, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         const data = await response.json();
//         setUserDetails({
//           employeeNo: data.data.ideaOwnerEmployeeNo || '',
//           name: data.data.ideaOwnerName || '',
//           email: data.data.ideaOwnerEmail || '',
//           department: data.data.ideaOwnerDepartment || '',
//           subDepartment: data.data.ideaOwnerSubDepartment || '',
//           location: data.data.location || '',
//           reportingManagerName: data.data.reportingManagerName || '',
//           reportingManagerEmail: data.data.reportingManagerEmail || '',
//         });
//       } catch (error) {
//         console.error('Error fetching employee details:', error);
//       }
//     };
//     fetchEmployeeDetails();
//   }, [activeTab]);

//   // Image Picker
//   const pickImage = async () => {
//     console.log("image button pressed"); // Debug
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission Denied', 'We need access to your photo library.');
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       console.log("Image selected:", result.assets[0].uri); // Debug
//       setImage(result.assets[0].uri);
//     }
//   };

//   // Date Picker
//   const onChangeDate = (event, selectedDate) => {
//     setShowDatePicker(false);
//     if (selectedDate) {
//       console.log("Date selected:", selectedDate.toDateString()); // Debug
//       setDate(selectedDate);
//     }
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: '#F5F8FF' }}>
//       <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
//         <Text style={styles.pageTitle}>Edit Idea Form</Text>

//         {/* Tabs */}
//         <View style={styles.tabContainer}>
//           <TouchableOpacity
//             style={[styles.tabButton, activeTab === 'idea' && styles.tabActive]}
//             onPress={() => setActiveTab('idea')}
//           >
//             <Text style={[styles.tabText, activeTab === 'idea' && styles.tabTextActive]}>
//               Idea Form
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.tabButton, activeTab === 'employee' && styles.tabActive]}
//             onPress={() => setActiveTab('employee')}
//           >
//             <Text style={[styles.tabText, activeTab === 'employee' && styles.tabTextActive]}>
//               Employee Details
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {activeTab === 'employee' ? (
//           <View style={styles.card}>
//             {userDetails ? (
//               <>
//                 <FieldRow label="Idea Owner Employee No:" value={userDetails.employeeNo} />
//                 <FieldRow label="Owner Name:" value={userDetails.name} />
//                 <FieldRow label="Owner Email:" value={userDetails.email} />
//                 <FieldRow label="Owner Department:" value={userDetails.department} />
//                 <FieldRow label="Owner Sub Department:" value={userDetails.subDepartment} />
//                 <FieldRow label="Owner Location:" value={userDetails.location} />
//                 <FieldRow label="Reporting Manager Name:" value={userDetails.reportingManagerName} />
//                 <FieldRow label="Reporting Manager Email:" value={userDetails.reportingManagerEmail} />
//               </>
//             ) : (
//               <Text style={styles.loadingText}>Loading employee details...</Text>
//             )}
//           </View>
//         ) : (
//           <View style={styles.card}>
//             <InputField
//               label="Idea/Opportunity Description"
//               required
//               icon={<MaterialIcons name="title" size={20} color="#666" />}
//               value={ideaDescription}
//               onChangeText={setIdeaDescription}
//             />
//             <InputField
//               label="Proposed Solution"
//               required
//               icon={<MaterialIcons name="description" size={20} color="#666" />}
//               value={proposedSolution}
//               onChangeText={setProposedSolution}
//               multiline
//             />
//             <InputField
//               label="Process Improvement/Cost Benefit"
//               required
//               icon={<FontAwesome name="lightbulb-o" size={20} color="#666" />}
//               value={benefit}
//               onChangeText={setBenefit}
//               multiline
//             />
//             <InputField
//               label="Team Members"
//               icon={<MaterialIcons name="group" size={20} color="#666" />}
//               value={teamMembers}
//               onChangeText={setTeamMembers}
//             />

//             <PickerField
//               label="Solution Category"
//               icon={<Ionicons name="bulb-outline" size={20} color="#666" />}
//               selectedValue={solutionCategory}
//               onValueChange={setSolutionCategory}
//               options={[
//                 'Quick Win',
//                 'Kaizen',
//                 'Lean',
//                 'Six Sigma Yellow Belt',
//                 'Six Sigma Green Belt',
//                 'WorkPlace Management',
//                 'Automation',
//                 'Cost Saving',
//                 'Business Improvement',
//                 'Efficiency Improvement',
//                 'Others',
//               ]}
//             />

//             <PickerField
//               label="Idea Theme"
//               icon={<MaterialIcons name="category" size={20} color="#666" />}
//               selectedValue={ideaTheme}
//               onValueChange={setIdeaTheme}
//               options={[
//                 'Productivity',
//                 'Quality',
//                 'Cost',
//                 'Delivery',
//                 'Safety',
//                 'Morale',
//                 'Environment',
//               ]}
//             />

//             <InputField
//               label="Mobile Number"
//               required
//               icon={<Feather name="phone" size={20} color="#666" />}
//               value={mobileNumber}
//               onChangeText={setMobileNumber}
//             />

//             {/* Image Upload */}
//             <View style={styles.inputBlock}>
//               <Text style={styles.label}>Upload Image</Text>
//               <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
//                 <Feather name="image" size={20} color="#fff" />
//                 <Text style={styles.uploadText}>Choose Image</Text>
//               </TouchableOpacity>
//               {image && (
//                 <TouchableOpacity onPress={() => setShowPreview(!showPreview)} style={{ marginTop: 8 }}>
//                   <Feather name="eye" size={20} color="#000" />
//                 </TouchableOpacity>
//               )}
//               {image && showPreview && (
//                 <TouchableOpacity onPress={() => setFullScreen(true)}>
//                   <Image
//                     source={{ uri: image }}
//                     style={{ width: '100%', height: 200, borderRadius: 10, marginTop: 10 }}
//                   />
//                 </TouchableOpacity>
//               )}
//             </View>

//             {/* Date Picker */}
//             <View style={styles.inputBlock}>
//               <Text style={styles.label}>Completion Date</Text>
//               <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
//                 <Feather name="calendar" size={20} color="#fff" />
//                 <Text style={styles.uploadText}>Select Date</Text>
//               </TouchableOpacity>
//               {date && <Text style={styles.dateText}>{date.toDateString()}</Text>}
//               {showDatePicker && (
//                 <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
//               )}
//             </View>
//             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
//           <TouchableOpacity 
//       style={{ 
//       flex: 1, 
//       backgroundColor: '#FFC107', 
//       paddingVertical: 14, 
//       borderRadius: 12, 
//       marginRight: 10, 
//       alignItems: 'center' 
//     }} 
//     onPress={() => console.log("Save as Draft pressed")}
//   >
//     <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Save as Draft</Text>
//   </TouchableOpacity>

//   <TouchableOpacity 
//     style={{ 
//       flex: 1, 
//       backgroundColor: '#00BFA5', 
//       paddingVertical: 14, 
//       borderRadius: 12, 
//       marginLeft: 10, 
//       alignItems: 'center' 
//     }} 
//     onPress={() => console.log("Submit pressed")}
//   >
//     <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Submit</Text>
//   </TouchableOpacity>
// </View>

            
//           </View>
//         )}
//       </ScrollView>

//       <Modal visible={fullScreen} transparent={true} onRequestClose={() => setFullScreen(false)}>
//         <View style={styles.modalOverlay}>
//           <TouchableOpacity style={styles.closeButton} onPress={() => setFullScreen(false)}>
//             <Ionicons name="close" size={30} color="#fff" />
//           </TouchableOpacity>
//           {image && <Image source={{ uri: image }} style={styles.fullScreenImage} resizeMode="contain" />}
//         </View>
//       </Modal>
//     </View>
//   );
// }

// // Input Field Component
// const InputField = ({ label, icon, value, onChangeText, multiline, required }) => (
//   <View style={styles.inputBlock}>
//     <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
//     <View style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}>
//       {icon}
//       <TextInput 
//         style={[styles.input, multiline && styles.textArea]} 
//         value={value} 
//         onChangeText={onChangeText} 
//         multiline={multiline}
//         placeholder={`Enter ${label.toLowerCase()}...`}
//       />
//     </View>
//   </View>
// );

// // Picker Field Component
// const PickerField = ({ label, icon, selectedValue, onValueChange, options }) => (
//   <View style={styles.inputBlock}>
//     <Text style={styles.label}>{label}</Text>
//     <View style={styles.inputWrapper}>
//       {icon}
//       <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker}>
//         <Picker.Item label="Select" value="" />
//         {options.map((option, index) => <Picker.Item label={option} value={option} key={index} />)}
//       </Picker>
//     </View>
//   </View>
// );

// // Field Row Component
// const FieldRow = ({ label, value }) => (
//   <View style={styles.fieldRow}>
//     <Text style={styles.fieldLabel}>{label}</Text>
//     <Text style={styles.fieldValue}>{value || '-'}</Text>
//   </View>
// );

// // Styles
// const styles = StyleSheet.create({
//   container: { 
//     backgroundColor: '#F5F8FF', 
//     padding: 20,
//     paddingBottom: 40
//   },
//   pageTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 20,
//     color: '#333'
//   },
//   tabContainer: {
//     flexDirection: 'row', 
//     marginBottom: 20,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 4,
//     elevation: 2
//   },
//   tabButton: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderRadius: 8
//   },
//   tabActive: {
//     backgroundColor: '#00BFA5' 
//   },
//   tabText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666'
//   },
//   tabTextActive: {
//     color: '#fff'
//   },
//   card: { 
//     backgroundColor: '#fff', 
//     borderRadius: 16, 
//     padding: 20, 
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4
//   },
//   inputBlock: { marginBottom: 18 },
//   label: { 
//     fontSize: 14, 
//     fontWeight: '600', 
//     marginBottom: 6,
//     color: '#333'
//   },
//   required: { color: '#FF5252' },
//   inputWrapper: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     backgroundColor: '#F8F9FA', 
//     borderRadius: 12, 
//     paddingHorizontal: 12, 
//     paddingVertical: 10,
//     borderWidth: 1,
//     borderColor: '#E0E0E0'
//   },
//   inputWrapperMultiline: { alignItems: 'flex-start' },
//   input: { 
//     flex: 1, 
//     fontSize: 16, 
//     marginLeft: 10,
//     color: '#333'
//   },
//   textArea: { 
//     height: 100, 
//     textAlignVertical: 'top' 
//   },
//   picker: { 
//     flex: 1, 
//     marginLeft: 10 
//   },
//   uploadBtn: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     backgroundColor: '#00BFA5', 
//     padding: 12, 
//     borderRadius: 10 
//   },
//   uploadText: { 
//     color: '#fff', 
//     marginLeft: 8,
//     fontSize: 14,
//     fontWeight: '500'
//   },
//   dateBtn: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     backgroundColor: '#2196F3', 
//     padding: 12, 
//     borderRadius: 10 
//   },
//   dateText: { 
//     marginTop: 8,
//     fontSize: 14,
//     color: '#333'
//   },
//   fieldRow: { 
//     flexDirection: 'row', 
//     marginBottom: 12,
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0'
//   },
//   fieldLabel: { 
//     fontWeight: 'bold', 
//     flex: 1,
//     color: '#555'
//   },
//   fieldValue: { 
//     flex: 2,
//     color: '#333'
//   },
//   loadingText: {
//     textAlign: 'center',
//     fontSize: 16,
//     color: '#666',
//     paddingVertical: 20
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     zIndex: 10
//   },
//   fullScreenImage: {
//     width: '90%',
//     height: '70%'
//   }
// });

import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Modal
} from 'react-native';
import { EMPLOYEE_GET_URL } from '../src/context/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

export default function EditIdeaScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const ideaData = route.params?.ideaData || {};

  const [activeTab, setActiveTab] = useState('idea');
  const [userDetails, setUserDetails] = useState(null);

  const [ideaDescription, setIdeaDescription] = useState(ideaData.ideaDescription || '');
  const [proposedSolution, setProposedSolution] = useState(ideaData.proposedSolution || '');
  const [solutionCategory, setSolutionCategory] = useState(ideaData.solutionCategory || '');
  const [ideaTheme, setIdeaTheme] = useState(ideaData.ideaTheme || '');
  const [benefit, setBenefit] = useState(ideaData.tentativeBenefit || '');
  const [teamMembers, setTeamMembers] = useState(ideaData.teamMembers || '');
  const [mobileNumber, setMobileNumber] = useState(ideaData.mobileNumber || '');
  const [date, setDate] = useState(
    ideaData.plannedImplementationDuration
      ? new Date(ideaData.plannedImplementationDuration)
      : new Date()
  );
  const [image, setImage] = useState(ideaData.imagePath || null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  // Employee Details Fetch
  const fetchEmployeeDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await fetch(EMPLOYEE_GET_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUserDetails({
        employeeNo: data.data.ideaOwnerEmployeeNo || '',
        name: data.data.ideaOwnerName || '',
        email: data.data.ideaOwnerEmail || '',
        department: data.data.ideaOwnerDepartment || '',
        subDepartment: data.data.ideaOwnerSubDepartment || '',
        location: data.data.location || '',
        reportingManagerName: data.data.reportingManagerName || '',
        reportingManagerEmail: data.data.reportingManagerEmail || '',
      });
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  // Image Picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // Date Picker
  const onChangeDate = (event, selectedDate) => {
    if (event.type === 'set' && selectedDate) setDate(selectedDate);
    setShowDatePicker(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FF' }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>Edit Idea Form</Text>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'idea' && styles.tabActive]}
            onPress={() => setActiveTab('idea')}
          >
            <Text style={[styles.tabText, activeTab === 'idea' && styles.tabTextActive]}>
              Idea Form
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'employee' && styles.tabActive]}
            onPress={() => {
              setActiveTab('employee');
              // fetchEmployeeDetails();
            }}
          >
            <Text style={[styles.tabText, activeTab === 'employee' && styles.tabTextActive]}>
              Employee Details
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'employee' ? (
          <View style={styles.card}>
            {userDetails ? (
              <>
                <FieldRow label="Employee No:" value={userDetails.employeeNo} />
                <FieldRow label="Name:" value={userDetails.name} />
                <FieldRow label="Email:" value={userDetails.email} />
                <FieldRow label="Department:" value={userDetails.department} />
                <FieldRow label="Sub Department:" value={userDetails.subDepartment} />
                <FieldRow label="Location:" value={userDetails.location} />
                <FieldRow label="Manager Name:" value={userDetails.reportingManagerName} />
                <FieldRow label="Manager Email:" value={userDetails.reportingManagerEmail} />
              </>
            ) : (
              <Text style={styles.loadingText}>Loading employee details...</Text>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <InputField
              label="Idea/Opportunity Description"
              required
              icon={<MaterialIcons name="title" size={20} color="#666" />}
              value={ideaDescription}
              onChangeText={setIdeaDescription}
            />
            <InputField
              label="Proposed Solution"
              required
              icon={<MaterialIcons name="description" size={20} color="#666" />}
              value={proposedSolution}
              onChangeText={setProposedSolution}
              multiline
            />
            <InputField
              label="Process Improvement/Cost Benefit"
              required
              icon={<FontAwesome name="lightbulb-o" size={20} color="#666" />}
              value={benefit}
              onChangeText={setBenefit}
              multiline
            />
            <InputField
              label="Team Members"
              icon={<MaterialIcons name="group" size={20} color="#666" />}
              value={teamMembers}
              onChangeText={setTeamMembers}
            />

            <PickerField
              label="Solution Category"
              icon={<Ionicons name="bulb-outline" size={20} color="#666" />}
              selectedValue={solutionCategory}
              onValueChange={setSolutionCategory}
              options={[
                'Quick Win','Kaizen','Lean','Six Sigma Yellow Belt','Six Sigma Green Belt',
                'WorkPlace Management','Automation','Cost Saving','Business Improvement',
                'Efficiency Improvement','Others'
              ]}
            />

            <PickerField
              label="Idea Theme"
              icon={<MaterialIcons name="category" size={20} color="#666" />}
              selectedValue={ideaTheme}
              onValueChange={setIdeaTheme}
              options={['Productivity','Quality','Cost','Delivery','Safety','Morale','Environment']}
            />

            <InputField
              label="Mobile Number"
              required
              icon={<Feather name="phone" size={20} color="#666" />}
              value={mobileNumber}
              onChangeText={setMobileNumber}
            />

            {/* Image Upload */}
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Upload Image</Text>
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                <Feather name="image" size={20} color="#fff" />
                <Text style={styles.uploadText}>Choose Image</Text>
              </TouchableOpacity>
              {image && (
                <TouchableOpacity onPress={() => setShowPreview(!showPreview)} style={{ marginTop: 8 }}>
                  <Feather name="eye" size={20} color="#000" />
                </TouchableOpacity>
              )}
              {image && showPreview && (
                <TouchableOpacity onPress={() => setFullScreen(true)}>
                  <Image source={{ uri: image }} style={{ width: '100%', height: 200, borderRadius: 10, marginTop: 10 }} />
                </TouchableOpacity>
              )}
            </View>

            {/* Date Picker */}
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Completion Date</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                <Feather name="calendar" size={20} color="#fff" />
                <Text style={styles.uploadText}>Select Date</Text>
              </TouchableOpacity>
              {date && <Text style={styles.dateText}>{date.toDateString()}</Text>}
              {showDatePicker && (
                <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
              )}
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <TouchableOpacity 
                style={{ flex: 1, backgroundColor: '#FFC107', paddingVertical: 14, borderRadius: 12, marginRight: 10, alignItems: 'center' }} 
                onPress={() => console.log("Save as Draft pressed")}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Save as Draft</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ flex: 1, backgroundColor: '#00BFA5', paddingVertical: 14, borderRadius: 12, marginLeft: 10, alignItems: 'center' }} 
                onPress={() => console.log("Submit pressed")}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={fullScreen} transparent={true} onRequestClose={() => setFullScreen(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setFullScreen(false)}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {image && <Image source={{ uri: image }} style={styles.fullScreenImage} resizeMode="contain" />}
        </View>
      </Modal>
    </View>
  );
}

// Components & Styles remain same as before
const InputField = ({ label, icon, value, onChangeText, multiline, required }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
    <View style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}>
      {icon}
      <TextInput 
        style={[styles.input, multiline && styles.textArea]} 
        value={value} 
        onChangeText={onChangeText} 
        multiline={multiline}
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </View>
  </View>
);

const PickerField = ({ label, icon, selectedValue, onValueChange, options }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      {icon}
      <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker}>
        <Picker.Item label="Select" value="" />
        {options.map((option, index) => <Picker.Item label={option} value={option} key={index} />)}
      </Picker>
    </View>
  </View>
);

const FieldRow = ({ label, value }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#F5F8FF', padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  tabContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#fff', borderRadius: 12, padding: 4, elevation: 2 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#00BFA5' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  inputBlock: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
  required: { color: '#FF5252' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  inputWrapperMultiline: { alignItems: 'flex-start' },
  input: { flex: 1, fontSize: 16, marginLeft: 10, color: '#333' },
  textArea: { height: 100, textAlignVertical: 'top' },
  picker: { flex: 1, marginLeft: 10 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00BFA5', padding: 12, borderRadius: 10 },
  uploadText: { color: '#fff', marginLeft: 8, fontSize: 14, fontWeight: '500' },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2196F3', padding: 12, borderRadius: 10 },
  dateText: { marginTop: 8, fontSize: 14, color: '#333' },
  fieldRow: { flexDirection: 'row', marginBottom: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  fieldLabel: { fontWeight: 'bold', flex: 1, color: '#555' },
  fieldValue: { flex: 2, color: '#333' },
  loadingText: { textAlign: 'center', fontSize: 16, color: '#666', paddingVertical: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  fullScreenImage: { width: '90%', height: '70%' }
});