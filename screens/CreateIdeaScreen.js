import React, { useState } from 'react';
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

export default function CreateIdeaScreen() {
  const navigation = useNavigation();

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

  const [beSupportNeeded, setBeSupportNeeded] = useState(null);
  const [canImplementOtherLocation, setCanImplementOtherLocation] = useState(null);

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

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

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

  const handleSubmit = () => {
    if (!title || !description || !solution || !image || !date || !mobileNumber) {
      Alert.alert(
        'Required Fields',
        'Please fill all required fields .'
      );
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10 digit mobile number.');
      return;
    }

    const idea = {
      title,
      description,
      solution,
      category,
      benefit,
      teamMembers,
      mobileNumber,
      date: date.toISOString().split('T')[0],
      image,
      beSupportNeeded,
      canImplementOtherLocation,
      status: 'Submitted',
    };

    navigation.navigate('My Ideas', { newIdea: idea });
    Alert.alert(
      'Success',
      'Your idea has been submitted successfully.',
      [], 
      { cancelable: true }
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        <Text style={styles.heading}>Idea Creation Form</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ height: 70 }} />

        <View style={styles.card}>
          <InputField
            label="Idea/Opportunity Description"
            required
            icon={<MaterialIcons name="title" size={20} color="#666" />}
            placeholder="Enter idea description..."
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          <InputField
            label="Proposed Solution"
            required
            icon={<MaterialIcons name="description" size={20} color="#666" />}
            placeholder="Enter proposed solution...."
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={300}
          />

          <InputField
            label="Process Improvement/Cost Benefit"
            required
            icon={<FontAwesome name="money" size={20} color="#666" />}
            placeholder="Enter tentative Benefit....."
            value={solution}
            onChangeText={setSolution}
            multiline
            maxLength={300}
          />

          <InputField
            label="Team Members"
            icon={<MaterialIcons name="group" size={20} color="#666" />}
            placeholder="Enter team Members...."
            value={category}
            onChangeText={setCategory}
            maxLength={30}
          />

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
              'Busniness Improvement',
              'Efficiency Improvement',
              'Others',
            ]}
          />

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

          <InputField
            label="Mobile Number"
            required
            icon={<Feather name="phone" size={20} color="#666" />}
            placeholder="Enter your number..."
            value={mobileNumber}
            onChangeText={setMobileNumber}
            maxLength={10}
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

          {/* Image Upload Section */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Upload Image <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
              <Feather name="image" size={20} color="#fff" />
              <Text style={styles.uploadText}> Choose Image</Text>
            </TouchableOpacity>
            {image && (
              <TouchableOpacity
                onPress={() => setShowPreview(!showPreview)}
                style={{ marginTop: 8, alignSelf: 'flex-start' }}
              >
                <Feather name="eye" size={20} color="#000" />
              </TouchableOpacity>
            )}
            {image && showPreview && (
              <Image
                source={{ uri: image }}
                style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 10 }}
              />
            )}
          </View>

          {/* Completion Date */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Completion Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
              <Feather name="calendar" size={20} color="#fff" />
              <Text style={styles.uploadText}> Select Date</Text>
            </TouchableOpacity>

            {date && (
              <Text style={styles.dateText}>
                {Math.ceil(
                  (date.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
                    (1000 * 60 * 60 * 24)
                ) > 0
                  ? `Total: ${Math.ceil(
                      (date.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
                        (1000 * 60 * 60 * 24)
                    )} days`
                  : ''}
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

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft}>
              <FontAwesome name="save" size={16} color="#555" />
              <Text style={styles.draftText}>Save as Draft</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// InputField, PickerField, RadioField, and styles remain exactly as in your original code.
const InputField = ({ label, icon, placeholder, value, onChangeText, multiline, maxLength, required }) => (
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
        keyboardType={label === "Mobile Number" ? "numeric" : "default"}
        maxLength={maxLength}
      />
    </View>
    {maxLength && (
      <Text style={styles.charCount}>
        {value.length}/{maxLength}
      </Text>
    )}
  </View>
);

const PickerField = ({ label, icon, selectedValue, onValueChange, options }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      {icon}
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.picker}
        dropdownIconColor="#666"
      >
        <Picker.Item label="Select " value="" />
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
        style={styles.radioOption}
        onPress={() => setValue(value === "Yes" ? null : "Yes")}
      >
        <View style={[styles.radioCircle, value === "Yes" && styles.radioSelected]} />
        <Text style={styles.radioText}>Yes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.radioOption}
        onPress={() => setValue(value === "No" ? null : "No")}
      >
        <View style={[styles.radioCircle, value === "No" && styles.radioSelected]} />
        <Text style={styles.radioText}>No</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F8FF',
    padding: 20,
    paddingBottom: 50,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5F8FF',
    paddingVertical: 15,
    zIndex: 10,
    elevation: 5,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  inputBlock: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  required: {
    color: 'red',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputWrapperMultiline: {
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  picker: {
    flex: 1,
    marginLeft: 10,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  dateText: {
    fontSize: 16,
    marginTop: 8,
    color: '#555',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  draftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e2e2',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  draftText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#00B894',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
});