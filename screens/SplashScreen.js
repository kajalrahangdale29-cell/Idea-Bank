import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen({ navigation }) {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  

  const letterAnims = useRef(
    'Welcome to IdeaBank!💡'.split('').map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true
      })
    ]).start();

    setTimeout(() => {
      const letterAnimations = letterAnims.map((anim, index) => 
        Animated.sequence([
          Animated.delay(index * 80), 
          Animated.spring(anim, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true
          })
        ])
      );

      Animated.parallel(letterAnimations).start();
    }, 1000); 

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 4000); 

    return () => clearTimeout(timer);
  }, []);

  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['15deg', '0deg']
  });

  const welcomeText = 'Welcome to IdeaBank!';

  return (
    <LinearGradient
      colors={['#E0F7FA', '#FFFFFF']}
      style={styles.container}
    >
      
      <Animated.View 
        style={{
          opacity: logoOpacity,
          transform: [
            { scale: logoScale },
            { rotate: logoRotation }
          ]
        }}
      >
        <Image
          source={require('../assets/ideabank_logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>
      <View style={styles.textContainer}>
        {welcomeText.split('').map((letter, index) => {
          const translateY = letterAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [15, 0]
          });
          return (
            <Animated.Text
              key={index}
              style={[
                styles.welcomeText,
                {
                  opacity: letterAnims[index],
                  transform: [
                    { translateY },
                    { scale: letterAnims[index] }
                  ]
                }
              ]}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </Animated.Text>
          );
        })}
      </View>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  logo: {
    width: 350,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -20
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004d61',
    letterSpacing: 1,
     includeFontPadding: false, 
    textAlignVertical: 'center'
  }
});