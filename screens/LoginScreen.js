import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Vibration,
} from 'react-native';
import { Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UserContext } from '../src/context/UserContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height, width } = Dimensions.get('window');

const isSmallDevice = height < 700;
const isMediumDevice = height >= 700 && height < 800;

export default function LoginScreen({ navigation }) {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const { setUser } = useContext(UserContext);
  const LOGIN_URL = 'https://ideabank-api-dev.abisaio.com/login';

  const playSuccessNotification = () => {
    const pattern = [0, 100, 50, 100];
    Vibration.vibrate(pattern);
  };

  const handleLogin = async () => {
    if (username.length !== 8) {
      Alert.alert('Error', 'Employee ID must be exactly 8 digits');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Password cannot be empty');
      return;
    }

    setUser({ name: 'Kajal', id: username });

    try {
      const response = await fetch(`${LOGIN_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (response.ok && data.success) {
        await AsyncStorage.setItem("userData", JSON.stringify(data));

        if (data.token) {
          await AsyncStorage.setItem("token", data.token);
        }

        if (data.employee?.role) {
          await AsyncStorage.setItem("role", data.employee.role);
        }

        if (data.employee) {
          await AsyncStorage.setItem("isManager", JSON.stringify(data.employee.isManager));
          await AsyncStorage.setItem("isHod", JSON.stringify(data.employee.isHod));
          await AsyncStorage.setItem("isBETeamMember", JSON.stringify(data.employee.isBETeamMember));
        }
        playSuccessNotification();

        setSuccessMessage('Login Successful!');
        setTimeout(() => {
          setSuccessMessage('');
          navigation.replace('MainApp', {
            screen: 'Dashboard',
            params: { showToast: true },
          });
        }, 1000);
      } else {
        Alert.alert("Login Failed", data?.message || "Invalid credentials");
      }
      return data;

    } catch (error) {
      Alert.alert("Error", "Network error occurred");
      throw error;
    }
  };

  const handleForgotPassword = () => {
    const url = 'https://myib.co.in:8052/employees/forgot-password';
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open the URL');
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAwareScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        enableOnAndroid={true} 
        extraScrollHeight={Platform.OS === 'android' ? 20 : 40}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>

            <View style={styles.topBackground}>
              <View style={styles.logoColumn}>
                <Image
                  source={require('../assets/implementimage.png')}
                  style={styles.topIllustration}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.loginCard}>
              <Image
                source={require('../assets/ideabank_logo.png')}
                style={styles.ideaBankLogo}
                resizeMode="contain"
              />
              <Text style={styles.loginTitle}>Welcome Back!</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="MYIB Employee ID"
                  value={username}
                  onChangeText={setUserName}
                  keyboardType="numeric"
                  maxLength={8}
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="MYIB Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureTextEntry}
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity 
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={secureTextEntry ? 'eye-off' : 'eye'}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                onPress={handleForgotPassword} 
                style={styles.forgotPasswordContainer}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Forgot your password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>

      {successMessage !== '' && (
        <View style={styles.toastWrapper}>
          <View style={styles.toast}>
            <Text style={styles.toastText}>{successMessage}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
    minHeight: height,
  },
  topBackground: { 
    height: isSmallDevice ? height * 0.32 : isMediumDevice ? height * 0.38 : height * 0.42,
    backgroundColor: '#fff', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
    paddingHorizontal: 20,
  },
  logoColumn: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    flex: 1, 
    width: '100%',
    maxWidth: 400,
  },
  topIllustration: { 
    width: '100%',
    height: isSmallDevice ? '60%' : isMediumDevice ? '70%' : '75%',
    maxHeight: 250,
  },
  loginCard: { 
    position: 'absolute', 
    top: isSmallDevice ? height * 0.26 : isMediumDevice ? height * 0.32 : height * 0.36,
    height: isSmallDevice ? height * 0.66 : height * 0.60,
    alignSelf: 'center', 
    width: width * 0.9,
    maxWidth: 450,
    backgroundColor: '#fff', 
    borderRadius: 24, 
    paddingHorizontal: width * 0.06,
    paddingVertical: isSmallDevice ? 20 : isMediumDevice ? 25 : 30,
    elevation: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.12, 
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  ideaBankLogo: { 
    width: isSmallDevice ? '70%' : '75%',
    height: isSmallDevice ? 50 : isMediumDevice ? 60 : 70,
    alignSelf: 'center', 
    marginBottom: isSmallDevice ? 8 : 10,
    marginTop: isSmallDevice ? 5 : 10,
  },
  loginTitle: { 
    fontSize: isSmallDevice ? 20 : isMediumDevice ? 22 : 24,
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#2c5aa0', 
    marginBottom: isSmallDevice ? 12 : 15,
    letterSpacing: 0.3,
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f8f9fa', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    marginBottom: isSmallDevice ? 10 : 12,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    height: isSmallDevice ? 48 : 52,
  },
  input: { 
    flex: 1, 
    color: '#495057',
    fontSize: isSmallDevice ? 14 : 15,
    paddingVertical: 0,
  },
  forgotPasswordContainer: {
    alignSelf: 'center', 
    marginTop: 8, 
    marginBottom: isSmallDevice ? 14 : 18,
    paddingVertical: 4,
  },
  forgotText: { 
    fontSize: isSmallDevice ? 13 : 14,
    color: '#666', 
    fontWeight: '500',
  },
  loginButton: { 
    backgroundColor: '#2c5aa0', 
    paddingVertical: isSmallDevice ? 13 : 15,
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 8,
    marginBottom: isSmallDevice ? 10 : 15,
    elevation: 3,
    shadowColor: '#2c5aa0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: isSmallDevice ? 16 : 17,
    letterSpacing: 0.5,
  },
  toastWrapper: { 
    position: 'absolute', 
    bottom: Platform.OS === 'ios' ? 50 : 40,
    alignSelf: 'center', 
    width: '100%', 
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  toast: { 
    backgroundColor: '#4BB543', 
    paddingHorizontal: 24, 
    paddingVertical: 14, 
    borderRadius: 30, 
    elevation: 6, 
    shadowColor: '#000', 
    shadowOpacity: 0.25, 
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    maxWidth: width * 0.8,
  },
  toastText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: isSmallDevice ? 13 : 14,
    textAlign: 'center',
  },
});