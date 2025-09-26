import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { APPROVED_BY_ME_URL } from '../src/context/api';

// --- Timeline Item with Icons and Attractive Style ---
// function TimelineItem({ status, date, isCurrent }) {
//   const getColor = () => {
//     if (status === 'Created') return '#2196F3';
//     if (status.includes('Approved')) return '#4CAF50';
//     if (status === 'Rejected') return '#f44336';
//     return '#ccc';
//   };

//   const getIcon = () => {
//     if (status === 'Created') return '📝';
//     if (status.includes('Approved')) return '✅';
//     if (status === 'Rejected') return '❌';
//     return '⚪';
//   };

//   return (
//     <View style={styles.timelineItem}>
//       <View style={[styles.timelineDot, { backgroundColor: getColor() }]} />
//       <View style={styles.timelineTextContainer}>
//         <Text style={[styles.timelineStatus, isCurrent ? styles.timelineStatusCurrent : null]}>
//           {getIcon()} {status}
//         </Text>
//         {date && (
//           <Text style={styles.timelineDate}>
//             {new Date(date).toLocaleString()}
//           </Text>
//         )}
//       </View>
//     </View>
//   );
// }
function TimelineItem({ status, description, date, isLast }) {
  const getColor = () => {
    switch (status) {
      case 'Created': return '#2196F3'; // Blue
      case 'Edited': return '#9C27B0';  // Purple
      case 'Approved': return '#4CAF50'; // Green
      case 'Implementation': return '#3F51B5'; // Indigo
      case 'Rejected': return '#f44336'; // Red
      case 'Pending': return '#FF9800'; // Orange
      default: return '#ccc';
    }
  };

  return (
    <View style={styles.timelineItem}>
      <View style={{ alignItems: 'center' }}>
        <View style={[styles.timelineDot, { backgroundColor: getColor() }]} />
        {!isLast && <View style={[styles.timelineLine, { backgroundColor: '#ccc' }]} />}
      </View>
      <View style={styles.timelineTextContainer}>
        <Text style={styles.timelineStatus}>{status}</Text>
        {description ? <Text style={styles.timelineDescription}>{description}</Text> : null}
        {date ? <Text style={styles.timelineDate}>{new Date(date).toLocaleString()}</Text> : null}
      </View>
    </View>
  );
}

const ApprovedScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [ideaDetail, setIdeaDetail] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const fetchApprovedIdeas = async (from, to) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let url = APPROVED_BY_ME_URL;
      const params = [];
      if (from) params.push(`fromDate=${from}`);
      if (to) params.push(`toDate=${to}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await axios.get(url, { headers });
      const items = response.data?.data?.items || [];
      console.log("Idea Detail Response:", response.data);

      let filteredByDate = items;
      if (from || to) {
        const fromTime = from ? new Date(from).getTime() : null;
        const toTime = to ? new Date(to).getTime() : null;

        filteredByDate = items.filter(item => {
          if (!item.approvalDate) return false;
          const approvalTime = new Date(item.approvalDate).getTime();
          if (fromTime !== null && approvalTime < fromTime) return false;
          if (toTime !== null && approvalTime > toTime) return false;
          return true;
        });
      }

      setIdeas(filteredByDate);
    } catch (error) {
      console.error("Error fetching approved ideas:", error);
      Alert.alert("Error", "Failed to load approved ideas.");
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApprovedIdeas(); }, []);

  const filteredIdeas = Array.isArray(ideas)
    ? ideas.filter(idea => {
        const searchLower = searchText.trim().toLowerCase();
        return (
          searchLower === '' ||
          (idea.ideaNumber && idea.ideaNumber.toLowerCase().includes(searchLower)) ||
          (idea.ownerName && idea.ownerName.toLowerCase().includes(searchLower)) ||
          (idea.description && idea.description.toLowerCase().includes(searchLower))
        );
      })
    : [];

  const fetchIdeaDetail = async (ideaId) => {
    if (!ideaId) return;
    try {
      setLoadingDetail(true);
      
      const idea = ideas.find(i => i.ideaId === ideaId || i.ideaNumber === ideaId);
      if (idea) {
        // Create timeline from available data
        const timeline = [];
        
        // Add Created status
        if (idea.creationDate) {
          timeline.push({
            status: 'Created',
            date: idea.creationDate
          });
        }
        
        // Add Approved status
        if (idea.approvalDate) {
          timeline.push({
            status: 'Approved',
            date: idea.approvalDate
          });
        }
        
        
        if (idea.timelineEvents && Array.isArray(idea.timelineEvents)) {
          idea.timelineEvents.forEach(event => {
            timeline.push({
              status: event.status || event.eventType || 'Unknown',
              date: event.date || event.timestamp || event.eventDate
            });
          });
        }
        
        // Sort timeline by date
        timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Set timeline in ideaDetail
        const ideaWithTimeline = {
          ...idea,
          timeline: timeline,
          currentStatus: idea.status
        };
        
        setIdeaDetail(ideaWithTimeline);
        setSelectedIdea(ideaWithTimeline);
        console.log("Timeline Events:", timeline);
      } else {
        Alert.alert("Error", "Idea details not found.");
      }
    } catch (error) {
      console.error("Error fetching idea detail:", error);
      Alert.alert("Error", "Failed to fetch idea details.");
    } finally { 
      setLoadingDetail(false); 
    }
  };

  const applyFilters = () => {
    let from = fromDate ? fromDate.toISOString().split('T')[0] : null;
    let to = toDate ? toDate.toISOString().split('T')[0] : null;
    fetchApprovedIdeas(from, to);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFromDate(null);
    setToDate(null);
    fetchApprovedIdeas();
  };

  const renderIdeaCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.cardContainer}
      onPress={() => fetchIdeaDetail(item.ideaId || item.ideaNumber)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.ideaNumber} numberOfLines={2}>{item.itemNumber}</Text>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <Text style={styles.label}>Owner:</Text>
          <Text style={styles.value} numberOfLines={2}>{item.ownerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{item.location}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Department:</Text>
          <Text style={styles.value}>{item.department}</Text>
        </View>
        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
        </View>
        <View style={styles.dateRow}>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>Approved:</Text>
            <Text style={styles.dateText}>{item.approvalDate}</Text>
          </View>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.dateText}>{item.creationDate}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Approved Ideas</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterButtonText}>{showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}</Text>
          <Ionicons name={showFilters ? "chevron-up" : "chevron-down"} size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Create Date Range</Text>

          {/* From Date */}
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromPicker(true)}>
            <Text style={styles.dateText}>{fromDate ? fromDate.toLocaleDateString() : "Select From Date"}</Text>
          </TouchableOpacity>
          {showFromPicker && (
            <DateTimePicker
              value={fromDate || new Date()}
              mode="date"
              display="default"
              onChange={(e, date) => { setShowFromPicker(false); if(date){setFromDate(date); if(toDate && date>toDate){setToDate(null)}} }}
              maximumDate={toDate || undefined}
            />
          )}

          {/* To Date */}
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowToPicker(true)}>
            <Text style={styles.dateText}>{toDate ? toDate.toLocaleDateString() : "Select To Date"}</Text>
          </TouchableOpacity>
          {showToPicker && (
            <DateTimePicker
              value={toDate || (fromDate || new Date())}
              mode="date"
              display="default"
              onChange={(e, date) => { setShowToPicker(false); if(date){setToDate(date)} }}
              minimumDate={fromDate || undefined}
            />
          )}

          <View style={styles.filterButtons}>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}><Text style={styles.btnText}>Apply</Text></TouchableOpacity>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}><Text style={styles.btnText}>Reset</Text></TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Search:</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Idea Number / Owner / Description"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        filteredIdeas.length > 0 ? (
          <FlatList
            data={filteredIdeas}
            renderItem={renderIdeaCard}
            keyExtractor={(item) => (item.ideaId?.toString() || item.ideaNumber?.toString() || Math.random().toString())}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.noResultContainer}><Text style={styles.noResultText}>No results found.</Text></View>
        )
      )}

      
      {loadingDetail && (
        <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#0000ff" /></View>
      )}

      {/* Modal */}
      <Modal visible={!!selectedIdea} animationType="slide">
        <SafeAreaView style={styles.fullModal}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedIdea(null)}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {ideaDetail && (
              <View>
                {/* Employee Details */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>👨🏻‍💻Employee Details</Text>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Employee Name:</Text><Text style={styles.valueDetail}>{ideaDetail.ownerName}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Employee Email:</Text><Text style={styles.valueDetail}>{ideaDetail.ownerEmail}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Department:</Text><Text style={styles.valueDetail}>{ideaDetail.department}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Location:</Text><Text style={styles.valueDetail}>{ideaDetail.location}</Text></View>
                </View>

                {/* Idea Information */}
                <View style={[styles.sectionCard, { marginTop: 16 }]}>
                  <Text style={styles.sectionTitle}>💡Idea Information</Text>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Idea Number:</Text><Text style={styles.valueDetail}>{ideaDetail.itemNumber}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Status:</Text><Text style={styles.valueDetail}>{ideaDetail.status}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Creation Date:</Text><Text style={styles.valueDetail}>{ideaDetail.creationDate}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Description:</Text><Text style={styles.valueDetail}>{ideaDetail.description}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Owner Name:</Text><Text style={styles.valueDetail}>{ideaDetail.ownerName}</Text></View>
                  <View style={styles.rowDetail}><Text style={styles.labelDetail}>Remarks:</Text><Text style={styles.valueDetail}>{ideaDetail.remarks}</Text></View>
                </View>

                {/* Progress Timeline */}
                {/* <View style={[styles.sectionCard, { marginTop: 16, marginBottom: 32 }]}>
                  <Text style={styles.sectionTitle}>⏱️Progress Timeline</Text>
                  {ideaDetail.timeline && ideaDetail.timeline.length > 0 ? (
                    ideaDetail.timeline.map((evt, idx) => (
                      <TimelineItem
                        key={idx}
                        status={evt.status}
                        date={evt.date}
                        isCurrent={evt.status === ideaDetail.currentStatus}
                        isLast={idx === ideaDetail.timeline.length - 1}
                      />
                    ))
                  ) : (
                    <View>
                      <Text style={{ fontStyle: 'italic', marginBottom: 10 }}>Creating timeline from available data...</Text>
                      {ideaDetail.creationDate && (
                        <TimelineItem
                          status="Created"
                          date={ideaDetail.creationDate}
                          isCurrent={false}
                        />
                      )}
                      {ideaDetail.approvalDate && (
                        <TimelineItem
                          status="Approved"
                          date={ideaDetail.approvalDate}
                          isCurrent={ideaDetail.status === 'Approved'}
                        />
                      )}
                    </View>
                  )}
                </View> */}

<View style={[styles.sectionCard, { marginTop: 16, marginBottom: 32 }]}>
  <Text style={styles.sectionTitle}>⏱️Progress Timeline</Text>
  {ideaDetail.timeline && ideaDetail.timeline.length > 0 ? (
    ideaDetail.timeline.map((evt, idx) => (
      <TimelineItem
        key={idx}
        status={evt.status}
        description={evt.description || evt.remarks}
        date={evt.date}
        isLast={idx === ideaDetail.timeline.length - 1}
      />
    ))
  ) : (
    <View>
      {ideaDetail.creationDate && (
        <TimelineItem status="Created" date={ideaDetail.creationDate} />
      )}
      {ideaDetail.approvalDate && (
        <TimelineItem status="Approved" date={ideaDetail.approvalDate} />
      )}
    </View>
  )}
</View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  filterButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 4 },
  filterButtonText: { fontSize: 12, color: '#666', marginRight: 4, fontWeight: '500' },
  filterPanel: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  filterLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' },
  dateInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, marginBottom: 10, backgroundColor: '#f9f9f9' },
  dateText: { fontSize: 14, color: '#333' },
  filterButtons: { flexDirection: 'row', marginTop: 12 },
  applyBtn: { flex: 1, backgroundColor: '#004b6f', padding: 12, borderRadius: 6, alignItems: 'center', marginRight: 8 },
  resetBtn: { flex: 1, backgroundColor: '#777', padding: 12, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  searchSection: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  searchLabel: { fontSize: 16, color: '#333', marginRight: 8, fontWeight: '500' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, backgroundColor: '#fff' },
  list: { flex: 1 }, listContent: { padding: 16 },
  cardContainer: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { backgroundColor: '#2c5aa0', padding: 12, borderTopLeftRadius: 8, borderTopRightRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  ideaNumber: { color: '#fff', fontSize: 14, fontWeight: 'bold', flex: 1, marginRight: 8 },
  typeTag: { backgroundColor: '#f0ad4e', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  typeText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  cardContent: { padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: '#555', fontWeight: '500', fontSize: 14 },
  value: { color: '#333', fontSize: 14, maxWidth: '65%', textAlign: 'right' },
  descriptionRow: { marginTop: 6 },
  description: { color: '#333', fontSize: 14 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  dateColumn: { flexDirection: 'column' },
  dateText: { color: '#333', fontSize: 12 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  fullModal: { flex: 1, backgroundColor: '#f5f5f5' },
  closeButton: { position: 'absolute', top: 16, right: 16, zIndex: 10, backgroundColor: '#000', borderRadius: 20, padding: 5 },
  closeText: { color: '#fff', fontSize: 16 },
  modalContent: { padding: 16 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  labelDetail: { fontSize: 14, fontWeight: '600', color: '#555', flex: 1 },
  valueDetail: { fontSize: 14, color: '#222', flex: 1, textAlign: 'right' },
  rowDetail: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },

  // timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  // timelineDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12, marginTop: 4 },
  // timelineTextContainer: { flex: 1 },
  // timelineStatus: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  // timelineStatusCurrent: { color: '#4CAF50' },
  // timelineDate: { fontSize: 12, color: '#666', marginTop: 2 },

  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
timelineDot: { width: 14, height: 14, borderRadius: 7, marginRight: 12, marginTop: 2 },
timelineLine: { width: 2, flex: 1, marginTop: 2 },
timelineTextContainer: { flex: 1 },
timelineStatus: { fontSize: 14, fontWeight: 'bold', color: '#333' },
timelineDescription: { fontSize: 13, color: '#555', marginTop: 2 },
timelineDate: { fontSize: 12, color: '#999', marginTop: 2 },

  noResultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  noResultText: { fontSize: 16, color: '#555' },
});

export default ApprovedScreen;

