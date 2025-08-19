// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ScrollView } from 'react-native';
// import { useRoute } from '@react-navigation/native';

// export default function MyIdeasScreen() {
//   const route = useRoute();
//   const [ideas, setIdeas] = useState([]);

//   useEffect(() => {
//     if (route.params?.newIdea) {
//       setIdeas((prevIdeas) => [...prevIdeas, route.params.newIdea]);
//     }
//   }, [route.params?.newIdea]);

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.heading}>My Ideas</Text>
//       {ideas.map((idea, index) => (
//         <View key={index} style={styles.card}>
//           <Text style={styles.title}>{idea.title}</Text>
//           <Text style={styles.text}>Description: {idea.description}</Text>
//           <Text style={styles.text}>Solution: {idea.solution}</Text>
//           <Text style={styles.text}>Category: {idea.category}</Text>
//           <Text style={styles.text}>Benefit: {idea.benefit}</Text>
//           <Text style={styles.text}>Team Members: {idea.teamMembers}</Text>
//           <Text style={styles.text}>Date: {idea.date}</Text>
//         </View>
//       ))}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: '#F8FAFF',
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 15,
//     elevation: 3,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   text: {
//     fontSize: 14,
//     marginBottom: 4,
//     color: '#444',
//   },
// });
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function MyIdeasScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    if (route.params?.newIdea) {
      setIdeas((prevIdeas) => [...prevIdeas, route.params.newIdea]);
    }
  }, [route.params?.newIdea]);

  // Delete idea
  const deleteIdea = (index) => {
    Alert.alert(
      'Delete Idea',
      'Are you sure you want to delete this idea?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
            setIdeas(prevIdeas => prevIdeas.filter((_, i) => i !== index));
          } 
        },
      ]
    );
  };

  // Edit idea
  const editIdea = (idea, index) => {
    navigation.navigate('Create Idea', { ideaToEdit: idea, ideaIndex: index, isEditing: true });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>My Ideas</Text>
      {ideas.map((idea, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.title}>{idea.title}</Text>
          <Text style={styles.text}>Description: {idea.description}</Text>
          <Text style={styles.text}>Solution: {idea.solution}</Text>
          <Text style={styles.text}>Category: {idea.category}</Text>
          <Text style={styles.text}>Benefit: {idea.benefit}</Text>
          <Text style={styles.text}>Team Members: {idea.teamMembers}</Text>
          <Text style={styles.text}>Date: {idea.date}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.editButton]} 
              onPress={() => editIdea(idea, index)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.deleteButton]} 
              onPress={() => deleteIdea(index)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8FAFF',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: '#444',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#E53935',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
