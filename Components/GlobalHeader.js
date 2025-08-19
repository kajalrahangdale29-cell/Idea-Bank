// components/GlobalHeader.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GlobalHeader({ employeeName = 'John Doe', employeeId = 'EMP1234' }) {
  return (
    <View style={styles.header}>
      {/* Left side - Logo */}
      <Image
        source={require('../assets/ideabank_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Right side - Employee info */}
      <View style={styles.empInfo}>
        <Ionicons name="person-circle-outline" size={28} color="#fff" style={{ marginRight: 5 }} />
        <View>
          <Text style={styles.name}>{employeeName}</Text>
          <Text style={styles.id}>{employeeId}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#003366', // dark blue
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  logo: {
    width: 120,
    height: 40,
  },
  empInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  id: {
    color: '#ddd',
    fontSize: 12,
  },
});
