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
  Modal,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { EDIT_IDEA_URL, EMPLOYEE_GET_URL } from '../src/context/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import NetInfo from '@react-native-community/netinfo';

/* ----------------------
   Utility helpers
   ---------------------*/
const normalizeImagePath = (path) => {
  if (!path) return null;
  try {
    let cleanPath = path;
    const basePattern = 'https://ideabank-api-dev.abisaio.com';
    const occurrences = (cleanPath.match(new RegExp(basePattern, 'g')) || []).length;
    if (occurrences > 1) {
      const lastIndex = cleanPath.lastIndexOf(basePattern);
      cleanPath = basePattern + cleanPath.substring(lastIndex + basePattern.length);
    }
    if (typeof cleanPath === 'string' && (cleanPath.startsWith('http://') || cleanPath.startsWith('https://'))) {
      return cleanPath;
    }
    const BASE_URL = 'https://ideabank-api-dev.abisaio.com';
    const fullUrl = `${BASE_URL}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
    return fullUrl;
  } catch (e) {
    return null;
  }
};

const getAlternateImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  return url.replace('ideabank-api-dev.abisaio.com', 'ideabank-dev.abisaio.com');
};

const parseInitialDate = (value) => {
  if (!value) return null;
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d;
  } catch (e) {
    return null;
  }
};

/* ----------------------
   Component
   ---------------------*/
export default function EditIdeaScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route?.params || {}; // defensive
  const ideaData = typeof params.ideaData === 'object' && params.ideaData !== null ? params.ideaData : {};
  const ideaId = params.ideaId;
  const isManagerEditing = params.isManagerEditing || false;

  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: '#0f4c5c' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    });
  }, [navigation]);

  const [activeTab, setActiveTab] = useState('idea');
  const [userDetails, setUserDetails] = useState(null);

  // Safe initial states
  const [ideaDescription, setIdeaDescription] = useState(String(ideaData.ideaDescription || ''));
  const [proposedSolution, setProposedSolution] = useState(String(ideaData.proposedSolution || ''));
  const [solutionCategory, setSolutionCategory] = useState(String(ideaData.solutionCategory || ''));
  const [ideaTheme, setIdeaTheme] = useState(String(ideaData.ideaTheme || ''));
  const [benefit, setBenefit] = useState(String(ideaData.tentativeBenefit || ''));
  const [teamMembers, setTeamMembers] = useState(String(ideaData.teamMembers || ''));
  const [mobileNumber, setMobileNumber] = useState(String(ideaData.mobileNumber || ''));

  const [date, setDate] = useState(parseInitialDate(ideaData.plannedImplementationDuration));
  const [showDatePicker, setShowDatePicker] = useState(false);

  // File handling - use safeExistingFile to avoid calling string methods on null
  const rawExisting = ideaData.beforeImplementationImagePath || ideaData.imagePath || null;
  const safeExistingFile = typeof rawExisting === 'string' ? normalizeImagePath(rawExisting) : null;

  const [file, setFile] = useState(safeExistingFile);
  const [fileName, setFileName] = useState(() => {
    try {
      if (!safeExistingFile) return '';
      const lower = String(safeExistingFile).toLowerCase();
      if (lower.includes('.pdf')) return 'Existing PDF Document';
      const urlParts = String(safeExistingFile).split('/');
      const filename = urlParts[urlParts.length - 1] || '';
      const decoded = decodeURIComponent(filename || '');
      return decoded.replace(/\s+/g, ' ').trim() || 'Existing Image';
    } catch (e) {
      return 'Existing Image';
    }
  });
  const [fileType, setFileType] = useState(() => {
    if (!safeExistingFile) return 'image';
    return String(safeExistingFile).toLowerCase().includes('.pdf') ? 'pdf' : 'image';
  });
  const [isNewFile, setIsNewFile] = useState(false);

  const [fullScreen, setFullScreen] = useState(false);
  const [imageScale, setImageScale] = useState(1);

  // Radios with safe ideaData
  const safeIdeaData = typeof ideaData === 'object' && ideaData !== null ? ideaData : {};
  const parseYesNo = (v) => {
    if (v === true || v === 'true' || v === 'Yes' || v === 'yes') return 'Yes';
    if (v === false || v === 'false' || v === 'No' || v === 'no') return 'No';
    return 'No';
  };

  const [beSupportNeeded, setBeSupportNeeded] = useState(parseYesNo(safeIdeaData.isBETeamSupportNeeded));
  const [canImplementOtherLocation, setCanImplementOtherLocation] = useState(
    parseYesNo(safeIdeaData.canBeImplementedToOtherLocations || safeIdeaData.canBeImplementedToOtherLocation)
  );

  const [showConfirm, setShowConfirm] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitType, setSubmitType] = useState('');
  const [imageLoadError, setImageLoadError] = useState(false);
  const [ideaDescriptionError, setIdeaDescriptionError] = useState('');
  const [proposedSolutionError, setProposedSolutionError] = useState('');
  const [benefitError, setBenefitError] = useState('');
  const [teamMembersError, setTeamMembersError] = useState('');
  const [mobileNumberError, setMobileNumberError] = useState('');
  const [solutionCategoryError, setSolutionCategoryError] = useState('');
  const [ideaThemeError, setIdeaThemeError] = useState('');
  const [fileError, setFileError] = useState('');
  const [dateError, setDateError] = useState('');
  const [beSupportNeededError, setBeSupportNeededError] = useState('');
  const [canImplementOtherLocationError, setCanImplementOtherLocationError] = useState('');

  const ideaStatus = safeIdeaData.status || safeIdeaData.ideaStatus || 'Draft';
  const showDraftOption = String(ideaStatus).toLowerCase() === 'draft' && !isManagerEditing;

  /* ----------------------
     Fetch employee details when employee tab opened
     ---------------------*/
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
      // swallow or log in dev
      // console.warn('fetchEmployeeDetails error', error);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [fetchEmployeeDetails]);

  /* ----------------------
     Pickers / File pickers
     ---------------------*/
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
        setIsNewFile(true);
        const timestamp = Date.now();
        const extension = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
        const cleanFileName = `image_${timestamp}.${extension}`;
        setFileName(cleanFileName);
        setShowFileOptions(false);
        validateFile(asset.uri);
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
        setIsNewFile(true);
        const timestamp = Date.now();
        const extension = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
        const cleanFileName = `camera_${timestamp}.${extension}`;
        setFileName(cleanFileName);
        setShowFileOptions(false);
        validateFile(asset.uri);
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
        setIsNewFile(true);
        const timestamp = Date.now();  
        const cleanName = `document_${timestamp}.pdf`;
        setFileName(cleanName);
        setShowFileOptions(false);
        validateFile(selectedFile.uri);
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
          Alert.alert('Info', 'Cannot open PDF. You can view it after submission.');
        }
      } catch (error) {
        Alert.alert('Info', 'PDF selected successfully. It will be uploaded with your idea.');
      }
    }
  };

  /* ----------------------
     Date helpers & validators
     ---------------------*/
  const formatDate = (dateObj) => {
    if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) return '';
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
    if (isNaN(target.getTime())) return null;
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /* ----------------------
     Validation functions
     ---------------------*/
  const validateIdeaDescription = (value) => {
    if (!String(value || '').trim()) {
      setIdeaDescriptionError('Idea Description is required.');
      return false;
    }
    setIdeaDescriptionError('');
    return true;
  };

  const validateProposedSolution = (value) => {
    if (!String(value || '').trim()) {
      setProposedSolutionError('Proposed Solution is required.');
      return false;
    }
    setProposedSolutionError('');
    return true;
  };

  const validateBenefit = (value) => {
    if (!String(value || '').trim()) {
      setBenefitError('Process Improvement/Cost Benefit is required.');
      return false;
    }
    setBenefitError('');
    return true;
  };

  const validateTeamMembers = (text) => {
    const t = String(text || '').trim();
    if (!t) {
      setTeamMembersError('Team Members is required.');
      return false;
    }
    const regex = /^[a-zA-Z\s,.]*$/;
    if (!regex.test(t)) {
      setTeamMembersError('Numbers or special characters are not allowed');
      return false;
    }
    setTeamMembersError('');
    return true;
  };

  const validateMobileNumber = (text) => {
    const trimmedText = String(text || '').trim();
    if (!trimmedText) {
      setMobileNumberError('Mobile number is required.');
      return false;
    }
    if (trimmedText.length !== 10 || !/^\d{10}$/.test(trimmedText)) {
      setMobileNumberError('Mobile number must be exactly 10 digits.');
      return false;
    }
    setMobileNumberError('');
    return true;
  };

  const validateSolutionCategory = (value) => {
    if (!String(value || '').trim()) {
      setSolutionCategoryError('Solution Category is required.');
      return false;
    }
    setSolutionCategoryError('');
    return true;
  };

  const validateIdeaTheme = (value) => {
    if (!String(value || '').trim()) {
      setIdeaThemeError('Idea Theme is required.');
      return false;
    }
    setIdeaThemeError('');
    return true;
  };

  const validateFile = (value) => {
    if (!value) {
      setFileError('Before Implementation file is required.');
      return false;
    }
    setFileError('');
    return true;
  };

  const validateDate = (value) => {
    if (!value || isNaN(new Date(value).getTime())) {
      setDateError('Planned Completion Date is required.');
      return false;
    }
    setDateError('');
    return true;
  };

  const validateBeSupportNeeded = (value) => {
    if (value === null || typeof value === 'undefined') {
      setBeSupportNeededError('Please select if BE Team Support is needed.');
      return false;
    }
    setBeSupportNeededError('');
    return true;
  };

  const validateCanImplementOtherLocation = (value) => {
    if (value === null || typeof value === 'undefined') {
      setCanImplementOtherLocationError('Please select if can be implemented to other location.');
      return false;
    }
    setCanImplementOtherLocationError('');
    return true;
  };

  /* ----------------------
     Submit handlers
     ---------------------*/
  const handleBeforeSubmit = useCallback((type) => {
    const isIdeaDescriptionValid = validateIdeaDescription(ideaDescription);
    const isProposedSolutionValid = validateProposedSolution(proposedSolution);
    const isBenefitValid = validateBenefit(benefit);
    const isTeamMembersValid = validateTeamMembers(teamMembers);
    const isSolutionCategoryValid = validateSolutionCategory(solutionCategory);
    const isIdeaThemeValid = validateIdeaTheme(ideaTheme);
    const isFileValid = validateFile(file);
    const isDateValid = validateDate(date);
    const isMobileNumberValid = validateMobileNumber(mobileNumber);
    const isBeSupportNeededValid = validateBeSupportNeeded(beSupportNeeded);
    const isCanImplementOtherLocationValid = validateCanImplementOtherLocation(canImplementOtherLocation);

    if (
      !isIdeaDescriptionValid ||
      !isProposedSolutionValid ||
      !isBenefitValid ||
      !isTeamMembersValid ||
      !isSolutionCategoryValid ||
      !isIdeaThemeValid ||
      !isFileValid ||
      !isDateValid ||
      !isMobileNumberValid ||
      !isBeSupportNeededValid ||
      !isCanImplementOtherLocationValid
    ) {
      Alert.alert('Validation Error', 'Please correct the highlighted fields before submitting.');
      return;
    }

    setSubmitType(type);
    setShowConfirm(true);
  }, [ideaDescription, proposedSolution, benefit, teamMembers, solutionCategory, ideaTheme, file, date, mobileNumber, beSupportNeeded, canImplementOtherLocation]);

  const handleFinalSubmit = async () => {
    setShowConfirm(false);

    try {
      setIsSubmitting(true);

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
      formData.append('IdeaDescription', String(ideaDescription).trim());
      formData.append('ProposedSolution', String(proposedSolution).trim());
      formData.append('TentativeBenefit', String(benefit).trim());
      formData.append('TeamMembers', String(teamMembers).trim());
      formData.append('MobileNumber', String(mobileNumber).trim());
      formData.append('SolutionCategory', solutionCategory);
      formData.append('IdeaTheme', ideaTheme);
      formData.append('PlannedImplementationDuration', date ? date.toISOString().split('T')[0] : '');
      formData.append('IsBETeamSupportNeeded', beSupportNeeded === 'Yes' ? 'true' : 'false');
      formData.append('CanBeImplementedToOtherLocations', canImplementOtherLocation === 'Yes' ? 'true' : 'false');

      if (submitType === 'publish') {
        formData.append('SubmitType', 'publish');
      } else {
        formData.append('SubmitType', 'draft');
      }

      if (file && isNewFile) {
        try {
          let fileUri = String(file);
          if (Platform.OS === 'android' && !fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
            fileUri = `file://${fileUri}`;
          }

          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          if (!fileInfo.exists) {
            throw new Error('File not found on device');
          }

          let mimeType = 'application/octet-stream';
          const extension = String(fileName || '').split('.').pop()?.toLowerCase() || '';
          if (fileType === 'pdf' || extension === 'pdf') {
            mimeType = 'application/pdf';
          } else if (extension === 'png') {
            mimeType = 'image/png';
          } else if (extension === 'jpg' || extension === 'jpeg') {
            mimeType = 'image/jpeg';
          } else if (extension === 'gif') {
            mimeType = 'image/gif';
          } else if (extension === 'webp') {
            mimeType = 'image/webp';
          }

          const cleanFileName = String(fileName || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');

          formData.append('BeforeImplementationImage', {
            uri: fileUri,
            type: mimeType,
            name: cleanFileName,
          });
        } catch (fileError) {
          Alert.alert('File Error', 'Unable to process selected file. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      const apiUrl = EDIT_IDEA_URL(ideaId);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: Do not set Content-Type when using FormData in RN fetch
        },
        body: formData,
      });

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        if (response.ok || response.status === 200) {
          setIsSubmitting(false);
          Alert.alert('Success', 'Idea updated successfully!', [{
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            }
          }]);
          return;
        } else {
          throw new Error('Invalid server response format');
        }
      }

      setIsSubmitting(false);

      if (response.ok && (data.success === true || data.success === 'true')) {
        Alert.alert('Success', data.message || 'Idea updated successfully!', [{
          text: 'OK',
          onPress: () => navigation.goBack(),
        }]);
      } else {
        Alert.alert('Error', data?.message || data?.error || 'Failed to update idea.');
      }
    } catch (error) {
      let errorMessage = 'Network error. Please try again.';
      if (error && error.message) {
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

  const handleTabSwitch = useCallback((tab) => setActiveTab(tab), []);

  /* ----------------------
     Render
     ---------------------*/
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FF' }}>
      <ScrollView contentContainerStyle={styles.container}>
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
              onChangeText={(text) => {
                setIdeaDescription(text);
                validateIdeaDescription(text);
              }}
              maxLength={300}
              error={ideaDescriptionError}
              multiline={false}
            />

            <InputField
              label="Proposed Solution"
              required
              icon={<MaterialIcons name="description" size={20} color="#666" />}
              placeholder="Enter proposed solution..."
              value={proposedSolution}
              onChangeText={(text) => {
                setProposedSolution(text);
                validateProposedSolution(text);
              }}
              multiline
              maxLength={500}
              error={proposedSolutionError}
            />

            <InputField
              label="Process Improvement/Cost Benefit"
              required
              icon={<FontAwesome name="lightbulb-o" size={20} color="#666" />}
              placeholder="Enter tentative Benefit..."
              value={benefit}
              onChangeText={(text) => {
                setBenefit(text);
                validateBenefit(text);
              }}
              multiline
              maxLength={200}
              error={benefitError}
            />

            <InputField
              label="Team Members"
              required
              icon={<MaterialIcons name="group" size={20} color="#666" />}
              placeholder="Enter team Members..."
              value={teamMembers}
              onChangeText={(text) => {
                setTeamMembers(text);
                validateTeamMembers(text);
              }}
              maxLength={100}
              error={teamMembersError}
            />

            <PickerField
              label="Solution Category"
              required
              icon={<Ionicons name="bulb-outline" size={20} color="#666" />}
              selectedValue={solutionCategory}
              onValueChange={(value) => {
                setSolutionCategory(value);
                validateSolutionCategory(value);
              }}
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
              error={solutionCategoryError}
            />

            <PickerField
              label="Idea Theme"
              required
              icon={<MaterialIcons name="category" size={20} color="#666" />}
              selectedValue={ideaTheme}
              onValueChange={(value) => {
                setIdeaTheme(value);
                validateIdeaTheme(value);
              }}
              options={[
                'Productivity',
                'Quality',
                'Cost',
                'Delivery',
                'Safety',
                'Morale',
                'Environment',
              ]}
              error={ideaThemeError}
            />

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Before Implementation (JPG, PNG, PDF) <Text style={styles.required}>*</Text></Text>
              <View style={[styles.fileInputRow, fileError && styles.inputError]}>
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
              {fileError ? <Text style={styles.errorText}>{fileError}</Text> : null}

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
                    {!imageLoadError ? (
                      <Image
                        source={{ uri: file }}
                        style={[styles.fullScreenImage, { transform: [{ scale: imageScale }] }]}
                        contentFit="contain"
                        onError={() => {
                          const altUrl = getAlternateImageUrl(file);
                          if (altUrl && file !== altUrl) {
                            setFile(altUrl);
                          } else {
                            setImageLoadError(true);
                          }
                        }}
                      />
                    ) : (
                      <View style={styles.imageErrorContainer}>
                        <Ionicons name="alert-circle-outline" size={50} color="#fff" />
                        <Text style={styles.imageErrorText}>Image failed to load</Text>
                      </View>
                    )}
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

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Planned Completion Date <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.dateInputWeb, dateError && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateDisplayText}>{date ? formatDate(date) : 'Select Date'}</Text>
                <Feather name="calendar" size={18} color="#666" />
              </TouchableOpacity>
              {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
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
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDate(selectedDate);
                    validateDate(selectedDate);
                  } else {
                    validateDate(null);
                  }
                }}
              />
            )}

            <InputField
              label="Mobile Number"
              required
              icon={<Feather name="phone" size={20} color="#666" />}
              placeholder="Enter your number..."
              value={mobileNumber}
              onChangeText={(text) => {
                setMobileNumber(text);
                validateMobileNumber(text);
              }}
              maxLength={10}
              keyboardType="numeric"
              error={mobileNumberError}
            />

            <RadioField
              label="Is BE Team Support Needed?"
              required
              value={beSupportNeeded}
              setValue={(value) => {
                setBeSupportNeeded(value);
                validateBeSupportNeeded(value);
              }}
              error={beSupportNeededError}
            />

            <RadioField
              label="Can Be Implemented To Other Location?"
              required
              value={canImplementOtherLocation}
              setValue={(value) => {
                setCanImplementOtherLocation(value);
                validateCanImplementOtherLocation(value);
              }}
              error={canImplementOtherLocationError}
            />

            <View style={styles.buttonRow}>
              {showDraftOption && (
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
                style={[styles.submitButton, !showDraftOption && styles.submitButtonFullWidth]}
                onPress={() => handleBeforeSubmit('publish')}
                disabled={isSubmitting}
              >
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.submitText}>Update & Publish</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#00B894" />
            <Text style={styles.loadingOverlayText}>Updating your idea...</Text>
          </View>
        </View>
      )}

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

/* ----------------------
   Small presentational components (fixed)
   ---------------------*/
const InputField = ({ label, icon, placeholder, value = '', onChangeText = () => {}, multiline = false, maxLength, required, keyboardType, error }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
    <View style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline, error && styles.inputError]}>
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
    {typeof maxLength !== 'undefined' ? <Text style={styles.charCount}>{String(value || '').length}/{maxLength}</Text> : null}
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const PickerField = ({ label, icon, selectedValue, onValueChange, options = [], required, error }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
    <View style={[styles.inputWrapper, error && styles.inputError]}>
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
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const RadioField = ({ label, value, setValue, required, error }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
    <View style={[styles.radioRow, error && styles.inputError]}>
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
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const FieldRow = ({ label, value }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value || '-'}</Text>
  </View>
);

/* ----------------------
   Styles (I kept your styles and added errorText)
   ---------------------*/
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
  textArea: { 
    height: 100, 
    textAlignVertical: 'top' 
  },
  inputError: { borderColor: 'red', borderWidth: 1 },
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
  imageErrorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageErrorText: {
    color: '#fff',
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 6,
    fontSize: 13,
  }
});