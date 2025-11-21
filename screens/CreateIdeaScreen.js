// import React, { useState, useEffect } from 'react';
// import { useNavigation } from '@react-navigation/native';
// import {
//   View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
//   Alert, Modal, ActivityIndicator, Platform, Linking,
// } from 'react-native';
// import { Image } from 'expo-image';
// import { CREATE_IDEA_POST_URL, EMPLOYEE_GET_URL } from '../src/context/api';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Picker } from '@react-native-picker/picker';
// import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import * as ImagePicker from 'expo-image-picker';
// import * as DocumentPicker from 'expo-document-picker';
// import * as FileSystem from 'expo-file-system/legacy';

// const BASE_URL = 'https://ideabank-api-dev.abisaio.com';

// export default function CreateIdeaScreen() {
//   const navigation = useNavigation();

//   const [activeTab, setActiveTab] = useState('idea');
//   const [userDetails, setUserDetails] = useState(null);
//   const [ideaDescription, setIdeaDescription] = useState('');
//   const [proposedSolution, setProposedSolution] = useState('');
//   const [solutionCategory, setSolutionCategory] = useState('');
//   const [ideaTheme, setIdeaTheme] = useState('');
//   const [benefit, setBenefit] = useState('');
//   const [teamMembers, setTeamMembers] = useState('');
//   const [mobileNumber, setMobileNumber] = useState('');
//   const [date, setDate] = useState(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [file, setFile] = useState(null);
//   const [fileName, setFileName] = useState('');
//   const [fileType, setFileType] = useState('');
//   const [showPreview, setShowPreview] = useState(false);
//   const [fullScreen, setFullScreen] = useState(false);
//   const [imageScale, setImageScale] = useState(1);
//   const [beSupportNeeded, setBeSupportNeeded] = useState(null);
//   const [canImplementOtherLocation, setCanImplementOtherLocation] = useState(null);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [showFileOptions, setShowFileOptions] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Validation error states
//   const [teamMembersError, setTeamMembersError] = useState('');
//   const [mobileNumberError, setMobileNumberError] = useState('');

//   const resetForm = () => {
//     setIdeaDescription('');
//     setProposedSolution('');
//     setSolutionCategory('');
//     setIdeaTheme('');
//     setBenefit('');
//     setTeamMembers('');
//     setMobileNumber('');
//     setDate(null);
//     setFile(null);
//     setFileName('');
//     setFileType('');
//     setBeSupportNeeded(null);
//     setCanImplementOtherLocation(null);
//     setImageScale(1);
//     setTeamMembersError('');
//     setMobileNumberError('');
//   };

//   // Validation function for Team Members (alphabets, spaces, comma, dot - NO numbers)
//   const validateTeamMembers = (text) => {
//     const regex = /^[a-zA-Z\s,.]*$/;
//     if (!regex.test(text)) {
//       setTeamMembersError('Numbers are not allowed');
//       return false;
//     }
//     setTeamMembersError('');
//     return true;
//   };

//   // Handle Team Members input
//   const handleTeamMembersChange = (text) => {
//     if (validateTeamMembers(text)) {
//       setTeamMembers(text);
//     }
//   };

//   // Validation function for Mobile Number (only digits)
//   const validateMobileNumber = (text) => {
//     if (text.length > 0 && text.length < 10) {
//       setMobileNumberError('Mobile number must be 10 digits');
//       return false;
//     }
//     setMobileNumberError('');
//     return true;
//   };

//   // Handle Mobile Number input - FIXED: Allow only numbers
//   const handleMobileNumberChange = (text) => {
//     // Only allow digits, remove any non-numeric characters
//     const numericText = text.replace(/[^0-9]/g, '');
//     setMobileNumber(numericText);
//     validateMobileNumber(numericText);
//   };

//   const pickImageFromGallery = async () => {
//     try {
//       const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (!permissionResult.granted) {
//         Alert.alert('Permission Required', 'Please allow access to your photos');
//         return;
//       }
//       let result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: 'images',
//         allowsEditing: false,
//         quality: 0.7,
//         base64: false,
//       });
//       if (!result.canceled && result.assets && result.assets[0]) {
//         const asset = result.assets[0];
//         setFile(asset.uri);
//         setFileType('image');
//         const timestamp = Date.now();
//         const extension = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
//         const cleanFileName = `image_${timestamp}.${extension}`;
//         setFileName(cleanFileName);
//         setShowFileOptions(false);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to pick image');
//     }
//   };

//   const pickImageFromCamera = async () => {
//     try {
//       const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
//       if (!permissionResult.granted) {
//         Alert.alert('Permission Required', 'Please allow camera access');
//         return;
//       }
//       let result = await ImagePicker.launchCameraAsync({
//         mediaTypes: 'images',
//         allowsEditing: false,
//         quality: 0.7,
//         base64: false,
//       });
//       if (!result.canceled && result.assets && result.assets[0]) {
//         const asset = result.assets[0];
//         setFile(asset.uri);
//         setFileType('image');
//         const timestamp = Date.now();
//         const extension = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
//         const cleanFileName = `camera_${timestamp}.${extension}`;
//         setFileName(cleanFileName);
//         setShowFileOptions(false);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to capture image');
//     }
//   };

//   const pickPDF = async () => {
//     try {
//       let result = await DocumentPicker.getDocumentAsync({
//         type: 'application/pdf',
//         copyToCacheDirectory: true,
//       });
//       if (result.type === 'success' || !result.canceled) {
//         const selectedFile = result.assets ? result.assets[0] : result;
//         setFile(selectedFile.uri);
//         setFileType('pdf');
//         setFileName(selectedFile.name);
//         setShowFileOptions(false);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to pick PDF file');
//     }
//   };

//   const openPDF = async () => {
//     if (file && fileType === 'pdf') {
//       try {
//         const supported = await Linking.canOpenURL(file);
//         if (supported) {
//           await Linking.openURL(file);
//         } else {
//           Alert.alert('Info', 'PDF will be uploaded. You can view it after submission.');
//         }
//       } catch (error) {
//         Alert.alert('Info', 'PDF selected successfully. It will be uploaded with your idea.');
//       }
//     }
//   };

//   const onChangeDate = (event, selectedDate) => {
//     setShowDatePicker(false);
//     if (selectedDate) setDate(selectedDate);
//   };

//   const formatDate = (dateObj) => {
//     if (!dateObj) return '';
//     const month = String(dateObj.getMonth() + 1).padStart(2, '0');
//     const day = String(dateObj.getDate()).padStart(2, '0');
//     const year = dateObj.getFullYear();
//     return `${month}/${day}/${year}`;
//   };

//   const getRemainingDays = (targetDate) => {
//     if (!targetDate) return null;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const target = new Date(targetDate);
//     target.setHours(0, 0, 0, 0);
//     const diffTime = target - today;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays;
//   };

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
//         if (!response.ok) throw new Error('Failed to fetch employee details');
//         const data = await response.json();
//         setUserDetails({
//           employeeNo: data.data.ideaOwnerEmployeeNo || '',
//           name: data.data.ideaOwnerName || '',
//           email: data.data.ideaOwnerEmail || '',
//           department: data.data.ideaOwnerDepartment || '',
//           subDepartment: data.data.ideaOwnerSubDepartment || '',
//           location: data.data.location || '',
//           reportingManagerName: data.data.reportingManagerName || '',
//           reportingManagerEmail: data.data.managerEmail || '',
//         });
//       } catch (error) {
//       }
//     };
//     fetchEmployeeDetails();
//   }, [activeTab]);

//   const createFormDataWithFile = async (submitType) => {
//     const formData = new FormData();
//     formData.append('IdeaDescription', ideaDescription || '');
//     formData.append('ProposedSolution', proposedSolution || '');
//     formData.append('TentativeBenefit', benefit || '');
//     formData.append('TeamMembers', teamMembers || '');
//     formData.append('MobileNumber', mobileNumber || '');
//     formData.append('SolutionCategory', solutionCategory || '');
//     formData.append('IdeaTheme', ideaTheme || '');
//     formData.append('PlannedImplementationDuration', date ? date.toISOString().split('T')[0] : '');
//     formData.append('IsBETeamSupportNeeded', beSupportNeeded === 'Yes' ? 'true' : 'false');
//     formData.append('CanBeImplementedToOtherLocations', canImplementOtherLocation === 'Yes' ? 'true' : 'false');
//     formData.append('SubmitType', submitType);

//     if (file && fileName) {
//       try {
//         let fileUri = file;
//         if (Platform.OS === 'android' && !fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
//           fileUri = `file://${fileUri}`;
//         }

//         const fileInfo = await FileSystem.getInfoAsync(fileUri);

//         if (!fileInfo.exists) throw new Error('File does not exist');

//         let mimeType = 'application/octet-stream';
//         const extension = fileName.split('.').pop()?.toLowerCase();

//         if (fileType === 'pdf' || extension === 'pdf') mimeType = 'application/pdf';
//         else if (extension === 'png') mimeType = 'image/png';
//         else if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
//         else if (extension === 'gif') mimeType = 'image/gif';
//         else if (extension === 'webp') mimeType = 'image/webp';

//         const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

//         const fileToUpload = {
//           uri: fileUri,
//           type: mimeType,
//           name: cleanFileName,
//         };

//         formData.append('BeforeImplementationImage', fileToUpload);
//       } catch (error) {
//         Alert.alert('File Error', 'Failed to prepare file for upload. Please try again.');
//         throw error;
//       }
//     }
//     return formData;
//   };

//   const handleSaveDraft = async () => {
//     // For Draft: Only Idea Description is mandatory
//     if (!ideaDescription.trim()) {
//       Alert.alert('Required Field', 'Idea Description is required to save draft.');
//       return;
//     }

//     // If mobile number is provided, validate it
//     if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
//       Alert.alert('Invalid Mobile Number', 'Please enter a valid 10 digit mobile number.');
//       return;
//     }

//     try {
//       setIsSubmitting(true);
//       const token = await AsyncStorage.getItem('token');
//       if (!token) {
//         Alert.alert('Error', 'User token missing. Please login again.');
//         setIsSubmitting(false);
//         return;
//       }

//       const formData = await createFormDataWithFile('draft');

//       const response = await fetch(CREATE_IDEA_POST_URL, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           Accept: 'application/json',
//         },
//         body: formData,
//       });

//       const text = await response.text();

//       let data = {};
//       try {
//         data = JSON.parse(text);
//       } catch (e) {
//         data = {};
//       }

//       if (response.ok && data.success) {
//         const imagePath = data.data?.beforeImplementationImage 
//                        || data.data?.imagePath 
//                        || data.data?.BeforeImplementationImagePath;
//         const fullImageUrl = imagePath 
//           ? (imagePath.startsWith('http') ? imagePath : `${BASE_URL}${imagePath}`)
//           : null;

//         const ideaData = {
//           ...data.data,
//           status: 'Draft',
//           beforeImplementationImagePath: fullImageUrl,
//           beforeImplementationImage: fullImageUrl,
//           imagePath: fullImageUrl,
//         };

//         resetForm();
//         Alert.alert('Success', 'Draft saved successfully!');
//         navigation.navigate('My Ideas', {
//           newIdea: ideaData,
//           refreshIdeas: true,
//           showDraftMessage: true,
//         });
//       } else {
//         Alert.alert('Error', data?.message || 'Failed to save draft.');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Network error, please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleBeforeSubmit = () => {
//     // For Publish: All fields are mandatory
//     if (!ideaDescription.trim()) {
//       Alert.alert('Required Field', 'Idea Description is required.');
//       return;
//     }
//     if (!proposedSolution.trim()) {
//       Alert.alert('Required Field', 'Proposed Solution is required.');
//       return;
//     }
//     if (!benefit.trim()) {
//       Alert.alert('Required Field', 'Process Improvement/Cost Benefit is required.');
//       return;
//     }
//     if (!teamMembers.trim()) {
//       Alert.alert('Required Field', 'Team Members is required.');
//       return;
//     }
//     if (!solutionCategory) {
//       Alert.alert('Required Field', 'Solution Category is required.');
//       return;
//     }
//     if (!ideaTheme) {
//       Alert.alert('Required Field', 'Idea Theme is required.');
//       return;
//     }
//     if (!file) {
//       Alert.alert('Required Field', 'Before Implementation file is required.');
//       return;
//     }
//     if (!date) {
//       Alert.alert('Required Field', 'Planned Completion Date is required.');
//       return;
//     }
//     if (!mobileNumber) {
//       Alert.alert('Required Field', 'Mobile Number is required.');
//       return;
//     }
//     if (!/^\d{10}$/.test(mobileNumber)) {
//       Alert.alert('Invalid Mobile Number', 'Please enter a valid 10 digit mobile number.');
//       return;
//     }
//     if (beSupportNeeded === null) {
//       Alert.alert('Required Field', 'Please select if BE Team Support is needed.');
//       return;
//     }
//     if (canImplementOtherLocation === null) {
//       Alert.alert('Required Field', 'Please select if can be implemented to other location.');
//       return;
//     }
    
//     setShowConfirm(true);
//   };

//   const handleFinalSubmit = async () => {
//     try {
//       setIsSubmitting(true);
//       const token = await AsyncStorage.getItem('token');
//       if (!token) {
//         Alert.alert('Error', 'User token missing. Please login again.');
//         setIsSubmitting(false);
//         return;
//       }

//       const formData = await createFormDataWithFile('publish');

//       const response = await fetch(CREATE_IDEA_POST_URL, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           Accept: 'application/json',
//         },
//         body: formData,
//       });

//       const text = await response.text();

//       let data = {};
//       try {
//         data = JSON.parse(text);
//       } catch (e) {
//         data = {};
//       }

//       if (response.ok && data.success) {
//         const imagePath = data.data?.beforeImplementationImage 
//                        || data.data?.imagePath 
//                        || data.data?.BeforeImplementationImagePath;
        
//         const fullImageUrl = imagePath 
//           ? (imagePath.startsWith('http') ? imagePath : `${BASE_URL}${imagePath}`)
//           : null;

//         const ideaData = {
//           ...data.data,
//           beforeImplementationImagePath: fullImageUrl,
//           beforeImplementationImage: fullImageUrl,
//           imagePath: fullImageUrl,
//         };

//         resetForm();
//         Alert.alert('Success', 'Idea published successfully!');
//         navigation.navigate('My Ideas', {
//           newIdea: ideaData,
//           refreshIdeas: true,
//         });
//       } else {
//         Alert.alert('Error', data?.message || 'Failed to create idea.');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Network error, please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleZoomIn = () => {
//     setImageScale(prev => Math.min(prev + 0.5, 3));
//   };

//   const handleZoomOut = () => {
//     setImageScale(prev => Math.max(prev - 0.5, 0.5));
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <View style={styles.stickyHeader}>
//         <Text style={styles.heading}>Idea Creation Form</Text>
//       </View>

//       <ScrollView contentContainerStyle={styles.container}>
//         <View style={{ height: 70 }} />

//         <View style={{ flexDirection: 'row', marginBottom: 20 }}>
//           <TouchableOpacity
//             style={[styles.tabButton, activeTab === 'idea' && styles.tabActive]}
//             onPress={() => setActiveTab('idea')}
//           >
//             <Text style={styles.tabText}>Idea Form</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.tabButton, activeTab === 'employee' && styles.tabActive]}
//             onPress={() => setActiveTab('employee')}
//           >
//             <Text style={styles.tabText}>Employee Details</Text>
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
//               placeholder="Enter idea description..."
//               value={ideaDescription}
//               onChangeText={setIdeaDescription}
//               maxLength={300}
//             />

//             <InputField
//               label="Proposed Solution"
//               required
//               icon={<MaterialIcons name="description" size={20} color="#666" />}
//               placeholder="Enter proposed solution..."
//               value={proposedSolution}
//               onChangeText={setProposedSolution}
//               multiline
//               maxLength={500}
//             />

//             <InputField
//               label="Process Improvement/Cost Benefit"
//               required
//               icon={<FontAwesome name="lightbulb-o" size={20} color="#666" />}
//               placeholder="Enter tentative Benefit..."
//               value={benefit}
//               onChangeText={setBenefit}
//               multiline
//               maxLength={200}
//             />

//             <InputField
//               label="Team Members"
//               required
//               icon={<MaterialIcons name="group" size={20} color="#666" />}
//               placeholder="Enter team Members..."
//               value={teamMembers}
//               onChangeText={handleTeamMembersChange}
//               maxLength={100}
//               error={teamMembersError}
//             />

//             <PickerField
//               label="Solution Category"
//               required
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
//               required
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

//             <View style={styles.inputBlock}>
//               <Text style={styles.label}>
//                 Before Implementation (JPG, PNG, PDF){' '}
//                 <Text style={styles.required}>*</Text>
//               </Text>
//               <View style={styles.fileInputRow}>
//                 <TouchableOpacity
//                   style={styles.chooseFileButton}
//                   onPress={() => setShowFileOptions(true)}
//                 >
//                   <Text style={styles.chooseFileText}>Choose File</Text>
//                 </TouchableOpacity>
//                 <Text
//                   style={styles.fileNameDisplay}
//                   numberOfLines={1}
//                   ellipsizeMode="middle"
//                 >
//                   {fileName || 'No file chosen'}
//                 </Text>
//               </View>

//               {file && fileType === 'image' && (
//                 <TouchableOpacity
//                   onPress={() => setFullScreen(true)}
//                   style={styles.eyeIconContainer}
//                 >
//                   <Feather name="eye" size={20} color="#2196F3" />
//                   <Text style={styles.previewText}>Preview Image</Text>
//                 </TouchableOpacity>
//               )}

//               {file && fileType === 'pdf' && (
//                 <TouchableOpacity
//                   onPress={openPDF}
//                   style={styles.pdfInfoContainer}
//                 >
//                   <Feather name="file-text" size={20} color="#FF5722" />
//                   <Text style={styles.pdfInfoText}>Open PDF Preview</Text>
//                 </TouchableOpacity>
//               )}

//               <Modal visible={fullScreen} transparent={true}>
//                 <View style={styles.fullScreenContainer}>
//                   <TouchableOpacity
//                     style={styles.closeButton}
//                     onPress={() => {
//                       setFullScreen(false);
//                       setImageScale(1);
//                     }}
//                   >
//                     <Feather name="x" size={30} color="#fff" />
//                   </TouchableOpacity>

//                   <View style={styles.zoomControls}>
//                     <TouchableOpacity
//                       style={styles.zoomButton}
//                       onPress={handleZoomOut}
//                     >
//                       <Feather name="minus" size={24} color="#fff" />
//                     </TouchableOpacity>
//                     <Text style={styles.zoomText}>{Math.round(imageScale * 100)}%</Text>
//                     <TouchableOpacity
//                       style={styles.zoomButton}
//                       onPress={handleZoomIn}
//                     >
//                       <Feather name="plus" size={24} color="#fff" />
//                     </TouchableOpacity>
//                   </View>

//                   <ScrollView
//                     contentContainerStyle={styles.scrollContent}
//                     maximumZoomScale={3}
//                     minimumZoomScale={0.5}
//                     showsHorizontalScrollIndicator={false}
//                     showsVerticalScrollIndicator={false}
//                   >
//                     <Image
//                       source={{ uri: file }}
//                       style={[styles.fullScreenImage, { transform: [{ scale: imageScale }] }]}
//                       contentFit="contain"
//                       cachePolicy="none"
//                     />
//                   </ScrollView>
//                 </View>
//               </Modal>

//               <Modal visible={showFileOptions} transparent={true} animationType="slide">
//                 <View style={styles.imageOptionsContainer}>
//                   <View style={styles.imageOptionsContent}>
//                     <Text style={styles.imageOptionsTitle}>Choose File Source</Text>

//                     <TouchableOpacity
//                       style={styles.imageOptionButton}
//                       onPress={pickImageFromCamera}
//                     >
//                       <Feather name="camera" size={24} color="#2196F3" />
//                       <Text style={styles.imageOptionText}>Take Photo</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={styles.imageOptionButton}
//                       onPress={pickImageFromGallery}
//                     >
//                       <Feather name="image" size={24} color="#4CAF50" />
//                       <Text style={styles.imageOptionText}>Choose Image from Gallery</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={styles.imageOptionButton}
//                       onPress={pickPDF}
//                     >
//                       <Feather name="file-text" size={24} color="#FF5722" />
//                       <Text style={styles.imageOptionText}>Choose PDF Document</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={[styles.imageOptionButton, styles.cancelButton]}
//                       onPress={() => setShowFileOptions(false)}
//                     >
//                       <Text style={styles.cancelButtonText}>Cancel</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </Modal>
//             </View>

//             <View style={styles.inputBlock}>
//               <Text style={styles.label}>
//                 Planned Completion Date <Text style={styles.required}>*</Text>
//               </Text>
//               <TouchableOpacity
//                 style={styles.dateInputWeb}
//                 onPress={() => setShowDatePicker(true)}
//               >
//                 <Text style={styles.dateDisplayText}>
//                   {date ? formatDate(date) : 'Select Date'}
//                 </Text>
//                 <Feather name="calendar" size={18} color="#666" />
//               </TouchableOpacity>
//               {date && getRemainingDays(date) !== null && (
//                 <Text style={styles.daysRemainingText}>
//                   ({getRemainingDays(date)} days)
//                 </Text>
//               )}
//             </View>

//             {showDatePicker && (
//               <DateTimePicker
//                 value={date || new Date()}
//                 mode="date"
//                 display="default"
//                 minimumDate={new Date()}
//                 onChange={onChangeDate}
//               />
//             )}

//             <InputField
//               label="Mobile Number"
//               required
//               icon={<Feather name="phone" size={20} color="#666" />}
//               placeholder="Enter your number..."
//               value={mobileNumber}
//               onChangeText={handleMobileNumberChange}
//               maxLength={10}
//               keyboardType="number-pad"
//               error={mobileNumberError}
//             />

//             <RadioField
//               label="Is BE Team Support Needed?"
//               required
//               value={beSupportNeeded}
//               setValue={setBeSupportNeeded}
//             />

//             <RadioField
//               label="Can Be Implemented To Other Location?"
//               required
//               value={canImplementOtherLocation}
//               setValue={setCanImplementOtherLocation}
//             />

//             <View style={styles.buttonRow}>
//               <TouchableOpacity
//                 style={styles.draftButton}
//                 onPress={handleSaveDraft}
//                 disabled={isSubmitting}
//               >
//                 <FontAwesome name="save" size={16} color="#555" />
//                 <Text style={styles.draftText}>Save as Draft</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.submitButton}
//                 onPress={handleBeforeSubmit}
//                 disabled={isSubmitting}
//               >
//                 <Text style={styles.submitText}>Save & Publish</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       </ScrollView>

//       {isSubmitting && (
//         <View style={styles.loadingOverlay}>
//           <View style={styles.loadingCard}>
//             <ActivityIndicator size="large" color="#00B894" />
//             <Text style={styles.loadingOverlayText}>Submitting your idea...</Text>
//           </View>
//         </View>
//       )}

//       <Modal visible={showConfirm} transparent={true} animationType="fade">
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: 'rgba(0,0,0,0.6)',
//             justifyContent: 'center',
//             alignItems: 'center',
//           }}
//         >
//           <View
//             style={{
//               backgroundColor: '#fff',
//               width: '80%',
//               padding: 20,
//               borderRadius: 10,
//               alignItems: 'center',
//             }}
//           >
//             <Feather name="check-circle" size={40} color="#2196F3" />
//             <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>
//               Save & Publish
//             </Text>
//             <Text style={{ fontSize: 14, textAlign: 'center', color: '#333' }}>
//               Are you sure you want to save and publish this record?
//             </Text>
//             <View style={{ flexDirection: 'row', marginTop: 20 }}>
//               <TouchableOpacity
//                 style={{
//                   backgroundColor: '#ddd',
//                   paddingVertical: 10,
//                   paddingHorizontal: 20,
//                   borderRadius: 8,
//                   marginRight: 10,
//                 }}
//                 onPress={() => setShowConfirm(false)}
//                 disabled={isSubmitting}
//               >
//                 <Text style={{ color: '#333', fontWeight: '600' }}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={{
//                   backgroundColor: '#00B894',
//                   paddingVertical: 10,
//                   paddingHorizontal: 20,
//                   borderRadius: 8,
//                 }}
//                 onPress={() => {
//                   setShowConfirm(false);
//                   handleFinalSubmit();
//                 }}
//                 disabled={isSubmitting}
//               >
//                 <Text style={{ color: '#fff', fontWeight: '600' }}>Save & Publish</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const InputField = ({ label, icon, placeholder, value, onChangeText, multiline, maxLength, required, keyboardType, error }) => (
//   <View style={styles.inputBlock}>
//     <Text style={styles.label}>
//       {label} {required && <Text style={styles.required}>*</Text>}
//     </Text>
//     <View style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}>
//       <View style={styles.iconContainer}>
//         {icon}
//       </View>
//       <TextInput
//         style={[styles.input, multiline && styles.textArea]}
//         placeholder={placeholder}
//         value={value}
//         onChangeText={onChangeText}
//         multiline={multiline}
//         placeholderTextColor="#999"
//         keyboardType={keyboardType || 'default'}
//         maxLength={maxLength}
//       />
//     </View>
//     {error ? (
//       <Text style={styles.errorText}>{error}</Text>
//     ) : null}
//     {maxLength && <Text style={styles.charCount}>{value.length}/{maxLength}</Text>}
//   </View>
// );

// const PickerField = ({ label, icon, selectedValue, onValueChange, options, required }) => (
//   <View style={styles.inputBlock}>
//     <Text style={styles.label}>
//       {label} {required && <Text style={styles.required}>*</Text>}
//     </Text>
//     <View style={styles.inputWrapper}>
//       <View style={styles.iconContainer}>
//         {icon}
//       </View>
//       <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker} dropdownIconColor="#666">
//         <Picker.Item label="Select" value="" />
//         {options.map((option, index) => (
//           <Picker.Item label={option} value={option} key={index} />
//         ))}
//       </Picker>
//     </View>
//   </View>
// );

// const RadioField = ({ label, value, setValue, required }) => (
//   <View style={styles.inputBlock}>
//     <Text style={styles.label}>
//       {label} {required && <Text style={styles.required}>*</Text>}
//     </Text>
//     <View style={styles.radioRow}>
//       <TouchableOpacity 
//         style={styles.radioOption} 
//         onPress={() => setValue('Yes')}
//       >
//         <View style={[styles.radioCircle, value === 'Yes' && styles.radioSelected]} />
//         <Text style={styles.radioText}>Yes</Text>
//       </TouchableOpacity>
//       <TouchableOpacity 
//         style={styles.radioOption} 
//         onPress={() => setValue('No')}
//       >
//         <View style={[styles.radioCircle, value === 'No' && styles.radioSelected]} />
//         <Text style={styles.radioText}>No</Text>
//       </TouchableOpacity>
//     </View>
//   </View>
// );

// const FieldRow = ({ label, value }) => (
//   <View style={styles.fieldRow}>
//     <Text style={styles.fieldLabel}>{label}</Text>
//     <Text style={styles.fieldValue} numberOfLines={2} ellipsizeMode="tail">{value || '-'}</Text>
//   </View>
// );

// const styles = StyleSheet.create({
//   container: { backgroundColor: '#F5F8FF', padding: 20, paddingBottom: 50 },
//   stickyHeader: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#F5F8FF',
//     paddingVertical: 15,
//     zIndex: 10,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   heading: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   inputBlock: { marginBottom: 18 },
//   label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
//   required: { color: 'red' },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F2F5',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//   },
//   inputWrapperMultiline: { 
//     alignItems: 'flex-start',
//     paddingTop: 12,
//   },
//   iconContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   input: { 
//     flex: 1, 
//     fontSize: 16, 
//     color: '#333',
//   },
//   picker: { flex: 1, color: '#333' },
//   textArea: { 
//     height: 100, 
//     textAlignVertical: 'top',
//     paddingTop: 0,
//   },
//   charCount: { alignSelf: 'flex-end', fontSize: 12, color: '#888', marginTop: 4 },
//   errorText: { 
//     color: 'red', 
//     fontSize: 12, 
//     marginTop: 4,
//     fontWeight: '500',
//   },
//   fileInputRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F2F5',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     overflow: 'hidden',
//     marginBottom: 10,
//   },
//   chooseFileButton: {
//     backgroundColor: '#e0e0e0',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRightWidth: 1,
//     borderRightColor: '#ccc',
//   },
//   chooseFileText: {
//     color: '#333',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   fileNameDisplay: {
//     flex: 1,
//     paddingHorizontal: 12,
//     color: '#666',
//     fontSize: 14,
//   },
//   eyeIconContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//   },
//   previewText: {
//     marginLeft: 6,
//     color: '#2196F3',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   pdfInfoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF3E0',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 6,
//     alignSelf: 'flex-start',
//   },
//   pdfInfoText: {
//     marginLeft: 8,
//     color: '#FF5722',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   dateInputWeb: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#F0F2F5',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//   },
//   dateDisplayText: {
//     color: '#333',
//     fontSize: 14,
//   },
//   daysRemainingText: {
//     fontSize: 13,
//     color: '#666',
//     marginTop: 6,
//     fontStyle: 'italic',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 20,
//     gap: 10,
//   },
//   draftButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#e2e2e2',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     flex: 1,
//   },
//   draftText: { marginLeft: 7, fontSize: 16, color: '#333', fontWeight: '600' },
//   submitButton: {
//     backgroundColor: '#00B894',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   submitText: { color: '#fff', fontSize: 16, fontWeight: '500' },
//   radioRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
//   radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
//   radioCircle: {
//     height: 18,
//     width: 18,
//     borderRadius: 9,
//     borderWidth: 2,
//     borderColor: '#666',
//     marginRight: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   radioSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
//   radioText: { fontSize: 14, color: '#333' },
//   tabButton: {
//     flex: 1,
//     paddingVertical: 12,
//     backgroundColor: '#e0e0e0',
//     alignItems: 'center',
//     borderRadius: 8,
//     marginHorizontal: 2,
//   },
//   tabActive: {
//     backgroundColor: '#00B894',
//   },
//   tabText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   fieldRow: {
//     flexDirection: 'row',
//     marginBottom: 12,
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   fieldLabel: {
//     fontWeight: 'bold',
//     flex: 1.2,
//     color: '#333',
//     fontSize: 14,
//   },
//   fieldValue: {
//     flex: 2,
//     color: '#555',
//     fontSize: 14,
//   },
//   loadingText: {
//     color: '#555',
//     textAlign: 'center',
//     marginTop: 20,
//     fontSize: 16,
//   },
//   fullScreenContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.95)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     zIndex: 3,
//     padding: 10,
//   },
//   zoomControls: {
//     position: 'absolute',
//     bottom: 40,
//     flexDirection: 'row',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     borderRadius: 25,
//     padding: 10,
//     zIndex: 2,
//     alignItems: 'center',
//   },
//   zoomButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 5,
//   },
//   zoomText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//     marginHorizontal: 10,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   fullScreenImage: {
//     width: 350,
//     height: 600,
//   },
//   imageOptionsContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     justifyContent: 'flex-end',
//   },
//   imageOptionsContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//     paddingBottom: 50,
//     minHeight: 400,
//   },
//   imageOptionsTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   imageOptionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F2F5',
//     padding: 18,
//     borderRadius: 12,
//     marginBottom: 14,
//   },
//   imageOptionText: {
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '600',
//     marginLeft: 15,
//   },
//   cancelButton: {
//     backgroundColor: '#FFE5E5',
//     marginTop: 10,
//     justifyContent: 'center',
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     color: '#FF3B30',
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000,
//   },
//   loadingCard: {
//     backgroundColor: '#fff',
//     padding: 30,
//     borderRadius: 15,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.3,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   loadingOverlayText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '600',
//   },
// });



import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Modal, ActivityIndicator, Platform, Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { CREATE_IDEA_POST_URL, EMPLOYEE_GET_URL } from '../src/context/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

const BASE_URL = 'https://ideabank-api-dev.abisaio.com';

export default function CreateIdeaScreen() {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState('idea');
  const [userDetails, setUserDetails] = useState(null);
  const [ideaDescription, setIdeaDescription] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [solutionCategory, setSolutionCategory] = useState('');
  const [ideaTheme, setIdeaTheme] = useState('');
  const [benefit, setBenefit] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [date, setDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [fullScreen, setFullScreen] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [beSupportNeeded, setBeSupportNeeded] = useState(null);
  const [canImplementOtherLocation, setCanImplementOtherLocation] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembersError, setTeamMembersError] = useState('');
  const [mobileNumberError, setMobileNumberError] = useState('');

  const resetForm = () => {
    setIdeaDescription('');
    setProposedSolution('');
    setSolutionCategory('');
    setIdeaTheme('');
    setBenefit('');
    setTeamMembers('');
    setMobileNumber('');
    setDate(null);
    setFile(null);
    setFileName('');
    setFileType('');
    setBeSupportNeeded(null);
    setCanImplementOtherLocation(null);
    setImageScale(1);
    setTeamMembersError('');
    setMobileNumberError('');
  };

  const validateTeamMembers = (text) => {
    const regex = /^[a-zA-Z\s,.]*$/;
    if (!regex.test(text)) {
      setTeamMembersError('Numbers are not allowed');
      return false;
    }
    setTeamMembersError('');
    return true;
  };

  const handleTeamMembersChange = (text) => {
    if (validateTeamMembers(text)) {
      setTeamMembers(text);
    }
  };

  const validateMobileNumber = (text) => {
    if (text.length > 0 && text.length < 10) {
      setMobileNumberError('Mobile number must be 10 digits');
      return false;
    }
    setMobileNumberError('');
    return true;
  };

  const handleMobileNumberChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setMobileNumber(numericText);
    validateMobileNumber(numericText);
  };

  const pickImageFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photos');
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.7,
        base64: false,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setFile(asset.uri);
        setFileType('image');
        const timestamp = Date.now();
        const extension = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
        const cleanFileName = `image_${timestamp}.${extension}`;
        setFileName(cleanFileName);
        setShowFileOptions(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow camera access');
        return;
      }
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.7,
        base64: false,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setFile(asset.uri);
        setFileType('image');
        const timestamp = Date.now();
        const extension = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
        const cleanFileName = `camera_${timestamp}.${extension}`;
        setFileName(cleanFileName);
        setShowFileOptions(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const pickPDF = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.type === 'success' || !result.canceled) {
        const selectedFile = result.assets ? result.assets[0] : result;
        setFile(selectedFile.uri);
        setFileType('pdf');
        // CRITICAL: Clean filename - web compatible format
        const timestamp = Date.now();
        const cleanName = `document_${timestamp}.pdf`;
        setFileName(cleanName);
        setShowFileOptions(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick PDF file');
    }
  };

  const openPDF = async () => {
    if (file && fileType === 'pdf') {
      try {
        const supported = await Linking.canOpenURL(file);
        if (supported) {
          await Linking.openURL(file);
        } else {
          Alert.alert('Info', 'PDF will be uploaded. You can view it after submission.');
        }
      } catch (error) {
        Alert.alert('Info', 'PDF selected successfully. It will be uploaded with your idea.');
      }
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const getRemainingDays = (targetDate) => {
    if (!targetDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (activeTab !== 'employee') return;
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
        if (!response.ok) throw new Error('Failed to fetch employee details');
        const data = await response.json();
        setUserDetails({
          employeeNo: data.data.ideaOwnerEmployeeNo || '',
          name: data.data.ideaOwnerName || '',
          email: data.data.ideaOwnerEmail || '',
          department: data.data.ideaOwnerDepartment || '',
          subDepartment: data.data.ideaOwnerSubDepartment || '',
          location: data.data.location || '',
          reportingManagerName: data.data.reportingManagerName || '',
          reportingManagerEmail: data.data.managerEmail || '',
        });
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };
    fetchEmployeeDetails();
  }, [activeTab]);

  const createFormDataWithFile = async (submitType) => {
    const formData = new FormData();
    formData.append('IdeaDescription', ideaDescription || '');
    formData.append('ProposedSolution', proposedSolution || '');
    formData.append('TentativeBenefit', benefit || '');
    formData.append('TeamMembers', teamMembers || '');
    formData.append('MobileNumber', mobileNumber || '');
    formData.append('SolutionCategory', solutionCategory || '');
    formData.append('IdeaTheme', ideaTheme || '');
    formData.append('PlannedImplementationDuration', date ? date.toISOString().split('T')[0] : '');
    formData.append('IsBETeamSupportNeeded', beSupportNeeded === 'Yes' ? 'true' : 'false');
    formData.append('CanBeImplementedToOtherLocations', canImplementOtherLocation === 'Yes' ? 'true' : 'false');
    formData.append('SubmitType', submitType);

    if (file && fileName) {
      try {
        let fileUri = file;
        if (Platform.OS === 'android' && !fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
          fileUri = `file://${fileUri}`;
        }

        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) throw new Error('File does not exist');

        let mimeType = 'application/octet-stream';
        const extension = fileName.split('.').pop()?.toLowerCase();

        if (fileType === 'pdf' || extension === 'pdf') {
          mimeType = 'application/pdf';
        } else if (extension === 'png') {
          mimeType = 'image/png';
        } else if (extension === 'jpg' || extension === 'jpeg') {
          mimeType = 'image/jpeg';
        }

        const fileToUpload = {
          uri: fileUri,
          type: mimeType,
          name: fileName,
        };

        formData.append('BeforeImplementationImage', fileToUpload);
      } catch (error) {
        Alert.alert('File Error', 'Failed to prepare file for upload. Please try again.');
        throw error;
      }
    }
    return formData;
  };

  // CRITICAL FIX: Multiple field names ko check karo
  const extractFilePath = (responseData) => {
    const possibleFields = [
      'beforeImplementationImage',
      'beforeImplementationImagePath', 
      'BeforeImplementationImagePath',
      'imagePath',
      'ImagePath',
      'filePath',
      'FilePath'
    ];
    
    for (const field of possibleFields) {
      if (responseData[field]) {
        return responseData[field];
      }
    }
    return null;
  };

  const normalizeFilePath = (path) => {
    if (!path) return null;
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    let cleanPath = path.replace(/^[\/\\]+/, '');
    
    cleanPath = cleanPath.replace(/\\/g, '/');
    
    return `${BASE_URL}/${cleanPath}`;
  };

  const handleSaveDraft = async () => {
    if (!ideaDescription.trim()) {
      Alert.alert('Required Field', 'Idea Description is required to save draft.');
      return;
    }

    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10 digit mobile number.');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User token missing. Please login again.');
        setIsSubmitting(false);
        return;
      }

      const formData = await createFormDataWithFile('draft');

      const response = await fetch(CREATE_IDEA_POST_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      const text = await response.text();
      console.log('API Response:', text);

      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Parse error:', e);
      }

      if (response.ok && data.success) {
        const rawPath = extractFilePath(data.data);
        const fullImageUrl = normalizeFilePath(rawPath);

        console.log('Raw Path:', rawPath);
        console.log('Full URL:', fullImageUrl);

        const ideaData = {
          ...data.data,
          status: 'Draft',
          beforeImplementationImagePath: fullImageUrl,
          beforeImplementationImage: fullImageUrl,
          imagePath: fullImageUrl,
          fileType: fileType,
        };

        resetForm();
        Alert.alert('Success', 'Draft saved successfully!');
        navigation.navigate('My Ideas', {
          newIdea: ideaData,
          refreshIdeas: true,
          showDraftMessage: true,
        });
      } else {
        Alert.alert('Error', data?.message || 'Failed to save draft.');
      }
    } catch (error) {
      console.error('Network error:', error);
      Alert.alert('Error', 'Network error, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBeforeSubmit = () => {
    if (!ideaDescription.trim()) {
      Alert.alert('Required Field', 'Idea Description is required.');
      return;
    }
    if (!proposedSolution.trim()) {
      Alert.alert('Required Field', 'Proposed Solution is required.');
      return;
    }
    if (!benefit.trim()) {
      Alert.alert('Required Field', 'Process Improvement/Cost Benefit is required.');
      return;
    }
    if (!teamMembers.trim()) {
      Alert.alert('Required Field', 'Team Members is required.');
      return;
    }
    if (!solutionCategory) {
      Alert.alert('Required Field', 'Solution Category is required.');
      return;
    }
    if (!ideaTheme) {
      Alert.alert('Required Field', 'Idea Theme is required.');
      return;
    }
    if (!file) {
      Alert.alert('Required Field', 'Before Implementation file is required.');
      return;
    }
    if (!date) {
      Alert.alert('Required Field', 'Planned Completion Date is required.');
      return;
    }
    if (!mobileNumber) {
      Alert.alert('Required Field', 'Mobile Number is required.');
      return;
    }
    if (!/^\d{10}$/.test(mobileNumber)) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10 digit mobile number.');
      return;
    }
    if (beSupportNeeded === null) {
      Alert.alert('Required Field', 'Please select if BE Team Support is needed.');
      return;
    }
    if (canImplementOtherLocation === null) {
      Alert.alert('Required Field', 'Please select if can be implemented to other location.');
      return;
    }
    
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User token missing. Please login again.');
        setIsSubmitting(false);
        return;
      }

      const formData = await createFormDataWithFile('publish');

      const response = await fetch(CREATE_IDEA_POST_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      const text = await response.text();
      console.log('API Response:', text);

      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Parse error:', e);
      }

      if (response.ok && data.success) {
        const rawPath = extractFilePath(data.data);
        const fullImageUrl = normalizeFilePath(rawPath);

        console.log('Raw Path:', rawPath);
        console.log('Full URL:', fullImageUrl);

        const ideaData = {
          ...data.data,
          beforeImplementationImagePath: fullImageUrl,
          beforeImplementationImage: fullImageUrl,
          imagePath: fullImageUrl,
          fileType: fileType,
        };

        resetForm();
        Alert.alert('Success', 'Idea published successfully!');
        navigation.navigate('My Ideas', {
          newIdea: ideaData,
          refreshIdeas: true,
        });
      } else {
        Alert.alert('Error', data?.message || 'Failed to create idea.');
      }
    } catch (error) {
      console.error('Network error:', error);
      Alert.alert('Error', 'Network error, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleZoomIn = () => {
    setImageScale(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setImageScale(prev => Math.max(prev - 0.5, 0.5));
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.stickyHeader}>
        <Text style={styles.heading}>Idea Creation Form</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ height: 70 }} />

        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'idea' && styles.tabActive]}
            onPress={() => setActiveTab('idea')}
          >
            <Text style={styles.tabText}>Idea Form</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'employee' && styles.tabActive]}
            onPress={() => setActiveTab('employee')}
          >
            <Text style={styles.tabText}>Employee Details</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'employee' ? (
          <View style={styles.card}>
            {userDetails ? (
              <>
                <FieldRow label="Idea Owner Employee No:" value={userDetails.employeeNo} />
                <FieldRow label="Owner Name:" value={userDetails.name} />
                <FieldRow label="Owner Email:" value={userDetails.email} />
                <FieldRow label="Owner Department:" value={userDetails.department} />
                <FieldRow label="Owner Sub Department:" value={userDetails.subDepartment} />
                <FieldRow label="Owner Location:" value={userDetails.location} />
                <FieldRow label="Reporting Manager Name:" value={userDetails.reportingManagerName} />
                <FieldRow label="Reporting Manager Email:" value={userDetails.reportingManagerEmail} />
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
              placeholder="Enter idea description..."
              value={ideaDescription}
              onChangeText={setIdeaDescription}
              maxLength={300}
            />

            <InputField
              label="Proposed Solution"
              required
              icon={<MaterialIcons name="description" size={20} color="#666" />}
              placeholder="Enter proposed solution..."
              value={proposedSolution}
              onChangeText={setProposedSolution}
              multiline
              maxLength={500}
            />

            <InputField
              label="Process Improvement/Cost Benefit"
              required
              icon={<FontAwesome name="lightbulb-o" size={20} color="#666" />}
              placeholder="Enter tentative Benefit..."
              value={benefit}
              onChangeText={setBenefit}
              multiline
              maxLength={200}
            />

            <InputField
              label="Team Members"
              required
              icon={<MaterialIcons name="group" size={20} color="#666" />}
              placeholder="Enter team Members..."
              value={teamMembers}
              onChangeText={handleTeamMembersChange}
              maxLength={100}
              error={teamMembersError}
            />

            <PickerField
              label="Solution Category"
              required
              icon={<Ionicons name="bulb-outline" size={20} color="#666" />}
              selectedValue={solutionCategory}
              onValueChange={setSolutionCategory}
              options={[
                'Quick Win',
                'Kaizen',
                'Lean',
                'Six Sigma Yellow Belt',
                'Six Sigma Green Belt',
                'WorkPlace Management',
                'Automation',
                'Cost Saving',
                'Business Improvement',
                'Efficiency Improvement',
                'Others',
              ]}
            />

            <PickerField
              label="Idea Theme"
              required
              icon={<MaterialIcons name="category" size={20} color="#666" />}
              selectedValue={ideaTheme}
              onValueChange={setIdeaTheme}
              options={[
                'Productivity',
                'Quality',
                'Cost',
                'Delivery',
                'Safety',
                'Morale',
                'Environment',
              ]}
            />

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Before Implementation (JPG, PNG, PDF){' '}
                <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.fileInputRow}>
                <TouchableOpacity
                  style={styles.chooseFileButton}
                  onPress={() => setShowFileOptions(true)}
                >
                  <Text style={styles.chooseFileText}>Choose File</Text>
                </TouchableOpacity>
                <Text
                  style={styles.fileNameDisplay}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {fileName || 'No file chosen'}
                </Text>
              </View>

              {file && fileType === 'image' && (
                <TouchableOpacity
                  onPress={() => setFullScreen(true)}
                  style={styles.eyeIconContainer}
                >
                  <Feather name="eye" size={20} color="#2196F3" />
                  <Text style={styles.previewText}>Preview Image</Text>
                </TouchableOpacity>
              )}

              {file && fileType === 'pdf' && (
                <TouchableOpacity
                  onPress={openPDF}
                  style={styles.pdfInfoContainer}
                >
                  <Feather name="file-text" size={20} color="#FF5722" />
                  <Text style={styles.pdfInfoText}>Open PDF Preview</Text>
                </TouchableOpacity>
              )}

              <Modal visible={fullScreen} transparent={true}>
                <View style={styles.fullScreenContainer}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setFullScreen(false);
                      setImageScale(1);
                    }}
                  >
                    <Feather name="x" size={30} color="#fff" />
                  </TouchableOpacity>

                  <View style={styles.zoomControls}>
                    <TouchableOpacity
                      style={styles.zoomButton}
                      onPress={handleZoomOut}
                    >
                      <Feather name="minus" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.zoomText}>{Math.round(imageScale * 100)}%</Text>
                    <TouchableOpacity
                      style={styles.zoomButton}
                      onPress={handleZoomIn}
                    >
                      <Feather name="plus" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    maximumZoomScale={3}
                    minimumZoomScale={0.5}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                  >
                    <Image
                      source={{ uri: file }}
                      style={[styles.fullScreenImage, { transform: [{ scale: imageScale }] }]}
                      contentFit="contain"
                      cachePolicy="none"
                    />
                  </ScrollView>
                </View>
              </Modal>

              <Modal visible={showFileOptions} transparent={true} animationType="slide">
                <View style={styles.imageOptionsContainer}>
                  <View style={styles.imageOptionsContent}>
                    <Text style={styles.imageOptionsTitle}>Choose File Source</Text>

                    <TouchableOpacity
                      style={styles.imageOptionButton}
                      onPress={pickImageFromCamera}
                    >
                      <Feather name="camera" size={24} color="#2196F3" />
                      <Text style={styles.imageOptionText}>Take Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.imageOptionButton}
                      onPress={pickImageFromGallery}
                    >
                      <Feather name="image" size={24} color="#4CAF50" />
                      <Text style={styles.imageOptionText}>Choose Image from Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.imageOptionButton}
                      onPress={pickPDF}
                    >
                      <Feather name="file-text" size={24} color="#FF5722" />
                      <Text style={styles.imageOptionText}>Choose PDF Document</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.imageOptionButton, styles.cancelButton]}
                      onPress={() => setShowFileOptions(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Planned Completion Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateInputWeb}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateDisplayText}>
                  {date ? formatDate(date) : 'Select Date'}
                </Text>
                <Feather name="calendar" size={18} color="#666" />
              </TouchableOpacity>
              {date && getRemainingDays(date) !== null && (
                <Text style={styles.daysRemainingText}>
                  ({getRemainingDays(date)} days)
                </Text>
              )}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={onChangeDate}
              />
            )}

            <InputField
              label="Mobile Number"
              required
              icon={<Feather name="phone" size={20} color="#666" />}
              placeholder="Enter your number..."
              value={mobileNumber}
              onChangeText={handleMobileNumberChange}
              maxLength={10}
              keyboardType="number-pad"
              error={mobileNumberError}
            />

            <RadioField
              label="Is BE Team Support Needed?"
              required
              value={beSupportNeeded}
              setValue={setBeSupportNeeded}
            />

            <RadioField
              label="Can Be Implemented To Other Location?"
              required
              value={canImplementOtherLocation}
              setValue={setCanImplementOtherLocation}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.draftButton}
                onPress={handleSaveDraft}
                disabled={isSubmitting}
              >
                <FontAwesome name="save" size={16} color="#555" />
                <Text style={styles.draftText}>Save as Draft</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleBeforeSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.submitText}>Save & Publish</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#00B894" />
            <Text style={styles.loadingOverlayText}>Submitting your idea...</Text>
          </View>
        </View>
      )}

      <Modal visible={showConfirm} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', width: '80%', padding: 20, borderRadius: 10, alignItems: 'center' }}>
            <Feather name="check-circle" size={40} color="#2196F3" />
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Save & Publish</Text>
            <Text style={{ fontSize: 14, textAlign: 'center', color: '#333' }}>
              Are you sure you want to save and publish this record?
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <TouchableOpacity
                style={{ backgroundColor: '#ddd', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginRight: 10 }}
                onPress={() => setShowConfirm(false)}
                disabled={isSubmitting}
              >
                <Text style={{ color: '#333', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#00B894', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }}
                onPress={() => { setShowConfirm(false); handleFinalSubmit(); }}
                disabled={isSubmitting}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Save & Publish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const InputField = ({ label, icon, placeholder, value, onChangeText, multiline, maxLength, required, keyboardType, error }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>
      {label} {required && <Text style={styles.required}>*</Text>}
    </Text>
    <View style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}>
      <View style={styles.iconContainer}>{icon}</View>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor="#999"
        keyboardType={keyboardType || 'default'}
        maxLength={maxLength}
      />
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
    {maxLength && <Text style={styles.charCount}>{value.length}/{maxLength}</Text>}
  </View>
);

const PickerField = ({ label, icon, selectedValue, onValueChange, options, required }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>
      {label} {required && <Text style={styles.required}>*</Text>}
    </Text>
    <View style={styles.inputWrapper}>
      <View style={styles.iconContainer}>{icon}</View>
      <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker} dropdownIconColor="#666">
        <Picker.Item label="Select" value="" />
        {options.map((option, index) => (
          <Picker.Item label={option} value={option} key={index} />
        ))}
      </Picker>
    </View>
  </View>
);

const RadioField = ({ label, value, setValue, required }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>
      {label} {required && <Text style={styles.required}>*</Text>}
    </Text>
    <View style={styles.radioRow}>
      <TouchableOpacity style={styles.radioOption} onPress={() => setValue('Yes')}>
        <View style={[styles.radioCircle, value === 'Yes' && styles.radioSelected]} />
        <Text style={styles.radioText}>Yes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.radioOption} onPress={() => setValue('No')}>
        <View style={[styles.radioCircle, value === 'No' && styles.radioSelected]} />
        <Text style={styles.radioText}>No</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const FieldRow = ({ label, value }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue} numberOfLines={2} ellipsizeMode="tail">{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#F5F8FF', padding: 20, paddingBottom: 50 },
  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#F5F8FF',
    paddingVertical: 15, zIndex: 10, elevation: 5, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000',
    shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5,
  },
  inputBlock: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
  required: { color: 'red' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  inputWrapperMultiline: { alignItems: 'flex-start', paddingTop: 12 },
  iconContainer: { justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  picker: { flex: 1, color: '#333' },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 0 },
  charCount: { alignSelf: 'flex-end', fontSize: 12, color: '#888', marginTop: 4 },
  errorText: { color: 'red', fontSize: 12, marginTop: 4, fontWeight: '500' },
  fileInputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5',
    borderRadius: 8, borderWidth: 1, borderColor: '#ddd', overflow: 'hidden', marginBottom: 10,
  },
  chooseFileButton: {
    backgroundColor: '#e0e0e0', paddingHorizontal: 16, paddingVertical: 12,
    borderRightWidth: 1, borderRightColor: '#ccc',
  },
  chooseFileText: { color: '#333', fontSize: 14, fontWeight: '500' },
  fileNameDisplay: { flex: 1, paddingHorizontal: 12, color: '#666', fontSize: 14 },
  eyeIconContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  previewText: { marginLeft: 6, color: '#2196F3', fontSize: 14, fontWeight: '500' },
  pdfInfoContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, alignSelf: 'flex-start',
  },
  pdfInfoText: { marginLeft: 8, color: '#FF5722', fontSize: 14, fontWeight: '500' },
  dateInputWeb: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F0F2F5', borderRadius: 8, borderWidth: 1, borderColor: '#ddd',
    paddingHorizontal: 12, paddingVertical: 12,
  },
  dateDisplayText: { color: '#333', fontSize: 14 },
  daysRemainingText: { fontSize: 13, color: '#666', marginTop: 6, fontStyle: 'italic' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  draftButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#e2e2e2', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, flex: 1,
  },
  draftText: { marginLeft: 7, fontSize: 16, color: '#333', fontWeight: '600' },
  submitButton: {
    backgroundColor: '#00B894', paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 10, flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  radioCircle: {
    height: 18, width: 18, borderRadius: 9, borderWidth: 2, borderColor: '#666',
    marginRight: 8, alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  radioText: { fontSize: 14, color: '#333' },
  tabButton: {
    flex: 1, paddingVertical: 12, backgroundColor: '#e0e0e0',
    alignItems: 'center', borderRadius: 8, marginHorizontal: 2,
  },
  tabActive: { backgroundColor: '#00B894' },
  tabText: { color: '#fff', fontWeight: '600' },
  fieldRow: {
    flexDirection: 'row', marginBottom: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  fieldLabel: { fontWeight: 'bold', flex: 1.2, color: '#333', fontSize: 14 },
  fieldValue: { flex: 2, color: '#555', fontSize: 14 },
  loadingText: { color: '#555', textAlign: 'center', marginTop: 20, fontSize: 16 },
  fullScreenContainer: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center', alignItems: 'center',
  },
  closeButton: { position: 'absolute', top: 40, right: 20, zIndex: 3, padding: 10 },
  zoomControls: {
    position: 'absolute', bottom: 40, flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 25, padding: 10, zIndex: 2, alignItems: 'center',
  },
  zoomButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  zoomText: { color: '#fff', fontSize: 16, fontWeight: '600', marginHorizontal: 10 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  fullScreenImage: { width: 350, height: 600 },
  imageOptionsContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  imageOptionsContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 50, minHeight: 400,
  },
  imageOptionsTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  imageOptionButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5',
    padding: 18, borderRadius: 12, marginBottom: 14,
  },
  imageOptionText: { fontSize: 16, color: '#333', fontWeight: '600', marginLeft: 15 },
  cancelButton: { backgroundColor: '#FFE5E5', marginTop: 10, justifyContent: 'center' },
  cancelButtonText: { fontSize: 16, color: '#FF3B30', fontWeight: '600', textAlign: 'center' },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: '#fff', padding: 30, borderRadius: 15, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10, elevation: 10,
  },
  loadingOverlayText: { marginTop: 15, fontSize: 16, color: '#333', fontWeight: '600' },
});