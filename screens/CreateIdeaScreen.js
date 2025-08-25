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
  Platform,
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

  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  
  const [image, setImage] = useState(null);

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
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleSaveDraft = () => {
    const draft = {
      title,
      description,
      solution,
      category,
      benefit,
      teamMembers,
      date: date.toISOString().split('T')[0],
      image,
      status: 'draft',
    };
    navigation.navigate('My Ideas', { newIdea: draft });
    Alert.alert('Draft Saved', 'Your idea has been saved as a draft.');
  };

  const handleSubmit = () => {
    if (!title || !description || !solution) {
      Alert.alert('Required Fields', 'Please fill all required fields.');
      return;
    }
    const idea = {
      title,
      description,
      solution,
      category,
      benefit,
      teamMembers,
      date: date.toISOString().split('T')[0],
      image,
      status: 'Submitted',
    };

    navigation.navigate('My Ideas', { newIdea: idea });
    Alert.alert('Success', 'Your idea has been submitted successfully.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Idea Creation Form</Text>

      <View style={styles.card}>
        <InputField
          label="Idea/Opportunity Description *"
          icon={<MaterialIcons name="title" size={20} color="#666" />}
          placeholder="Enter idea description..."
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <InputField
          label="Proposed Solution *"
          icon={<MaterialIcons name="description" size={20} color="#666" />}
          placeholder="Enter proposed solution...."
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={300}
        />

        <InputField
          label="Process Improvement/Cost Benefit *"
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

        
        <View style={styles.inputBlock}>
          <Text style={styles.label}>Upload Image</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
            <Feather name="image" size={20} color="#fff" />
            <Text style={styles.uploadText}> Choose Image</Text>
          </TouchableOpacity>
          {image && (
            <Image
              source={{ uri: image }}
              style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 10 }}
            />
          )}
        </View>

        
        <View style={styles.inputBlock}>
          <Text style={styles.label}>Completion Date</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
            <Feather name="calendar" size={20} color="#fff" />
            <Text style={styles.uploadText}> Select Date</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>
            Selected Date: {date.toLocaleDateString('en-GB')}
          </Text>
        </View>

        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
        )}

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
  );
}

const InputField = ({ label, icon, placeholder, value, onChangeText, multiline, maxLength }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}>
      {icon}
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor="#999"
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F8FF',
    padding: 20,
    paddingBottom: 50,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
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
});