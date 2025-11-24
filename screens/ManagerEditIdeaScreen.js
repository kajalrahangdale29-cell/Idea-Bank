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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import NetInfo from '@react-native-community/netinfo';

const MANAGER_EDIT_IDEA_URL = (id) => `https://ideabank-api-dev.abisaio.com/api/Approval/edit/${id}`;
const EMPLOYEE_GET_URL = "https://ideabank-api-dev.abisaio.com/EmployeeInfo";

const normalizeImagePath = (path) => {
  if (!path) return null;
  let cleanPath = path;
  const basePattern = 'https://ideabank-api-dev.abisaio.com';
  const occurrences = (cleanPath.match(new RegExp(basePattern, 'g')) || []).length;
  if (occurrences > 1) {
    const lastIndex = cleanPath.lastIndexOf(basePattern);
    cleanPath = basePattern + cleanPath.substring(lastIndex + basePattern.length);
  }
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }
  const BASE_URL = 'https://ideabank-api-dev.abisaio.com';
  const fullUrl = `${BASE_URL}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
  return fullUrl;
};

const getAlternateImageUrl = (url) => {
  if (!url) return null;
  return url.replace('ideabank-api-dev.abisaio.com', 'ideabank-dev.abisaio.com');
};

export default function ManagerEditIdeaScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const ideaData = route.params?.ideaData || {};
  const ideaId = route.params?.ideaId;
  const onSuccess = route.params?.onSuccess;

  const [activeTab, setActiveTab] = useState('idea');
  const [userDetails, setUserDetails] = useState(null);
  const [ideaDescription, setIdeaDescription] = useState(ideaData.ideaDescription || '');
  const [proposedSolution, setProposedSolution] = useState(ideaData.proposedSolution || '');
  const [solutionCategory, setSolutionCategory] = useState(ideaData.solutionCategory || '');
  const [ideaTheme, setIdeaTheme] = useState(ideaData.ideaTheme || '');
  const [benefit, setBenefit] = useState(ideaData.tentativeBenefit || '');
  const [teamMembers, setTeamMembers] = useState(ideaData.teamMembers || '');
  
  // FIX: Handle empty mobile number from API
  const [mobileNumber, setMobileNumber] = useState(() => {
    const existingMobile = ideaData.mobileNumber || '';
    // If mobile number is empty or invalid, try to get from user data
    if (!existingMobile || existingMobile.trim() === '') {
      return '';
    }
    return existingMobile;
  });
  
  const [date, setDate] = useState(
    ideaData.plannedImplementationDuration
      ? new Date(ideaData.plannedImplementationDuration)
      : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const existingFile = normalizeImagePath(ideaData.beforeImplementationImagePath || ideaData.beforeImplementationImage || ideaData.imagePath || null);
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
  
  const [isNewFile, setIsNewFile] = useState(false);
  
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
  const [imageLoadError, setImageLoadError] = useState(false);

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
      
      // FIX: Auto-fill mobile number from employee details if not present
      if (!mobileNumber || mobileNumber.trim() === '') {
        const employeeMobile = data.data.mobileNumber || '';
        if (employeeMobile && /^\d{10}$/.test(employeeMobile)) {
          setMobileNumber(employeeMobile);
        }
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  }, [activeTab, mobileNumber]);

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
      const asset = result.assets[0];
      setFile(asset.uri);
      setFileType('image');
      setIsNewFile(true); 
      const timestamp = Date.now();
      const extension = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanFileName = `image_${timestamp}.${extension}`;
      setFileName(cleanFileName);
      setShowFileOptions(false);
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
      const asset = result.assets[0];
      setFile(asset.uri);
      setFileType('image');
      setIsNewFile(true); 
      const timestamp = Date.now();
      const extension = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanFileName = `camera_${timestamp}.${extension}`;
      setFileName(cleanFileName);
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
        setIsNewFile(true); 
        setFileName(selectedFile.name);
        setShowFileOptions(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select PDF file.');
    }
  };

  const openPDF = () => {
    if (file && fileType === 'pdf') {
      if (file.startsWith('http://') || file.startsWith('https://')) {
        Linking.openURL(file).catch(() => {
          Alert.alert('Error', 'Cannot open PDF file');
        });
      } else {
        Alert.alert('PDF Selected', `PDF file: ${fileName}\n\nFile will be uploaded on submission.`);
      }
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
    
    // FIX: Improved mobile number validation
    const trimmedMobile = mobileNumber.trim();
    if (!trimmedMobile) {
      Alert.alert('Required Field', 'Please enter mobile number.');
      return;
    }
    if (!/^\d{10}$/.test(trimmedMobile)) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number without spaces or special characters.');
      return;
    }
    
    setShowConfirm(true);
  }, [ideaDescription, proposedSolution, solutionCategory, file, date, mobileNumber]);

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
      formData.append('IdeaDescription', ideaDescription.trim());
      formData.append('ProposedSolution', proposedSolution.trim());
      formData.append('TentativeBenefit', benefit.trim());
      formData.append('TeamMembers', teamMembers.trim());
      
      // FIX: Ensure mobile number is properly trimmed and validated
      formData.append('MobileNumber', mobileNumber.trim());
      
      formData.append('SolutionCategory', solutionCategory);
      formData.append('IdeaTheme', ideaTheme);
      formData.append('PlannedImplementationDuration', date ? date.toISOString().split('T')[0] : '');
      formData.append('IsBETeamSupportNeeded', beSupportNeeded === 'Yes' ? 'true' : 'false');
      formData.append('CanBeImplementedToOtherLocations', canImplementOtherLocation === 'Yes' ? 'true' : 'false');

      // FIX: Only append file if it's a new file
      if (file && isNewFile) {
        try {
          let fileUri = file;
          if (Platform.OS === 'android' && !fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
            fileUri = `file://${fileUri}`;
          }

          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          
          if (!fileInfo.exists) {
            throw new Error('File not found on device');
          }

          let mimeType = 'application/octet-stream';
          const extension = fileName.split('.').pop()?.toLowerCase();
          
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

          const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

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

      const apiUrl = MANAGER_EDIT_IDEA_URL(ideaId);
      
      console.log('Submitting to:', apiUrl);
      console.log('Mobile Number being sent:', mobileNumber.trim());
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      if (response.status === 413) {
        setIsSubmitting(false);
        Alert.alert(
          'File Too Large',
          'The selected file is too large. Please select a smaller file (recommended under 5MB).',
          [{ text: 'OK' }]
        );
        return;
      }

      if (response.status === 404) {
        setIsSubmitting(false);
        Alert.alert(
          'API Error',
          'Manager edit endpoint not configured on server.',
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

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        if (response.ok || response.status === 200) {
          setIsSubmitting(false);
          Alert.alert(
            'Success',
            'Idea updated successfully!',
            [
              {
                text: 'OK',
                onPress: () => {
                  if (onSuccess) onSuccess();
                  navigation.goBack(); 
                },
              },
            ]
          );
          return;
        } else {
          throw new Error('Invalid server response format');
        }
      }
      
      setIsSubmitting(false);
      if (response.ok && (data.success === true || data.success === 'true')) {
        Alert.alert(
          'Success',
          data.message || 'Idea updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onSuccess) onSuccess();
                navigation.goBack(); 
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Error',
          data?.message || data?.error || 'Failed to update idea.'
        );
      }

    } catch (error) {
      console.error('Submit error:', error);
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
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={openPDF}
                  style={styles.pdfInfoContainer}
                >
                  <Feather name="file-text" size={20} color="#FF5722" />
                  <Text style={styles.pdfInfoText} numberOfLines={1}>PDF: {fileName}</Text>
                </TouchableOpacity>
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
              placeholder="Enter 10-digit mobile number"
              value={mobileNumber}
              onChangeText={(text) => {
                // Remove any non-numeric characters
                const cleaned = text.replace(/\D/g, '');
                setMobileNumber(cleaned);
              }}
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

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#0f4c5c" />
            <Text style={styles.loadingOverlayText}>Updating idea...</Text>
          </View>
        </View>
      )}

      <Modal visible={showConfirm} transparent={true} animationType="fade">
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Feather name="check-circle" size={40} color="#0f4c5c" />
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
    backgroundColor: '#0f4c5c',
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
    backgroundColor: '#0f4c5c',
    borderColor: '#0f4c5c'
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
    backgroundColor: '#0f4c5c',
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
  imageErrorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageErrorText: {
    color: '#fff',
    marginTop: 10,
  }
});