// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
//   Image,
//   Modal,
//   ActivityIndicator,
//   Platform,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Picker } from '@react-native-picker/picker';
// import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import * as ImagePicker from 'expo-image-picker';
// import * as DocumentPicker from 'expo-document-picker';
// import NetInfo from '@react-native-community/netinfo';

// const MANAGER_EDIT_IDEA_URL = (id) => `https://ideabank-api-dev.abisaio.com/approval/edit/${id}`;
// const EMPLOYEE_GET_URL = "https://ideabank-api-dev.abisaio.com/EmployeeInfo";

// export default function ManagerEditIdeaScreen() {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const ideaData = route.params?.ideaData || {};
//   const ideaId = route.params?.ideaId;

//   useEffect(() => {
//     navigation.setOptions({
//       headerStyle: { backgroundColor: '#0f4c5c' },
//       headerTintColor: '#fff',
//       headerTitleStyle: { fontWeight: 'bold' },
//       title: 'Edit Idea (Manager)',
//     });
//   }, [navigation]);

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
//       : null
//   );
//   const [showDatePicker, setShowDatePicker] = useState(false);
  
//   const existingFile = ideaData.beforeImplementationImagePath || ideaData.imagePath || null;
//   const [file, setFile] = useState(existingFile);
//   const [fileName, setFileName] = useState(() => {
//     if (!existingFile) return '';
//     if (existingFile.toLowerCase().includes('.pdf')) return 'Existing PDF Document';
//     try {
//       const urlParts = existingFile.split('/');
//       const filename = urlParts[urlParts.length - 1];
//       return decodeURIComponent(filename).replace(/\s+/g, ' ').trim() || 'Existing Image';
//     } catch (e) {
//       return 'Existing Image';
//     }
//   });
//   const [fileType, setFileType] = useState(() => {
//     if (!existingFile) return 'image';
//     return existingFile.toLowerCase().includes('.pdf') ? 'pdf' : 'image';
//   });
  
//   const [fullScreen, setFullScreen] = useState(false);
//   const [imageScale, setImageScale] = useState(1);
//   const [beSupportNeeded, setBeSupportNeeded] = useState(() => {
//     if (ideaData.isBETeamSupportNeeded === true || ideaData.isBETeamSupportNeeded === 'true' || ideaData.isBETeamSupportNeeded === 'Yes') return 'Yes';
//     if (ideaData.isBETeamSupportNeeded === false || ideaData.isBETeamSupportNeeded === 'false' || ideaData.isBETeamSupportNeeded === 'No') return 'No';
//     return null;
//   });
//   const [canImplementOtherLocation, setCanImplementOtherLocation] = useState(() => {
//     if (ideaData.canBeImplementedToOtherLocations === true || ideaData.canBeImplementedToOtherLocations === 'true' || ideaData.canBeImplementedToOtherLocations === 'Yes' || ideaData.canBeImplementedToOtherLocation === true || ideaData.canBeImplementedToOtherLocation === 'Yes') return 'Yes';
//     if (ideaData.canBeImplementedToOtherLocations === false || ideaData.canBeImplementedToOtherLocations === 'false' || ideaData.canBeImplementedToOtherLocations === 'No' || ideaData.canBeImplementedToOtherLocation === false || ideaData.canBeImplementedToOtherLocation === 'No') return 'No';
//     return null;
//   });
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [showFileOptions, setShowFileOptions] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const fetchEmployeeDetails = useCallback(async () => {
//     if (activeTab !== 'employee') return;
//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (!token) return;
//       const response = await fetch(EMPLOYEE_GET_URL, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (!response.ok) throw new Error('Failed to fetch employee details');
//       const data = await response.json();
      
//       setUserDetails({
//         employeeNo: data.data.ideaOwnerEmployeeNo || '',
//         name: data.data.ideaOwnerName || '',
//         email: data.data.ideaOwnerEmail || '',
//         department: data.data.ideaOwnerDepartment || '',
//         subDepartment: data.data.ideaOwnerSubDepartment || '',
//         location: data.data.location || '',
//         reportingManagerName: data.data.reportingManagerName || '',
//         reportingManagerEmail: data.data.managerEmail || '',
//       });
//     } catch (error) {
//       console.error('Error fetching employee details:', error);
//     }
//   }, [activeTab]);

//   useEffect(() => {
//     fetchEmployeeDetails();
//   }, [fetchEmployeeDetails]);

//   const handleTabSwitch = useCallback((tab) => {
//     setActiveTab(tab);
//   }, []);

//   const pickImageFromGallery = async () => {
//     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permissionResult.granted) {
//       alert('Permission required!');
//       return;
//     }
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 1,
//     });
//     if (!result.canceled) {
//       setFile(result.assets[0].uri);
//       setFileType('image');
//       const uriParts = result.assets[0].uri.split('/');
//       setFileName(uriParts[uriParts.length - 1]);
//       setShowFileOptions(false);
//       console.log('✅ New image selected from gallery:', result.assets[0].uri);
//     }
//   };

//   const pickImageFromCamera = async () => {
//     const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
//     if (!permissionResult.granted) {
//       alert('Camera permission required!');
//       return;
//     }
//     let result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       quality: 1,
//     });
//     if (!result.canceled) {
//       setFile(result.assets[0].uri);
//       setFileType('image');
//       const uriParts = result.assets[0].uri.split('/');
//       setFileName(uriParts[uriParts.length - 1]);
//       setShowFileOptions(false);
//       console.log('✅ New image captured from camera:', result.assets[0].uri);
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
//         console.log('✅ New PDF selected:', selectedFile.uri);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to pick PDF file');
//     }
//   };

//   const onChangeDate = useCallback((event, selectedDate) => {
//     setShowDatePicker(false);
//     if (selectedDate) setDate(selectedDate);
//   }, []);

//   const formatDate = (dateObj) => {
//     if (!dateObj) return '';
//     const day = String(dateObj.getDate()).padStart(2, '0');
//     const month = String(dateObj.getMonth() + 1).padStart(2, '0');
//     const year = dateObj.getFullYear();
//     return `${day}-${month}-${year}`;
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

//   const handleBeforeSubmit = useCallback(() => {
//     if (!proposedSolution || !solutionCategory || !file || !date || !mobileNumber) {
//       Alert.alert('Required Fields', 'Please fill all required fields.');
//       return;
//     }
//     if (!/^\d{10}$/.test(mobileNumber)) {
//       Alert.alert('Invalid Mobile Number', 'Please enter a valid 10 digit mobile number.');
//       return;
//     }
//     setShowConfirm(true);
//   }, [proposedSolution, solutionCategory, file, date, mobileNumber]);

//   const handleFinalSubmit = async () => {
//     setShowConfirm(false);
    
//     try {
//       setIsSubmitting(true);
      
//       const netInfo = await NetInfo.fetch();
//       if (!netInfo.isConnected) {
//         Alert.alert('No Internet', 'Please check your internet connection and try again.');
//         setIsSubmitting(false);
//         return;
//       }

//       const token = await AsyncStorage.getItem('token');
//       if (!token) {
//         Alert.alert('Error', 'User token missing. Please login again.');
//         setIsSubmitting(false);
//         return;
//       }

//       const formData = new FormData();
//       formData.append('IdeaDescription', ideaDescription || '');
//       formData.append('ProposedSolution', proposedSolution || '');
//       formData.append('TentativeBenefit', benefit || '');
//       formData.append('TeamMembers', teamMembers || '');
//       formData.append('MobileNumber', mobileNumber || '');
//       formData.append('SolutionCategory', solutionCategory || '');
//       formData.append('IdeaTheme', ideaTheme || '');
//       formData.append('PlannedImplementationDuration', date ? date.toISOString().split('T')[0] : '');
//       formData.append('IsBETeamSupportNeeded', beSupportNeeded || '');
//       formData.append('CanBeImplementedToOtherLocations', canImplementOtherLocation || '');

//       if (file) {
//         const isNewFile = file.startsWith('file://') || 
//                           file.startsWith('content://') || 
//                           file.startsWith('ph://');
        
//         console.log('📎 File info:', { 
//           file: file.substring(0, 50) + '...', 
//           isNewFile, 
//           fileName, 
//           fileType 
//         });
        
//         if (isNewFile) {
//           const fileExtension = fileName.split('.').pop().toLowerCase();
          
//           if (fileType === 'pdf') {
//             formData.append('image', {
//               uri: Platform.OS === 'android' ? file : file.replace('file://', ''),
//               type: 'application/pdf',
//               name: fileName || `document_${Date.now()}.pdf`,
//             });
//             console.log('📄 Uploading new PDF');
//           } else {
//             let mimeType = 'image/jpeg';
//             if (fileExtension === 'png') mimeType = 'image/png';
//             else if (fileExtension === 'jpg' || fileExtension === 'jpeg') mimeType = 'image/jpeg';
            
//             formData.append('image', {
//               uri: Platform.OS === 'android' ? file : file.replace('file://', ''),
//               type: mimeType,
//               name: fileName || `image_${Date.now()}.${fileExtension}`,
//             });
//             console.log('🖼️ Uploading new image with type:', mimeType);
//           }
//         } else {
//           console.log('✅ Keeping existing server file - not uploading');
//         }
//       }

//       // ✅ Manager ke liye alag API endpoint
//       const apiUrl = MANAGER_EDIT_IDEA_URL(ideaId);

//       console.log('🌐 Manager Edit API URL:', apiUrl);
//       console.log('👔 Manager Editing Idea ID:', ideaId);

//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       console.log('📡 Response Status:', response.status);
      
//       const responseText = await response.text();
//       console.log('📥 Raw Response (first 500 chars):', responseText.substring(0, 500));
      
//       // Check for specific permission errors
//       if (responseText.includes("don't have permission") || 
//           responseText.includes("Permission denied") ||
//           responseText.includes("Forbidden")) {
//         setIsSubmitting(false);
//         Alert.alert(
//           'Permission Denied',
//           'You do not have permission to edit this idea. Only the reporting manager can edit pending ideas.',
//           [{ text: 'OK', onPress: () => navigation.goBack() }]
//         );
//         return;
//       }
      
//       if (response.status === 403) {
//         setIsSubmitting(false);
//         Alert.alert(
//           'Permission Denied',
//           'You do not have permission to edit this idea.',
//           [{ text: 'OK', onPress: () => navigation.goBack() }]
//         );
//         return;
//       }

//       if (response.status === 401) {
//         setIsSubmitting(false);
//         Alert.alert(
//           'Session Expired',
//           'Your session has expired. Please login again.',
//           [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
//         );
//         return;
//       }

//       if (response.status >= 500) {
//         setIsSubmitting(false);
//         Alert.alert(
//           'Server Error',
//           'Server is experiencing issues. Please try again later or contact support.',
//           [{ text: 'OK' }]
//         );
//         return;
//       }

//       // Try to parse JSON response
//       let data;
//       try {
//         data = JSON.parse(responseText);
//         console.log('✅ Parsed JSON:', data);
//       } catch (parseError) {
//         console.error('❌ JSON Parse Error:', parseError);
        
//         // If 200 OK but not JSON, assume success
//         if (response.ok || response.status === 200) {
//           setIsSubmitting(false);
//           Alert.alert(
//             'Success', 
//             'Idea updated successfully!',
//             [{
//               text: 'OK',
//               onPress: () => navigation.goBack()
//             }]
//           );
//           return;
//         } else {
//           throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
//         }
//       }
      
//       setIsSubmitting(false);

//       if (response.ok && (data.success === true || data.success === 'true' || response.status === 200)) {
//         Alert.alert(
//           'Success', 
//           data.message || 'Idea updated successfully by manager!',
//           [{
//             text: 'OK',
//             onPress: () => navigation.goBack()
//           }]
//         );
//       } else {
//         console.error('❌ Update failed:', data);
//         Alert.alert(
//           'Error', 
//           data?.message || data?.error || `Failed to update idea. Status: ${response.status}`
//         );
//       }

//     } catch (error) {
//       console.error('❌ Submit error:', error);
      
//       let errorMessage = 'Network error, please try again.';
      
//       if (error.message) {
//         if (error.message.includes('Network request failed')) {
//           errorMessage = 'Cannot connect to server. Please check your internet connection.';
//         } else if (error.message.includes('timeout')) {
//           errorMessage = 'Request timeout. Please check your internet connection.';
//         } else if (error.message.includes('JSON')) {
//           errorMessage = 'Server response format error. Please contact support.';
//         } else {
//           errorMessage = error.message;
//         }
//       }
      
//       Alert.alert('Error', errorMessage);
//       setIsSubmitting(false);
//     }
//   };

//   const handleZoomIn = useCallback(() => {
//     setImageScale(prev => Math.min(prev + 0.5, 3));
//   }, []);

//   const handleZoomOut = useCallback(() => {
//     setImageScale(prev => Math.max(prev - 0.5, 0.5));
//   }, []);

//   return (
//     <View style={{ flex: 1, backgroundColor: '#F5F8FF' }}>
//       <ScrollView contentContainerStyle={styles.container}>
        
//         <View style={styles.managerBadge}>
//           <Ionicons name="shield-checkmark" size={20} color="#fff" />
//           <Text style={styles.managerBadgeText}>Manager Edit Mode</Text>
//         </View>

//         <View style={styles.tabContainer}>
//           <TouchableOpacity
//             activeOpacity={0.7}
//             style={[styles.tabButton, activeTab === 'idea' && styles.tabActive]}
//             onPress={() => handleTabSwitch('idea')}
//           >
//             <Text style={[styles.tabText, activeTab === 'idea' && styles.tabTextActive]}>Idea Form</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             activeOpacity={0.7}
//             style={[styles.tabButton, activeTab === 'employee' && styles.tabActive]}
//             onPress={() => handleTabSwitch('employee')}
//           >
//             <Text style={[styles.tabText, activeTab === 'employee' && styles.tabTextActive]}>Employee Details</Text>
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
//               icon={<MaterialIcons name="group" size={20} color="#666" />}
//               placeholder="Enter team Members..."
//               value={teamMembers}
//               onChangeText={setTeamMembers}
//               maxLength={100}
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

//             <View style={styles.inputBlock}>
//               <Text style={styles.label}>Before Implementation (JPG, PNG, PDF) <Text style={styles.required}>*</Text></Text>
//               <View style={styles.fileInputRow}>
//                 <TouchableOpacity 
//                   activeOpacity={0.7}
//                   style={styles.chooseFileButton} 
//                   onPress={() => setShowFileOptions(true)}
//                 >
//                   <Text style={styles.chooseFileText}>Choose File</Text>
//                 </TouchableOpacity>
//                 <Text style={styles.fileNameDisplay} numberOfLines={1}>
//                   {fileName || (file ? (fileType === 'pdf' ? 'PDF selected' : 'Image selected') : 'No file chosen')}
//                 </Text>
//               </View>

//               {file && fileType === 'image' && (
//                 <TouchableOpacity 
//                   activeOpacity={0.7}
//                   onPress={() => setFullScreen(true)} 
//                   style={styles.imagePreviewButton}
//                 >
//                   <Feather name="image" size={18} color="#2196F3" />
//                   <Text style={styles.previewText}>View Image</Text>
//                 </TouchableOpacity>
//               )}

//               {file && fileType === 'pdf' && (
//                 <View style={styles.pdfInfoContainer}>
//                   <Feather name="file-text" size={20} color="#FF5722" />
//                   <Text style={styles.pdfInfoText}>PDF Selected: {fileName}</Text>
//                 </View>
//               )}

//               <Modal visible={fullScreen} transparent={true}>
//                 <View style={styles.fullScreenContainer}>
//                   <TouchableOpacity 
//                     activeOpacity={0.7}
//                     style={styles.closeButton} 
//                     onPress={() => {
//                       setFullScreen(false);
//                       setImageScale(1);
//                     }}
//                   >
//                     <Feather name="x" size={30} color="#fff" />
//                   </TouchableOpacity>
                  
//                   <View style={styles.zoomControls}>
//                     <TouchableOpacity activeOpacity={0.7} style={styles.zoomButton} onPress={handleZoomOut}>
//                       <Feather name="minus" size={24} color="#fff" />
//                     </TouchableOpacity>
//                     <Text style={styles.zoomText}>{Math.round(imageScale * 100)}%</Text>
//                     <TouchableOpacity activeOpacity={0.7} style={styles.zoomButton} onPress={handleZoomIn}>
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
//                       resizeMode="contain" 
//                     />
//                   </ScrollView>
//                 </View>
//               </Modal>

//               <Modal visible={showFileOptions} transparent={true} animationType="slide">
//                 <View style={styles.imageOptionsContainer}>
//                   <View style={styles.imageOptionsContent}>
//                     <Text style={styles.imageOptionsTitle}>Choose File Source</Text>
                    
//                     <TouchableOpacity 
//                       activeOpacity={0.7}
//                       style={styles.imageOptionButton} 
//                       onPress={pickImageFromCamera}
//                     >
//                       <Feather name="camera" size={24} color="#2196F3" />
//                       <Text style={styles.imageOptionText}>Take Photo</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity 
//                       activeOpacity={0.7}
//                       style={styles.imageOptionButton} 
//                       onPress={pickImageFromGallery}
//                     >
//                       <Feather name="image" size={24} color="#4CAF50" />
//                       <Text style={styles.imageOptionText}>Choose Image from Gallery</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity 
//                       activeOpacity={0.7}
//                       style={styles.imageOptionButton} 
//                       onPress={pickPDF}
//                     >
//                       <Feather name="file-text" size={24} color="#FF5722" />
//                       <Text style={styles.imageOptionText}>Choose PDF Document</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity 
//                       activeOpacity={0.7}
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
//               <Text style={styles.label}>Planned Completion Date <Text style={styles.required}>*</Text></Text>
//               <TouchableOpacity 
//                 activeOpacity={0.7}
//                 style={styles.dateInputWeb} 
//                 onPress={() => setShowDatePicker(true)}
//               >
//                 <Text style={styles.dateDisplayText}>{date ? formatDate(date) : 'Select Date'}</Text>
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
//               onChangeText={setMobileNumber}
//               maxLength={10}
//             />

//             <RadioField label="Is BE Team Support Needed?" value={beSupportNeeded} setValue={setBeSupportNeeded} />
//             <RadioField label="Can Be Implemented To Other Location?" value={canImplementOtherLocation} setValue={setCanImplementOtherLocation} />

//             <TouchableOpacity
//               activeOpacity={0.7}
//               style={styles.submitButton}
//               onPress={handleBeforeSubmit}
//               disabled={isSubmitting}
//             >
//               <Ionicons name="checkmark-circle" size={20} color="#fff" />
//               <Text style={styles.submitText}>Update Idea</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>

//       {isSubmitting && (
//         <View style={styles.loadingOverlay}>
//           <View style={styles.loadingCard}>
//             <ActivityIndicator size="large" color="#00B894" />
//             <Text style={styles.loadingOverlayText}>Updating idea...</Text>
//           </View>
//         </View>
//       )}

//       <Modal visible={showConfirm} transparent={true} animationType="fade">
//         <View style={styles.confirmModalOverlay}>
//           <View style={styles.confirmModalContent}>
//             <Feather name="check-circle" size={40} color="#2196F3" />
//             <Text style={styles.confirmModalTitle}>Update Idea as Manager</Text>
//             <Text style={styles.confirmModalText}>
//               Are you sure you want to update this idea? This will modify the idea details for your team member.
//             </Text>
//             <View style={styles.confirmModalButtons}>
//               <TouchableOpacity
//                 activeOpacity={0.7}
//                 style={styles.confirmCancelButton}
//                 onPress={() => setShowConfirm(false)}
//                 disabled={isSubmitting}
//               >
//                 <Text style={styles.confirmCancelText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 activeOpacity={0.7}
//                 style={styles.confirmSubmitButton}
//                 onPress={handleFinalSubmit}
//                 disabled={isSubmitting}
//               >
//                 <Text style={styles.confirmSubmitText}>Confirm</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// // ============= REUSABLE COMPONENTS =============

// const InputField = ({ label, icon, placeholder, value, onChangeText, multiline, maxLength, required }) => (
//   <View style={styles.inputBlock}>
//     <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
//     <View style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}>
//       {icon}
//       <TextInput
//         style={[styles.input, multiline && styles.textArea]}
//         placeholder={placeholder}
//         value={value}
//         onChangeText={onChangeText}
//         multiline={multiline}
//         placeholderTextColor="#999"
//         keyboardType={label === 'Mobile Number' ? 'numeric' : 'default'}
//         maxLength={maxLength}
//       />
//     </View>
//     {maxLength && <Text style={styles.charCount}>{value.length}/{maxLength}</Text>}
//   </View>
// );

// const PickerField = ({ label, icon, selectedValue, onValueChange, options }) => (
//   <View style={styles.inputBlock}>
//     <Text style={styles.label}>{label}</Text>
//     <View style={styles.inputWrapper}>
//       {icon}
//       <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker} dropdownIconColor="#666">
//         <Picker.Item label="Select" value="" />
//         {options.map((option, index) => <Picker.Item label={option} value={option} key={index} />)}
//       </Picker>
//     </View>
//   </View>
// );

// const RadioField = ({ label, value, setValue }) => (
//   <View style={styles.inputBlock}>
//     <Text style={styles.label}>{label}</Text>
//     <View style={styles.radioRow}>
//       <TouchableOpacity 
//         activeOpacity={0.7}
//         style={styles.radioOption} 
//         onPress={() => setValue(value === 'Yes' ? null : 'Yes')}
//       >
//         <View style={[styles.radioCircle, value === 'Yes' && styles.radioSelected]} />
//         <Text style={styles.radioText}>Yes</Text>
//       </TouchableOpacity>
//       <TouchableOpacity 
//         activeOpacity={0.7}
//         style={styles.radioOption} 
//         onPress={() => setValue(value === 'No' ? null : 'No')}
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
//     <Text style={styles.fieldValue}>{value || '-'}</Text>
//   </View>
// );

// // ============= STYLES =============

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#F5F8FF',
//     padding: 16,
//     paddingBottom: 40,
//   },
//   managerBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FF9800',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     gap: 8,
//   },
//   managerBadgeText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     marginBottom: 16,
//     gap: 10,
//   },
//   tabButton: {
//     flex: 1,
//     paddingVertical: 12,
//     backgroundColor: '#e0e0e0',
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   tabActive: {
//     backgroundColor: '#00B894',
//   },
//   tabText: {
//     color: '#666',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   tabTextActive: {
//     color: '#fff',
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 10,
//     elevation: 5
//   },
//   inputBlock: { 
//     marginBottom: 16 
//   },
//   label: { 
//     fontSize: 14, 
//     fontWeight: '600', 
//     marginBottom: 6, 
//     color: '#333' 
//   },
//   required: { 
//     color: 'red' 
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F2F5',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 10
//   },
//   inputWrapperMultiline: { 
//     alignItems: 'flex-start' 
//   },
//   input: { 
//     flex: 1, 
//     fontSize: 14, 
//     marginLeft: 10, 
//     color: '#333' 
//   },
//   picker: { 
//     flex: 1, 
//     marginLeft: 10, 
//     color: '#333' 
//   },
//   textArea: { 
//     height: 100, 
//     textAlignVertical: 'top' 
//   },
//   charCount: { 
//     alignSelf: 'flex-end', 
//     fontSize: 12, 
//     color: '#888', 
//     marginTop: 4 
//   },
//   fileInputRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F2F5',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     overflow: 'hidden',
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
//     fontSize: 13,
//   },
//   imagePreviewButton: {
//     marginTop: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#E3F2FD',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 6,
//     alignSelf: 'flex-start',
//   },
//   previewText: {
//     marginLeft: 6,
//     color: '#2196F3',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   pdfInfoContainer: {
//     marginTop: 8,
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
//   submitButton: {
//     flexDirection: 'row',
//     backgroundColor: '#FF9800',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 20,
//     gap: 8,
//   },
//   submitText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '700'
//   },
//   radioRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 6
//   },
//   radioOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 20
//   },
//   radioCircle: {
//     height: 18,
//     width: 18,
//     borderRadius: 9,
//     borderWidth: 2,
//     borderColor: '#666',
//     marginRight: 8,
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   radioSelected: {
//     backgroundColor: '#4CAF50',
//     borderColor: '#4CAF50'
//   },
//   radioText: {
//     fontSize: 14,
//     color: '#333'
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
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
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
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 22,
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
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   imageOptionsContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//     paddingBottom: 40,
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
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 12,
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
//   confirmModalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   confirmModalContent: {
//     backgroundColor: '#fff',
//     width: '85%',
//     maxWidth: 400,
//     padding: 24,
//     borderRadius: 12,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.25,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   confirmModalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginVertical: 12,
//     color: '#333',
//   },
//   confirmModalText: {
//     fontSize: 14,
//     textAlign: 'center',
//     color: '#666',
//     marginBottom: 8,
//   },
//   confirmModalButtons: {
//     flexDirection: 'row',
//     marginTop: 20,
//     gap: 12,
//   },
//   confirmCancelButton: {
//     backgroundColor: '#e0e0e0',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     flex: 1,
//     alignItems: 'center',
//   },
//   confirmCancelText: {
//     color: '#333',
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   confirmSubmitButton: {
//     backgroundColor: '#FF9800',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     flex: 1,
//     alignItems: 'center',
//   },
//   confirmSubmitText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 15,
//   },
// });



// Manager edit 

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';

// ✅ API ENDPOINTS - Add this to your api.js file too
const MANAGER_EDIT_IDEA_URL = (id) => `https://ideabank-api-dev.abisaio.com/api/Approval/edit/${id}`;
const EMPLOYEE_GET_URL = "https://ideabank-api-dev.abisaio.com/EmployeeInfo";

export default function ManagerEditIdeaScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const ideaData = route.params?.ideaData || {};
  const ideaId = route.params?.ideaId;
  const onSuccess = route.params?.onSuccess;

  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: '#FF9800' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
      title: 'Manager Edit Idea',
    });
  }, [navigation]);

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
      : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const existingFile = ideaData.beforeImplementationImagePath || ideaData.imagePath || null;
  const [file, setFile] = useState(existingFile);
  const [fileName, setFileName] = useState(() => {
    if (!existingFile) return '';
    if (existingFile.toLowerCase().includes('.pdf')) return 'Existing PDF Document';
    try {
      const urlParts = existingFile.split('/');
      const filename = urlParts[urlParts.length - 1];
      return decodeURIComponent(filename).replace(/\s+/g, ' ').trim() || 'Existing Image';
    } catch (e) {
      return 'Existing Image';
    }
  });
  const [fileType, setFileType] = useState(() => {
    if (!existingFile) return 'image';
    return existingFile.toLowerCase().includes('.pdf') ? 'pdf' : 'image';
  });
  
  const [fullScreen, setFullScreen] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [beSupportNeeded, setBeSupportNeeded] = useState(() => {
    if (ideaData.isBETeamSupportNeeded === true || ideaData.isBETeamSupportNeeded === 'true' || ideaData.isBETeamSupportNeeded === 'Yes') return 'Yes';
    if (ideaData.isBETeamSupportNeeded === false || ideaData.isBETeamSupportNeeded === 'false' || ideaData.isBETeamSupportNeeded === 'No') return 'No';
    return 'No';
  });
  const [canImplementOtherLocation, setCanImplementOtherLocation] = useState(() => {
    if (ideaData.canBeImplementedToOtherLocations === true || ideaData.canBeImplementedToOtherLocations === 'true' || ideaData.canBeImplementedToOtherLocations === 'Yes' || ideaData.canBeImplementedToOtherLocation === true || ideaData.canBeImplementedToOtherLocation === 'Yes') return 'Yes';
    if (ideaData.canBeImplementedToOtherLocations === false || ideaData.canBeImplementedToOtherLocations === 'false' || ideaData.canBeImplementedToOtherLocations === 'No' || ideaData.canBeImplementedToOtherLocation === false || ideaData.canBeImplementedToOtherLocation === 'No') return 'No';
    return 'No';
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployeeDetails = useCallback(async () => {
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
      console.error('❌ Error fetching employee details:', error);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [fetchEmployeeDetails]);

  const handleTabSwitch = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow gallery access to select images.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setFile(result.assets[0].uri);
      setFileType('image');
      const uriParts = result.assets[0].uri.split('/');
      setFileName(uriParts[uriParts.length - 1]);
      setShowFileOptions(false);
      console.log('✅ New image selected:', result.assets[0].uri);
    }
  };

  const pickImageFromCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow camera access to take photos.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setFile(result.assets[0].uri);
      setFileType('image');
      const uriParts = result.assets[0].uri.split('/');
      setFileName(uriParts[uriParts.length - 1]);
      setShowFileOptions(false);
      console.log('✅ New photo captured:', result.assets[0].uri);
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
        setFileName(selectedFile.name);
        setShowFileOptions(false);
        console.log('✅ PDF selected:', selectedFile.name);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select PDF file.');
    }
  };

  const onChangeDate = useCallback((event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  }, []);

  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
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

  const handleBeforeSubmit = useCallback(() => {
    // Validation
    if (!ideaDescription.trim()) {
      Alert.alert('Required Field', 'Please enter idea description.');
      return;
    }
    if (!proposedSolution.trim()) {
      Alert.alert('Required Field', 'Please enter proposed solution.');
      return;
    }
    if (!solutionCategory) {
      Alert.alert('Required Field', 'Please select solution category.');
      return;
    }
    if (!file) {
      Alert.alert('Required Field', 'Please upload before implementation image/PDF.');
      return;
    }
    if (!date) {
      Alert.alert('Required Field', 'Please select planned completion date.');
      return;
    }
    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
      Alert.alert('Invalid Mobile', 'Please enter valid 10 digit mobile number.');
      return;
    }
    setShowConfirm(true);
  }, [ideaDescription, proposedSolution, solutionCategory, file, date, mobileNumber]);

  const handleFinalSubmit = async () => {
    setShowConfirm(false);
    
    try {
      setIsSubmitting(true);
      
      // Check internet
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        Alert.alert('No Internet', 'Please check your internet connection.');
        setIsSubmitting(false);
        return;
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Session expired. Please login again.');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('IdeaDescription', ideaDescription.trim());
      formData.append('ProposedSolution', proposedSolution.trim());
      formData.append('TentativeBenefit', benefit.trim());
      formData.append('TeamMembers', teamMembers.trim());
      formData.append('MobileNumber', mobileNumber.trim());
      formData.append('SolutionCategory', solutionCategory);
      formData.append('IdeaTheme', ideaTheme);
      formData.append('PlannedImplementationDuration', date ? date.toISOString().split('T')[0] : '');
      formData.append('IsBETeamSupportNeeded', beSupportNeeded);
      formData.append('CanBeImplementedToOtherLocations', canImplementOtherLocation);

      // Handle file upload
      if (file) {
        const isNewFile = file.startsWith('file://') || 
                          file.startsWith('content://') || 
                          file.startsWith('ph://');
        
        console.log('📎 File check:', { 
          isNewFile, 
          fileName, 
          fileType,
          filePath: file.substring(0, 50) + '...'
        });
        
        if (isNewFile) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(file);
            
            if (!fileInfo.exists) {
              throw new Error('File not found on device');
            }

            const fileExtension = fileName.split('.').pop().toLowerCase();
            let mimeType = 'application/octet-stream';
            
            if (fileType === 'pdf' || fileExtension === 'pdf') {
              mimeType = 'application/pdf';
            } else if (['png', 'jpg', 'jpeg'].includes(fileExtension)) {
              mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
            }

            formData.append('image', {
              uri: Platform.OS === 'ios' ? file.replace('file://', '') : file,
              type: mimeType,
              name: fileName || `file_${Date.now()}.${fileExtension}`,
            });
            
            console.log('✅ New file attached for upload');
          } catch (fileError) {
            console.error('❌ File error:', fileError);
            Alert.alert('File Error', 'Unable to process selected file. Please try again.');
            setIsSubmitting(false);
            return;
          }
        } else {
          console.log('ℹ️ Using existing server file (no upload needed)');
        }
      }

      const apiUrl = MANAGER_EDIT_IDEA_URL(ideaId);
      console.log('🚀 Submitting to:', apiUrl);
      console.log('👔 Idea ID:', ideaId);

      // ✅ CRITICAL: Use PUT method (not POST)
      const response = await fetch(apiUrl, {
        method: 'PUT',  // ✅ Changed from POST to PUT
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser sets it with boundary
        },
        body: formData,
      });

      console.log('📡 Response status:', response.status);
      
      const responseText = await response.text();
      console.log('📥 Response preview:', responseText.substring(0, 300));

      // Handle errors
      if (response.status === 404) {
        setIsSubmitting(false);
        console.error('❌ 404 - Endpoint not found');
        Alert.alert(
          'API Error',
          'Manager edit endpoint not configured on server. Please contact your backend developer to enable PUT /api/Approval/edit/:id',
          [{ text: 'OK' }]
        );
        return;
      }

      if (response.status === 403 || responseText.includes("don't have permission")) {
        setIsSubmitting(false);
        Alert.alert(
          'Permission Denied',
          'You do not have permission to edit this idea.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      if (response.status === 401) {
        setIsSubmitting(false);
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        return;
      }

      if (response.status >= 500) {
        setIsSubmitting(false);
        Alert.alert('Server Error', 'Server is experiencing issues. Please try again later.');
        return;
      }

      // Parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Parsed response:', data);
      } catch (parseError) {
        console.error('⚠️ JSON parse error:', parseError.message);
        // If 200 but not JSON, assume success
        if (response.ok || response.status === 200) {
          setIsSubmitting(false);
          Alert.alert(
            'Success', 
            'Idea updated successfully!',
            [{
              text: 'OK',
              onPress: () => {
                if (onSuccess) onSuccess();
                navigation.goBack();
              }
            }]
          );
          return;
        } else {
          throw new Error('Invalid server response format');
        }
      }
      
      setIsSubmitting(false);

      // Check success
      if (response.ok && (data.success === true || data.success === 'true')) {
        Alert.alert(
          'Success', 
          data.message || 'Idea updated successfully!',
          [{
            text: 'OK',
            onPress: () => {
              if (onSuccess) onSuccess();
              navigation.goBack();
            }
          }]
        );
      } else {
        Alert.alert('Error', data?.message || data?.error || 'Failed to update idea.');
      }

    } catch (error) {
      console.error('❌ Submit error:', error);
      
      let errorMessage = 'Network error. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Network request failed')) {
          errorMessage = 'Cannot connect to server. Check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        } else if (!error.message.includes('Invalid server response')) {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleZoomIn = useCallback(() => {
    setImageScale(prev => Math.min(prev + 0.5, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setImageScale(prev => Math.max(prev - 0.5, 0.5));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FF' }}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.managerBadge}>
          <Ionicons name="shield-checkmark" size={20} color="#fff" />
          <Text style={styles.managerBadgeText}>Manager Edit Mode</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.tabButton, activeTab === 'idea' && styles.tabActive]}
            onPress={() => handleTabSwitch('idea')}
          >
            <Text style={[styles.tabText, activeTab === 'idea' && styles.tabTextActive]}>Idea Form</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.tabButton, activeTab === 'employee' && styles.tabActive]}
            onPress={() => handleTabSwitch('employee')}
          >
            <Text style={[styles.tabText, activeTab === 'employee' && styles.tabTextActive]}>Employee Details</Text>
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
                <FieldRow label="Manager:" value={userDetails.reportingManagerName} />
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
              icon={<FontAwesome name="lightbulb-o" size={20} color="#666" />}
              placeholder="Enter tentative benefit..."
              value={benefit}
              onChangeText={setBenefit}
              multiline
              maxLength={200}
            />

            <InputField
              label="Team Members"
              icon={<MaterialIcons name="group" size={20} color="#666" />}
              placeholder="Enter team members..."
              value={teamMembers}
              onChangeText={setTeamMembers}
              maxLength={100}
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
                Before Implementation Image/PDF <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.fileInputRow}>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  style={styles.chooseFileButton} 
                  onPress={() => setShowFileOptions(true)}
                >
                  <Text style={styles.chooseFileText}>Choose File</Text>
                </TouchableOpacity>
                <Text style={styles.fileNameDisplay} numberOfLines={1}>
                  {fileName || 'No file chosen'}
                </Text>
              </View>

              {file && fileType === 'image' && (
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => setFullScreen(true)} 
                  style={styles.imagePreviewButton}
                >
                  <Feather name="image" size={18} color="#2196F3" />
                  <Text style={styles.previewText}>View Image</Text>
                </TouchableOpacity>
              )}

              {file && fileType === 'pdf' && (
                <View style={styles.pdfInfoContainer}>
                  <Feather name="file-text" size={20} color="#FF5722" />
                  <Text style={styles.pdfInfoText} numberOfLines={1}>PDF: {fileName}</Text>
                </View>
              )}

              {/* Image Preview Modal */}
              <Modal visible={fullScreen} transparent={true}>
                <View style={styles.fullScreenContainer}>
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    style={styles.closeButton} 
                    onPress={() => {
                      setFullScreen(false);
                      setImageScale(1);
                    }}
                  >
                    <Feather name="x" size={30} color="#fff" />
                  </TouchableOpacity>
                  
                  <View style={styles.zoomControls}>
                    <TouchableOpacity activeOpacity={0.7} style={styles.zoomButton} onPress={handleZoomOut}>
                      <Feather name="minus" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.zoomText}>{Math.round(imageScale * 100)}%</Text>
                    <TouchableOpacity activeOpacity={0.7} style={styles.zoomButton} onPress={handleZoomIn}>
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
                      resizeMode="contain" 
                    />
                  </ScrollView>
                </View>
              </Modal>

              {/* File Options Modal */}
              <Modal visible={showFileOptions} transparent={true} animationType="slide">
                <View style={styles.imageOptionsContainer}>
                  <View style={styles.imageOptionsContent}>
                    <Text style={styles.imageOptionsTitle}>Choose File Source</Text>
                    
                    <TouchableOpacity 
                      activeOpacity={0.7}
                      style={styles.imageOptionButton} 
                      onPress={pickImageFromCamera}
                    >
                      <Feather name="camera" size={24} color="#2196F3" />
                      <Text style={styles.imageOptionText}>Take Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      activeOpacity={0.7}
                      style={styles.imageOptionButton} 
                      onPress={pickImageFromGallery}
                    >
                      <Feather name="image" size={24} color="#4CAF50" />
                      <Text style={styles.imageOptionText}>Choose from Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      activeOpacity={0.7}
                      style={styles.imageOptionButton} 
                      onPress={pickPDF}
                    >
                      <Feather name="file-text" size={24} color="#FF5722" />
                      <Text style={styles.imageOptionText}>Choose PDF</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      activeOpacity={0.7}
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
                activeOpacity={0.7}
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
                  ({getRemainingDays(date)} days remaining)
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
              placeholder="Enter mobile number..."
              value={mobileNumber}
              onChangeText={setMobileNumber}
              maxLength={10}
              keyboardType="numeric"
            />

            <RadioField 
              label="Is BE Team Support Needed?" 
              value={beSupportNeeded} 
              setValue={setBeSupportNeeded} 
            />
            
            <RadioField 
              label="Can Be Implemented To Other Location?" 
              value={canImplementOtherLocation} 
              setValue={setCanImplementOtherLocation} 
            />

            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleBeforeSubmit}
              disabled={isSubmitting}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitText}>Update Idea</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      {/* Loading Overlay */}
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#FF9800" />
            <Text style={styles.loadingOverlayText}>Updating idea...</Text>
          </View>
        </View>
      )}

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent={true} animationType="fade">
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Feather name="check-circle" size={40} color="#FF9800" />
            <Text style={styles.confirmModalTitle}>Update Idea?</Text>
            <Text style={styles.confirmModalText}>
              Confirm to update this idea. Changes will be saved to the system.
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.confirmCancelButton}
                onPress={() => setShowConfirm(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.confirmSubmitButton}
                onPress={handleFinalSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.confirmSubmitText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============= REUSABLE COMPONENTS =============

const InputField = ({ label, icon, placeholder, value, onChangeText, multiline, maxLength, required, keyboardType }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>
      {label} {required && <Text style={styles.required}>*</Text>}
    </Text>
    <View style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}>
      {icon}
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
    {maxLength && (
      <Text style={styles.charCount}>{value.length}/{maxLength}</Text>
    )}
  </View>
);

const PickerField = ({ label, icon, selectedValue, onValueChange, options, required }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>
      {label} {required && <Text style={styles.required}>*</Text>}
    </Text>
    <View style={styles.inputWrapper}>
      {icon}
      <Picker 
        selectedValue={selectedValue} 
        onValueChange={onValueChange} 
        style={styles.picker} 
        dropdownIconColor="#666"
      >
        <Picker.Item label="Select" value="" />
        {options.map((option, index) => (
          <Picker.Item label={option} value={option} key={index} />
        ))}
      </Picker>
    </View>
  </View>
);

const RadioField = ({ label, value, setValue }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.radioRow}>
      <TouchableOpacity 
        activeOpacity={0.7}
        style={styles.radioOption} 
        onPress={() => setValue('Yes')}
      >
        <View style={[styles.radioCircle, value === 'Yes' && styles.radioSelected]} />
        <Text style={styles.radioText}>Yes</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        activeOpacity={0.7}
        style={styles.radioOption} 
        onPress={() => setValue('No')}
      >
        <View style={[styles.radioCircle, value === 'No' && styles.radioSelected]} />
        <Text style={styles.radioText}>No</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const FieldRow = ({ label, value }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value || '-'}</Text>
  </View>
);

// ============= STYLES =============

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F8FF',
    padding: 16,
    paddingBottom: 40,
  },
  managerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  managerBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FF9800',
  },
  tabText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5
  },
  inputBlock: { 
    marginBottom: 16 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 6, 
    color: '#333' 
  },
  required: { 
    color: 'red' 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  inputWrapperMultiline: { 
    alignItems: 'flex-start' 
  },
  input: { 
    flex: 1, 
    fontSize: 14, 
    marginLeft: 10, 
    color: '#333' 
  },
  picker: { 
    flex: 1, 
    marginLeft: 10, 
    color: '#333' 
  },
  textArea: { 
    height: 100, 
    textAlignVertical: 'top' 
  },
  charCount: { 
    alignSelf: 'flex-end', 
    fontSize: 12, 
    color: '#888', 
    marginTop: 4 
  },
  fileInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  chooseFileButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  chooseFileText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  fileNameDisplay: {
    flex: 1,
    paddingHorizontal: 12,
    color: '#666',
    fontSize: 13,
  },
  imagePreviewButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  previewText: {
    marginLeft: 6,
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  pdfInfoContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  pdfInfoText: {
    marginLeft: 8,
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '500',
  },
  dateInputWeb: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateDisplayText: {
    color: '#333',
    fontSize: 14,
  },
  daysRemainingText: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#FF9800',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20
  },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioSelected: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800'
  },
  radioText: {
    fontSize: 14,
    color: '#333'
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fieldLabel: {
    fontWeight: 'bold',
    flex: 1.2,
    color: '#333',
    fontSize: 14,
  },
  fieldValue: {
    flex: 2,
    color: '#555',
    fontSize: 14,
  },
  loadingText: {
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 3,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  zoomControls: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    padding: 10,
    zIndex: 2,
    alignItems: 'center',
  },
  zoomButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 22,
  },
  zoomText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 10,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreenImage: {
    width: 350,
    height: 600,
  },
  imageOptionsContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  imageOptionsContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  imageOptionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  imageOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginLeft: 15,
  },
  cancelButton: {
    backgroundColor: '#FFE5E5',
    marginTop: 10,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
  loadingOverlayText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContent: {
    backgroundColor: '#fff',
    width: '85%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 10,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#333',
  },
  confirmModalText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  confirmCancelButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  confirmCancelText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 15,
  },
  confirmSubmitButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  confirmSubmitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});