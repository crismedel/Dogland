import { Text, View, ImageBackground, TouchableOpacity, StyleSheet, Dimensions, KeyboardAvoidingView, Platform } from "react-native"
import { router } from 'expo-router';

const { width, height } = Dimensions.get("window")

export default function Index() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ImageBackground
        source={require("../../assets/images/golden-retriever.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={styles.access}>
          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')} activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>Acceder</Text>
          </TouchableOpacity>

          {/* Registration Prompt */}
          <View style={styles.registrationContainer}>
            <Text style={styles.registrationText} onPress={() => router.push('/auth/register')}>
              No tienes una cuenta? <Text style={styles.registrationLink}>Regístrate</Text>
            </Text>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  container: {
    flex: 1,
  },
  access: {
    flex: 1,
    justifyContent: "flex-end", // Position at bottom like in PDF
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 80, // Adjusted bottom padding
  },
  loginButton: {
    backgroundColor: "#fbbf24",
    paddingVertical: 18, // Slightly larger button
    paddingHorizontal: 80, // Wider button
    borderRadius: 12, // More rounded corners
    marginBottom: 20, // Reduced margin
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4, // Stronger shadow
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 20, // Larger text
    fontWeight: "700", // Bold weight
    textAlign: "center",
    letterSpacing: 0.5,
  },
  registrationContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  registrationText: {
    color: "#ffffff", // White text for better contrast
    fontSize: 16, // Slightly larger text
    textAlign: "center",
    fontWeight: "400",
  },
  registrationLink: {
    color: "#fbbf24", // Yellow accent to match button
    fontWeight: "600",
    textDecorationLine: "underline",
  },
})
