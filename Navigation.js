// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import SplashScreen from './screens/SplashScreen';
// import LoginScreen from './screens/LoginScreen';
// import MainApp from './screens/MainApp';
// import EditIdeaScreen from './screens/EditIdeaScreen'; 
// import EditImplementationScreen from './src/context/ImplementationDetailsScreen';

// const Stack = createNativeStackNavigator();
// export default function Navigation() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Splash">
//         <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
//         <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
//         <Stack.Screen name="MainApp" component={MainApp} options={{ headerShown: false }} />
//         <Stack.Screen name="EditImplementation" component={EditImplementationScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }



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

      // If logged in → go directly to MainApp
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