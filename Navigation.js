// import React, { useState, useEffect } from 'react';
// import { ActivityIndicator, View, StyleSheet } from 'react-native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { NavigationContainer } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// import LoginScreen from './screens/LoginScreen';
// import MainApp from './screens/MainApp';

// const Stack = createNativeStackNavigator();

// export default function Navigation() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   useEffect(() => {
//     const checkLogin = async () => {
//       try {
//         const loginStatus = await AsyncStorage.getItem('isLoggedIn');
//         setIsLoggedIn(loginStatus === 'true');
//       } catch (error) {
//         console.log('Error reading login status:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     checkLogin();
//   }, []);

//   if (isLoading) {
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#2c5aa0" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {isLoggedIn ? (
//           <Stack.Screen name="MainApp" component={MainApp} />
//         ) : (
//           <Stack.Screen name="Login" component={LoginScreen} />
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// const styles = StyleSheet.create({
//   loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// });




import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import MainApp from './screens/MainApp';
import EditIdeaScreen from './screens/EditIdeaScreen';
import EditImplementationScreen from './src/context/ImplementationDetailsScreen';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  const [initialRoute, setInitialRoute] = useState("Splash");

  useEffect(() => {
    const checkLogin = async () => {
      const loginStatus = await AsyncStorage.getItem("isLoggedIn");

      if (loginStatus === "true") {
        setInitialRoute("MainApp");
      } else {
        setInitialRoute("Login");
      }
    };

    checkLogin();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainApp" component={MainApp} options={{ headerShown: false }} />
        <Stack.Screen name="EditImplementation" component={EditImplementationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}