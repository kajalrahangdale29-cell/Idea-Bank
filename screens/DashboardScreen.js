import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, Dimensions, Modal, FlatList, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-root-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { decrypt, safeDecrypt } from './EncryptionHelper'; 
import { DASHBOARD_URL, NOTIFICATION_USER_URL, NOTIFICATION_COUNT_URL, MARK_READ_URL, CLEAR_ALL_URL, REDIRECT_NOTIFICATION_URL, IDEA_DETAIL_URL, PENDING_APPROVALS_URL } from '../src/context/api'; 

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-IN', { month: 'short' });
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const DashboardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [employeeName, setEmployeeName] = useState('');
  const [employeeUsername, setEmployeeUsername] = useState('');
  const [employeeSystemId, setEmployeeSystemId] = useState('');
  const [token, setToken] = useState('');
  const [cardData, setCardData] = useState([
    { title: 'Total Ideas', icon: 'bulb-outline', count: 0, color: '#d6f1f5', iconColor: '#004d61' },
    { title: 'In Progress', icon: 'refresh-circle-outline', count: 0, color: '#f0e6f9', iconColor: '#6a1b9a' },
    { title: 'Completed', icon: 'checkmark-circle-outline', count: 0, color: '#e8f5e9', iconColor: '#2e7d32' },
    { title: 'On Hold', icon: 'pause-circle-outline', count: 0, color: '#ffefd8', iconColor: '#f57c00' },
    { title: 'Rejected', icon: 'close-circle-outline', count: 0, color: '#ffe4e6', iconColor: '#d32f2f' },
  ]);

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ideaDetail, setIdeaDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  const [employeeInfoExpanded, setEmployeeInfoExpanded] = useState(false);
  const [ideaInfoExpanded, setIdeaInfoExpanded] = useState(true);
  const [showImplementationDetails, setShowImplementationDetails] = useState(false);

  const NOTIFICATIONS_STORAGE_KEY = 'user_notifications_7day';
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("userData");
        if (storedData) {
          const parsed = JSON.parse(storedData);
          setEmployeeName(parsed.employee.name);
          setEmployeeUsername(parsed.employee.username); 
          setEmployeeSystemId(parsed.employee.id); 
          setToken(parsed.token);
          fetchDashboard(parsed.token);
          fetchUnreadCount(parsed.employee.id, parsed.token);
          
          loadStoredNotifications(parsed.employee.id);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (employeeSystemId && token) {
        fetchDashboard(token);
        fetchUnreadCount(employeeSystemId, token);
        loadStoredNotifications(employeeSystemId);
      }
    }, [employeeSystemId, token])
  );

  const loadStoredNotifications = async (systemId) => {
    try {
      const key = `${NOTIFICATIONS_STORAGE_KEY}_${systemId}`;
      const storedData = await AsyncStorage.getItem(key);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const currentTime = Date.now();
        
        const validNotifications = parsedData.filter(notif => {
          const notifTime = new Date(notif.storedAt || notif.createdOn).getTime();
          return (currentTime - notifTime) < SEVEN_DAYS_MS;
        });
        
        if (validNotifications.length !== parsedData.length) {
          await AsyncStorage.setItem(key, JSON.stringify(validNotifications));
        }
        
        setNotifications(validNotifications);
        
        const unread = validNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error loading stored notifications:", error);
    }
  };
  const saveNotificationsToStorage = async (systemId, notificationsList) => {
    try {
      const key = `${NOTIFICATIONS_STORAGE_KEY}_${systemId}`;
      const currentTime = Date.now();
      
      const notificationsWithTimestamp = notificationsList.map(notif => ({
        ...notif,
        storedAt: notif.storedAt || currentTime
      }));
      
      await AsyncStorage.setItem(key, JSON.stringify(notificationsWithTimestamp));
    } catch (error) {
      console.error("Error saving notifications:", error);
    }
  };

  const fetchDashboard = async (token) => {
    try {
      const response = await fetch(DASHBOARD_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      let jsonData = {};
      try {
        jsonData = JSON.parse(text);
      } catch (e) {
        console.error("JSON parse error:", e);
      }

      if (response.ok && jsonData.success) {
        const stats = jsonData.data.statistics || {};
        const updatedCards = [...cardData];
        updatedCards[0].count = stats.totalIdeas || 0;
        updatedCards[1].count = stats.inProgress || 0;
        updatedCards[2].count = stats.approved || 0;  
        updatedCards[3].count = stats.hold || 0;      
        updatedCards[4].count = stats.cancelled || 0; 
        setCardData(updatedCards);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  const fetchUnreadCount = async (systemId, authToken) => {
    try {
      const url = NOTIFICATION_COUNT_URL(systemId);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      const text = await response.text();
      if (response.ok) {
        const count = parseInt(text);
        if (!isNaN(count)) {
          setUnreadCount(count);
        } else {
          try {
            const data = JSON.parse(text);
            setUnreadCount(data.data?.unreadCount || data.unreadCount || 0);
          } catch (e) {
            console.error("Count parse error:", e);
          }
        }
      }
    } catch (error) {
      console.error("Fetch unread count error:", error);
    }
  };

  const fetchNotifications = async () => {
    if (!employeeSystemId || !token) return;

    setLoadingNotifications(true);
    try {
      const url = NOTIFICATION_USER_URL(employeeSystemId);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
     
        await loadStoredNotifications(employeeSystemId);
        return;
      }

      const data = await response.json();
      let newNotifications = [];
      
      if (Array.isArray(data)) {
        newNotifications = data;
      } else if (data.data && Array.isArray(data.data)) {
        newNotifications = data.data;
      }

      const key = `${NOTIFICATIONS_STORAGE_KEY}_${employeeSystemId}`;
      const storedData = await AsyncStorage.getItem(key);
      
      if (storedData) {
        const storedNotifications = JSON.parse(storedData);
        const currentTime = Date.now();
        
        // Keep stored notifications that are less than 7 days old
        const validStoredNotifs = storedNotifications.filter(notif => {
          const notifTime = new Date(notif.storedAt || notif.createdOn).getTime();
          return (currentTime - notifTime) < SEVEN_DAYS_MS;
        });
        
        const mergedNotifications = [...newNotifications];
        validStoredNotifs.forEach(storedNotif => {
          const exists = mergedNotifications.find(n => n.id === storedNotif.id);
          if (!exists) {
            mergedNotifications.push(storedNotif);
          }
        });
        
        mergedNotifications.sort((a, b) => {
          const dateA = new Date(a.createdOn || a.storedAt).getTime();
          const dateB = new Date(b.createdOn || b.storedAt).getTime();
          return dateB - dateA;
        });
        
        setNotifications(mergedNotifications);
        await saveNotificationsToStorage(employeeSystemId, mergedNotifications);
      } else {
        setNotifications(newNotifications);
        await saveNotificationsToStorage(employeeSystemId, newNotifications);
      }
      
    } catch (error) {
      console.error("Fetch notifications error:", error);

      await loadStoredNotifications(employeeSystemId);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const shouldShowImplementationDetails = (ideaDetail) => {
    if (!ideaDetail) return false;
    if (ideaDetail.implementationCycle && Object.keys(ideaDetail.implementationCycle).length > 0) {
      return true;
    }
    const type = (ideaDetail.ideaType || ideaDetail.type || '').toLowerCase().trim();
    return type === "implementation" || type === "implement";
  };

  const fetchIdeaDetail = async (encryptedId) => {
    if (!encryptedId) {
      Toast.show('Idea ID not found', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      return;
    }

    try {
      setLoadingDetail(true);

      let decryptedId;
      try {
        decryptedId = decrypt(encryptedId);  
        if (!decryptedId || decryptedId.trim() === '') {
          throw new Error('Decryption returned empty value');
        }
      } catch (decryptError) {
        console.error("Decryption error:", decryptError);
        Toast.show('Invalid idea ID - Unable to decrypt', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
        setLoadingDetail(false);
        return;
      }

      const apiUrl = `${IDEA_DETAIL_URL}/${decryptedId}`; 
      const { data: response } = await axios.get(apiUrl, { 
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });

      if (response?.success && response?.data) {
        setIdeaDetail(response.data);
        setSelectedIdea(response.data);
        setShowNotificationModal(false);
        
        if (shouldShowImplementationDetails(response.data)) {
          setShowImplementationDetails(true);
        }
      } else {
        Toast.show(response?.message || 'Idea details not found', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
      }
    } catch (error) {
      console.error("Fetch idea detail error:", error);
      
      let errorMsg = 'Failed to fetch idea details';
      
      if (error.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout - please try again';
      } else if (error.response?.status === 401) {
        errorMsg = 'Session expired - please login again';
      } else if (error.response?.status === 403) {
        errorMsg = 'Access denied - you do not have permission';
      } else if (error.response?.status === 404) {
        errorMsg = 'Idea not found';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message && !error.message.includes('decrypt')) {
        errorMsg = error.message;
      }
      
      Toast.show(errorMsg, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const url = MARK_READ_URL(notificationId);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedNotifications = notifications.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true } 
            : notif
        );
        
        setNotifications(updatedNotifications);
        
        await saveNotificationsToStorage(employeeSystemId, updatedNotifications);
        
        const unread = updatedNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const url = CLEAR_ALL_URL(employeeSystemId);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
        
        const key = `${NOTIFICATIONS_STORAGE_KEY}_${employeeSystemId}`;
        await AsyncStorage.removeItem(key);
        
        Toast.show('All notifications cleared!', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        });
      } else {
        Toast.show('Failed to clear notifications', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        });
      }
    } catch (error) {
      Toast.show('Network error', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    }
  };

  const openNotificationModal = () => {
    setShowNotificationModal(true);
    fetchNotifications();
  };

  const closeModal = () => {
    setSelectedIdea(null);
    setIdeaDetail(null);
    setEmployeeInfoExpanded(false);
    setIdeaInfoExpanded(true);
    setShowImplementationDetails(false);
  };

  const openImagePreview = (imageUrl) => {
    setCurrentImageUrl(imageUrl);
    setShowImage(true);
  };

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

  const getStatusColor = (status) => {
    if (!status) return "gray";
    const s = status.toLowerCase();
    if (s === "draft") return "blue";
    if (s === "published") return "green";
    if (s === "pending") return "orange";
    if (s === "approved" || s === "closed") return "#00ACC1";
    if (s === "rejected") return "red";
    if (s === "hold" || s === "on hold") return "#191970";
    return "gray";
  };

  const safeRenderValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const parseRemarks = (remarkData) => {
    if (!remarkData) return [];
    if (Array.isArray(remarkData)) return remarkData;
    if (typeof remarkData === "object") {
      const keys = Object.keys(remarkData);
      if (keys.length > 0 && keys.every(k => !isNaN(k))) {
        return Object.values(remarkData);
      }
      return [remarkData];
    }
    return [];
  };

  const DashboardCard = ({ title, icon, count, color, iconColor }) => (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Ionicons name={icon} size={28} color={iconColor} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardCount}>{count}</Text>
    </View>
  );

  const NotificationItem = ({ item }) => {
    const handleNotificationClick = async () => {
      await markAsRead(item.id);
      
      let encryptedId = null;
      if (item.redirectUrl) {
        const urlParts = item.redirectUrl.split('/');
        encryptedId = urlParts[urlParts.length - 1];
      }
      
      if (encryptedId && encryptedId.trim() !== '') {
        setShowNotificationModal(false);
        
        await fetchIdeaDetail(encryptedId);
      } else {
        Toast.show('Invalid notification - redirect URL missing', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
      }
    };

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
        onPress={handleNotificationClick}
      >
        <View style={styles.notificationIcon}>
          <Ionicons 
            name={item.isRead ? "mail-open-outline" : "mail-unread-outline"} 
            size={24} 
            color={item.isRead ? "#666" : "#004d61"} 
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, !item.isRead && styles.unreadText]}>
            {item.module || 'Notification'}
          </Text>
          <Text style={styles.notificationMessage} numberOfLines={3}>
            {item.text || 'No message'}
          </Text>
          <Text style={styles.notificationTime}>
            {item.createdOn ? new Date(item.createdOn).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }) : ''}
          </Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  function TimelineItem({ status, date, description, isLast }) {
    const getCircleColor = (status) => {
      const s = status?.toLowerCase() || '';
      if (s.includes('created')) return "#2196F3";
      if (s.includes('edited')) return "#9C27B0";
      if (s.includes('approved')) return "#4CAF50";
      if (s.includes('pending')) return "#FF9800";
      if (s.includes('implementation')) return "#3F51B5";
      if (s.includes('rejected')) return "#F44336";
      return "#9E9E9E";
    };

    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          <View style={[styles.timelineCircle, { backgroundColor: getCircleColor(status) }]} />
          {!isLast && <View style={styles.timelineLine} />}
        </View>
        <View style={styles.timelineContent}>
          <Text style={styles.timelineStatus}>{status}</Text>
          {description && <Text style={styles.timelineDescription}>{description}</Text>}
          {date && (
            <Text style={styles.timelineDate}>
              {formatDateTime(date)}
            </Text>
          )}
        </View>
      </View>
    );
  }

  function RemarksCard({ title, comment, date }) {
    return (
      <View style={styles.remarkCard}>
        <Text style={styles.remarkTitle}>{title}</Text>
        <Text style={styles.remarkComment}>{comment}</Text>
        <Text style={styles.remarkDate}>{date}</Text>
      </View>
    );
  }

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
            <Text style={styles.id}>{employeeUsername}</Text>
          </View>
          <TouchableOpacity onPress={openNotificationModal} style={styles.notificationBell}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsContainer}>
          <View style={styles.row}>
            <View style={styles.cardWrapper}>
              <DashboardCard {...cardData[0]} />
            </View>
            <View style={styles.cardWrapper}>
              <DashboardCard {...cardData[1]} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.cardWrapper}>
              <DashboardCard {...cardData[2]} />
            </View>
            <View style={styles.cardWrapper}>
              <DashboardCard {...cardData[3]} />
            </View>
          </View>

          <View style={styles.rejectedRow}>
            <View style={styles.rejectedWrapper}>
              <DashboardCard {...cardData[4]} />
            </View>
          </View>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.sectionTitle}>Ideas Overview</Text>
          <Ionicons name="bulb-outline" size={40} color="#fbc02d" style={{ marginVertical: 10 }} />
          <Text style={styles.readyTitle}>Ready to Innovate?</Text>
          <Text style={styles.readySubtitle}>
            You have not created any ideas yet. Start your innovation journey by sharing your first brilliant idea!
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate("Create Idea")}>
            <Text style={styles.createButtonText}>Create Your First Idea</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Notification Modal */}
      <Modal visible={showNotificationModal} animationType="slide" transparent={true} onRequestClose={() => setShowNotificationModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <View style={styles.modalActions}>
                {notifications.length > 0 && (
                  <TouchableOpacity onPress={clearAllNotifications} style={styles.clearAllBtn}>
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            {loadingNotifications ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#004d61" />
                <Text style={styles.loadingText}>Loading notifications...</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No notifications yet</Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                renderItem={({ item }) => <NotificationItem item={item} />}
                contentContainerStyle={styles.notificationList}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {loadingDetail && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#004d61" />
          <Text style={styles.loadingText}>Loading idea details...</Text>
        </View>
      )}

      {/* Idea Detail Modal - Team Ideas Design Style */}
      <Modal visible={!!selectedIdea} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.modalHeaderDetail}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalHeaderTitle}>Idea Details</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.timelineButtonHeader} onPress={() => setShowTimelineModal(true)}>
              <Ionicons name="time-outline" size={18} color="#2c5aa0" />
              <Text style={styles.timelineButtonText}>View Progress Timeline</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            {selectedIdea && ideaDetail && (
              <>
                {/* Employee Information - Collapsible */}
                <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setEmployeeInfoExpanded(!employeeInfoExpanded)} activeOpacity={0.7}>
                  <Text style={styles.collapsibleHeaderText}>Employee Information</Text>
                  <Ionicons name={employeeInfoExpanded ? "chevron-up" : "chevron-down"} size={24} color="#2c5aa0" />
                </TouchableOpacity>

                {employeeInfoExpanded && (
                  <View style={styles.cardDetail}>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Employee Name:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerName || ideaDetail.ownerName || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Employee Number:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerEmployeeNo || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Employee Email:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerEmail || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Department:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerDepartment || ideaDetail.department || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Mobile:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.mobileNumber || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Reporting Manager:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.reportingManagerName || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Manager Email:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.managerEmail || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Employee Location:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.location || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetail}>
                      <Text style={styles.labelDetail}>Sub Department:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.ideaOwnerSubDepartment || "N/A"}</Text>
                    </View>
                  </View>
                )}

                {/* Idea Information - Collapsible */}
                <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setIdeaInfoExpanded(!ideaInfoExpanded)} activeOpacity={0.7}>
                  <Text style={styles.collapsibleHeaderText}>Idea Information</Text>
                  <Ionicons name={ideaInfoExpanded ? "chevron-up" : "chevron-down"} size={24} color="#2c5aa0" />
                </TouchableOpacity>

                {ideaInfoExpanded && (
                  <View style={styles.cardDetail}>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Idea No:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.ideaNumber || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Solution Category:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.solutionCategory || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Creation Date:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.ideaCreationDate || ideaDetail.creationDate ? 
                          formatDate(ideaDetail.ideaCreationDate || ideaDetail.creationDate) : "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Planned Completion:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.plannedImplementationDuration ? formatDate(ideaDetail.plannedImplementationDuration) : "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Before Implementation:</Text>
                      {(ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath) ? (
                        <TouchableOpacity style={styles.imagePreviewContainer} onPress={() => openImagePreview(ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath)}>
                          <Image source={{ uri: ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath }} style={styles.thumbnailSmall} />
                          <Text style={styles.tapToEnlargeText}></Text>
                        </TouchableOpacity>
                      ) : (<Text style={styles.valueDetail}>N/A</Text>)}
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Status:</Text>
                      <Text style={[styles.statusBadgeDetail, { backgroundColor: getStatusColor(ideaDetail.ideaStatus || ideaDetail.status) }]}>
                        {ideaDetail.ideaStatus || ideaDetail.status || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Idea Description:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.ideaDescription || ideaDetail.description || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Proposed Solution:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.proposedSolution || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Process Improvement/Cost Benefit:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.tentativeBenefit || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Team Members:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.teamMembers || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Idea Theme:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.ideaTheme || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Type:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.ideaType || ideaDetail.type || "N/A"}</Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>BE Team Support Needed:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.isBETeamSupportNeeded ? "Yes" : "No"}</Text>
                    </View>
                    <View style={styles.rowDetail}>
                      <Text style={styles.labelDetail}>Can Be Implemented To Other Locations:</Text>
                      <Text style={styles.valueDetail}>{ideaDetail.canBeImplementedToOtherLocation ? "Yes" : "No"}</Text>
                    </View>
                  </View>
                )}

                {/* Implementation Details - Show if available */}
                {shouldShowImplementationDetails(ideaDetail) && (
                  <>
                    <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setShowImplementationDetails(!showImplementationDetails)} activeOpacity={0.7}>
                      <Text style={styles.collapsibleHeaderText}>Implementation Details</Text>
                      <Ionicons name={showImplementationDetails ? "chevron-up" : "chevron-down"} size={24} color="#2c5aa0" />
                    </TouchableOpacity>
                    
                    {showImplementationDetails && (
                      <View style={styles.cardDetail}>
                        <View style={styles.rowDetailWithBorder}>
                          <Text style={styles.labelDetail}>Implementation Status:</Text>
                          <Text style={[styles.statusBadgeDetail, { backgroundColor: getStatusColor(ideaDetail.implementationCycle?.status) }]}>
                            {ideaDetail.implementationCycle?.status || "N/A"}
                          </Text>
                        </View>
                        <View style={styles.rowDetailWithBorder}>
                          <Text style={styles.labelDetail}>Implementation Details:</Text>
                          <Text style={styles.valueDetail}>
                            {ideaDetail.implementationCycle?.implementation || ideaDetail.implementationDetail || ideaDetail.implementation || "Not provided"}
                          </Text>
                        </View>
                        <View style={styles.rowDetailWithBorder}>
                          <Text style={styles.labelDetail}>Outcome/Benefits:</Text>
                          <Text style={styles.valueDetail}>
                            {ideaDetail.implementationCycle?.outcome || ideaDetail.implementationOutcome || ideaDetail.outcome || "Not provided"}
                          </Text>
                        </View>
                        {(ideaDetail.implementationCycle?.startDate || ideaDetail.implementationDate) && (
                          <View style={styles.rowDetailWithBorder}>
                            <Text style={styles.labelDetail}>Submitted On:</Text>
                            <Text style={styles.valueDetail}>
                              {formatDate(ideaDetail.implementationCycle?.startDate || ideaDetail.implementationDate)}
                            </Text>
                          </View>
                        )}
                        
                        {ideaDetail.implementationCycle?.beforeImplementationImagePath && (
                          <View style={styles.implementationImageSection}>
                            <Text style={styles.imageLabel}>Before Implementation:</Text>
                            <TouchableOpacity onPress={() => openImagePreview(ideaDetail.implementationCycle.beforeImplementationImagePath)}>
                              <Image source={{ uri: ideaDetail.implementationCycle.beforeImplementationImagePath }} style={styles.implementationImage} />
                            </TouchableOpacity>
                          </View>
                        )}
                        
                        {ideaDetail.implementationCycle?.afterImplementationImagePath && (
                          <View style={styles.implementationImageSection}>
                            <Text style={styles.imageLabel}>After Implementation:</Text>
                            <TouchableOpacity onPress={() => {
                              const imagePath = ideaDetail.implementationCycle.afterImplementationImagePath;
                              const fullUrl = imagePath.startsWith('http') ? imagePath : `https://ideabank-api-dev.abisaio.com${imagePath}`;
                              openImagePreview(fullUrl);
                            }}>
                              <Image source={{ 
                                uri: ideaDetail.implementationCycle.afterImplementationImagePath.startsWith('http')
                                  ? ideaDetail.implementationCycle.afterImplementationImagePath
                                  : `https://ideabank-api-dev.abisaio.com${ideaDetail.implementationCycle.afterImplementationImagePath}`
                              }} style={styles.implementationImage} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </>
                )}

                {/* Remarks Section */}
                <View style={styles.cardDetail}>
                  <Text style={styles.cardHeading}>Remarks</Text>
                  {(() => {
                    const remarks = parseRemarks(ideaDetail.remark || ideaDetail.remarks);
                    if (remarks.length === 0) {
                      return <Text style={styles.noRemarksText}>No remarks available</Text>;
                    }
                    return remarks.map((remark, index) => (
                      <RemarksCard
                        key={index}
                        title={remark.approverName || remark.title || "Unknown"}
                        comment={remark.comments || remark.comment || "No comment"}
                        date={remark.approvalDate || remark.date ? formatDateTime(remark.approvalDate || remark.date) : ""}
                      />
                    ));
                  })()}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Timeline Modal */}
      <Modal visible={showTimelineModal} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.timelineModalHeader}>
            <Text style={styles.timelineModalTitle}>Progress Timeline</Text>
            <TouchableOpacity style={styles.closeButtonTimeline} onPress={() => setShowTimelineModal(false)}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.timelineCardContainer}>
              <View style={styles.timelineContainer}>
                {ideaDetail?.timeline && Array.isArray(ideaDetail.timeline) && ideaDetail.timeline.length > 0 ? (
                  ideaDetail.timeline.map((item, idx) => (
                    <TimelineItem
                      key={idx}
                      status={safeRenderValue(item.status || item.approvalStage || item.approvalstage || "N/A")}
                      date={item.date || item.approvalDate}
                      description={safeRenderValue(item.description || item.comments)}
                      isLast={idx === ideaDetail.timeline.length - 1}
                    />
                  ))
                ) : (
                  <View style={styles.noTimelineContainer}>
                    <Ionicons name="time-outline" size={48} color="#ccc" />
                    <Text style={styles.noTimelineText}>No timeline data available</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal visible={showImage} transparent animationType="fade">
        <View style={styles.imageModal}>
          <TouchableOpacity style={styles.closeButtonImage} onPress={() => { setShowImage(false); setCurrentImageUrl(null); }}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          {currentImageUrl ? (
            <Image source={{ uri: currentImageUrl }} style={styles.fullImage} resizeMode="contain" onError={() => Toast.show('Failed to load image', { duration: Toast.durations.SHORT, position: Toast.positions.BOTTOM })} />
          ) : (
            <Text style={{ color: '#fff' }}>No image available</Text>
          )}
        </View>
      </Modal>
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
  notificationBell: {
    marginLeft: 12,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardsContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rejectedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
  },
  cardWrapper: {
    width: '48%', 
  },
  rejectedWrapper: {
    width: '48%', 
  },
  card: {
    width: '100%',
    borderRadius: 15,
    alignItems: 'center',
    paddingVertical: 25, 
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  cardCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004d61',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004d61',
    marginBottom: 6,
    textAlign: 'center',
  },
  overviewCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10, 
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  readyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 1,
    color: '#000',
  },
  readySubtitle: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  createButton: {
    marginTop: 15,
    backgroundColor: '#0f4c5c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#0f4c5c',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004d61',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  clearAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff3b30',
    borderRadius: 6,
  },
  clearAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationList: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  unreadNotification: {
    backgroundColor: '#e3f2fd',
    borderColor: '#004d61',
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  unreadText: {
    color: '#004d61',
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
    marginLeft: 8,
    alignSelf: 'center',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 9999,
  },
  fullModal: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeaderDetail: {
    backgroundColor: '#fff',
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 4,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c5aa0',
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2c5aa0',
  },
  timelineButtonText: {
    color: '#2c5aa0',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  collapsibleHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c5aa0',
  },
  cardDetail: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c5aa0',
  },
  rowDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  rowDetailWithBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    marginBottom: 10,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  labelDetail: {
    fontWeight: '600',
    color: '#555',
    width: '45%',
    fontSize: 14,
  },
  valueDetail: {
    color: '#222',
    width: '50%',
    textAlign: 'right',
    fontSize: 14,
  },
  statusBadgeDetail: {
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 200,
    textAlign: 'center',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thumbnailSmall: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tapToEnlargeText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '500',
  },
  implementationImageSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  implementationImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  remarkCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2c5aa0',
  },
  remarkTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 6,
  },
  remarkComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 6,
  },
  remarkDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  noRemarksText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  timelineModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c5aa0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    elevation: 4,
  },
  timelineModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButtonTimeline: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineCardContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
  },
  timelineContainer: {
    paddingLeft: 4,
    paddingTop: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 15,
    width: 20,
  },
  timelineCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 2,
  },
  timelineLine: {
    width: 3,
    backgroundColor: '#E0E0E0',
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 5,
  },
  timelineStatus: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  timelineDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  noTimelineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noTimelineText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 15,
    fontStyle: 'italic',
  },
  imageModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonImage: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '70%',
  },
});