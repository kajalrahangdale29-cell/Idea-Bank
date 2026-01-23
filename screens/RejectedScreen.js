import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  SafeAreaView,
  Linking,
} from "react-native";
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import { REJECTED_BY_ME_URL, IDEA_DETAIL_URL } from "../src/context/api";

const normalizeImagePath = (path) => {
  if (!path) return null;

  let cleanPath = path;
  const basePattern = 'https://ideabank-api.abisaio.com';

  const occurrences = (cleanPath.match(new RegExp(basePattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

  if (occurrences > 1) {
    const lastIndex = cleanPath.lastIndexOf(basePattern);
    cleanPath = basePattern + cleanPath.substring(lastIndex + basePattern.length);
  }

  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  const BASE_URL = 'https://ideabank-api.abisaio.com';
  const fullUrl = `${BASE_URL}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
  return fullUrl;
};

const getAlternateImageUrl = (url) => {
  if (!url) return null;
  return url.replace('ideabank-api.abisaio.com', 'ideabank.abisaio.com');
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

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

function TimelineItem({ status, date, description, isLast, isFirst }) {
  const getCircleColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('created')) return "#2196F3";
    if (s.includes('edited')) return "#9C27B0";
    if (s.includes('approved')) return "#4CAF50";
    if (s.includes('pending')) return "#FF9800";
    if (s.includes('implementation')) return "#3F51B5";
    if (s.includes('rejected')) return "#F44336";
    if (s.includes('closed')) return "#FF3B30";
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
        {description && (
          <Text style={styles.timelineDescription}>{description}</Text>
        )}
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

const getStatusColor = (status) => {
  if (!status) return "gray";
  const s = status.toLowerCase();
  if (s === "draft") return "#2196F3";
  if (s === "published") return "#4CAF50";
  if (s === "closed") return "#00ACC1";
  if (s === "rejected") return "#F44336";
  if (s === "pending" || s.includes("pending")) return "#FF9800";
  if (s === "approved") return "#4CAF50";
  if (s === "hold") return "#FFC107";
  return "#9E9E9E";
};

const shouldShowImplementationDetails = (ideaDetail) => {
  if (!ideaDetail) return false;

  if (ideaDetail.implementationCycle && Object.keys(ideaDetail.implementationCycle).length > 0) {
    return true;
  }

  const type = (ideaDetail.ideaType || ideaDetail.type || '').toLowerCase().trim();
  return type === "implementation" || type === "implement";
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

export default function RejectedByMeScreen() {
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [ideaDetail, setIdeaDetail] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [allIdeasOriginal, setAllIdeasOriginal] = useState([]);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [imageRetryUrl, setImageRetryUrl] = useState(null);
  const [imageLoadError, setImageLoadError] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [employeeInfoExpanded, setEmployeeInfoExpanded] = useState(false);
  const [ideaInfoExpanded, setIdeaInfoExpanded] = useState(true);
  const [showImplementationDetails, setShowImplementationDetails] = useState(false);

  const handleImageError = (error) => {
    if (imageRetryUrl && currentImageUrl !== imageRetryUrl) {
      setCurrentImageUrl(imageRetryUrl);
      setImageRetryUrl(null);
    } else {
      Alert.alert('Error', 'Failed to load image');
    }
  };

  const fetchRejectedIdeas = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      let allIdeas = [];
      let currentPage = 1;
      let hasMorePages = true;
      let apiTotalItems = 0;

      while (hasMorePages) {
        const baseUrl = REJECTED_BY_ME_URL.split('?')[0];
        let url = `${baseUrl}?page=${currentPage}&pageSize=10`;

        const response = await axios.get(url, { headers: authHeaders });

        if (response.data && response.data.data && Array.isArray(response.data.data.items)) {
          const { items, totalPages, totalItems, hasNextPage } = response.data.data;

          if (currentPage === 1 && totalItems !== undefined) {
            apiTotalItems = totalItems;
          }

          if (items.length > 0) {
            allIdeas = [...allIdeas, ...items];
          }

          if (hasNextPage === false || items.length === 0 || (totalPages && currentPage >= totalPages)) {
            hasMorePages = false;
          }
        } else {
          hasMorePages = false;
        }

        currentPage++;
        if (currentPage > 100) {
          hasMorePages = false;
        }
      }

      setAllIdeasOriginal(allIdeas);
      setIdeas(allIdeas);
      setTotalItems(apiTotalItems || allIdeas.length);

    } catch (error) {
      console.error("Error fetching rejected ideas:", error);
      Alert.alert("Error", "Failed to load rejected ideas.");
      setIdeas([]);
      setAllIdeasOriginal([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectedIdeas();
  }, []);
  
  const filteredIdeas = Array.isArray(ideas)
    ? ideas.filter(idea => {
      const searchLower = searchText.trim().toLowerCase();
      return (
        searchLower === '' ||
        (idea.ideaNumber && idea.ideaNumber.toLowerCase().includes(searchLower)) ||
        (idea.itemNumber && idea.itemNumber.toLowerCase().includes(searchLower)) ||
        (idea.ownerName && idea.ownerName.toLowerCase().includes(searchLower)) ||
        (idea.description && idea.description.toLowerCase().includes(searchLower))
      );
    })
    : [];

  const fetchIdeaDetail = async (ideaId) => {
    if (!ideaId) return;
    try {
      setLoadingDetail(true);
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let response;
      try {
        response = await axios.get(`${IDEA_DETAIL_URL}?ideaId=${encodeURIComponent(ideaId)}`, { headers });
      } catch (err1) {
        try {
          response = await axios.get(`${IDEA_DETAIL_URL}/${encodeURIComponent(ideaId)}`, { headers });
        } catch (err2) {
          response = await axios.get(`${IDEA_DETAIL_URL}?id=${encodeURIComponent(ideaId)}`, { headers });
        }
      }

      if (response?.data?.success && response?.data?.data) {
        const detail = response.data.data;

        const normalizedDetail = {
          ...detail,
          beforeImplementationImagePath: normalizeImagePath(detail.beforeImplementationImagePath || detail.imagePath),
          imagePath: normalizeImagePath(detail.beforeImplementationImagePath || detail.imagePath),
          afterImplementationImagePath: normalizeImagePath(detail.afterImplementationImagePath),
          implementationCycle: detail.implementationCycle ? {
            ...detail.implementationCycle,
            beforeImplementationImagePath: normalizeImagePath(detail.implementationCycle.beforeImplementationImagePath),
            afterImplementationImagePath: normalizeImagePath(detail.implementationCycle.afterImplementationImagePath)
          } : null
        };

        setIdeaDetail(normalizedDetail);
        setSelectedIdea(normalizedDetail);

        if (shouldShowImplementationDetails(normalizedDetail)) {
          setShowImplementationDetails(true);
        }
      } else if (response?.data) {
        const detail = response.data;

        const normalizedDetail = {
          ...detail,
          beforeImplementationImagePath: normalizeImagePath(detail.beforeImplementationImagePath || detail.imagePath),
          imagePath: normalizeImagePath(detail.beforeImplementationImagePath || detail.imagePath),
          afterImplementationImagePath: normalizeImagePath(detail.afterImplementationImagePath),
          implementationCycle: detail.implementationCycle ? {
            ...detail.implementationCycle,
            beforeImplementationImagePath: normalizeImagePath(detail.implementationCycle.beforeImplementationImagePath),
            afterImplementationImagePath: normalizeImagePath(detail.implementationCycle.afterImplementationImagePath)
          } : null
        };

        setIdeaDetail(normalizedDetail);
        setSelectedIdea(normalizedDetail);

        if (shouldShowImplementationDetails(normalizedDetail)) {
          setShowImplementationDetails(true);
        }
      } else {
        Alert.alert("Error", "Idea details not found.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch idea details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const applyFilters = () => {
    setLoading(true);
    try {
      let filteredIdeas = [...allIdeasOriginal];

      if (fromDate || toDate) {
        filteredIdeas = filteredIdeas.filter(idea => {
          if (!idea.creationDate) return false;
          const ideaDate = new Date(idea.creationDate);
          ideaDate.setHours(0, 0, 0, 0);

          if (fromDate && toDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            return ideaDate >= from && ideaDate <= to;
          } else if (fromDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            return ideaDate >= from;
          } else if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            return ideaDate <= to;
          }
          return true;
        });
      }

      setIdeas(filteredIdeas);
      setTotalItems(filteredIdeas.length);
      setShowFilters(false);

    } catch (error) {
      console.error("Filter error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFromDate(null);
    setToDate(null);
    setIdeas(allIdeasOriginal);
    setTotalItems(allIdeasOriginal.length);
  };

  const closeModal = () => {
    setSelectedIdea(null);
    setIdeaDetail(null);
    setEmployeeInfoExpanded(false);
    setIdeaInfoExpanded(true);
    setShowImplementationDetails(false);
  };

  const openImagePreview = (imageUrl) => {
    const finalUrl = normalizeImagePath(imageUrl);

    if (finalUrl && (finalUrl.toLowerCase().endsWith('.pdf') || finalUrl.includes('.pdf'))) {
      Alert.alert(
        'PDF Document',
        'This is a PDF document. Would you like to open it?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open',
            onPress: () => {
              Linking.openURL(finalUrl).catch(err => {
                Alert.alert('Error', 'Unable to open PDF. Please try accessing it from a web browser.');
              });
            }
          }
        ]
      );
      return;
    }

    setCurrentImageUrl(finalUrl);
    setImageRetryUrl(getAlternateImageUrl(finalUrl));
    setShowImage(true);
  };


  const renderIdeaCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.cardContainer}
      onPress={() => fetchIdeaDetail(item.ideaId || item.ideaNumber)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.ideaNumber} numberOfLines={2}>
          {item.itemNumber || item.ideaNumber || "N/A"}
        </Text>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{item.type || "N/A"}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.rowDetail}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value} numberOfLines={2}>
            {item.description || "N/A"}
          </Text>
        </View>

        <View style={styles.rowDetail}>
          <Text style={styles.label}>Owner:</Text>
          <Text style={styles.value}>{item.ownerName || "N/A"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Created:</Text>
          <Text style={styles.value}>{formatDate(item.creationDate)}</Text>
        </View>

        <View style={styles.rowDetail}>
          <Text style={styles.label}>Status:</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text
              style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
              numberOfLines={2}
            >
              {item.status || "N/A"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rejected Ideas</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>
            {showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}
          </Text>
          <Text style={styles.filterArrow}>{showFilters ? "▲" : "▼"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Search:</Text>
          <TextInput
            placeholder="Idea Number / Owner / Description"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Create Date Range</Text>

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowFromPicker(true)}
          >
            <Text style={styles.dateInputText}>
              {fromDate ? fromDate.toLocaleDateString() : "Select From Date"}
            </Text>
          </TouchableOpacity>
          {showFromPicker && (
            <DateTimePicker
              value={fromDate || new Date()}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setShowFromPicker(false);
                if (date) {
                  setFromDate(date);
                  if (toDate && date > toDate) {
                    setToDate(null);
                  }
                }
              }}
              maximumDate={toDate || new Date()}
            />
          )}

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowToPicker(true)}
          >
            <Text style={styles.dateInputText}>
              {toDate ? toDate.toLocaleDateString() : "Select To Date"}
            </Text>
          </TouchableOpacity>
          {showToPicker && (
            <DateTimePicker
              value={toDate || (fromDate || new Date())}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setShowToPicker(false);
                if (date) {
                  setToDate(date);
                }
              }}
              minimumDate={fromDate || undefined}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.filterButtons}>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
              <Text style={styles.btnText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
              <Text style={styles.btnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#2c5aa0" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filteredIdeas.length === 0 ? (
            <Text style={styles.noDataText}>No ideas found.</Text>
          ) : (
            <>
              {filteredIdeas.map((idea, index) => (
                <View key={index}>{renderIdeaCard({ item: idea })}</View>
              ))}
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total Ideas: {totalItems}</Text>
              </View>
            </>
          )}
        </ScrollView>
      )}

      {loadingDetail && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2c5aa0" />
        </View>
      )}

      <Modal visible={!!selectedIdea} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalHeaderTitle}>Idea Details</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.timelineButtonHeader}
              onPress={() => setShowTimelineModal(true)}
            >
              <Ionicons name="time-outline" size={18} color="#2c5aa0" />
              <Text style={styles.timelineButtonText}>View Progress Timeline</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            {selectedIdea && ideaDetail && (
              <>
                <TouchableOpacity
                  style={styles.collapsibleHeader}
                  onPress={() => setEmployeeInfoExpanded(!employeeInfoExpanded)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.collapsibleHeaderText}>Employee Information</Text>
                  <Ionicons
                    name={employeeInfoExpanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color="#2c5aa0"
                  />
                </TouchableOpacity>

                {employeeInfoExpanded && (
                  <View style={styles.cardDetail}>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Employee Name:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.ideaOwnerName || ideaDetail.ownerName || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Employee Number:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.ideaOwnerEmployeeNo || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Employee Email:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.ideaOwnerEmail || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Department:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.ideaOwnerDepartment || ideaDetail.department || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Mobile:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.mobileNumber || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Reporting Manager:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.reportingManagerName || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Manager Email:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.managerEmail || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Employee Location:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.location || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetail}>
                      <Text style={styles.labelDetail}>Sub Department:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.ideaOwnerSubDepartment || "N/A"}
                      </Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.collapsibleHeader}
                  onPress={() => setIdeaInfoExpanded(!ideaInfoExpanded)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.collapsibleHeaderText}>Idea Information</Text>
                  <Ionicons
                    name={ideaInfoExpanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color="#2c5aa0"
                  />
                </TouchableOpacity>

                {ideaInfoExpanded && (
                  <View style={styles.cardDetail}>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Idea No:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.ideaNumber || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Solution Category:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.solutionCategory || "N/A"}
                      </Text>
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
                        {ideaDetail.plannedImplementationDuration
                          ? formatDate(ideaDetail.plannedImplementationDuration)
                          : "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Before Implementation:</Text>
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        {(ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath) ? (
                          ideaDetail.beforeImplementationImagePath?.toLowerCase().includes('.pdf') || ideaDetail.imagePath?.toLowerCase().includes('.pdf') ? (
                            <TouchableOpacity
                              onPress={() => openImagePreview(ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath)}
                            >
                              <View style={styles.pdfThumbnailContainer}>
                                <Ionicons name="document-text" size={30} color="#FF5722" />
                                <Text style={styles.pdfThumbnailText}>PDF</Text>
                              </View>
                            </TouchableOpacity>
                          ) : !imageLoadError[`before_${ideaDetail.id}`] ? (
                            <TouchableOpacity
                              style={styles.imagePreviewContainer}
                              onPress={() => openImagePreview(ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath)}
                            >
                              <Image
                                source={{
                                  uri: ideaDetail.beforeImplementationImagePath || ideaDetail.imagePath
                                }}
                                style={styles.thumbnailSmall}
                                contentFit="cover"
                                cachePolicy="none"
                                placeholder="L6Pj0^jE.AyE_3t7t7R**0o#DgR4"
                                transition={1000}
                                onError={(e) => {
                                  const altUrl = getAlternateImageUrl(ideaDetail.beforeImplementationImagePath);
                                  if (altUrl && ideaDetail.beforeImplementationImagePath !== altUrl) {
                                    setIdeaDetail(prev => ({
                                      ...prev,
                                      beforeImplementationImagePath: altUrl
                                    }));
                                  } else {
                                    setImageLoadError(prev => ({
                                      ...prev,
                                      [`before_${ideaDetail.id}`]: true
                                    }));
                                  }
                                }}
                              />
                            </TouchableOpacity>
                          ) : (
                            <View style={styles.imageErrorContainer}>
                              <Ionicons name="image-outline" size={24} color="#999" />
                              <Text style={styles.imageErrorText}>Image unavailable</Text>
                            </View>
                          )
                        ) : (
                          <Text style={styles.valueDetail}>N/A</Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Idea Description:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.ideaDescription || ideaDetail.description || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Proposed Solution:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.proposedSolution || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Process Improvement/Cost Benefit:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.tentativeBenefit || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Team Members:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.teamMembers || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Mobile Number:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.mobileNumber || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Idea Theme:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.ideaTheme || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>Type:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.type || ideaDetail.ideaType || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.rowDetailWithBorder}>
                      <Text style={styles.labelDetail}>BE Team Support Needed:</Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.isBETeamSupportNeeded ? "Yes" : "No"}
                      </Text>
                    </View>
                    <View style={styles.rowDetail}>
                      <Text style={styles.labelDetail}>
                        Can Be Implemented To Other Locations:
                      </Text>
                      <Text style={styles.valueDetail}>
                        {ideaDetail.canBeImplementedToOtherLocations ? "Yes" : "No"}
                      </Text>
                    </View>
                  </View>
                )}

                {shouldShowImplementationDetails(ideaDetail) && (
                  <>
                    <TouchableOpacity
                      style={styles.collapsibleHeader}
                      onPress={() => setShowImplementationDetails(!showImplementationDetails)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.collapsibleHeaderText}>
                        Implementation Details
                      </Text>
                      <Ionicons
                        name={showImplementationDetails ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#2c5aa0"
                      />
                    </TouchableOpacity>

                    {showImplementationDetails && (
                      <View style={styles.cardDetail}>
                        <View style={styles.rowDetailWithBorder}>
                          <Text style={styles.labelDetail}>Implementation Status:</Text>
                          <Text
                            style={[
                              styles.statusBadgeDetail,
                              { backgroundColor: getStatusColor(ideaDetail.implementationCycle?.status) }
                            ]}
                          >
                            {ideaDetail.implementationCycle?.status || "N/A"}
                          </Text>
                        </View>
                        <View style={styles.rowDetailWithBorder}>
                          <Text style={styles.labelDetail}>Implementation Details:</Text>
                          <Text style={styles.valueDetail}>
                            {ideaDetail.implementationCycle?.implementation ||
                              ideaDetail.implementationDetail ||
                              ideaDetail.implementation ||
                              "Not provided"}
                          </Text>
                        </View>
                        <View style={styles.rowDetailWithBorder}>
                          <Text style={styles.labelDetail}>Outcome/Benefits:</Text>
                          <Text style={styles.valueDetail}>
                            {ideaDetail.implementationCycle?.outcome ||
                              ideaDetail.implementationOutcome ||
                              ideaDetail.outcome ||
                              "Not provided"}
                          </Text>
                        </View>
                        {(ideaDetail.implementationCycle?.startDate || ideaDetail.implementationDate) && (
                          <View style={styles.rowDetailWithBorder}>
                            <Text style={styles.labelDetail}>Completed On:</Text>
                            <Text style={styles.valueDetail}>
                              {formatDate(ideaDetail.implementationCycle?.startDate || ideaDetail.implementationDate)}
                            </Text>
                          </View>
                        )}

                        {/* Before Implementation with PDF Support */}
                        {(ideaDetail.implementationCycle?.beforeImplementationImagePath ||
                          ideaDetail.beforeImplementationImagePath ||
                          ideaDetail.imagePath) && (
                            <View style={styles.rowDetailWithBorder}>
                              <Text style={styles.labelDetail}>Before Implementation:</Text>
                              {(() => {
                                const imagePath = ideaDetail.implementationCycle?.beforeImplementationImagePath ||
                                  ideaDetail.beforeImplementationImagePath ||
                                  ideaDetail.imagePath;
                                return imagePath.toLowerCase().includes('.pdf') ? (
                                  <TouchableOpacity onPress={() => openImagePreview(imagePath)}>
                                    <View style={styles.pdfThumbnailContainer}>
                                      <Ionicons name="document-text" size={30} color="#FF5722" />
                                      <Text style={styles.pdfThumbnailText}>PDF</Text>
                                    </View>
                                  </TouchableOpacity>
                                ) : !imageLoadError[`before_${ideaDetail.id}`] ? (
                                  <TouchableOpacity onPress={() => openImagePreview(imagePath)}>
                                    <Image
                                      source={{ uri: imagePath }}
                                      style={styles.thumbnailSmall}
                                      contentFit="cover"
                                      cachePolicy="none"
                                      placeholder="L6Pj0^jE.AyE_3t7t7R**0o#DgR4"
                                      transition={1000}
                                      onError={(e) => {
                                        const altUrl = getAlternateImageUrl(imagePath);
                                        if (altUrl && imagePath !== altUrl) {
                                          setIdeaDetail(prev => ({
                                            ...prev,
                                            beforeImplementationImagePath: altUrl
                                          }));
                                        } else {
                                          setImageLoadError(prev => ({
                                            ...prev,
                                            [`before_${ideaDetail.id}`]: true
                                          }));
                                        }
                                      }}
                                    />
                                  </TouchableOpacity>
                                ) : (
                                  <View style={styles.imageErrorContainer}>
                                    <Ionicons name="image-outline" size={24} color="#999" />
                                    <Text style={styles.imageErrorText}>Image unavailable</Text>
                                  </View>
                                );
                              })()}
                            </View>
                          )}

                        {/* After Implementation with PDF Support */}
                        {(ideaDetail.implementationCycle?.afterImplementationImagePath ||
                          ideaDetail.afterImplementationImagePath) && (
                            <View style={styles.rowDetailWithBorder}>
                              <Text style={styles.labelDetail}>After Implementation:</Text>
                              {(() => {
                                const imagePath = ideaDetail.implementationCycle?.afterImplementationImagePath ||
                                  ideaDetail.afterImplementationImagePath;
                                return imagePath.toLowerCase().includes('.pdf') ? (
                                  <TouchableOpacity onPress={() => openImagePreview(imagePath)}>
                                    <View style={styles.pdfThumbnailContainer}>
                                      <Ionicons name="document-text" size={30} color="#FF5722" />
                                      <Text style={styles.pdfThumbnailText}>PDF</Text>
                                    </View>
                                  </TouchableOpacity>
                                ) : !imageLoadError[`after_${ideaDetail.id}`] ? (
                                  <TouchableOpacity onPress={() => openImagePreview(imagePath)}>
                                    <Image
                                      source={{ uri: imagePath }}
                                      style={styles.thumbnailSmall}
                                      contentFit="cover"
                                      cachePolicy="none"
                                      onError={() => {
                                        const altUrl = getAlternateImageUrl(imagePath);
                                        if (altUrl && imagePath !== altUrl) {
                                          setIdeaDetail(prev => ({
                                            ...prev,
                                            afterImplementationImagePath: altUrl
                                          }));
                                        } else {
                                          setImageLoadError(prev => ({ ...prev, [`after_${ideaDetail.id}`]: true }));
                                        }
                                      }}
                                    />
                                  </TouchableOpacity>
                                ) : (
                                  <View style={styles.imageErrorContainer}>
                                    <Ionicons name="image-outline" size={24} color="#999" />
                                    <Text style={styles.imageErrorText}>Image unavailable</Text>
                                  </View>
                                );
                              })()}
                            </View>
                          )}
                      </View>
                    )}
                  </>
                )}
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
                        date={remark.approvalDate || remark.date ?
                          formatDateTime(remark.approvalDate || remark.date) : ""}
                      />
                    ));
                  })()}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showTimelineModal} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.timelineModalHeader}>
            <Text style={styles.timelineModalTitle}>Progress Timeline</Text>
            <TouchableOpacity
              style={styles.closeButtonTimeline}
              onPress={() => setShowTimelineModal(false)}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.timelineCardContainer}>
              <View style={styles.timelineContainer}>
                {ideaDetail?.timeline &&
                  Array.isArray(ideaDetail.timeline) &&
                  ideaDetail.timeline.length > 0 ? (
                  ideaDetail.timeline.map((item, idx) => (
                    <TimelineItem
                      key={idx}
                      status={item.status || item.approvalStage || item.approvalstage || "N/A"}
                      date={item.date || item.approvalDate}
                      description={item.description || item.comments}
                      isLast={idx === ideaDetail.timeline.length - 1}
                      isFirst={idx === 0}
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

      <Modal visible={showImage} transparent animationType="fade">
        <View style={styles.imageModal}>
          <TouchableOpacity
            style={styles.closeButtonImage}
            onPress={() => {
              setShowImage(false);
              setCurrentImageUrl(null);
              setImageRetryUrl(null);
            }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          {currentImageUrl ? (
            <Image
              source={{ uri: currentImageUrl }}
              style={styles.fullImage}
              contentFit="contain"
              cachePolicy="none"
              onError={handleImageError}
            />
          ) : (
            <Text style={{ color: '#fff' }}>No image available</Text>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#e8e8e8',
    borderRadius: 4
  },
  filterButtonText: {
    fontSize: 11,
    color: '#000',
    marginRight: 6,
    fontWeight: '600'
  },
  filterArrow: {
    fontSize: 10,
    color: '#000',
    fontWeight: 'bold'
  },
  searchSection: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12
  },
  searchLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
    fontWeight: '500'
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff'
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333'
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 10
  },
  dateInputText: {
    fontSize: 14,
    color: '#333'
  },
  filterButtons: {
    flexDirection: 'row',
    marginTop: 12
  },
  applyBtn: {
    flex: 1,
    backgroundColor: '#0A5064',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 8
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  btnText: {
    color: '#fff',
    fontWeight: '600'
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    backgroundColor: '#2c5aa0',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  ideaNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8
  },
  typeTag: {
    backgroundColor: '#f0ad4e',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500'
  },
  cardContent: {
    padding: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center'
  },
  rowDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: 'flex-start'
  },
  rowDetailWithBorder: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    marginBottom: 10,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  label: {
    color: '#555',
    fontWeight: '500',
    fontSize: 14
  },
  value: {
    color: '#333',
    fontSize: 14,
    maxWidth: '65%',
    textAlign: 'right'
  },
  statusBadge: {
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 200,
    textAlign: 'center'
  },
  totalContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c5aa0'
  },
  noDataText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
    fontSize: 16
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)"
  },
  fullModal: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  modalHeader: {
    backgroundColor: '#fff',
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 4
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c5aa0'
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center"
  },
  timelineButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2c5aa0'
  },
  timelineButtonText: {
    color: '#2c5aa0',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 30
  },
  cardDetail: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#2c5aa0"
  },
  labelDetail: {
    fontWeight: "600",
    color: "#555",
    width: "45%",
    fontSize: 14
  },
  valueDetail: {
    color: "#222",
    width: "50%",
    textAlign: "right",
    fontSize: 14
  },
  statusBadgeDetail: {
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 170,
    textAlign: 'center'
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  thumbnailSmall: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  implementationImageSection: {
    marginTop: 12,
    marginBottom: 12
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8
  },
  implementationImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  remarkCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2c5aa0'
  },
  remarkTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 6
  },
  remarkComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 6
  },
  remarkDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic'
  },
  noRemarksText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 10
  },
  timelineModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c5aa0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    elevation: 4
  },
  timelineModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  closeButtonTimeline: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center"
  },
  timelineCardContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2
  },
  timelineContainer: {
    paddingLeft: 4,
    paddingTop: 4
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 15,
    width: 20
  },
  timelineCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 2
  },
  timelineLine: {
    width: 3,
    backgroundColor: "#E0E0E0",
    flex: 1,
    marginTop: 4
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 5
  },
  timelineStatus: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4
  },
  timelineDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
    lineHeight: 18
  },
  timelineDate: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic"
  },
  noTimelineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  noTimelineText: {
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    fontSize: 15,
    fontStyle: 'italic'
  },
  imageModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center"
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
    justifyContent: "center",
    alignItems: "center"
  },
  fullImage: {
    width: "80%",
    height: "60%"
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
    shadowRadius: 2
  },
  collapsibleHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c5aa0'
  },

  pdfThumbnailContainer: { 
    width: 60, 
    height: 60, 
    borderRadius: 6, 
    borderWidth: 1, 
    borderColor: '#FF5722', 
    backgroundColor: '#FFF3E0', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  pdfThumbnailText: { 
    fontSize: 10, 
    color: '#FF5722', 
    fontWeight: 'bold', 
    marginTop: 2 
  },
});