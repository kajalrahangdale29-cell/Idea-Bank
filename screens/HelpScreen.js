import React from "react";
 import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";

 export default function HelpScreen() {
   const openPDF = async () => {
     const pdfUrl = "https://ideabank.abisaio.com/manuals/User_Manuals.pdf"; // 🔗 direct URL

     try {
       const supported = await Linking.canOpenURL(pdfUrl);
       if (supported) {
         await Linking.openURL(pdfUrl); 
     } else {
        Alert.alert("Error", "Cannot open the PDF");
     }
     } catch (error) {
      console.error("Failed to open PDF:", error);
     }
   };

   return (
     <View style={styles.container}>
<TouchableOpacity style={styles.button} onPress={openPDF}>
        <Text style={styles.buttonText}>Open User Manual</Text>
       </TouchableOpacity>
     </View>
   );
 }

 const styles = StyleSheet.create({
   container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
   button: { backgroundColor: "#007bff", padding: 15, borderRadius: 8 },
   buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
 });