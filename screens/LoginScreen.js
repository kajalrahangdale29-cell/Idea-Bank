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


// const { height } = Dimensions.get('window');

// export default function LoginScreen({ navigation }) {
//   const [username, setUserName] = useState('');///
//   const [password, setPassword] = useState('');
//   const [secureTextEntry, setSecureTextEntry] = useState(true);
//   const [successMessage, setSuccessMessage] = useState('');
//   const { setUser } = useContext(UserContext);
//   const LOGIN_URL='https://ideabank-api-dev.abisaio.com/login';
//   console.log('------',LOGIN_URL);
  

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
//     console.log('------',LOGIN_URL);
//     //alert("LOG",LOGIN_URL);
//     console.log('wer',JSON.stringify({ username, password }));
//     try {
//       const response = await fetch(`${LOGIN_URL}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ username, password }),
        
        
//       });
//       const text = await response.text(); // get raw response
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
//       <KeyboardAwareScrollView
//         contentContainerStyle={{ flexGrow: 1 }}
//         enableOnAndroid={true}
//         extraScrollHeight={40} 
//       >
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//           <View style={styles.container}>

//             <View style={styles.topBackground}>
//               <View style={styles.logoColumn}>
//                 <Image
//                   source={require('../assets/abis_logo.png')}
//                   style={styles.ibLogo}
//                   resizeMode="contain"
//                 />
//               </View>
//             </View>

//             <View style={styles.bottomBackground} />

//             <View style={styles.loginCard}>
//               <Image
//                 source={require('../assets/ideabank_logo.png')}
//                 style={styles.ideaBankLogo}
//                 resizeMode="contain"
//               />
//               <Text style={styles.loginTitle}>Welcome to Idea Bank!</Text>

//               <View style={styles.inputContainer}>
//                 <Feather name="user" size={20} color="#999" style={styles.icon} />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter your Employee ID"
//                   value={username}
//                   onChangeText={setUserName}
//                   keyboardType="numeric"
//                   maxLength={8}
//                   placeholderTextColor="#999"
//                 />
//               </View>

//               <View style={styles.inputContainer}>
//                 <Feather name="lock" size={20} color="#999" style={styles.icon} />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter your Password"
//                   value={password}
//                   onChangeText={setPassword}
//                   secureTextEntry={secureTextEntry}
//                   placeholderTextColor="#999"
//                 />
//                 <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
//                   <Feather
//                     name={secureTextEntry ? 'eye-off' : 'eye'}
//                     size={20}
//                     color="#999"
//                   />
//                 </TouchableOpacity>
//               </View>
//           {/* Forgot Password Text */}
//             <TouchableOpacity onPress={handleForgotPassword} style={{alignSelf: 'flex-end', marginTop: 5}}>
//                 <Text style={styles.forgotText}>Forgot Password</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
//                 <Text style={styles.loginButtonText}>Login</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
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
//   container: { flex: 1, backgroundColor: '#fff' },
//   topBackground: {
//     height: height * 0.4,
//     backgroundColor: '#0F5468',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   logoColumn: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     flex: 1,
//     width: '100%',
//     marginTop: 40,
//     paddingLeft: 45,
//   },
//   ibLogo: { width: 500, height: 200, marginBottom: 90, resizeMode: 'contain' },
//   bottomBackground: { height: height * 0.7, backgroundColor: '#fff' }, 
//   loginCard: {
//     position: 'absolute',
//     top: height * 0.32,
//     height: height * 0.6,
//     alignSelf: 'center',
//     width: '90%',
//     backgroundColor: '#fff',
//     borderRadius: 30,
//     padding: 30,
//     elevation: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//   },
//   ideaBankLogo: {
//     width: 250,
//     height: 70,
//     alignSelf: 'center',
//     marginBottom: 10.5,
//   },
//   loginTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     color: '#000',
//     marginBottom: 35,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f2f2f2',
//     borderRadius: 35,
//     paddingHorizontal: 25,
//     marginBottom: 15,
//   },
//   icon: { marginRight: 15 },
//   input: { flex: 2, height: 50, color: '#000' },
//   loginButton: {
//     backgroundColor: '#FFD700',
//     paddingVertical: 15,
//     borderRadius: 25,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   loginButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
//   forgotText: {
//     fontSize: 14,
//     color: '#0F5468',
//     fontWeight: 'bold',
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
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 25,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//   },
//   toastText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
// });
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
        // if (data.employee) {
        //   await AsyncStorage.setItem("employee", JSON.stringify(data.employee));
        // } ///// emplyoee ke liye
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
