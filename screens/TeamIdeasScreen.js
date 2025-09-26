import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

function TimelineItem({ status, date }) {
  const getCircleColor = (status) => {
    if (status === "Created") return "#4CAF50";
    return "#ccc";
  };

  return (
    <View style={{ flexDirection: "row", marginVertical: 6, alignItems: "flex-start" }}>
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: getCircleColor(status),
          marginRight: 8,
          marginTop: 2,
        }}
      />
      <View>
        <Text style={{ fontWeight: status === "Created" ? "bold" : "normal", fontSize: 13 }}>
          {status}
        </Text>
        <Text style={{ color: "#000080", fontSize: 11 }}>
          {status === "Created" && date ? new Date(date).toLocaleDateString() : ""}
        </Text>
      </View>
    </View>
  );
}

const getStatusColor = (status) => {
  if (!status) return "gray";
  const s = status.toLowerCase();
  if (s === "draft") return "blue";
  if (s === "published") return "green";
  if (s === "pending") return "orange";
  if (s === "approved" || s === "closed") return "green";
  if (s === "rejected") return "red";
  if (s === "hold") return "yellow";
  return "gray";
};

export default function MyTeamIdeasScreen() {
  const ideas = [];

  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchIdeaNumber, setSearchIdeaNumber] = useState("");

  const fetchIdeaDetail = (ideaId) => {
    const mockDetail = {
      ideaNumber: ideaId,
      ideaOwnerName: "John Doe",
      location: "New York",
      department: "Engineering",
      description: "Sample idea description",
      type: "Improvement",
      creationDate: new Date().toISOString(),
      status: "Pending",
    };

    setSelectedIdea(mockDetail);
  };

  return (
    <View style={styles.container}>
      {/* Search + Show Filters Row */}
      <View style={styles.filterSearchRow}>
        {/* Search Box */}
        <TextInput
          placeholder="Search Idea Number"
          style={[styles.input, { flex: 1.5, marginRight: 8 }]} 
          value={searchIdeaNumber}
          onChangeText={(text) => setSearchIdeaNumber(text)}
        />

        {/* Show Filters Button */}
        <TouchableOpacity
          style={styles.filterToggleBtn}
          onPress={() => setShowFilters((prev) => !prev)}
        >
          <Text style={styles.filterToggleText}>
            SHOW FILTERS {showFilters ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters Section */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <TextInput
            placeholder="Search by Idea Number"
            style={styles.input}
            value={searchIdeaNumber}
            onChangeText={(text) => setSearchIdeaNumber(text)}
          />
        </View>
      )}

      {/* Cards List */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {ideas.length === 0 ? (
          <Text style={styles.noDataText}>No team ideas found.</Text>
        ) : (
          ideas.map((idea, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              style={styles.card}
              onPress={() => fetchIdeaDetail(idea.id || idea.ideaNumber)}
            >
              <View style={styles.row}>
                <Text style={styles.label}>Idea No</Text>
                <Text style={styles.value}>{idea.ideaNumber || "N/A"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Owner Name</Text>
                <Text style={styles.value}>{idea.ownerName || "N/A"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>{idea.location || "N/A"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Department</Text>
                <Text style={styles.value}>{idea.department || "N/A"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.value} numberOfLines={2}>
                  {idea.description || "N/A"}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Type</Text>
                <Text style={styles.value}>{idea.type || "N/A"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Created Date</Text>
                <Text style={styles.value}>
                  {idea.creationDate
                    ? new Date(idea.creationDate).toLocaleDateString()
                    : "N/A"}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <Text
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(idea.status) },
                  ]}
                >
                  {idea.status || "N/A"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    paddingHorizontal: 10,
    backgroundColor: "#F2F4F9",
  },
  filterSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  filterToggleBtn: {
    backgroundColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  filterToggleText: {
    fontWeight: "bold",
    color: "#000",
  },
  filtersContainer: {
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
    fontSize: 13,
  },
  scrollContainer: {
    paddingBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    borderBottomWidth: 0.4,
    borderColor: "#eee",
    paddingBottom: 3,
  },
  label: {
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
  },
  value: {
    fontSize: 13,
    color: "#222",
    maxWidth: "60%",
    textAlign: "right",
  },
  statusBadge: {
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 11,
    overflow: "hidden",
  },
  noDataText: {
    textAlign: "center",
    marginTop: 15,
    color: "#777",
    fontSize: 14,
  },
});
