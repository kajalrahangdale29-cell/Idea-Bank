// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// export default function HelpScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Help Screen</Text>
//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   text: { fontSize: 20 },
// });

// import React from "react";
// import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";

// export default function HelpScreen() {
//   const openPDF = async () => {
//     const pdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

//     try {
//       await Linking.openURL(pdfUrl); 
//     } catch (error) {
//       console.error("Failed to open PDF:", error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}></Text>

//       <TouchableOpacity style={styles.button} onPress={openPDF}>
//         <Text style={styles.buttonText}>Open PDF</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
//   header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
//   button: { backgroundColor: "#007bff", padding: 15, borderRadius: 8 },
//   buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
// });
// import React from "react";
// import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
// import { Asset } from "expo-asset";
// import * as Sharing from "expo-sharing";

// export default function HelpScreen() {
//   const openPDF = async () => {
//     try {
//       const asset = Asset.fromModule(require("../assets/User_Manuals.pdf"));
//       await asset.downloadAsync();

//       if (asset.localUri) {
//         await Sharing.shareAsync(asset.localUri); 
//       } else {
//         console.error("PDF URI not found");
//       }
//     } catch (error) {
//       console.error("Failed to open PDF:", error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}></Text>

//       <TouchableOpacity style={styles.button} onPress={openPDF}>
//         <Text style={styles.buttonText}>Open PDF</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
//   header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
//   button: { backgroundColor: "#007bff", padding: 15, borderRadius: 8 },
//   buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
// });
// import React from "react";
// import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";

// export default function HelpScreen() {
//   const openPDF = async () => {
//     const pdfUrl = "https://ideabank.abisaio.com/manuals/User_Manuals.pdf"; // 🔗 direct URL

//     try {
//       const supported = await Linking.canOpenURL(pdfUrl);
//       if (supported) {
//         await Linking.openURL(pdfUrl);  // ✅ Open in browser like Study Material
//       } else {
//         Alert.alert("Error", "Cannot open the PDF");
//       }
//     } catch (error) {
//       console.error("Failed to open PDF:", error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.button} onPress={openPDF}>
//         <Text style={styles.buttonText}>Open User Manual</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
//   button: { backgroundColor: "#007bff", padding: 15, borderRadius: 8 },
//   buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
// });