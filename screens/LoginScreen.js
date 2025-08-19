import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// Correct the relative path according to your folder structure
import { UserContext } from '../src/context/UserContext';  

const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const { setUser } = useContext(UserContext);

  const handleLogin = () => {
    if (employeeId.length !== 8) {
      Alert.alert('Error', 'Employee ID must be exactly 8 digits');
      return;
    }

    // You may want to add password validation here as well

    setUser({
      name: 'Kajal',
      id: employeeId,
    });

    Alert.alert('Login Successful', 'Welcome to Idea Bank!', [
      {
        text: 'OK',
        onPress: () => navigation.replace('MainApp'),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 120}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <StatusBar backgroundColor="#0f526a" barStyle="light-content" />

          <View style={styles.topBackground}>
            <View style={styles.logoColumn}>
              <Image
                source={require('../assets/abis_logo.png')}
                style={styles.ibLogo}
                resizeMode="contain"
              />
            </View>
          </View>
          <View style={styles.bottomBackground} />
          <View style={styles.loginCard}>
            <Image
              source={require('../assets/ideabank_logo.png')}
              style={styles.ideaBankLogo}
              resizeMode="contain"
            />
            <Text style={styles.loginTitle}>Welcome to Idea Bank!</Text>
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color="#999" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your Employee ID"
                value={employeeId}
                onChangeText={setEmployeeId}
                keyboardType="numeric"
                maxLength={8}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#999" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureTextEntry}
                placeholderTextColor="#999"
                textContentType="oneTimeCode"
              />
              <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
                <Feather name={secureTextEntry ? 'eye-off' : 'eye'} size={20} color="#999" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f526a',
  },
  topBackground: {
    height: height * 0.4,
    backgroundColor: '#0f526a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    marginTop: 40,
    paddingLeft: 45,
  },
  ibLogo: {
    width: 400,
    height: 200,
    marginBottom: 90,
    resizeMode: 'contain',
  },
  bottomBackground: {
    height: height * 0.7,
    backgroundColor: '#fff',
  },
  loginCard: {
    position: 'absolute',
    top: height * 0.31,
    height: height * 0.6,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  ideaBankLogo: {
    width: 250,
    height: 70,
    alignSelf: 'center',
    marginBottom: 10.5,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 35,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 35,
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  icon: {
    marginRight: 15,
  },
  input: {
    flex: 2,
    height: 50,
    color: '#000',
  },
  forgotPassword: {
    textAlign: 'right',
    color: '#007BFF',
    fontSize: 13,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 70,
  },
  loginButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});