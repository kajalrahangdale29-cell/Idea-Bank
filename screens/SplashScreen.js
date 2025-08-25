import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen({ navigation }) {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const bulbAnim = useRef(new Animated.Value(50)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(bulbAnim, { toValue: 0, friction: 4, useNativeDriver: true }),
      Animated.timing(textAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#E0F7FA', '#FFFFFF']}
      style={styles.container}
    >
      
      <Animated.View style={{ opacity: logoAnim }}>
        <Image
          source={require('../assets/ideabank_logo.png')}
          style={styles.logo}
        />
      </Animated.View>

      
      <Animated.View style={{ transform: [{ translateY: bulbAnim }] }}>
        <Image
          source={require('../assets/IdeaBank_Bulb.png')}
          style={styles.mainImage}
        />
      </Animated.View>

      
      <Animated.Text style={[styles.welcomeText, { opacity: textAnim }]}>
      Your Ideas, Our Platform.
      </Animated.Text>
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
    width: 250,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 20
  },
  mainImage: {
    width: 300,
    height: 350,
    resizeMode: 'contain'
  },
  welcomeText: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004d61',
    letterSpacing: 1
  }
});