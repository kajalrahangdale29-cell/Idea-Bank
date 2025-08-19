// import React, { useState } from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import CreateIdeaScreen from './CreateIdeaScreen';
// import MyIdeasScreen from './MyIdeasScreen';
// import TeamIdeasScreen from './TeamIdeasScreen';

// const Stack = createNativeStackNavigator();

// export default function ManageIdeaStack() {
//   const [ideas, setIdeas] = useState([]);

//   const addIdea = (idea) => {
//     setIdeas(prev => [idea, ...prev]);
//   };

//   return (
//     <Stack.Navigator>
//       <Stack.Screen name="Create Idea">
//         {props => <CreateIdeaScreen {...props} addIdea={addIdea} />}
//       </Stack.Screen>
//       <Stack.Screen name="My Ideas">
//         {props => <MyIdeasScreen {...props} ideas={ideas} />}
//       </Stack.Screen>
//       <Stack.Screen name="Team Ideas" component={TeamIdeasScreen} />
//     </Stack.Navigator>
//   );
// }
import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateIdeaScreen from './CreateIdeaScreen';
import MyIdeasScreen from './MyIdeasScreen';
import TeamIdeasScreen from './TeamIdeasScreen';

const Stack = createNativeStackNavigator();

export default function ManageIdeaStack() {
  const [ideas, setIdeas] = useState([]);

  const addIdea = (idea) => {
    setIdeas(prev => [idea, ...prev]);
  };

  const updateIdea = (updatedIdea, index) => {
    setIdeas(prev => {
      const newIdeas = [...prev];
      newIdeas[index] = updatedIdea;
      return newIdeas;
    });
  };

  const deleteIdea = (index) => {
    setIdeas(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Stack.Navigator>
      <Stack.Screen name="Create Idea">
        {props => (
          <CreateIdeaScreen
            {...props}
            addIdea={addIdea}
            updateIdea={updateIdea}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="My Ideas">
        {props => (
          <MyIdeasScreen
            {...props}
            ideas={ideas}
            deleteIdea={deleteIdea}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Team Ideas" component={TeamIdeasScreen} />
    </Stack.Navigator>
  );
}
