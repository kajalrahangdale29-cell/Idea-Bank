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
} from 'react-native';
import { Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UserContext } from '../src/context/UserContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const { setUser } = useContext(UserContext);
  const LOGIN_URL = 'https://ideabank-api-dev.abisaio.com/login';

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
      console.log("Raw response:", text);
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (response.ok && data.success) {
        // Save response to AsyncStorage
        await AsyncStorage.setItem("userData", JSON.stringify(data));

        // ✅ Save token separately for CreateIdeaScreen
        if (data.token) {
          await AsyncStorage.setItem("token", data.token);
        }

        // ✅ Save role if present
        if (data.employee?.role) {
          await AsyncStorage.setItem("role", data.employee.role);
        }

        // ✅ Save role flags for navigation
        if (data.employee) {
          await AsyncStorage.setItem("isManager", JSON.stringify(data.employee.isManager));
          await AsyncStorage.setItem("isHod", JSON.stringify(data.employee.isHod));
          await AsyncStorage.setItem("isBETeamMember", JSON.stringify(data.employee.isBETeamMember));
        }

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

      console.log("Login API Response:", data);
      return data;

    } catch (error) {
      console.error("Login API Error:", error);
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
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} enableOnAndroid={true} extraScrollHeight={40}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>

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
                  value={username}
                  onChangeText={setUserName}
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
                />
                <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
                  <Feather
                    name={secureTextEntry ? 'eye-off' : 'eye'}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleForgotPassword} style={{ alignSelf: 'flex-end', marginTop: 5 }}>
                <Text style={styles.forgotText}>Forgot Password</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
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
  container: { flex: 1, backgroundColor: '#fff' },
  topBackground: { height: height * 0.4, backgroundColor: '#0F5468', alignItems: 'center', justifyContent: 'center' },
  logoColumn: { alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%', marginTop: 40, paddingLeft: 45 },
  ibLogo: { width: 500, height: 200, marginBottom: 90, resizeMode: 'contain' },
  bottomBackground: { height: height * 0.7, backgroundColor: '#fff' },
  loginCard: { position: 'absolute', top: height * 0.32, height: height * 0.6, alignSelf: 'center', width: '90%', backgroundColor: '#fff', borderRadius: 30, padding: 30, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 8 },
  ideaBankLogo: { width: 250, height: 70, alignSelf: 'center', marginBottom: 10.5 },
  loginTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#000', marginBottom: 35 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderRadius: 35, paddingHorizontal: 25, marginBottom: 15 },
  icon: { marginRight: 15 },
  input: { flex: 2, height: 50, color: '#000' },
  loginButton: { backgroundColor: '#FFD700', paddingVertical: 15, borderRadius: 25, alignItems: 'center', marginTop: 20 },
  loginButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  forgotText: { fontSize: 14, color: '#0F5468', fontWeight: 'bold' },
  toastWrapper: { position: 'absolute', bottom: Platform.OS === 'ios' ? 60 : 40, alignSelf: 'center', width: '100%', alignItems: 'center' },
  toast: { backgroundColor: '#4BB543', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6 },
  toastText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

// import React, { useState, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   StatusBar,
//   Dimensions,
//   Platform,
//   TouchableWithoutFeedback,
//   Keyboard,
//   Alert,
// } from 'react-native';
// import { Linking } from 'react-native';
// import { Feather } from '@expo/vector-icons';
// import { UserContext } from '../src/context/UserContext';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { LinearGradient } from 'expo-linear-gradient';

// const { height, width } = Dimensions.get('window');

// export default function LoginScreen({ navigation }) {
//   const [username, setUserName] = useState('');
//   const [password, setPassword] = useState('');
//   const [secureTextEntry, setSecureTextEntry] = useState(true);
//   const [successMessage, setSuccessMessage] = useState('');
//   const { setUser } = useContext(UserContext);
//   const LOGIN_URL = 'https://ideabank-api-dev.abisaio.com/login';

//   const handleLogin = async () => {
//     if (username.length !== 8) {
//       Alert.alert('Error', 'Employee ID must be exactly 8 digits');
//       return;
//     }
//     if (!password.trim()) {
//       Alert.alert('Error', 'Password cannot be empty');
//       return;
//     }

//     setUser({ name: 'Kajal', id: username });

//     try {
//       const response = await fetch(`${LOGIN_URL}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ username, password }),
//       });

//       const text = await response.text();
//       console.log("Raw response:", text);
//       let data;
//       try {
//         data = JSON.parse(text);
//       } catch {
//         data = { message: text };
//       }

//       if (response.ok && data.success) {
//         // Save response to AsyncStorage
//         await AsyncStorage.setItem("userData", JSON.stringify(data));

//         // ✅ Save token separately for CreateIdeaScreen
//         if (data.token) {
//           await AsyncStorage.setItem("token", data.token);
//         }

//         // ✅ Save role if present
//         if (data.employee?.role) {
//           await AsyncStorage.setItem("role", data.employee.role);
//         }

//         // ✅ Save role flags for navigation
//         if (data.employee) {
//           await AsyncStorage.setItem("isManager", JSON.stringify(data.employee.isManager));
//           await AsyncStorage.setItem("isHod", JSON.stringify(data.employee.isHod));
//           await AsyncStorage.setItem("isBETeamMember", JSON.stringify(data.employee.isBETeamMember));
//         }

//         setSuccessMessage('Login Successful!');
//         setTimeout(() => {
//           setSuccessMessage('');
//           navigation.replace('MainApp', {
//             screen: 'Dashboard',
//             params: { showToast: true },
//           });
//         }, 1000);
//       } else {
//         Alert.alert("Login Failed", data?.message || "Invalid credentials");
//       }

//       console.log("Login API Response:", data);
//       return data;

//     } catch (error) {
//       console.error("Login API Error:", error);
//       Alert.alert("Error", "Network error occurred");
//       throw error;
//     }
//   };

//   const handleForgotPassword = () => {
//     const url = 'https://myib.co.in:8052/employees/forgot-password';
//     Linking.canOpenURL(url)
//       .then((supported) => {
//         if (supported) {
//           Linking.openURL(url);
//         } else {
//           Alert.alert('Error', 'Cannot open the URL');
//         }
//       })
//       .catch((err) => console.error('An error occurred', err));
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <StatusBar barStyle="light-content" backgroundColor="#8B5A9F" />
//       <KeyboardAwareScrollView 
//         contentContainerStyle={{ flexGrow: 1 }} 
//         enableOnAndroid={true} 
//         extraScrollHeight={40}
//       >
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//           <LinearGradient
//             colors={['#8B5A9F', '#A569BD', '#BB73C7']}
//             style={styles.container}
//           >
//             {/* Header Section with Logo */}
//             <View style={styles.headerSection}>
//               <Image
//                 source={require('../assets/abis_logo.png')}
//                 style={styles.headerLogo}
//                 resizeMode="contain"
//               />
//             </View>

//             {/* Login Card */}
//             <View style={styles.loginCard}>
//               {/* Logo and Welcome Text */}
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require('../assets/ideabank_logo.png')}
//                   style={styles.ideaBankLogo}
//                   resizeMode="contain"
//                 />
//                 <Text style={styles.welcomeText}>Welcome to Idea Bank!</Text>
//               </View>

//               {/* Input Fields */}
//               <View style={styles.inputsContainer}>
//                 <View style={styles.inputContainer}>
//                   <Feather name="user" size={20} color="#999" style={styles.icon} />
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Enter your Employee ID"
//                     value={username}
//                     onChangeText={setUserName}
//                     keyboardType="numeric"
//                     maxLength={8}
//                     placeholderTextColor="#999"
//                   />
//                 </View>

//                 <View style={styles.inputContainer}>
//                   <Feather name="lock" size={20} color="#999" style={styles.icon} />
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Enter your Password"
//                     value={password}
//                     onChangeText={setPassword}
//                     secureTextEntry={secureTextEntry}
//                     placeholderTextColor="#999"
//                   />
//                   <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
//                     <Feather
//                       name={secureTextEntry ? 'eye-off' : 'eye'}
//                       size={20}
//                       color="#999"
//                     />
//                   </TouchableOpacity>
//                 </View>

//                 {/* Forgot Password */}
//                 <TouchableOpacity 
//                   onPress={handleForgotPassword} 
//                   style={styles.forgotPasswordContainer}
//                 >
//                   <Text style={styles.forgotText}>Forgot Password?</Text>
//                 </TouchableOpacity>

//                 {/* Login Button */}
//                 <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
//                   <LinearGradient
//                     colors={['#8B5A9F', '#A569BD']}
//                     style={styles.loginButtonGradient}
//                   >
//                     <Text style={styles.loginButtonText}>Login</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* ABIS Logo at Bottom */}
//             <View style={styles.bottomLogoContainer}>
//               <Image
//                 source={require('../assets/abis_logo.png')}
//                 style={styles.abisLogo}
//                 resizeMode="contain"
//               />
//             </View>
//           </LinearGradient>
//         </TouchableWithoutFeedback>
//       </KeyboardAwareScrollView>

//       {successMessage !== '' && (
//         <View style={styles.toastWrapper}>
//           <View style={styles.toast}>
//             <Text style={styles.toastText}>{successMessage}</Text>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   headerSection: {
//     paddingTop: Platform.OS === 'ios' ? 60 : 40,
//     paddingHorizontal: 30,
//     paddingBottom: 40,
//     alignItems: 'center',
//   },
//   headerLogo: {
//     width: 200,
//     height: 80,
//   },
//   loginTitle: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   welcomeText: {
//     fontSize: 18,
//     color: '#333',
//     textAlign: 'center',
//     marginTop: 10,
//     fontWeight: '500',
//   },
//   loginCard: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     paddingHorizontal: 30,
//     paddingTop: 40,
//     marginTop: 20,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: -3,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   logoContainer: {
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   ideaBankLogo: {
//     width: 200,
//     height: 60,
//   },
//   inputsContainer: {
//     paddingTop: 20,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     paddingHorizontal: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   icon: {
//     marginRight: 15,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     color: '#333',
//     fontSize: 16,
//   },
//   forgotPasswordContainer: {
//     alignSelf: 'center',
//     marginBottom: 30,
//     marginTop: 5,
//   },
//   forgotText: {
//     fontSize: 14,
//     color: '#8B5A9F',
//     fontWeight: '500',
//   },
//   loginButton: {
//     borderRadius: 25,
//     overflow: 'hidden',
//     shadowColor: '#8B5A9F',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   loginButtonGradient: {
//     paddingVertical: 16,
//     alignItems: 'center',
//   },
//   loginButtonText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   bottomLogoContainer: {
//     alignItems: 'center',
//     paddingVertical: 20,
//     backgroundColor: '#FFFFFF',
//   },
//   abisLogo: {
//     width: 120,
//     height: 40,
//     opacity: 0.7,
//   },
//   toastWrapper: {
//     position: 'absolute',
//     bottom: Platform.OS === 'ios' ? 60 : 40,
//     alignSelf: 'center',
//     width: '100%',
//     alignItems: 'center',
//   },
//   toast: {
//     backgroundColor: '#4BB543',
//     paddingHorizontal: 25,
//     paddingVertical: 15,
//     borderRadius: 25,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     shadowOffset: {
//       width: 0,
//       height: 3,
//     },
//   },
//   toastText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
// });