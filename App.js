import React from 'react';
import { UserProvider } from './src/context/UserContext';
import Navigation from './Navigation';
import { RootSiblingParent } from 'react-native-root-siblings'; 
import { AppRegistry } from 'react-native';

export default function App() {
  return (
    <RootSiblingParent>   
      <UserProvider>
        <Navigation />
      </UserProvider>
    </RootSiblingParent>
  );
}