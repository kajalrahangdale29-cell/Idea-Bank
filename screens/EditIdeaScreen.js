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
} from 'react-native';
import { EDIT_IDEA_URL, EMPLOYEE_GET_URL } from '../src/context/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export default function EditIdeaScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const ideaData = route.params?.ideaData || {};
  const ideaId = route.params?.ideaId;

  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: '#0f4c5c' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
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
  const [fileName, setFileName] = useState(existingFile ? (existingFile.includes('.pdf') ? 'Existing PDF' : 'Existing Image') : '');
  const [fileType, setFileType] = useState(existingFile && existingFile.includes('.pdf') ? 'pdf' : 'image');
  
  const [fullScreen, setFullScreen] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [beSupportNeeded, setBeSupportNeeded] = useState(ideaData.isBETeamSupportNeeded || null);
  const [canImplementOtherLocation, setCanImplementOtherLocation] = useState(ideaData.canBeImplementedToOtherLocations || null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitType, setSubmitType] = useState('');

  const ideaStatus = ideaData.status || 'Draft';
  
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
      
    }
  }, [activeTab]);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [fetchEmployeeDetails]);

  // Optimized tab switch with useCallback
  const handleTabSwitch = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const pickImageFromGallery = async () => {
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
      setFile(result.assets[0].uri);
      setFileType('image');
      const uriParts = result.assets[0].uri.split('/');
      setFileName(uriParts[uriParts.length - 1]);
      setShowFileOptions(false);
    }
  };

  const pickImageFromCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Camera permission required!');
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
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick PDF file');
    }
  };

  const onChangeDate = useCallback((event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  }, []);

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

  const handleBeforeSubmit = useCallback((type) => {
    if (!proposedSolution || !solutionCategory || !file || !date || !mobileNumber) {
      Alert.alert('Required Fields', 'Please fill all required fields.');
      return;
    }
    if (!/^\d{10}$/.test(mobileNumber)) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10 digit mobile number.');
      return;
    }
    setSubmitType(type);
    setShowConfirm(true);
  }, [proposedSolution, solutionCategory, file, date, mobileNumber]);

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User token missing. Please login again.');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('IdeaDescription', ideaDescription);
      formData.append('ProposedSolution', proposedSolution);
      formData.append('TentativeBenefit', benefit);
      formData.append('TeamMembers', teamMembers);
      formData.append('MobileNumber', mobileNumber);
      formData.append('SolutionCategory', solutionCategory);
      formData.append('IdeaTheme', ideaTheme);
      formData.append('PlannedImplementationDuration', date ? date.toISOString().split('T')[0] : null);
      formData.append('IsBETeamSupportNeeded', beSupportNeeded);
      formData.append('CanBeImplementedToOtherLocations', canImplementOtherLocation);

      if (file) {
        if (fileType === 'pdf') {
          formData.append('image', {
            uri: file,
            type: 'application/pdf',
            name: fileName || 'document.pdf',
          });
        } else {
          formData.append('image', {
            uri: file,
            type: 'image/jpeg',
            name: fileName || 'idea.jpg',
          });
        }
      }

      const apiUrl = EDIT_IDEA_URL(ideaId);
      if (submitType === 'publish') {
        formData.append('SubmitType', 'publish');
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const text = await response.text();
      let data = {};
      try { data = JSON.parse(text); } catch (e) { data = {}; }

      if (response.ok && data.success) {
        navigation.goBack();
      } else {
        Alert.alert('Error', data?.message || 'Failed to update idea.');
      }
    } catch (error) {
      Alert.alert('Network error, please try again.');
    } finally {
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
        {/* Tabs - Green color like Create Idea */}
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
              maxLength={100}
            />

            <InputField
              label="Proposed Solution"
              required
              icon={<MaterialIcons name="description" size={20} color="#666" />}
              placeholder="Enter proposed solution..."
              value={proposedSolution}
              onChangeText={setProposedSolution}
              multiline
              maxLength={300}
            />

            <InputField
              label="Process Improvement/Cost Benefit"
              required
              icon={<FontAwesome name="lightbulb-o" size={20} color="#666" />}
              placeholder="Enter tentative Benefit..."
              value={benefit}
              onChangeText={setBenefit}
              multiline
              maxLength={300}
            />

            <InputField
              label="Team Members"
              icon={<MaterialIcons name="group" size={20} color="#666" />}
              placeholder="Enter team Members..."
              value={teamMembers}
              onChangeText={setTeamMembers}
              maxLength={30}
            />

            <PickerField
              label="Solution Category"
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

            {/* File Upload Section */}
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Before Implementation (JPG, PNG, PDF) <Text style={styles.required}>*</Text></Text>
              <View style={styles.fileInputRow}>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  style={styles.chooseFileButton} 
                  onPress={() => setShowFileOptions(true)}
                >
                  <Text style={styles.chooseFileText}>Choose File</Text>
                </TouchableOpacity>
                <Text style={styles.fileNameDisplay}>
                  {fileName || (file ? (fileType === 'pdf' ? 'PDF selected' : 'Image selected') : 'No file chosen')}
                </Text>
              </View>

              {file && fileType === 'image' && (
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => setFullScreen(true)} 
                  style={styles.eyeIconContainer}
                >
                  <Feather name="eye" size={20} color="#2196F3" />
                  <Text style={styles.previewText}>Preview Image</Text>
                </TouchableOpacity>
              )}

              {file && fileType === 'pdf' && (
                <View style={styles.pdfInfoContainer}>
                  <Feather name="file-text" size={20} color="#FF5722" />
                  <Text style={styles.pdfInfoText}>PDF Selected</Text>
                </View>
              )}

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
                      <Text style={styles.imageOptionText}>Choose Image from Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      activeOpacity={0.7}
                      style={styles.imageOptionButton} 
                      onPress={pickPDF}
                    >
                      <Feather name="file-text" size={24} color="#FF5722" />
                      <Text style={styles.imageOptionText}>Choose PDF Document</Text>
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

            {/* Completion Date */}
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Planned Completion Date <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                style={styles.dateInputWeb} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateDisplayText}>{date ? formatDate(date) : 'Select Date'}</Text>
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
              onChangeText={setMobileNumber}
              maxLength={10}
            />

            <RadioField label="Is BE Team Support Needed?" value={beSupportNeeded} setValue={setBeSupportNeeded} />
            <RadioField label="Can Be Implemented To Other Location?" value={canImplementOtherLocation} setValue={setCanImplementOtherLocation} />

            {/* Buttons */}
            <View style={styles.buttonRow}>
              {ideaStatus === 'Draft' && (
                <TouchableOpacity 
                  activeOpacity={0.7}
                  style={styles.draftButton} 
                  onPress={() => handleBeforeSubmit('draft')}
                  disabled={isSubmitting}
                >
                  <FontAwesome name="save" size={16} color="#555" />
                  <Text style={styles.draftText}>Update as Draft</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.submitButton, ideaStatus !== 'Draft' && styles.submitButtonFullWidth]}
                onPress={() => handleBeforeSubmit('publish')}
                disabled={isSubmitting}
              >
                <Text style={styles.submitText}>Update & Publish</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Loading Overlay */}
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#00B894" />
            <Text style={styles.loadingOverlayText}>Updating your idea...</Text>
          </View>
        </View>
      )}

      {/* Confirm Modal */}
      <Modal visible={showConfirm} transparent={true} animationType="fade">
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Feather name="check-circle" size={40} color="#2196F3" />
            <Text style={styles.confirmModalTitle}>
              {submitType === 'draft' ? 'Update as Draft' : 'Update & Publish'}
            </Text>
            <Text style={styles.confirmModalText}>
              Are you sure you want to {submitType === 'draft' ? 'save as draft' : 'update and publish'} this record?
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
                onPress={() => {
                  setShowConfirm(false);
                  handleFinalSubmit();
                }}
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

const RadioField = React.memo(({ label, value, setValue }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.radioRow}>
      <TouchableOpacity 
        activeOpacity={0.7}
        style={styles.radioOption} 
        onPress={() => setValue(value === 'Yes' ? null : 'Yes')}
      >
        <View style={[styles.radioCircle, value === 'Yes' && styles.radioSelected]} />
        <Text style={styles.radioText}>Yes</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        activeOpacity={0.7}
        style={styles.radioOption} 
        onPress={() => setValue(value === 'No' ? null : 'No')}
      >
        <View style={[styles.radioCircle, value === 'No' && styles.radioSelected]} />
        <Text style={styles.radioText}>No</Text>
      </TouchableOpacity>
    </View>
  </View>
));

const FieldRow = ({ label, value }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F8FF',
    padding: 16,
    paddingBottom: 40,
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
    backgroundColor: '#00B894',
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
  inputBlock: { marginBottom: 16 },
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
  input: { flex: 1, fontSize: 14, marginLeft: 10, color: '#333' },
  picker: { flex: 1, marginLeft: 10, color: '#333' },
  textArea: { height: 100, textAlignVertical: 'top' },
  charCount: { alignSelf: 'flex-end', fontSize: 12, color: '#888', marginTop: 4 },
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
  eyeIconContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  draftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e2e2',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    flex: 1,
  },
  draftText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
    fontWeight: '600'
  },
  submitButton: {
    backgroundColor: '#00B894',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  submitButtonFullWidth: {
    flex: 1,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
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
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50'
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
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  confirmModalText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  confirmModalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  confirmCancelButton: {
    backgroundColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  confirmCancelText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmSubmitButton: {
    backgroundColor: '#00B894',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmSubmitText: {
    color: '#fff',
    fontWeight: '600',
  },
});