import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-root-toast';

const cardData = [
  { title: 'Total Ideas', icon: 'bulb-outline', count: 0, color: '#d6f1f5', iconColor: '#004d61' },
  { title: 'In Progress', icon: 'refresh-circle-outline', count: 0, color: '#f0e6f9', iconColor: '#6a1b9a' },
  { title: 'Completed', icon: 'checkmark-circle-outline', count: 0, color: '#e8f5e9', iconColor: '#2e7d32' },
  { title: 'On Hold', icon: 'pause-circle-outline', count: 0, color: '#ffefd8', iconColor: '#f57c00' },
  { title: 'Rejected', icon: 'close-circle-outline', count: 0, color: '#ffe4e6', iconColor: '#d32f2f' },
];

const DashboardCard = ({ title, icon, count, color, iconColor }) => (
  <View style={[styles.card, { backgroundColor: color }]}>
    <Ionicons name={icon} size={28} color={iconColor} />
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardCount}>{count}</Text>
  </View>
);

const DashboardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const employeeName = "Kajal";
  const employeeId = "EMP1023";

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.showToast) {
        Toast.show('Login Successful!', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
        });
        route.params.showToast = false;
      }
    }, [route.params])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginRight: 15 }}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.empInfo}>
          <Ionicons name="person-circle-outline" size={35} color="#fff" style={{ marginRight: 8 }} />
          <View>
            <Text style={styles.name}>{employeeName}</Text>
            <Text style={styles.id}>{employeeId}</Text>
          </View>
          <TouchableOpacity onPress={() => alert('Notifications clicked!')}>
            <Ionicons name="notifications-outline" size={22} color="#fff" style={{ marginLeft: 12 }} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardsContainer}>
          {cardData.map((card, index) => (
            <DashboardCard key={index} {...card} />
          ))}
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.sectionTitle}>Ideas Overview</Text>
          <Ionicons name="bulb-outline" size={40} color="#fbc02d" style={{ marginVertical: 10 }} />
          <Text style={styles.readyTitle}>Ready to Innovate?</Text>
          <Text style={styles.readySubtitle}>
            You have not created any ideas yet. Start your innovation journey by sharing your first brilliant idea!
          </Text>

          {/* Create Idea Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate("Create Idea")}
          >
            <Text style={styles.createButtonText}>Create Your First Idea</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;

const { width } = Dimensions.get('window');
const isSmallDevice = width < 360;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f7fa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#004d61',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 50 : 15,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  empInfo: { flexDirection: 'row', alignItems: 'center' },
  name: { color: '#fff', fontSize: isSmallDevice ? 15 : 16, fontWeight: 'bold' },
  id: { color: '#ddd', fontSize: isSmallDevice ? 12 : 12 },
  cardsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, marginVertical: 25 },
  card: { width: '48%', borderRadius: 15, alignItems: 'center', paddingVertical: 30, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, alignSelf: 'center' },
  cardTitle: { marginTop: 8, fontSize: 14, color: '#333', fontWeight: '500', textAlign: 'center' },
  cardCount: { fontSize: 22, fontWeight: 'bold', color: '#004d61', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#004d61', marginBottom: 6, textAlign: 'center' },
  overviewCard: { backgroundColor: '#fff', marginHorizontal: 20, padding: 20, borderRadius: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginBottom: 30 },
  readyTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 8, color: '#000' },
  readySubtitle: { fontSize: 13, color: '#555', textAlign: 'center', marginTop: 6 },
  createButton: {
    marginTop: 15,
    backgroundColor: '#0f4c5c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  
  },
  scrollContent: { paddingBottom: 30 },
});
