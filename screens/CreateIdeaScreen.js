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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';

export default function CreateIdeaScreen() {
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [solution, setSolution] = useState('');
  const [category, setCategory] = useState('');
  const [benefit, setBenefit] = useState('');
  const [teamMembers, setTeamMembers] = useState('');

  const handleSaveDraft = () => {
    const draft = {
      title,
      description,
      solution,
      category,
      benefit,
      teamMembers,
      date: new Date().toDateString(),
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
      date: new Date().toDateString(),
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

// Reusable Input Field component
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

// Custom PickerField component
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