import { Text, View, TextInput, TouchableOpacity, StyleSheet, Dimensions, KeyboardAvoidingView, Platform } from "react-native"
import { router } from 'expo-router';

const { width, height } = Dimensions.get("window")

export default function Index() {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    {/* Welcome Title */}
                    <Text style={styles.welcomeTitle}>Bienvenido a Dogland</Text>

                    {/* User Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Usuario</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ingresa tu usuario"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="default"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Correo</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ingresa tu correo"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Contraseña</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ingresa tu contraseña"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={true}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity style={styles.registerButton} activeOpacity={0.8}>
                        <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                    </TouchableOpacity>

                    {/* Login Link */}
                    <TouchableOpacity style={styles.loginContainer}>
                        <Text style={styles.loginText} onPress={() => router.push('/auth/login')}>Ya Tengo una Cuenta</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
    },
    formContainer: {
        width: width * 0.85,
        maxWidth: 400,
        paddingHorizontal: 20,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1F2937",
        textAlign: "center",
        marginBottom: 40,
        letterSpacing: 0.5,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#1F2937",
        backgroundColor: "#F9FAFB",
    },
    registerButton: {
        backgroundColor: "#fbbf24",
        paddingVertical: 18,
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    registerButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
        letterSpacing: 0.5,
    },
    loginContainer: {
        alignItems: "center",
    },
    loginText: {
        color: "#fbbf24",
        fontSize: 16,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
})
