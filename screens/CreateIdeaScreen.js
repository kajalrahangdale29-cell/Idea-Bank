// // import React, { useState } from 'react';
// // import { useNavigation } from '@react-navigation/native';
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   StyleSheet,
// //   ScrollView,
// //   Alert,
// //   Image,
// //   Modal,
// // } from 'react-native';
// // import { CREATE_IDEA_URL } from '../src/context/api';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import { Picker } from '@react-native-picker/picker';
// // import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
// // import DateTimePicker from '@react-native-community/datetimepicker';
// // import * as ImagePicker from 'expo-image-picker';

// // export default function CreateIdeaScreen() {
// //   const navigation = useNavigation();

// //   const [title, setTitle] = useState('');
// //   const [description, setDescription] = useState('');
// //   const [solution, setSolution] = useState('');
// //   const [category, setCategory] = useState('');
// //   const [benefit, setBenefit] = useState('');
// //   const [teamMembers, setTeamMembers] = useState('');
// //   const [mobileNumber, setMobileNumber] = useState('');
// //   const [date, setDate] = useState(null);
// //   const [showDatePicker, setShowDatePicker] = useState(false);

// //   const [image, setImage] = useState(null);
// //   const [showPreview, setShowPreview] = useState(false);
// //   const [fullScreen, setFullScreen] = useState(false);

// //   const [beSupportNeeded, setBeSupportNeeded] = useState(null);
// //   const [canImplementOtherLocation, setCanImplementOtherLocation] = useState(null);

// //   const [showConfirm, setShowConfirm] = useState(false);

// //   // IMAGE PICKER
// //   const pickImage = async () => {
// //     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
// //     if (!permissionResult.granted) {
// //       alert('Permission required!');
// //       return;
// //     }

// //     let result = await ImagePicker.launchImageLibraryAsync({
// //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
// //       allowsEditing: true,
// //       quality: 1,
// //     });

// //     if (!result.canceled) {
// //       setImage(result.assets[0].uri);
// //     }
// //   };

// //   // DATE PICKER
// //   const onChangeDate = (event, selectedDate) => {
// //     setShowDatePicker(false);
// //     if (selectedDate) setDate(selectedDate);
// //   };

// //   // SAVE DRAFT
// //   const handleSaveDraft = () => {
// //     const draft = {
// //       title,
// //       description,
// //       solution,
// //       category,
// //       benefit,
// //       teamMembers,
// //       mobileNumber,
// //       date: date ? date.toISOString().split('T')[0] : null,
// //       image,
// //       beSupportNeeded,
// //       canImplementOtherLocation,
// //       status: 'draft',
// //     };
// //     navigation.navigate('My Ideas', { newIdea: draft });
// //     Alert.alert('Draft Saved', 'Your idea has been saved as a draft.');
// //   };

// //   // VALIDATE BEFORE SUBMIT
// //   const handleBeforeSubmit = () => {
// //     if (!title || !description || !solution || !image || !date || !mobileNumber) {
// //       Alert.alert('Required Fields', 'Please fill all required fields.');
// //       return;
// //     }

// //     if (!/^\d{10}$/.test(mobileNumber)) {
// //       Alert.alert('Invalid Mobile Number', 'Please enter a valid 10 digit mobile number.');
// //       return;
// //     }

// //     setShowConfirm(true);
// //   };

// //   // FINAL SUBMIT WITH API CALL
// //   const handleFinalSubmit = async () => {
// //     const idea = {
// //       title,
// //       description,
// //       solution,
// //       category,
// //       benefit,
// //       teamMembers,
// //       mobileNumber,
// //       date: date ? date.toISOString().split('T')[0] : null,
// //       image,
// //       beSupportNeeded,
// //       canImplementOtherLocation,
// //       status: 'Submitted',
// //     };

// //     try {
// //       // ✅ Token check
// //       const token = await AsyncStorage.getItem('token');
// //       if (!token) {
// //         Alert.alert('Error', 'User token missing. Please login again.');
// //         return;
// //       }

// //       const response = await fetch(CREATE_IDEA_URL, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify(idea),
// //       });

// //       // 🔹 Debug logs to trace API response
// //       const text = await response.text();
// //       console.log('Create Idea Status:', response.status);
// //       console.log('Create Idea Response:', text);

// //       let data = {};
// //       try {
// //         data = JSON.parse(text);
// //       } catch (e) {
// //         console.warn('Response is not valid JSON:', text);
// //         data = {}; // fallback if empty or invalid
// //       }

// //       if (response.ok) {
// //         Alert.alert('Success', 'Your idea has been submitted successfully!');
// //         navigation.navigate('My Ideas', { newIdea: data });
// //       } else {
// //         console.error('Error:', data);
// //         Alert.alert('Error', data?.message || 'Failed to create idea.');
// //       }
// //     } catch (error) {
// //       console.error('Create Idea Error:', error);
// //       Alert.alert('Network error, please try again.');
// //     }
// //   };

// //   return (
// //     <View style={{ flex: 1 }}>
// //       {/* Sticky Header */}
// //       <View style={styles.stickyHeader}>
// //         <Text style={styles.heading}>Idea Creation Form</Text>
// //       </View>

// //       <ScrollView contentContainerStyle={styles.container}>
// //         <View style={{ height: 70 }} />

// //         <View style={styles.card}>
// //           <InputField
// //             label="Idea/Opportunity Description"
// //             required
// //             icon={<MaterialIcons name="title" size={20} color="#666" />}
// //             placeholder="Enter idea description..."
// //             value={title}
// //             onChangeText={setTitle}
// //             maxLength={100}
// //           />

// //           <InputField
// //             label="Proposed Solution"
// //             required
// //             icon={<MaterialIcons name="description" size={20} color="#666" />}
// //             placeholder="Enter proposed solution..."
// //             value={description}
// //             onChangeText={setDescription}
// //             multiline
// //             maxLength={300}
// //           />

// //           <InputField
// //             label="Process Improvement/Cost Benefit"
// //             required
// //             icon={<FontAwesome name="" size={20} color="#666" />}
// //             placeholder="Enter tentative Benefit..."
// //             value={solution}
// //             onChangeText={setSolution}
// //             multiline
// //             maxLength={300}  // ✅ typo fixed
// //           />

// //           <InputField
// //             label="Team Members"
// //             icon={<MaterialIcons name="group" size={20} color="#666" />}
// //             placeholder="Enter team Members..."
// //             value={category}
// //             onChangeText={setCategory}
// //             maxLength={30}
// //           />

// //           <PickerField
// //             label="Solution Category"
// //             icon={<Ionicons name="bulb-outline" size={20} color="#666" />}
// //             selectedValue={benefit}
// //             onValueChange={setBenefit}
// //             options={[
// //               'Quick Win', 'Kaizen', 'Lean', 'Six Sigma Yellow Belt', 'Six Sigma Green Belt',
// //               'WorkPlace Management', 'Automation', 'Cost Saving', 'Busniness Improvement',
// //               'Efficiency Improvement', 'Others',
// //             ]}
// //           />

// //           <PickerField
// //             label="Idea Theme"
// //             icon={<MaterialIcons name="category" size={20} color="#666" />}
// //             selectedValue={teamMembers}
// //             onValueChange={setTeamMembers}
// //             options={[
// //               'Productivity', 'Quality', 'Cost', 'Delivery', 'Safety', 'Morale', 'Environment',
// //             ]}
// //           />

// //           <InputField
// //             label="Mobile Number"
// //             required
// //             icon={<Feather name="phone" size={20} color="#666" />}
// //             placeholder="Enter your number..."
// //             value={mobileNumber}
// //             onChangeText={setMobileNumber}
// //             maxLength={10}
// //           />

// //           <RadioField
// //             label="Is BE Team Support Needed?"
// //             value={beSupportNeeded}
// //             setValue={setBeSupportNeeded}
// //           />
// //           <RadioField
// //             label="Can Be Implemented To Other Location?"
// //             value={canImplementOtherLocation}
// //             setValue={setCanImplementOtherLocation}
// //           />

// //           {/* Image Upload */}
// //           <View style={styles.inputBlock}>
// //             <Text style={styles.label}>Upload Image <Text style={styles.required}>*</Text></Text>
// //             <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
// //               <Feather name="image" size={20} color="#fff" />
// //               <Text style={styles.uploadText}> Choose Image</Text>
// //             </TouchableOpacity>

// //             {image && (
// //               <TouchableOpacity onPress={() => setShowPreview(!showPreview)} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
// //                 <Feather name="eye" size={20} color="#000" />
// //               </TouchableOpacity>
// //             )}

// //             {image && showPreview && (
// //               <TouchableOpacity onPress={() => setFullScreen(true)}>
// //                 <Image source={{ uri: image }} style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 10 }} />
// //               </TouchableOpacity>
// //             )}

// //             {/* Full Screen Modal */}
// //             <Modal visible={fullScreen} transparent={true}>
// //               <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
// //                 <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 1 }} onPress={() => setFullScreen(false)}>
// //                   <Feather name="x" size={30} color="#fff" />
// //                 </TouchableOpacity>
// //                 <Image source={{ uri: image }} style={{ width: '90%', height: '80%', borderRadius: 10 }} resizeMode="contain" />
// //               </View>
// //             </Modal>
// //           </View>

// //           {/* Completion Date */}
// //           <View style={styles.inputBlock}>
// //             <Text style={styles.label}>Completion Date <Text style={styles.required}>*</Text></Text>
// //             <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
// //               <Feather name="calendar" size={20} color="#fff" />
// //               <Text style={styles.uploadText}> Select Date</Text>
// //             </TouchableOpacity>
// //             {date && <Text style={styles.dateText}>{date.toDateString()}</Text>}
// //           </View>

// //           {showDatePicker && <DateTimePicker value={date || new Date()} mode="date" display="default" minimumDate={new Date()} onChange={onChangeDate} />}

// //           {/* Buttons */}
// //           <View style={styles.buttonRow}>
// //             <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft}>
// //               <FontAwesome name="save" size={16} color="#555" />
// //               <Text style={styles.draftText}>Save as Draft</Text>
// //             </TouchableOpacity>

// //             <TouchableOpacity style={styles.submitButton} onPress={handleBeforeSubmit}>
// //               <Text style={styles.submitText}>Submit</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </ScrollView>

// //       {/* Confirm Modal */}
// //       <Modal visible={showConfirm} transparent={true} animationType="fade">
// //         <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
// //           <View style={{ backgroundColor: '#fff', width: '80%', padding: 20, borderRadius: 10, alignItems: 'center' }}>
// //             <Feather name="check-circle" size={40} color="#2196F3" />
// //             <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Save & Publish</Text>
// //             <Text style={{ fontSize: 14, textAlign: 'center', color: '#333' }}>Are you sure you want to save and publish this record?</Text>
// //             <View style={{ flexDirection: 'row', marginTop: 20 }}>
// //               <TouchableOpacity style={{ backgroundColor: '#ddd', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginRight: 10 }} onPress={() => setShowConfirm(false)}>
// //                 <Text style={{ color: '#333', fontWeight: '600' }}>Cancel</Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity style={{ backgroundColor: '#00B894', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }} onPress={() => { setShowConfirm(false); handleFinalSubmit(); }}>
// //                 <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>
// //     </View>
// //   );
// // }

// // // INPUT, PICKER, RADIO FIELDS
// // const InputField = ({ label, icon, placeholder, value, onChangeText, multiline, maxLength, required }) => (
// //   <View style={styles.inputBlock}>
// //     <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
// //     <View style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}>
// //       {icon}
// //       <TextInput
// //         style={[styles.input, multiline && styles.textArea]}
// //         placeholder={placeholder}
// //         value={value}
// //         onChangeText={onChangeText}
// //         multiline={multiline}
// //         placeholderTextColor="#999"
// //         keyboardType={label === 'Mobile Number' ? 'numeric' : 'default'}
// //         maxLength={maxLength}
// //       />
// //     </View>
// //     {maxLength && <Text style={styles.charCount}>{value.length}/{maxLength}</Text>}
// //   </View>
// // );

// // const PickerField = ({ label, icon, selectedValue, onValueChange, options }) => (
// //   <View style={styles.inputBlock}>
// //     <Text style={styles.label}>{label}</Text>
// //     <View style={styles.inputWrapper}>
// //       {icon}
// //       <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker} dropdownIconColor="#666">
// //         <Picker.Item label="Select" value="" />
// //         {options.map((option, index) => <Picker.Item label={option} value={option} key={index} />)}
// //       </Picker>
// //     </View>
// //   </View>
// // );

// // const RadioField = ({ label, value, setValue }) => (
// //   <View style={styles.inputBlock}>
// //     <Text style={styles.label}>{label}</Text>
// //     <View style={styles.radioRow}>
// //       <TouchableOpacity style={styles.radioOption} onPress={() => setValue(value === 'Yes' ? null : 'Yes')}>
// //         <View style={[styles.radioCircle, value === 'Yes' && styles.radioSelected]} />
// //         <Text style={styles.radioText}>Yes</Text>
// //       </TouchableOpacity>
// //       <TouchableOpacity style={styles.radioOption} onPress={() => setValue(value === 'No' ? null : 'No')}>
// //         <View style={[styles.radioCircle, value === 'No' && styles.radioSelected]} />
// //         <Text style={styles.radioText}>No</Text>
// //       </TouchableOpacity>
// //     </View>
// //   </View>
// // );

// // // STYLES
// // const styles = StyleSheet.create({
// //   container: { backgroundColor: '#F5F8FF', padding: 20, paddingBottom: 50 },
// //   stickyHeader: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#F5F8FF', paddingVertical: 15, zIndex: 10, elevation: 5 },
// //   heading: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' },
// //   card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5 },
// //   inputBlock: { marginBottom: 18 },
// //   label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
// //   required: { color: 'red' },
// //   inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
// //   inputWrapperMultiline: { alignItems: 'flex-start' },
// //   input: { flex: 1, fontSize: 16, marginLeft: 10, color: '#333' },
// //   picker: { flex: 1, marginLeft: 10, color: '#333' },
// //   textArea: { height: 100, textAlignVertical: 'top' },
// //   charCount: { alignSelf: 'flex-end', fontSize: 12, color: '#888', marginTop: 4 },
// //   uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF50', padding: 12, borderRadius: 10, justifyContent: 'center' },
// //   dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2196F3', padding: 12, borderRadius: 10, justifyContent: 'center' },
// //   uploadText: { color: '#fff', fontSize: 16, marginLeft: 8 },
// //   dateText: { fontSize: 16, marginTop: 8, color: '#555' },
// //   buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
// //   draftButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2e2e2', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10 },
// //   draftText: { marginLeft: 8, fontSize: 16, color: '#333', fontWeight: '600' },
// //   submitButton: { backgroundColor: '#00B894', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
// //   submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
// //   radioRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
// //   radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
// //   radioCircle: { height: 18, width: 18, borderRadius: 9, borderWidth: 2, borderColor: '#666', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
// //   radioSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
// //   radioText: { fontSize: 14, color: '#333' },
// // });
// // import React, { useState } from 'react';
// // import { useNavigation } from '@react-navigation/native';
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   StyleSheet,
// //   ScrollView,
// //   Alert,
// //   Image,
// //   Modal,
// // } from 'react-native';
// // import { CREATE_IDEA_URL } from '../src/context/api';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import { Picker } from '@react-native-picker/picker';
// // import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
// // import DateTimePicker from '@react-native-community/datetimepicker';
// // import * as ImagePicker from 'expo-image-picker';

// // export default function CreateIdeaScreen() {
// //   const navigation = useNavigation();

// //   const [title, setTitle] = useState('');
// //   const [description, setDescription] = useState('');
// //   const [solution, setSolution] = useState('');
// //   const [category, setCategory] = useState('');
// //   const [benefit, setBenefit] = useState('');
// //   const [teamMembers, setTeamMembers] = useState('');
// //   const [mobileNumber, setMobileNumber] = useState('');
// //   const [date, setDate] = useState(null);
// //   const [showDatePicker, setShowDatePicker] = useState(false);

// //   const [image, setImage] = useState(null);
// //   const [showPreview, setShowPreview] = useState(false);
// //   const [fullScreen, setFullScreen] = useState(false);

// //   const [beSupportNeeded, setBeSupportNeeded] = useState(null);
// //   const [canImplementOtherLocation, setCanImplementOtherLocation] = useState(null);

// //   const [showConfirm, setShowConfirm] = useState(false);

// //   // IMAGE PICKER
// //   const pickImage = async () => {
// //     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
// //     if (!permissionResult.granted) {
// //       alert('Permission required!');
// //       return;
// //     }

// //     let result = await ImagePicker.launchImageLibraryAsync({
// //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
// //       allowsEditing: true,
// //       quality: 1,
// //     });

// //     if (!result.canceled) {
// //       setImage(result.assets[0].uri);
// //     }
// //   };

// //   // DATE PICKER
// //   const onChangeDate = (event, selectedDate) => {
// //     setShowDatePicker(false);
// //     if (selectedDate) setDate(selectedDate);
// //   };

// //   // SAVE DRAFT
// //   const handleSaveDraft = () => {
// //     const draft = {
// //       title,
// //       description,
// //       solution,
// //       category,
// //       benefit,
// //       teamMembers,
// //       mobileNumber,
// //       date: date ? date.toISOString().split('T')[0] : null,
// //       image,
// //       beSupportNeeded,
// //       canImplementOtherLocation,
// //       status: 'draft',
// //     };
// //     navigation.navigate('My Ideas', { newIdea: draft });
// //     Alert.alert('Draft Saved', 'Your idea has been saved as a draft.');
// //   };

// //   // VALIDATE BEFORE SUBMIT
// //   const handleBeforeSubmit = () => {
// //     if (!title || !description || !solution || !image || !date || !mobileNumber) {
// //       Alert.alert('Required Fields', 'Please fill all required fields.');
// //       return;
// //     }

// //     if (!/^\d{10}$/.test(mobileNumber)) {
// //       Alert.alert('Invalid Mobile Number', 'Please enter a valid 10 digit mobile number.');
// //       return;
// //     }

// //     setShowConfirm(true);
// //   };

// //   // FINAL SUBMIT WITH API CALL
// //   const handleFinalSubmit = async () => {
// //     const idea = {
// //       title,
// //       description,
// //       solution,
// //       category,
// //       benefit,
// //       teamMembers,
// //       mobileNumber,
// //       date: date ? date.toISOString().split('T')[0] : null,
// //       image,
// //       beSupportNeeded,
// //       canImplementOtherLocation,
// //       status: 'Submitted',
// //     };

// //     try {
// //       // ✅ Token check
// //       const token = await AsyncStorage.getItem('token');
// //       if (!token) {
// //         Alert.alert('Error', 'User token missing. Please login again.');
// //         return;
// //       }

// //       const response = await fetch(CREATE_IDEA_URL, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify(idea),
// //       });

// //       // 🔹 Debug logs to trace API response
// //       const text = await response.text();
// //       console.log('Create Idea Status:', response.status);
// //       console.log('Create Idea Response:', text);

// //       let data = {};
// //       try {
// //         data = JSON.parse(text);
// //       } catch (e) {
// //         console.warn('Response is not valid JSON:', text);
// //         data = {}; // fallback if empty or invalid
// //       }

// //       if (response.ok) {
// //         Alert.alert('Success', 'Your idea has been submitted successfully!');
// //         navigation.navigate('My Ideas', { newIdea: data });
// //       } else {
// //         console.error('Error:', data);
// //         Alert.alert('Error', data?.message || 'Failed to create idea.');
// //       }
// //     } catch (error) {
// //       console.error('Create Idea Error:', error);
// //       Alert.alert('Network error, please try again.');
// //     }
// //   };

// //   return (
// //     <View style={{ flex: 1 }}>
// //       {/* Sticky Header */}
// //       <View style={styles.stickyHeader}>
// //         <Text style={styles.heading}>Idea Creation Form</Text>
// //       </View>

// //       <ScrollView contentContainerStyle={styles.container}>
// //         <View style={{ height: 70 }} />

// //         <View style={styles.card}>
// //           <InputField
// //             label="Idea/Opportunity Description"
// //             required
// //             icon={<MaterialIcons name="title" size={20} color="#666" />}
// //             placeholder="Enter idea description..."
// //             value={title}
// //             onChangeText={setTitle}
// //             maxLength={100}
// //           />

// //           <InputField
// //             label="Proposed Solution"
// //             required
// //             icon={<MaterialIcons name="description" size={20} color="#666" />}
// //             placeholder="Enter proposed solution..."
// //             value={description}
// //             onChangeText={setDescription}
// //             multiline
// //             maxLength={300}
// //           />

// //           <InputField
// //             label="Process Improvement/Cost Benefit"
// //             required
// //             icon={<FontAwesome name="" size={20} color="#666" />}
// //             placeholder="Enter tentative Benefit..."
// //             value={solution}
// //             onChangeText={setSolution}
// //             multiline
// //             maxLength={300}  // ✅ typo fixed
// //           />

// //           <InputField
// //             label="Team Members"
// //             icon={<MaterialIcons name="group" size={20} color="#666" />}
// //             placeholder="Enter team Members..."
// //             value={category}
// //             onChangeText={setCategory}
// //             maxLength={30}
// //           />

// //           <PickerField
// //             label="Solution Category"
// //             icon={<Ionicons name="bulb-outline" size={20} color="#666" />}
// //             selectedValue={benefit}
// //             onValueChange={setBenefit}
// //             options={[
// //               'Quick Win', 'Kaizen', 'Lean', 'Six Sigma Yellow Belt', 'Six Sigma Green Belt',
// //               'WorkPlace Management', 'Automation', 'Cost Saving', 'Busniness Improvement',
// //               'Efficiency Improvement', 'Others',
// //             ]}
// //           />

// //           <PickerField
// //             label="Idea Theme"
// //             icon={<MaterialIcons name="category" size={20} color="#666" />}
// //             selectedValue={teamMembers}
// //             onValueChange={setTeamMembers}
// //             options={[
// //               'Productivity', 'Quality', 'Cost', 'Delivery', 'Safety', 'Morale', 'Environment',
// //             ]}
// //           />

// //           <InputField
// //             label="Mobile Number"
// //             required
// //             icon={<Feather name="phone" size={20} color="#666" />}
// //             placeholder="Enter your number..."
// //             value={mobileNumber}
// //             onChangeText={setMobileNumber}
// //             maxLength={10}
// //           />

// //           <RadioField
// //             label="Is BE Team Support Needed?"
// //             value={beSupportNeeded}
// //             setValue={setBeSupportNeeded}
// //           />
// //           <RadioField
// //             label="Can Be Implemented To Other Location?"
// //             value={canImplementOtherLocation}
// //             setValue={setCanImplementOtherLocation}
// //           />

// //           {/* Image Upload */}
// //           <View style={styles.inputBlock}>
// //             <Text style={styles.label}>Upload Image <Text style={styles.required}>*</Text></Text>
// //             <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
// //               <Feather name="image" size={20} color="#fff" />
// //               <Text style={styles.uploadText}> Choose Image</Text>
// //             </TouchableOpacity>

// //             {image && (
// //               <TouchableOpacity onPress={() => setShowPreview(!showPreview)} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
// //                 <Feather name="eye" size={20} color="#000" />
// //               </TouchableOpacity>
// //             )}

// //             {image && showPreview && (
// //               <TouchableOpacity onPress={() => setFullScreen(true)}>
// //                 <Image source={{ uri: image }} style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 10 }} />
// //               </TouchableOpacity>
// //             )}

// //             {/* Full Screen Modal */}
// //             <Modal visible={fullScreen} transparent={true}>
// //               <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
// //                 <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 1 }} onPress={() => setFullScreen(false)}>
// //                   <Feather name="x" size={30} color="#fff" />
// //                 </TouchableOpacity>
// //                 <Image source={{ uri: image }} style={{ width: '90%', height: '80%', borderRadius: 10 }} resizeMode="contain" />
// //               </View>
// //             </Modal>
// //           </View>

// //           {/* Completion Date */}
// //           <View style={styles.inputBlock}>
// //             <Text style={styles.label}>Completion Date <Text style={styles.required}>*</Text></Text>
// //             <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
// //               <Feather name="calendar" size={20} color="#fff" />
// //               <Text style={styles.uploadText}> Select Date</Text>
// //             </TouchableOpacity>
// //             {date && <Text style={styles.dateText}>{date.toDateString()}</Text>}
// //           </View>

// //           {showDatePicker && <DateTimePicker value={date || new Date()} mode="date" display="default" minimumDate={new Date()} onChange={onChangeDate} />}

// //           {/* Buttons */}
// //           <View style={styles.buttonRow}>
// //             <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft}>
// //               <FontAwesome name="save" size={16} color="#555" />
// //               <Text style={styles.draftText}>Save as Draft</Text>
// //             </TouchableOpacity>

// //             <TouchableOpacity style={styles.submitButton} onPress={handleBeforeSubmit}>
// //               <Text style={styles.submitText}>Submit</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </ScrollView>

// //       {/* Confirm Modal */}
// //       <Modal visible={showConfirm} transparent={true} animationType="fade">
// //         <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
// //           <View style={{ backgroundColor: '#fff', width: '80%', padding: 20, borderRadius: 10, alignItems: 'center' }}>
// //             <Feather name="check-circle" size={40} color="#2196F3" />
// //             <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Save & Publish</Text>
// //             <Text style={{ fontSize: 14, textAlign: 'center', color: '#333' }}>Are you sure you want to save and publish this record?</Text>
// //             <View style={{ flexDirection: 'row', marginTop: 20 }}>
// //               <TouchableOpacity style={{ backgroundColor: '#ddd', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginRight: 10 }} onPress={() => setShowConfirm(false)}>
// //                 <Text style={{ color: '#333', fontWeight: '600' }}>Cancel</Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity style={{ backgroundColor: '#00B894', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }} onPress={() => { setShowConfirm(false); handleFinalSubmit(); }}>
// //                 <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>
// //     </View>
// //   );
// // }

// // // INPUT, PICKER, RADIO FIELDS
// // const InputField = ({ label, icon, placeholder, value, onChangeText, multiline, maxLength, required }) => (
// //   <View style={styles.inputBlock}>
// //     <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
// //     <View style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}>
// //       {icon}
// //       <TextInput
// //         style={[styles.input, multiline && styles.textArea]}
// //         placeholder={placeholder}
// //         value={value}
// //         onChangeText={onChangeText}
// //         multiline={multiline}
// //         placeholderTextColor="#999"
// //         keyboardType={label === 'Mobile Number' ? 'numeric' : 'default'}
// //         maxLength={maxLength}
// //       />
// //     </View>
// //     {maxLength && <Text style={styles.charCount}>{value.length}/{maxLength}</Text>}
// //   </View>
// // );

// // const PickerField = ({ label, icon, selectedValue, onValueChange, options }) => (
// //   <View style={styles.inputBlock}>
// //     <Text style={styles.label}>{label}</Text>
// //     <View style={styles.inputWrapper}>
// //       {icon}
// //       <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker} dropdownIconColor="#666">
// //         <Picker.Item label="Select" value="" />
// //         {options.map((option, index) => <Picker.Item label={option} value={option} key={index} />)}
// //       </Picker>
// //     </View>
// //   </View>
// // );

// // const RadioField = ({ label, value, setValue }) => (
// //   <View style={styles.inputBlock}>
// //     <Text style={styles.label}>{label}</Text>
// //     <View style={styles.radioRow}>
// //       <TouchableOpacity style={styles.radioOption} onPress={() => setValue(value === 'Yes' ? null : 'Yes')}>
// //         <View style={[styles.radioCircle, value === 'Yes' && styles.radioSelected]} />
// //         <Text style={styles.radioText}>Yes</Text>
// //       </TouchableOpacity>
// //       <TouchableOpacity style={styles.radioOption} onPress={() => setValue(value === 'No' ? null : 'No')}>
// //         <View style={[styles.radioCircle, value === 'No' && styles.radioSelected]} />
// //         <Text style={styles.radioText}>No</Text>
// //       </TouchableOpacity>
// //     </View>
// //   </View>
// // );

// // // STYLES
// // const styles = StyleSheet.create({
// //   container: { backgroundColor: '#F5F8FF', padding: 20, paddingBottom: 50 },
// //   stickyHeader: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#F5F8FF', paddingVertical: 15, zIndex: 10, elevation: 5 },
// //   heading: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' },
// //   card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5 },
// //   inputBlock: { marginBottom: 18 },
// //   label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
// //   required: { color: 'red' },
// //   inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
// //   inputWrapperMultiline: { alignItems: 'flex-start' },
// //   input: { flex: 1, fontSize: 16, marginLeft: 10, color: '#333' },
// //   picker: { flex: 1, marginLeft: 10, color: '#333' },
// //   textArea: { height: 100, textAlignVertical: 'top' },
// //   charCount: { alignSelf: 'flex-end', fontSize: 12, color: '#888', marginTop: 4 },
// //   uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF50', padding: 12, borderRadius: 10, justifyContent: 'center' },
// //   dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2196F3', padding: 12, borderRadius: 10, justifyContent: 'center' },
// //   uploadText: { color: '#fff', fontSize: 16, marginLeft: 8 },
// //   dateText: { fontSize: 16, marginTop: 8, color: '#555' },
// //   buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
// //   draftButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2e2e2', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10 },
// //   draftText: { marginLeft: 8, fontSize: 16, color: '#333', fontWeight: '600' },
// //   submitButton: { backgroundColor: '#00B894', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
// //   submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
// //   radioRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
// //   radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
// //   radioCircle: { height: 18, width: 18, borderRadius: 9, borderWidth: 2, borderColor: '#666', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
// //   radioSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
// //   radioText: { fontSize: 14, color: '#333' },
// // }); 
// // import React, { useState, useEffect } from 'react';
// // import { useNavigation } from '@react-navigation/native';
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   StyleSheet,
// //   ScrollView,
// //   Alert,
// //   Image,
// //   Modal,
// // } from 'react-native';
// // import { CREATE_IDEA_URL } from '../src/context/api';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import { Picker } from '@react-native-picker/picker';
// // import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
// // import DateTimePicker from '@react-native-community/datetimepicker';
// // import * as ImagePicker from 'expo-image-picker';

// // export default function CreateIdeaScreen() {
// //   const navigation = useNavigation();

// //   // Tabs
// //   const [activeTab, setActiveTab] = useState('idea'); // idea / employee
// //   const [userDetails, setUserDetails] = useState(null);

// //   useEffect(() => {
// //     const fetchUserDetails = async () => {
// //       try {
// //         const userData = await AsyncStorage.getItem('user'); // replace 'user' with your key
// //         if (userData) setUserDetails(JSON.parse(userData));
// //       } catch (error) {
// //         console.log('Error fetching user details:', error);
// //       }
// //     };
// //     fetchUserDetails();
// //   }, []);

// //   // Form states
// //   const [title, setTitle] = useState('');
// //   const [description, setDescription] = useState('');
// //   const [solution, setSolution] = useState('');
// //   const [category, setCategory] = useState('');
// //   const [benefit, setBenefit] = useState('');
// //   const [teamMembers, setTeamMembers] = useState('');
// //   const [mobileNumber, setMobileNumber] = useState('');
// //   const [date, setDate] = useState(null);
// //   const [showDatePicker, setShowDatePicker] = useState(false);

// //   const [image, setImage] = useState(null);
// //   const [showPreview, setShowPreview] = useState(false);
// //   const [fullScreen, setFullScreen] = useState(false);

// //   const [beSupportNeeded, setBeSupportNeeded] = useState(null);
// //   const [canImplementOtherLocation, setCanImplementOtherLocation] = useState(null);

// //   const [showConfirm, setShowConfirm] = useState(false);

// //   // IMAGE PICKER
// //   const pickImage = async () => {
// //     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
// //     if (!permissionResult.granted) {
// //       alert('Permission required!');
// //       return;
// //     }

// //     let result = await ImagePicker.launchImageLibraryAsync({
// //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
// //       allowsEditing: true,
// //       quality: 1,
// //     });

// //     if (!result.canceled) {
// //       setImage(result.assets[0].uri);
// //     }
// //   };

// //   // DATE PICKER
// //   const onChangeDate = (event, selectedDate) => {
// //     setShowDatePicker(false);
// //     if (selectedDate) setDate(selectedDate);
// //   };

// //   // SAVE DRAFT
// //   const handleSaveDraft = () => {
// //     const draft = {
// //       title,
// //       description,
// //       solution,
// //       category,
// //       benefit,
// //       teamMembers,
// //       mobileNumber,
// //       date: date ? date.toISOString().split('T')[0] : null,
// //       image,
// //       beSupportNeeded,
// //       canImplementOtherLocation,
// //       status: 'draft',
// //     };
// //     navigation.navigate('My Ideas', { newIdea: draft });
// //     Alert.alert('Draft Saved', 'Your idea has been saved as a draft.');
// //   };

// //   // VALIDATE BEFORE SUBMIT
// //   const handleBeforeSubmit = () => {
// //     if (!title || !description || !solution || !image || !date || !mobileNumber) {
// //       Alert.alert('Required Fields', 'Please fill all required fields.');
// //       return;
// //     }

// //     if (!/^\d{10}$/.test(mobileNumber)) {
// //       Alert.alert('Invalid Mobile Number', 'Please enter a valid 10 digit mobile number.');
// //       return;
// //     }

// //     setShowConfirm(true);
// //   };

// //   // FINAL SUBMIT WITH API CALL
// //   const handleFinalSubmit = async () => {
// //     const idea = {
// //       title,
// //       description,
// //       solution,
// //       category,
// //       benefit,
// //       teamMembers,
// //       mobileNumber,
// //       date: date ? date.toISOString().split('T')[0] : null,
// //       image,
// //       beSupportNeeded,
// //       canImplementOtherLocation,
// //       status: 'Submitted',
// //     };

// //     try {
// //       const token = await AsyncStorage.getItem('token');
// //       if (!token) {
// //         Alert.alert('Error', 'User token missing. Please login again.');
// //         return;
// //       }

// //       const response = await fetch(CREATE_IDEA_URL, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify(idea),
// //       });

// //       const text = await response.text();
// //       console.log('Create Idea Status:', response.status);
// //       console.log('Create Idea Response:', text);

// //       let data = {};
// //       try {
// //         data = JSON.parse(text);
// //       } catch (e) {
// //         console.warn('Response is not valid JSON:', text);
// //         data = {};
// //       }

// //       if (response.ok) {
// //         Alert.alert('Success', 'Your idea has been submitted successfully!');
// //         navigation.navigate('My Ideas', { newIdea: data });
// //       } else {
// //         console.error('Error:', data);
// //         Alert.alert('Error', data?.message || 'Failed to create idea.');
// //       }
// //     } catch (error) {
// //       console.error('Create Idea Error:', error);
// //       Alert.alert('Network error, please try again.');
// //     }
// //   };

// //   return (
// //     <View style={{ flex: 1 }}>
// //       {/* Sticky Header */}
// //       <View style={styles.stickyHeader}>
// //         <Text style={styles.heading}>Idea Creation Form</Text>
// //       </View>

// //       <ScrollView contentContainerStyle={styles.container}>
// //         <View style={{ height: 70 }} />

// //         {/* Tabs */}
// //         <View style={{ flexDirection: 'row', marginBottom: 20 }}>
// //           <TouchableOpacity
// //             style={[styles.tabButton, activeTab === 'idea' && styles.tabActive]}
// //             onPress={() => setActiveTab('idea')}
// //           >
// //             <Text style={styles.tabText}>Idea Form</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={[styles.tabButton, activeTab === 'employee' && styles.tabActive]}
// //             onPress={() => setActiveTab('employee')}
// //           >
// //             <Text style={styles.tabText}>Employee Details</Text>
// //           </TouchableOpacity>
// //         </View>

// //         {activeTab === 'employee' ? (
// //           <View style={styles.card}>
// //             {userDetails ? (
// //               <>
// //                 <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{userDetails.name}</Text>
// //                 <Text style={{ color: '#555' }}>Designation: {userDetails.designation}</Text>
// //                 <Text style={{ color: '#555' }}>Email: {userDetails.email}</Text>
// //                 <Text style={{ color: '#555' }}>Employee ID: {userDetails.empId}</Text>
// //               </>
// //             ) : (
// //               <Text style={{ color: '#555', textAlign: 'center', marginTop: 20 }}>
// //                 Loading employee details...
// //               </Text>
// //             )}
// //           </View>
// //         ) : (
// //           <View style={styles.card}>
// //             {/* Paste your full form here exactly as it is in your original code */}
// //             {/* Idea/Opportunity Description */}
// //             <InputField
// //               label="Idea/Opportunity Description"
// //               required
// //               icon={<MaterialIcons name="title" size={20} color="#666" />}
// //               placeholder="Enter idea description..."
// //               value={title}
// //               onChangeText={setTitle}
// //               maxLength={100}
// //             />
// //             {/* Proposed Solution */}
// //             <InputField
// //               label="Proposed Solution"
// //               required
// //               icon={<MaterialIcons name="description" size={20} color="#666" />}
// //               placeholder="Enter proposed solution..."
// //               value={description}
// //               onChangeText={setDescription}
// //               multiline
// //               maxLength={300}
// //             />
// //             {/* Process Improvement / Cost Benefit */}
// //             <InputField
// //               label="Process Improvement/Cost Benefit"
// //               required
// //               icon={<FontAwesome name="" size={20} color="#666" />}
// //               placeholder="Enter tentative Benefit..."
// //               value={solution}
// //               onChangeText={setSolution}
// //               multiline
// //               maxLength={300}
// //             />
// //             {/* Team Members */}
// //             <InputField
// //               label="Team Members"
// //               icon={<MaterialIcons name="group" size={20} color="#666" />}
// //               placeholder="Enter team Members..."
// //               value={category}
// //               onChangeText={setCategory}
// //               maxLength={30}
// //             />
// //             {/* Solution Category */}
// //             <PickerField
// //               label="Solution Category"
// //               icon={<Ionicons name="bulb-outline" size={20} color="#666" />}
// //               selectedValue={benefit}
// //               onValueChange={setBenefit}
// //               options={[
// //                 'Quick Win', 'Kaizen', 'Lean', 'Six Sigma Yellow Belt', 'Six Sigma Green Belt',
// //                 'WorkPlace Management', 'Automation', 'Cost Saving', 'Busniness Improvement',
// //                 'Efficiency Improvement', 'Others',
// //               ]}
// //             />
// //             {/* Idea Theme */}
// //             <PickerField
// //               label="Idea Theme"
// //               icon={<MaterialIcons name="category" size={20} color="#666" />}
// //               selectedValue={teamMembers}
// //               onValueChange={setTeamMembers}
// //               options={[
// //                 'Productivity', 'Quality', 'Cost', 'Delivery', 'Safety', 'Morale', 'Environment',
// //               ]}
// //             />
// //             {/* Mobile Number */}
// //             <InputField
// //               label="Mobile Number"
// //               required
// //               icon={<Feather name="phone" size={20} color="#666" />}
// //               placeholder="Enter your number..."
// //               value={mobileNumber}
// //               onChangeText={setMobileNumber}
// //               maxLength={10}
// //             />
// //             {/* Radio fields */}
// //             <RadioField label="Is BE Team Support Needed?" value={beSupportNeeded} setValue={setBeSupportNeeded} />
// //             <RadioField label="Can Be Implemented To Other Location?" value={canImplementOtherLocation} setValue={setCanImplementOtherLocation} />

// //             {/* Image Upload */}
// //             <View style={styles.inputBlock}>
// //               <Text style={styles.label}>Upload Image <Text style={styles.required}>*</Text></Text>
// //               <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
// //                 <Feather name="image" size={20} color="#fff" />
// //                 <Text style={styles.uploadText}> Choose Image</Text>
// //               </TouchableOpacity>

// //               {image && (
// //                 <TouchableOpacity onPress={() => setShowPreview(!showPreview)} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
// //                   <Feather name="eye" size={20} color="#000" />
// //                 </TouchableOpacity>
// //               )}

// //               {image && showPreview && (
// //                 <TouchableOpacity onPress={() => setFullScreen(true)}>
// //                   <Image source={{ uri: image }} style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 10 }} />
// //                 </TouchableOpacity>
// //               )}

// //               <Modal visible={fullScreen} transparent={true}>
// //                 <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
// //                   <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 1 }} onPress={() => setFullScreen(false)}>
// //                     <Feather name="x" size={30} color="#fff" />
// //                   </TouchableOpacity>
// //                   <Image source={{ uri: image }} style={{ width: '90%', height: '80%', borderRadius: 10 }} resizeMode="contain" />
// //                 </View>
// //               </Modal>
// //             </View>

// //             {/* Completion Date */}
// //             <View style={styles.inputBlock}>
// //               <Text style={styles.label}>Completion Date <Text style={styles.required}>*</Text></Text>
// //               <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
// //                 <Feather name="calendar" size={20} color="#fff" />
// //                 <Text style={styles.uploadText}> Select Date</Text>
// //               </TouchableOpacity>
// //               {date && <Text style={styles.dateText}>{date.toDateString()}</Text>}
// //             </View>

// //             {showDatePicker && <DateTimePicker value={date || new Date()} mode="date" display="default" minimumDate={new Date()} onChange={onChangeDate} />}

// //             {/* Buttons */}
// //             <View style={styles.buttonRow}>
// //               <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft}>
// //                 <FontAwesome name="save" size={16} color="#555" />
// //                 <Text style={styles.draftText}>Save as Draft</Text>
// //               </TouchableOpacity>

// //               <TouchableOpacity style={styles.submitButton} onPress={handleBeforeSubmit}>
// //                 <Text style={styles.submitText}>Submit</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         )}
// //       </ScrollView>

// //       {/* Confirm Modal */}
// //       <Modal visible={showConfirm} transparent={true} animationType="fade">
// //         <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
// //           <View style={{ backgroundColor: '#fff', width: '80%', padding: 20, borderRadius: 10, alignItems: 'center' }}>
// //             <Feather name="check-circle" size={40} color="#2196F3" />
// //             <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Save & Publish</Text>
// //             <Text style={{ fontSize: 14, textAlign: 'center', color: '#333' }}>Are you sure you want to save and publish this record?</Text>
// //             <View style={{ flexDirection: 'row', marginTop: 20 }}>
// //               <TouchableOpacity style={{ backgroundColor: '#ddd', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginRight: 10 }} onPress={() => setShowConfirm(false)}>
// //                 <Text style={{ color: '#333', fontWeight: '600' }}>Cancel</Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity style={{ backgroundColor: '#00B894', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }} onPress={() => { setShowConfirm(false); handleFinalSubmit(); }}>
// //                 <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>
// //     </View>
// //   );
// // }

// // // INPUT, PICKER, RADIO FIELDS
// // const InputField = ({ label, icon, placeholder, value, onChangeText, multiline, maxLength, required }) => (
// //   <View style={styles.inputBlock}>
// //     <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
// //     <View style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}>
// //       {icon}
// //       <TextInput
// //         style={[styles.input, multiline && styles.textArea]}
// //         placeholder={placeholder}
// //         value={value}
// //         onChangeText={onChangeText}
// //         multiline={multiline}
// //         placeholderTextColor="#999"
// //         keyboardType={label === 'Mobile Number' ? 'numeric' : 'default'}
// //         maxLength={maxLength}
// //       />
// //     </View>
// //     {maxLength && <Text style={styles.charCount}>{value.length}/{maxLength}</Text>}
// //   </View>
// // );

// // const PickerField = ({ label, icon, selectedValue, onValueChange, options }) => (
// //   <View style={styles.inputBlock}>
// //     <Text style={styles.label}>{label}</Text>
// //     <View style={styles.inputWrapper}>
// //       {icon}
// //       <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker} dropdownIconColor="#666">
// //         <Picker.Item label="Select" value="" />
// //         {options.map((option, index) => <Picker.Item label={option} value={option} key={index} />)}
// //       </Picker>
// //     </View>
// //   </View>
// // );

// // const RadioField = ({ label, value, setValue }) => (
// //   <View style={styles.inputBlock}>
// //     <Text style={styles.label}>{label}</Text>
// //     <View style={styles.radioRow}>
// //       <TouchableOpacity style={styles.radioOption} onPress={() => setValue(value === 'Yes' ? null : 'Yes')}>
// //         <View style={[styles.radioCircle, value === 'Yes' && styles.radioSelected]} />
// //         <Text style={styles.radioText}>Yes</Text>
// //       </TouchableOpacity>
// //       <TouchableOpacity style={styles.radioOption} onPress={() => setValue(value === 'No' ? null : 'No')}>
// //         <View style={[styles.radioCircle, value === 'No' && styles.radioSelected]} />
// //         <Text style={styles.radioText}>No</Text>
// //       </TouchableOpacity>
// //     </View>
// //   </View>
// // );

// // // STYLES
// // const styles = StyleSheet.create({
// //   container: { backgroundColor: '#F5F8FF', padding: 20, paddingBottom: 50 },
// //   stickyHeader: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#F5F8FF', paddingVertical: 15, zIndex: 10, elevation: 5 },
// //   heading: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' },
// //   card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5 },
// //   inputBlock: { marginBottom: 18 },
// //   label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
// //   required: { color: 'red' },
// //   inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
// //   inputWrapperMultiline: { alignItems: 'flex-start' },
// //   input: { flex: 1, fontSize: 16, marginLeft: 10, color: '#333' },
// //   picker: { flex: 1, marginLeft: 10, color: '#333' },
// //   textArea: { height: 100, textAlignVertical: 'top' },
// //   charCount: { alignSelf: 'flex-end', fontSize: 12, color: '#888', marginTop: 4 },
// //   uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF50', padding: 12, borderRadius: 10, justifyContent: 'center' },
// //   dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2196F3', padding: 12, borderRadius: 10, justifyContent: 'center' },
// //   uploadText: { color: '#fff', fontSize: 16, marginLeft: 8 },
// //   dateText: { fontSize: 16, marginTop: 8, color: '#555' },
// //   buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
// //   draftButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2e2e2', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10 },
// //   draftText: { marginLeft: 8, fontSize: 16, color: '#333', fontWeight: '600' },
// //   submitButton: { backgroundColor: '#00B894', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
// //   submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
// //   radioRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
// //   radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
// //   radioCircle: { height: 18, width: 18, borderRadius: 9, borderWidth: 2, borderColor: '#666', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
// //   radioSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
// //   radioText: { fontSize: 14, color: '#333' },

// //   // Tabs
// //   tabButton: {
// //     flex: 1,
// //     paddingVertical: 12,
// //     backgroundColor: '#e0e0e0',
// //     alignItems: 'center',
// //     borderRadius: 8,
// //     marginHorizontal: 2,
// //   },
// //   tabActive: {
// //     backgroundColor: '#00B894',
// //   },
// //   tabText: {
// //     color: '#fff',
// //     fontWeight: '600',
// //   },
// // });
// // import React, { useState, useEffect } from 'react';
// // import { useNavigation } from '@react-navigation/native';
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   StyleSheet,
// //   ScrollView,
// //   Alert,
// //   Image,
// //   Modal,
// // } from 'react-native';
// // import { CREATE_IDEA_URL } from '../src/context/api';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import { Picker } from '@react-native-picker/picker';
// // import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
// // import DateTimePicker from '@react-native-community/datetimepicker';
// // import * as ImagePicker from 'expo-image-picker';

// // export default function CreateIdeaScreen() {
// //   const navigation = useNavigation();

// //   // Tabs
// //   const [activeTab, setActiveTab] = useState('idea'); // 'idea' or 'employee'
// //   const [userDetails, setUserDetails] = useState(null);

// //   useEffect(() => {
// //     const fetchUserDetails = async () => {
// //       try {
// //         const userData = await AsyncStorage.getItem('user'); // tumhara storage key
// //         console.log('Raw userData from AsyncStorage:', userData);
// //         if (userData) {
// //           const parsed = JSON.parse(userData);
// //         console.log('Parsed userData:', parsed);
// //         console.log('parsed.empId:', parsed.empId);
// //         console.log('parsed.employeeNo:', parsed.employeeNo);
// //         console.log('parsed.designation:', parsed.designation);
// //         console.log('parsed.ownerDepartment:', parsed.ownerDepartment);
// //         console.log('parsed.ownerSubDepartment:', parsed.ownerSubDepartment);
// //         console.log('parsed.managerName:', parsed.managerName);
// //         console.log('parsed.reportingManagerEmail:', parsed.reportingManagerEmail);

// //           setUserDetails({
// //             employeeNo: parsed.employeeNo || parsed.empId || '',  
// //             name: parsed.name || '',
// //             email: parsed.email || parsed.ownerEmailId || '',  
// //             department: parsed.department || parsed.ownerDepartment || '',
// //             subDepartment: parsed.subDepartment || parsed.ownerSubDepartment || '',
// //             location: parsed.location || parsed.ownerLocation || '',
// //             reportingManagerName: parsed.reportingManagerName || parsed.managerName || parsed.reportingManager || '',
// //             reportingManagerEmail: parsed.reportingManagerEmail || parsed.managerEmail || parsed.managerEmailId || '',
// //             designation: parsed.designation || parsed.designation || '',  
// //           });
// //         } else {
// //           console.log('No userData found in AsyncStorage under key "user"');
// //         }
// //       } catch (error) {
// //         console.log('Error fetching user details:', error);
// //       }
// //     };
// //     fetchUserDetails();
// //   }, []);

// //   // Form states
// //   const [title, setTitle] = useState('');
// //   const [description, setDescription] = useState('');
// //   const [solution, setSolution] = useState('');
// //   const [category, setCategory] = useState('');
// //   const [benefit, setBenefit] = useState('');
// //   const [teamMembers, setTeamMembers] = useState('');
// //   const [mobileNumber, setMobileNumber] = useState('');
// //   const [date, setDate] = useState(null);
// //   const [showDatePicker, setShowDatePicker] = useState(false);

// //   const [image, setImage] = useState(null);
// //   const [showPreview, setShowPreview] = useState(false);
// //   const [fullScreen, setFullScreen] = useState(false);

// //   const [beSupportNeeded, setBeSupportNeeded] = useState(null);
// //   const [canImplementOtherLocation, setCanImplementOtherLocation] = useState(null);

// //   const [showConfirm, setShowConfirm] = useState(false);

// //   // IMAGE PICKER
// //   const pickImage = async () => {
// //     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
// //     if (!permissionResult.granted) {
// //       alert('Permission required!');
// //       return;
// //     }

// //     let result = await ImagePicker.launchImageLibraryAsync({
// //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
// //       allowsEditing: true,
// //       quality: 1,
// //     });

// //     if (!result.canceled) {
// //       setImage(result.assets[0].uri);
// //     }
// //   };

// //   // DATE PICKER
// //   const onChangeDate = (event, selectedDate) => {
// //     setShowDatePicker(false);
// //     if (selectedDate) setDate(selectedDate);
// //   };

// //   // SAVE DRAFT
// //   const handleSaveDraft = () => {
// //     const draft = {
// //       title,
// //       description,
// //       solution,
// //       category,
// //       benefit,
// //       teamMembers,
// //       mobileNumber,
// //       date: date ? date.toISOString().split('T')[0] : null,
// //       image,
// //       beSupportNeeded,
// //       canImplementOtherLocation,
// //       status: 'draft',
// //     };
// //     navigation.navigate('My Ideas', { newIdea: draft });
// //     Alert.alert('Draft Saved', 'Your idea has been saved as a draft.');
// //   };

// //   // VALIDATE BEFORE SUBMIT
// //   const handleBeforeSubmit = () => {
// //     if (!title || !description || !solution || !image || !date || !mobileNumber) {
// //       Alert.alert('Required Fields', 'Please fill all required fields.');
// //       return;
// //     }

// //     if (!/^\d{10}$/.test(mobileNumber)) {
// //       Alert.alert('Invalid Mobile Number', 'Please enter a valid 10 digit mobile number.');
// //       return;
// //     }

// //     setShowConfirm(true);
// //   };

// //   // FINAL SUBMIT WITH API CALL
// //   const handleFinalSubmit = async () => {
// //     const idea = {
// //       title,
// //       ideaDescription: description,       // updated
// //       proposedSolution: solution,         // updated
// //       benefitDescription: benefit,        // updated
// //       teamMembers,
// //       mobileNumber,
// //       category,
// //       date: date ? date.toISOString().split('T')[0] : null,
// //       image,
// //       beSupportNeeded,
// //       canImplementOtherLocation,
// //       status: 'Submitted',
// //     };
// //     //   description,
// //     //   solution,
// //     //   category,
// //     //   benefit,
// //     //   teamMembers,
// //     //   mobileNumber,
// //     //   date: date ? date.toISOString().split('T')[0] : null,
// //     //   image,
// //     //   beSupportNeeded,
// //     //   canImplementOtherLocation,
// //     //   status: 'Submitted',
// //     // };

// //     try {
// //       const token = await AsyncStorage.getItem('token');
// //       if (!token) {
// //         Alert.alert('Error', 'User token missing. Please login again.');
// //         return;
// //       }

// //       const response = await fetch(CREATE_IDEA_URL, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify(idea),
// //       });


// //   //     const text = await response.text();
// //   //     console.log('Create Idea Status:', response.status);
// //   //     console.log('Create Idea Response:', text);

// //   //     let data = {};
// //   //     try {
// //   //       data = JSON.parse(text);
// //   //     } catch (e) {
// //   //       console.warn('Response is not valid JSON:', text);
// //   //       data = {};
// //   //     }

// //   //     if (response.ok) {
// //   //       Alert.alert('Success', 'Your idea has been submitted successfully!');
// //   //       navigation.navigate('My Ideas', { newIdea: data });
// //   //     } else {
// //   //       console.error('Error:', data);
// //   //       Alert.alert('Error', data?.message || 'Failed to create idea.');
// //   //     }
// //   //   } catch (error) {
// //   //     console.error('Create Idea Error:', error);
// //   //     Alert.alert('Network error, please try again.');
// //   //   }
// //   // };
// //   const text = await response.text();
// //       let data = {};
// //       try { data = JSON.parse(text); } catch (e) { data = {}; }

// //       if (response.ok) {
// //         Alert.alert('Success', 'Your idea has been submitted successfully!');
// //         navigation.navigate('My Ideas', { newIdea: idea }); 
// //       } else {
// //         Alert.alert('Error', data?.message || 'Failed to create idea.');
// //       }
// //     } catch (error) {
// //       Alert.alert('Network error, please try again.');
// //     }
// //   };

// //   return (
// //     <View style={{ flex: 1 }}>
// //       {/* Sticky Header */}
// //       <View style={styles.stickyHeader}>
// //         <Text style={styles.heading}>Idea Creation Form</Text>
// //       </View>

// //       <ScrollView contentContainerStyle={styles.container}>
// //         <View style={{ height: 70 }} />

// //         {/* Tabs */}
// //         <View style={{ flexDirection: 'row', marginBottom: 20 }}>
// //           <TouchableOpacity
// //             style={[styles.tabButton, activeTab === 'idea' && styles.tabActive]}
// //             onPress={() => setActiveTab('idea')}
// //           >
// //             <Text style={styles.tabText}>Idea Form</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={[styles.tabButton, activeTab === 'employee' && styles.tabActive]}
// //             onPress={() => setActiveTab('employee')}
// //           >
// //             <Text style={styles.tabText}>Employee Details</Text>
// //           </TouchableOpacity>
// //         </View>

// //         {activeTab === 'employee' ? (
// //           <View style={styles.card}>
// //             {userDetails ? (
// //               <>
// //                 <FieldRow label="Idea Owner Employee No:" value={userDetails.employeeNo} />
// //                 <FieldRow label="Owner Name:" value={userDetails.name} />
// //                 <FieldRow label="Owner Email ID:" value={userDetails.email} />
// //                 <FieldRow label="Owner Department:" value={userDetails.department} />
// //                 <FieldRow label="Owner Sub Department:" value={userDetails.subDepartment} />
// //                 <FieldRow label="Owner Location:" value={userDetails.location} />
// //                 <FieldRow label="Reporting Manager Name:" value={userDetails.reportingManagerName} />
// //                 <FieldRow label="Reporting Manager Email:" value={userDetails.reportingManagerEmail} />

// //               </>
// //             ) : (
// //               <Text style={styles.loadingText}>Loading employee details...</Text>
// //             )}
// //           </View>
// //         ) :
// //          (
// //           <View style={styles.card}>
// //             {/* Idea/Opportunity Description */}
// //             <InputField
// //               label="Idea/Opportunity Description"
// //               required
// //               icon={<MaterialIcons name="title" size={20} color="#666" />}
// //               placeholder="Enter idea description..."
// //               value={title}
// //               onChangeText={setTitle}
// //               maxLength={100}
// //             />
// //             {/* Proposed Solution */}
// //             <InputField
// //               label="Proposed Solution"
// //               required
// //               icon={<MaterialIcons name="description" size={20} color="#666" />}
// //               placeholder="Enter proposed solution..."
// //               value={description}
// //               onChangeText={setDescription}
// //               multiline
// //               maxLength={300}
// //             />
// //             {/* Process Improvement / Cost Benefit */}
// //             <InputField
// //               label="Process Improvement/Cost Benefit"
// //               required
// //               icon={<FontAwesome name="" size={20} color="#666" />}
// //               placeholder="Enter tentative Benefit..."
// //               value={solution}
// //               onChangeText={setSolution}
// //               multiline
// //               maxLength={300}
// //             />
// //             {/* Team Members */}
// //             <InputField
// //               label="Team Members"
// //               icon={<MaterialIcons name="group" size={20} color="#666" />}
// //               placeholder="Enter team Members..."
// //               value={category}
// //               onChangeText={setCategory}
// //               maxLength={30}
// //             />
// //             {/* Solution Category */}
// //             <PickerField
// //               label="Solution Category"
// //               icon={<Ionicons name="bulb-outline" size={20} color="#666" />}
// //               selectedValue={benefit}
// //               onValueChange={setBenefit}
// //               options={[
// //                 'Quick Win',
// //                 'Kaizen',
// //                 'Lean',
// //                 'Six Sigma Yellow Belt',
// //                 'Six Sigma Green Belt',
// //                 'WorkPlace Management',
// //                 'Automation',
// //                 'Cost Saving',
// //                 'Busniness Improvement',
// //                 'Efficiency Improvement',
// //                 'Others',
// //               ]}
// //             />
// //             {/* Idea Theme */}
// //             <PickerField
// //               label="Idea Theme"
// //               icon={<MaterialIcons name="category" size={20} color="#666" />}
// //               selectedValue={teamMembers}
// //               onValueChange={setTeamMembers}
// //               options={[
// //                 'Productivity',
// //                 'Quality',
// //                 'Cost',
// //                 'Delivery',
// //                 'Safety',
// //                 'Morale',
// //                 'Environment',
// //               ]}
// //             />
// //             {/* Mobile Number */}
// //             <InputField
// //               label="Mobile Number"
// //               required
// //               icon={<Feather name="phone" size={20} color="#666" />}
// //               placeholder="Enter your number..."
// //               value={mobileNumber}
// //               onChangeText={setMobileNumber}
// //               maxLength={10}
// //             />
// //             {/* Radio fields */}
// //             <RadioField label="Is BE Team Support Needed?" value={beSupportNeeded} setValue={setBeSupportNeeded} />
// //             <RadioField label="Can Be Implemented To Other Location?" value={canImplementOtherLocation} setValue={setCanImplementOtherLocation} />

// //             {/* Image Upload */}
// //             <View style={styles.inputBlock}>
// //               <Text style={styles.label}>
// //                 Upload Image <Text style={styles.required}>*</Text>
// //               </Text>
// //               <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
// //                 <Feather name="image" size={20} color="#fff" />
// //                 <Text style={styles.uploadText}> Choose Image</Text>
// //               </TouchableOpacity>

// //               {image && (
// //                 <TouchableOpacity onPress={() => setShowPreview(!showPreview)} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
// //                   <Feather name="eye" size={20} color="#000" />
// //                 </TouchableOpacity>
// //               )}

// //               {image && showPreview && (
// //                 <TouchableOpacity onPress={() => setFullScreen(true)}>
// //                   <Image source={{ uri: image }} style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 10 }} />
// //                 </TouchableOpacity>
// //               )}

// //               <Modal visible={fullScreen} transparent={true}>
// //                 <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
// //                   <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 1 }} onPress={() => setFullScreen(false)}>
// //                     <Feather name="x" size={30} color="#fff" />
// //                   </TouchableOpacity>
// //                   <Image source={{ uri: image }} style={{ width: '90%', height: '80%', borderRadius: 10 }} resizeMode="contain" />
// //                 </View>
// //               </Modal>
// //             </View>

// //             {/* Completion Date */}
// //             <View style={styles.inputBlock}>
// //               <Text style={styles.label}>
// //                 Completion Date <Text style={styles.required}>*</Text>
// //               </Text>
// //               <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
// //                 <Feather name="calendar" size={20} color="#fff" />
// //                 <Text style={styles.uploadText}> Select Date</Text>
// //               </TouchableOpacity>
// //               {date && <Text style={styles.dateText}>{date.toDateString()}</Text>}
// //             </View>

// //             {showDatePicker && (
// //               <DateTimePicker
// //                 value={date || new Date()}
// //                 mode="date"
// //                 display="default"
// //                 minimumDate={new Date()}
// //                 onChange={onChangeDate}
// //               />
// //             )}

// //             {/* Buttons */}
// //             <View style={styles.buttonRow}>
// //               <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft}>
// //                 <FontAwesome name="save" size={16} color="#555" />
// //                 <Text style={styles.draftText}>Save as Draft</Text>
// //               </TouchableOpacity>

// //               <TouchableOpacity style={styles.submitButton} onPress={handleBeforeSubmit}>
// //                 <Text style={styles.submitText}>Submit</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         )}
// //       </ScrollView>

// //       {/* Confirm Modal */}
// //       <Modal visible={showConfirm} transparent={true} animationType="fade">
// //         <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
// //           <View style={{ backgroundColor: '#fff', width: '80%', padding: 20, borderRadius: 10, alignItems: 'center' }}>
// //             <Feather name="check-circle" size={40} color="#2196F3" />
// //             <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Save & Publish</Text>
// //             <Text style={{ fontSize: 14, textAlign: 'center', color: '#333' }}>Are you sure you want to save and publish this record?</Text>
// //             <View style={{ flexDirection: 'row', marginTop: 20 }}>
// //               <TouchableOpacity style={{ backgroundColor: '#ddd', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginRight: 10 }} onPress={() => setShowConfirm(false)}>
// //                 <Text style={{ color: '#333', fontWeight: '600' }}>Cancel</Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity style={{ backgroundColor: '#00B894', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }} onPress={() => { setShowConfirm(false); handleFinalSubmit(); }}>
// //                 <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>
// //     </View>
// //   );
// // }

// // // Input, Picker, Radio Fields as before

// // const InputField = ({ label, icon, placeholder, value, onChangeText, multiline, maxLength, required }) => (
// //   <View style={styles.inputBlock}>
// //     <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
// //     <View style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}>
// //       {icon}
// //       <TextInput
// //         style={[styles.input, multiline && styles.textArea]}
// //         placeholder={placeholder}
// //         value={value}
// //         onChangeText={onChangeText}
// //         multiline={multiline}
// //         placeholderTextColor="#999"
// //         keyboardType={label === 'Mobile Number' ? 'numeric' : 'default'}
// //         maxLength={maxLength}
// //       />
// //     </View>
// //     {maxLength && <Text style={styles.charCount}>{value.length}/{maxLength}</Text>}
// //   </View>
// // );

// // const PickerField = ({ label, icon, selectedValue, onValueChange, options }) => (
// //   <View style={styles.inputBlock}>
// //     <Text style={styles.label}>{label}</Text>
// //     <View style={styles.inputWrapper}>
// //       {icon}
// //       <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker} dropdownIconColor="#666">
// //         <Picker.Item label="Select" value="" />
// //         {options.map((option, index) => <Picker.Item label={option} value={option} key={index} />)}
// //       </Picker>
// //     </View>
// //   </View>
// // );

// // const RadioField = ({ label, value, setValue }) => (
// //   <View style={styles.inputBlock}>
// //     <Text style={styles.label}>{label}</Text>
// //     <View style={styles.radioRow}>
// //       <TouchableOpacity style={styles.radioOption} onPress={() => setValue(value === 'Yes' ? null : 'Yes')}>
// //         <View style={[styles.radioCircle, value === 'Yes' && styles.radioSelected]} />
// //         <Text style={styles.radioText}>Yes</Text>
// //       </TouchableOpacity>
// //       <TouchableOpacity style={styles.radioOption} onPress={() => setValue(value === 'No' ? null : 'No')}>
// //         <View style={[styles.radioCircle, value === 'No' && styles.radioSelected]} />
// //         <Text style={styles.radioText}>No</Text>
// //       </TouchableOpacity>
// //     </View>
// //   </View>
// // );

// // const FieldRow = ({ label, value }) => (
// //   <View style={styles.fieldRow}>
// //     <Text style={styles.fieldLabel}>{label}</Text>
// //     <Text style={styles.fieldValue}>{value || '-'}</Text>
// //   </View>
// // );

// // const styles = StyleSheet.create({
// //   container: { backgroundColor: '#F5F8FF', padding: 20, paddingBottom: 50 },
// //   stickyHeader: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#F5F8FF', paddingVertical: 15, zIndex: 10, elevation: 5 },
// //   heading: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' },
// //   card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5 },
// //   inputBlock: { marginBottom: 18 },
// //   label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
// //   required: { color: 'red' },
// //   inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
// //   inputWrapperMultiline: { alignItems: 'flex-start' },
// //   input: { flex: 1, fontSize: 16, marginLeft: 10, color: '#333' },
// //   picker: { flex: 1, marginLeft: 10, color: '#333' },
// //   textArea: { height: 100, textAlignVertical: 'top' },
// //   charCount: { alignSelf: 'flex-end', fontSize: 12, color: '#888', marginTop: 4 },
// //   uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF50', padding: 12, borderRadius: 10, justifyContent: 'center' },
// //   dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2196F3', padding: 12, borderRadius: 10, justifyContent: 'center' },
// //   uploadText: { color: '#fff', fontSize: 16, marginLeft: 8 },
// //   dateText: { fontSize: 16, marginTop: 8, color: '#555' },
// //   buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
// //   draftButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2e2e2', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10 },
// //   draftText: { marginLeft: 8, fontSize: 16, color: '#333', fontWeight: '600' },
// //   submitButton: { backgroundColor: '#00B894', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
// //   submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
// //   radioRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
// //   radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
// //   radioCircle: { height: 18, width: 18, borderRadius: 9, borderWidth: 2, borderColor: '#666', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
// //   radioSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
// //   radioText: { fontSize: 14, color: '#333' },

// //   // Tabs
// //   tabButton: {
// //     flex: 1,
// //     paddingVertical: 12,
// //     backgroundColor: '#e0e0e0',
// //     alignItems: 'center',
// //     borderRadius: 8,
// //     marginHorizontal: 2,
// //   },
// //   tabActive: {
// //     backgroundColor: '#00B894',
// //   },
// //   tabText: {
// //     color: '#fff',
// //     fontWeight: '600',
// //   },

// //   // New styles for employee details
// //   fieldRow: {
// //     flexDirection: 'row',
// //     marginBottom: 8,
// //   },
// //   fieldLabel: {
// //     fontWeight: 'bold',
// //     flex: 1,
// //     color: '#333',
// //   },
// //   fieldValue: {
// //     flex: 2,
// //     color: '#555',
// //   },
// //   loadingText: {
// //     color: '#555',
// //     textAlign: 'center',
// //     marginTop: 20,
// //   },
// // });
// import React, { useState, useEffect } from 'react';
// import { useNavigation } from '@react-navigation/native';
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
// } from 'react-native';
// import { CREATE_IDEA_POST_URL, CREATE_IDEA_GET_URL } from '../src/context/api';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Picker } from '@react-native-picker/picker';
// import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import * as ImagePicker from 'expo-image-picker';

// export default function CreateIdeaScreen() {
//   const navigation = useNavigation();

//   // Tabs
//   const [activeTab, setActiveTab] = useState('idea'); // 'idea' or 'employee'
//   const [userDetails, setUserDetails] = useState(null);

//   // Form states
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [solution, setSolution] = useState('');
//   const [category, setCategory] = useState('');
//   const [benefit, setBenefit] = useState('');
//   const [teamMembers, setTeamMembers] = useState('');
//   const [mobileNumber, setMobileNumber] = useState('');
//   const [date, setDate] = useState(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [image, setImage] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);
//   const [fullScreen, setFullScreen] = useState(false);
//   const [beSupportNeeded, setBeSupportNeeded] = useState(null);
//   const [canImplementOtherLocation, setCanImplementOtherLocation] = useState(null);
//   const [showConfirm, setShowConfirm] = useState(false);

//   // IMAGE PICKER
//   const pickImage = async () => {
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
//       setImage(result.assets[0].uri);
//     }
//   };

//   // DATE PICKER
//   const onChangeDate = (event, selectedDate) => {
//     setShowDatePicker(false);
//     if (selectedDate) setDate(selectedDate);
//   };

//   // FETCH EMPLOYEE DETAILS (GET API)
//   useEffect(() => {
//     const fetchEmployeeDetails = async () => {
//       if (activeTab !== 'employee') return;
//       try {
//         const token = await AsyncStorage.getItem('token');
//         if (!token) return;
//         const response = await fetch(CREATE_IDEA_GET_URL, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         if (!response.ok) {
//           throw new Error('Failed to fetch employee details');
//         }
//         const data = await response.json();
//         console.log('Employee Data:', data);
//         setUserDetails({
//           employeeNo: data.employeeNo || '',
//           name: data.name || '',
//           email: data.email || '',
//           department: data.department || '',
//           subDepartment: data.subDepartment || '',
//           location: data.location || '',
//           reportingManagerName: data.reportingManagerName || '',
//           reportingManagerEmail: data.reportingManagerEmail || '',
//           designation: data.designation || '',
//         });
//       } catch (error) {
//         console.error('Error fetching employee details:', error);
//       }
//     };
//     fetchEmployeeDetails();
//   }, [activeTab]);

//   // SAVE DRAFT
//   const handleSaveDraft = () => {
//     const draft = {
//       title,
//       description,
//       solution,
//       category,
//       benefit,
//       teamMembers,
//       mobileNumber,
//       date: date ? date.toISOString().split('T')[0] : null,
//       image,
//       beSupportNeeded,
//       canImplementOtherLocation,
//       status: 'draft',
//     };
//     navigation.navigate('My Ideas', { newIdea: draft });
//     Alert.alert('Draft Saved', 'Your idea has been saved as a draft.');
//   };

//   // VALIDATE BEFORE SUBMIT
//   const handleBeforeSubmit = () => {
//     if (!title || !description || !solution || !image || !date || !mobileNumber) {
//       Alert.alert('Required Fields', 'Please fill all required fields.');
//       return;
//     }
//     if (!/^\d{10}$/.test(mobileNumber)) {
//       Alert.alert('Invalid Mobile Number', 'Please enter a valid 10 digit mobile number.');
//       return;
//     }
//     setShowConfirm(true);
//   };

//   // FINAL SUBMIT (POST API)
//   const handleFinalSubmit = async () => {
//     const idea = {
//       title,
//       ideaDescription: description,
//       proposedSolution: solution,
//       benefitDescription: benefit,
//       teamMembers,
//       mobileNumber,
//       category,
//       date: date ? date.toISOString().split('T')[0] : null,
//       image,
//       beSupportNeeded,
//       canImplementOtherLocation,
//       status: 'Submitted',
//     };
//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (!token) {
//         Alert.alert('Error', 'User token missing. Please login again.');
//         return;
//       }
//       const response = await fetch(CREATE_IDEA_POST_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(idea),
//       });
//       const text = await response.text();
//       let data = {};
//       try { data = JSON.parse(text); } catch (e) { data = {}; }

//       if (response.ok) {
//         Alert.alert('Success', 'Your idea has been submitted successfully!');
//         navigation.navigate('My Ideas', { newIdea: idea }); 
//       } else {
//         Alert.alert('Error', data?.message || 'Failed to create idea.');
//       }
//     } catch (error) {
//       Alert.alert('Network error, please try again.');
//     }
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <View style={styles.stickyHeader}>
//         <Text style={styles.heading}>Idea Creation Form</Text>
//       </View>

//       <ScrollView contentContainerStyle={styles.container}>
//         <View style={{ height: 70 }} />

//         {/* Tabs */}
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
//                 <FieldRow label="Employee No:" value={userDetails.employeeNo} />
//                 <FieldRow label="Name:" value={userDetails.name} />
//                 <FieldRow label="Email:" value={userDetails.email} />
//                 <FieldRow label="Department:" value={userDetails.department} />
//                 <FieldRow label="Sub Department:" value={userDetails.subDepartment} />
//                 <FieldRow label="Location:" value={userDetails.location} />
//                 <FieldRow label="Reporting Manager Name:" value={userDetails.reportingManagerName} />
//                 <FieldRow label="Reporting Manager Email:" value={userDetails.reportingManagerEmail} />
//               </>
//             ) : (
//               <Text style={styles.loadingText}>Loading employee details...</Text>
//             )}
//           </View>
//         ) : (
//           // Idea Form Tab
//           <View style={styles.card}>
//             {/* Your InputFields, PickerFields, RadioFields, ImagePicker, DatePicker, Buttons */}
//             {/* ... keep all fields same as your original code ... */}
//             <View style={styles.buttonRow}>
//               <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft}>
//                 <FontAwesome name="save" size={16} color="#555" />
//                 <Text style={styles.draftText}>Save as Draft</Text>
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.submitButton} onPress={handleBeforeSubmit}>
//                 <Text style={styles.submitText}>Submit</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       </ScrollView>

//       {/* Confirm Modal */}
//       <Modal visible={showConfirm} transparent={true} animationType="fade">
//         <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
//           <View style={{ backgroundColor: '#fff', width: '80%', padding: 20, borderRadius: 10, alignItems: 'center' }}>
//             <Feather name="check-circle" size={40} color="#2196F3" />
//             <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Save & Publish</Text>
//             <Text style={{ fontSize: 14, textAlign: 'center', color: '#333' }}>Are you sure you want to save and publish this record?</Text>
//             <View style={{ flexDirection: 'row', marginTop: 20 }}>
//               <TouchableOpacity style={{ backgroundColor: '#ddd', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginRight: 10 }} onPress={() => setShowConfirm(false)}>
//                 <Text style={{ color: '#333', fontWeight: '600' }}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={{ backgroundColor: '#00B894', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }} onPress={() => { setShowConfirm(false); handleFinalSubmit(); }}>
//                 <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
//   const styles = StyleSheet.create({
//       container: { backgroundColor: '#F5F8FF', padding: 20, paddingBottom: 50 },
//       stickyHeader: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#F5F8FF', paddingVertical: 15, zIndex: 10, elevation: 5 },
//       heading: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' },
//       card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5 },
//       inputBlock: { marginBottom: 18 },
//       label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
//       required: { color: 'red' },
//       inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
//       inputWrapperMultiline: { alignItems: 'flex-start' },
//       input: { flex: 1, fontSize: 16, marginLeft: 10, color: '#333' },
//       picker: { flex: 1, marginLeft: 10, color: '#333' },
//       textArea: { height: 100, textAlignVertical: 'top' },
//       charCount: { alignSelf: 'flex-end', fontSize: 12, color: '#888', marginTop: 4 },
//       uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF50', padding: 12, borderRadius: 10, justifyContent: 'center' },
//       dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2196F3', padding: 12, borderRadius: 10, justifyContent: 'center' },
//       uploadText: { color: '#fff', fontSize: 16, marginLeft: 8 },
//       dateText: { fontSize: 16, marginTop: 8, color: '#555' },
//       buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
//       draftButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2e2e2', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10 },
//       draftText: { marginLeft: 8, fontSize: 16, color: '#333', fontWeight: '600' },
//       submitButton: { backgroundColor: '#00B894', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
//       submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
//       radioRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
//       radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
//       radioCircle: { height: 18, width: 18, borderRadius: 9, borderWidth: 2, borderColor: '#666', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
//       radioSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
//       radioText: { fontSize: 14, color: '#333' },

//       // Tabs
//       tabButton: {
//         flex: 1,
//         paddingVertical: 12,
//         backgroundColor: '#e0e0e0',
//         alignItems: 'center',
//         borderRadius: 8,
//         marginHorizontal: 2,
//       },
//       tabActive: {
//         backgroundColor: '#00B894',
//       },
//       tabText: {
//         color: '#fff',
//         fontWeight: '600',
//       },

//       // New styles for employee details
//       fieldRow: {
//         flexDirection: 'row',
//         marginBottom: 8,
//       },
//       fieldLabel: {
//         fontWeight: 'bold',
//         flex: 1,
//         color: '#333',
//       },
//       fieldValue: {
//         flex: 2,
//         color: '#555',
//       },
//       loadingText: {
//         color: '#555',
//         textAlign: 'center',
//         marginTop: 20,
//       },
//     });
// }
// // import React, { useState, useEffect } from 'react';
// // import { useNavigation } from '@react-navigation/native';
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   StyleSheet,
// //   ScrollView,
// //   Alert,
// //   Image,
// //   Modal,
// // } from 'react-native';
// // import { CREATE_IDEA_URL } from '../src/context/api';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import { Picker } from '@react-native-picker/picker';
// // import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
// // import DateTimePicker from '@react-native-community/datetimepicker';
// // import * as ImagePicker from 'expo-image-picker';

// // export default function CreateIdeaScreen() {
// //   const navigation = useNavigation();

// //   // Tabs
// //   const [activeTab, setActiveTab] = useState('idea'); // 'idea' or 'employee'
// //   const [userDetails, setUserDetails] = useState(null);

// //   useEffect(() => {
// //     const fetchUserDetails = async () => {
// //       try {
// //         const userData = await AsyncStorage.getItem('user'); 
// //         if (userData) {
// //           const parsed = JSON.parse(userData);
// //           setUserDetails({
// //             ideaOwnerEmployeeNo: parsed.empId || parsed.employeeNo || '',
// //             ideaOwnerName: parsed.name || '',
// //             ideaOwnerEmail: parsed.email || parsed.ownerEmailId || '',
// //             ideaOwnerDepartment: parsed.department || parsed.ownerDepartment || '',
// //             ideaOwnerSubDepartment: parsed.subDepartment || parsed.ownerSubDepartment || '',
// //             reportingManagerName: parsed.reportingManagerName || parsed.managerName || parsed.manager || '',
// //             managerEmail: parsed.managerEmail || parsed.reportingManagerEmail || '',
// //             location: parsed.location || parsed.ownerLocation || '',
// //             designation: parsed.designation || '',
// //           });
// //         }
// //       } catch (error) {
// //         console.log('Error fetching user details:', error);
// //       }
// //     };
// //     fetchUserDetails();
// //   }, []);

// //   // Form states
// //   const [title, setTitle] = useState('');
// //   const [description, setDescription] = useState('');
// //   const [solution, setSolution] = useState('');
// //   const [category, setCategory] = useState('');
// //   const [benefit, setBenefit] = useState('');
// //   const [teamMembers, setTeamMembers] = useState('');
// //   const [mobileNumber, setMobileNumber] = useState('');
// //   const [date, setDate] = useState(null);
// //   const [showDatePicker, setShowDatePicker] = useState(false);

// //   const [image, setImage] = useState(null);
// //   const [showPreview, setShowPreview] = useState(false);
// //   const [fullScreen, setFullScreen] = useState(false);

// //   const [beSupportNeeded, setBeSupportNeeded] = useState(null);
// //   const [canImplementOtherLocation, setCanImplementOtherLocation] = useState(null);

// //   const [showConfirm, setShowConfirm] = useState(false);

// //   // IMAGE PICKER
// //   const pickImage = async () => {
// //     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
// //     if (!permissionResult.granted) {
// //       alert('Permission required!');
// //       return;
// //     }

// //     let result = await ImagePicker.launchImageLibraryAsync({
// //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
// //       allowsEditing: true,
// //       quality: 1,
// //     });

// //     if (!result.canceled) {
// //       setImage(result.assets[0].uri);
// //     }
// //   };

// //   // DATE PICKER
// //   const onChangeDate = (event, selectedDate) => {
// //     setShowDatePicker(false);
// //     if (selectedDate) setDate(selectedDate);
// //   };

// //   // SAVE DRAFT
// //   const handleSaveDraft = () => {
// //     const draft = {
// //       title,
// //       description,
// //       solution,
// //       category,
// //       benefit,
// //       teamMembers,
// //       mobileNumber,
// //       date: date ? date.toISOString().split('T')[0] : null,
// //       image,
// //       beSupportNeeded,
// //       canImplementOtherLocation,
// //       status: 'draft',
// //     };
// //     navigation.navigate('My Ideas', { newIdea: draft });
// //     Alert.alert('Draft Saved', 'Your idea has been saved as a draft.');
// //   };

// //   // VALIDATE BEFORE SUBMIT
// //   const handleBeforeSubmit = () => {
// //     if (!title || !description || !solution || !image || !date || !mobileNumber) {
// //       Alert.alert('Required Fields', 'Please fill all required fields.');
// //       return;
// //     }

// //     if (!/^\d{10}$/.test(mobileNumber)) {
// //       Alert.alert('Invalid Mobile Number', 'Please enter a valid 10 digit mobile number.');
// //       return;
// //     }

// //     setShowConfirm(true);
// //   };

// //   // FINAL SUBMIT WITH API CALL
// //   const handleFinalSubmit = async () => {
// //     const idea = {
// //       title,
// //       ideaDescription: description,
// //       proposedSolution: solution,
// //       benefitDescription: benefit,
// //       teamMembers,
// //       mobileNumber,
// //       category,
// //       date: date ? date.toISOString().split('T')[0] : null,
// //       image,
// //       beSupportNeeded,
// //       canImplementOtherLocation,
// //       status: 'Submitted',
// //     };

// //     try {
// //       const token = await AsyncStorage.getItem('token');
// //       if (!token) {
// //         Alert.alert('Error', 'User token missing. Please login again.');
// //         return;
// //       }

// //       const response = await fetch(CREATE_IDEA_URL, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify(idea),
// //       });

// //       const text = await response.text();
// //       let data = {};
// //       try { data = JSON.parse(text); } catch (e) { data = {}; }

// //       if (response.ok) {
// //         Alert.alert('Success', 'Your idea has been submitted successfully!');
// //         navigation.navigate('My Ideas', { newIdea: idea });
// //       } else {
// //         Alert.alert('Error', data?.message || 'Failed to create idea.');
// //       }
// //     } catch (error) {
// //       Alert.alert('Network error, please try again.');
// //     }
// //   };

// //   return (
// //     <View style={{ flex: 1 }}>
// //       <View style={styles.stickyHeader}>
// //         <Text style={styles.heading}>Idea Creation Form</Text>
// //       </View>

// //       <ScrollView contentContainerStyle={styles.container}>
// //         <View style={{ height: 70 }} />

// //         {/* Tabs */}
// //         <View style={{ flexDirection: 'row', marginBottom: 20 }}>
// //           <TouchableOpacity
// //             style={[styles.tabButton, activeTab === 'idea' && styles.tabActive]}
// //             onPress={() => setActiveTab('idea')}
// //           >
// //             <Text style={styles.tabText}>Idea Form</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={[styles.tabButton, activeTab === 'employee' && styles.tabActive]}
// //             onPress={() => setActiveTab('employee')}
// //           >
// //             <Text style={styles.tabText}>Employee Details</Text>
// //           </TouchableOpacity>
// //         </View>

// //         {activeTab === 'employee' ? (
// //           <View style={styles.card}>
// //             {userDetails ? (
// //               <>
// //                 <FieldRow label="Employee No" value={userDetails.ideaOwnerEmployeeNo} />
// //                 <FieldRow label="Name" value={userDetails.ideaOwnerName} />
// //                 <FieldRow label="Email" value={userDetails.ideaOwnerEmail} />
// //                 <FieldRow label="Department" value={userDetails.ideaOwnerDepartment} />
// //                 <FieldRow label="Sub Department" value={userDetails.ideaOwnerSubDepartment} />
// //                 <FieldRow label="Manager Name" value={userDetails.reportingManagerName} />
// //                 <FieldRow label="Manager Email" value={userDetails.managerEmail?.email || userDetails.managerEmail || '-'} />
// //                 <FieldRow label="Location" value={userDetails.location?.city || userDetails.location || '-'} />
// //               </>
// //             ) : (
// //               <Text style={styles.loadingText}>Loading employee details...</Text>
// //             )}
// //           </View>
// //         ) : (
// //           // Idea Form tab content (unchanged, same as before)
// //           <View style={styles.card}>
// //             {/* Idea/Opportunity Description */}
// //             <InputField
// //               label="Idea/Opportunity Description"
// //               required
// //               icon={<MaterialIcons name="title" size={20} color="#666" />}
// //               placeholder="Enter idea description..."
// //               value={title}
// //               onChangeText={setTitle}
// //               maxLength={100}
// //             />
// //             <InputField
// //               label="Proposed Solution"
// //               required
// //               icon={<MaterialIcons name="description" size={20} color="#666" />}
// //               placeholder="Enter proposed solution..."
// //               value={description}
// //               onChangeText={setDescription}
// //               multiline
// //               maxLength={300}
// //             />
// //             <InputField
// //               label="Process Improvement/Cost Benefit"
// //               required
// //               icon={<FontAwesome name="" size={20} color="#666" />}
// //               placeholder="Enter tentative Benefit..."
// //               value={solution}
// //               onChangeText={setSolution}
// //               multiline
// //               maxLength={300}
// //             />
// //             <InputField
// //               label="Team Members"
// //               icon={<MaterialIcons name="group" size={20} color="#666" />}
// //               placeholder="Enter team Members..."
// //               value={category}
// //               onChangeText={setCategory}
// //               maxLength={30}
// //             />
// //             <PickerField
// //               label="Solution Category"
// //               icon={<Ionicons name="bulb-outline" size={20} color="#666" />}
// //               selectedValue={benefit}
// //               onValueChange={setBenefit}
// //               options={[
// //                 'Quick Win',
// //                 'Kaizen',
// //                 'Lean',
// //                 'Six Sigma Yellow Belt',
// //                 'Six Sigma Green Belt',
// //                 'WorkPlace Management',
// //                 'Automation',
// //                 'Cost Saving',
// //                 'Busniness Improvement',
// //                 'Efficiency Improvement',
// //                 'Others',
// //               ]}
// //             />
// //             <PickerField
// //               label="Idea Theme"
// //               icon={<MaterialIcons name="category" size={20} color="#666" />}
// //               selectedValue={teamMembers}
// //               onValueChange={setTeamMembers}
// //               options={[
// //                 'Productivity',
// //                 'Quality',
// //                 'Cost',
// //                 'Delivery',
// //                 'Safety',
// //                 'Morale',
// //                 'Environment',
// //               ]}
// //             />
// //             <InputField
// //               label="Mobile Number"
// //               required
// //               icon={<Feather name="phone" size={20} color="#666" />}
// //               placeholder="Enter your number..."
// //               value={mobileNumber}
// //               onChangeText={setMobileNumber}
// //               maxLength={10}
// //             />
// //             <RadioField label="Is BE Team Support Needed?" value={beSupportNeeded} setValue={setBeSupportNeeded} />
// //             <RadioField label="Can Be Implemented To Other Location?" value={canImplementOtherLocation} setValue={setCanImplementOtherLocation} />
// //             {/* Image, Date Picker and buttons same as your previous code */}
// //           </View>
// //         )}
// //       </ScrollView>
// //     </View>
// //   );
// // }

// // // Reuse your InputField, PickerField, RadioField, FieldRow components
// // // styles same as your previous code


import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
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
} from 'react-native';
import { CREATE_IDEA_POST_URL, CREATE_IDEA_GET_URL } from '../src/context/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

export default function CreateIdeaScreen() {
  const navigation = useNavigation();

  // Tabs
  const [activeTab, setActiveTab] = useState('idea'); // 'idea' or 'employee'
  const [userDetails, setUserDetails] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [solution, setSolution] = useState('');
  const [category, setCategory] = useState('');
  const [benefit, setBenefit] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [date, setDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [image, setImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [beSupportNeeded, setBeSupportNeeded] = useState(null);
  const [canImplementOtherLocation, setCanImplementOtherLocation] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // IMAGE PICKER
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission required!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // DATE PICKER
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  // FETCH EMPLOYEE DETAILS (GET API)
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (activeTab !== 'employee') return;
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        const response = await fetch(CREATE_IDEA_GET_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch employee details');
        }
        const data = await response.json();
        console.log('Employee Data:', data);
        setUserDetails({
          employeeNo: data.employeeNo || '',
          name: data.name || '',
          email: data.email || '',
          department: data.department || '',
          subDepartment: data.subDepartment || '',
          location: data.location || '',
          reportingManagerName: data.reportingManagerName || '',
          reportingManagerEmail: data.reportingManagerEmail || '',
          designation: data.designation || '',
        });
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };
    fetchEmployeeDetails();
  }, [activeTab]);

  // SAVE DRAFT
  const handleSaveDraft = () => {
    const draft = {
      title,
      description,
      solution,
      category,
      benefit,
      teamMembers,
      mobileNumber,
      date: date ? date.toISOString().split('T')[0] : null,
      image,
      beSupportNeeded,
      canImplementOtherLocation,
      status: 'draft',
    };
    navigation.navigate('My Ideas', { newIdea: draft });
    Alert.alert('Draft Saved', 'Your idea has been saved as a draft.');
  };

  // VALIDATE BEFORE SUBMIT
  const handleBeforeSubmit = () => {
    if (!title || !description || !solution || !image || !date || !mobileNumber) {
      Alert.alert('Required Fields', 'Please fill all required fields.');
      return;
    }
    if (!/^\d{10}$/.test(mobileNumber)) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10 digit mobile number.');
      return;
    }
    setShowConfirm(true);
  };

  // FINAL SUBMIT (POST API)
  const handleFinalSubmit = async () => {
    const idea = {
      title,
      ideaDescription: description,
      proposedSolution: solution,
      benefitDescription: benefit,
      teamMembers,
      mobileNumber,
      category,
      date: date ? date.toISOString().split('T')[0] : null,
      image,
      beSupportNeeded,
      canImplementOtherLocation,
      status: 'Submitted',
    };
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User token missing. Please login again.');
        return;
      }
      const response = await fetch(CREATE_IDEA_POST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(idea),
      });
      const text = await response.text();
      let data = {};
      try { data = JSON.parse(text); } catch (e) { data = {}; }

      if (response.ok) {
        Alert.alert('Success', 'Your idea has been submitted successfully!');
        navigation.navigate('My Ideas', { newIdea: idea });
      } else {
        Alert.alert('Error', data?.message || 'Failed to create idea.');
      }
    } catch (error) {
      Alert.alert('Network error, please try again.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.stickyHeader}>
        <Text style={styles.heading}>Idea Creation Form</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ height: 70 }} />

        {/* Tabs */}
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
                <FieldRow label="Employee No:" value={userDetails.employeeNo} />
                <FieldRow label="Name:" value={userDetails.name} />
                <FieldRow label="Email:" value={userDetails.email} />
                <FieldRow label="Department:" value={userDetails.department} />
                <FieldRow label="Sub Department:" value={userDetails.subDepartment} />
                <FieldRow label="Location:" value={userDetails.location} />
                <FieldRow label="Reporting Manager Name:" value={userDetails.reportingManagerName} />
                <FieldRow label="Reporting Manager Email:" value={userDetails.reportingManagerEmail} />
              </>
            ) : (
              <Text style={styles.loadingText}>Loading employee details...</Text>
            )}
          </View>
        ) : (
          // Idea Form Tab
          <View style={styles.card}>
            {/* Idea/Opportunity Description */}
            <InputField
              label="Idea/Opportunity Description"
              required
              icon={<MaterialIcons name="title" size={20} color="#666" />}
              placeholder="Enter idea description..."
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            {/* Proposed Solution */}
            <InputField
              label="Proposed Solution"
              required
              icon={<MaterialIcons name="description" size={20} color="#666" />}
              placeholder="Enter proposed solution..."
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={300}
            />

            {/* Process Improvement / Cost Benefit */}
            <InputField
              label="Process Improvement/Cost Benefit"
              required
              icon={<FontAwesome name="lightbulb-o" size={20} color="#666" />}
              placeholder="Enter tentative Benefit..."
              value={solution}
              onChangeText={setSolution}
              multiline
              maxLength={300}
            />

            {/* Team Members */}
            <InputField
              label="Team Members"
              icon={<MaterialIcons name="group" size={20} color="#666" />}
              placeholder="Enter team Members..."
              value={category}
              onChangeText={setCategory}
              maxLength={30}
            />

            {/* Solution Category */}
            <PickerField
              label="Solution Category"
              icon={<Ionicons name="bulb-outline" size={20} color="#666" />}
              selectedValue={benefit}
              onValueChange={setBenefit}
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

            {/* Idea Theme */}
            <PickerField
              label="Idea Theme"
              icon={<MaterialIcons name="category" size={20} color="#666" />}
              selectedValue={teamMembers}
              onValueChange={setTeamMembers}
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

            {/* Mobile Number */}
            <InputField
              label="Mobile Number"
              required
              icon={<Feather name="phone" size={20} color="#666" />}
              placeholder="Enter your number..."
              value={mobileNumber}
              onChangeText={setMobileNumber}
              maxLength={10}
            />

            {/* Radio fields */}
            <RadioField label="Is BE Team Support Needed?" value={beSupportNeeded} setValue={setBeSupportNeeded} />
            <RadioField label="Can Be Implemented To Other Location?" value={canImplementOtherLocation} setValue={setCanImplementOtherLocation} />

            {/* Image Upload */}
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Upload Image <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                <Feather name="image" size={20} color="#fff" />
                <Text style={styles.uploadText}> Choose Image</Text>
              </TouchableOpacity>

              {image && (
                <TouchableOpacity onPress={() => setShowPreview(!showPreview)} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                  <Feather name="eye" size={20} color="#000" />
                </TouchableOpacity>
              )}

              {image && showPreview && (
                <TouchableOpacity onPress={() => setFullScreen(true)}>
                  <Image source={{ uri: image }} style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 10 }} />
                </TouchableOpacity>
              )}

              <Modal visible={fullScreen} transparent={true}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
                  <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 1 }} onPress={() => setFullScreen(false)}>
                    <Feather name="x" size={30} color="#fff" />
                  </TouchableOpacity>
                  <Image source={{ uri: image }} style={{ width: '90%', height: '80%', borderRadius: 10 }} resizeMode="contain" />
                </View>
              </Modal>
            </View>

            {/* Completion Date */}
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Completion Date <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                <Feather name="calendar" size={20} color="#fff" />
                <Text style={styles.uploadText}> Select Date</Text>
              </TouchableOpacity>
              {date && <Text style={styles.dateText}>{date.toDateString()}</Text>}
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

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft}>
                <FontAwesome name="save" size={16} color="#555" />
                <Text style={styles.draftText}>Save as Draft</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitButton} onPress={handleBeforeSubmit}>
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Confirm Modal */}
      <Modal visible={showConfirm} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', width: '80%', padding: 20, borderRadius: 10, alignItems: 'center' }}>
            <Feather name="check-circle" size={40} color="#2196F3" />
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Save & Publish</Text>
            <Text style={{ fontSize: 14, textAlign: 'center', color: '#333' }}>Are you sure you want to save and publish this record?</Text>
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <TouchableOpacity style={{ backgroundColor: '#ddd', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginRight: 10 }} onPress={() => setShowConfirm(false)}>
                <Text style={{ color: '#333', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: '#00B894', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }} onPress={() => { setShowConfirm(false); handleFinalSubmit(); }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// INPUT, PICKER, RADIO FIELDS
const InputField = ({ label, icon, placeholder, value, onChangeText, multiline, maxLength, required }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
    <View style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}>
      {icon}
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor="#999"
        keyboardType={label === 'Mobile Number' ? 'numeric' : 'default'}
        maxLength={maxLength}
      />
    </View>
    {maxLength && <Text style={styles.charCount}>{value.length}/{maxLength}</Text>}
  </View>
);

const PickerField = ({ label, icon, selectedValue, onValueChange, options }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      {icon}
      <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker} dropdownIconColor="#666">
        <Picker.Item label="Select" value="" />
        {options.map((option, index) => <Picker.Item label={option} value={option} key={index} />)}
      </Picker>
    </View>
  </View>
);

const RadioField = ({ label, value, setValue }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.radioRow}>
      <TouchableOpacity style={styles.radioOption} onPress={() => setValue(value === 'Yes' ? null : 'Yes')}>
        <View style={[styles.radioCircle, value === 'Yes' && styles.radioSelected]} />
        <Text style={styles.radioText}>Yes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.radioOption} onPress={() => setValue(value === 'No' ? null : 'No')}>
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

// STYLES - moved outside the component
const styles = StyleSheet.create({
  container: { backgroundColor: '#F5F8FF', padding: 20, paddingBottom: 50 },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5F8FF',
    paddingVertical: 15,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5
  },
  inputBlock: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
  required: { color: 'red' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  inputWrapperMultiline: { alignItems: 'flex-start' },
  input: { flex: 1, fontSize: 16, marginLeft: 10, color: '#333' },
  picker: { flex: 1, marginLeft: 10, color: '#333' },
  textArea: { height: 100, textAlignVertical: 'top' },
  charCount: { alignSelf: 'flex-end', fontSize: 12, color: '#888', marginTop: 4 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center'
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center'
  },
  uploadText: { color: '#fff', fontSize: 16, marginLeft: 8 },
  dateText: { fontSize: 16, marginTop: 8, color: '#555' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  draftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e2e2',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10
  },
  draftText: { marginLeft: 8, fontSize: 16, color: '#333', fontWeight: '600' },
  submitButton: { backgroundColor: '#00B894', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
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
  radioSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  radioText: { fontSize: 14, color: '#333' },

  // Tabs
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  tabActive: {
    backgroundColor: '#00B894',
  },
  tabText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Employee details
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
});