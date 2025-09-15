import React, { useState } from "react"
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
} from "react-native"
import { router } from 'expo-router';

const { width } = Dimensions.get("window")

export default function Index() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    const handleRegister = () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Por favor, completa todos los campos.');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Error', 'Por favor, ingresa un correo válido.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }

        Alert.alert('Éxito', 'Cuenta creada correctamente. Ahora puedes iniciar sesión.', [
            { text: 'OK', onPress: () => router.push('/auth/login') }
        ]);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableOpacity
                style={{ position: 'absolute', top: 50, left: 20, zIndex: 1 }}
                activeOpacity={0.8}
                onPress={() => router.push('/auth')}
            >
                <Image
                    source={require("../../assets/images/volver.png")}
                    style={{ width: 24, height: 24 }}
                />
            </TouchableOpacity>

            <View style={styles.container}>
                <View style={styles.formContainer}>
                    {/* Welcome Title */}
                    <Text style={styles.welcomeTitle}>Crea tu cuenta en Dogland</Text>

                    {/* User Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Usuario</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ingresa tu usuario"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="default"
                            autoCapitalize="none"
                            value={username}
                            onChangeText={setUsername}
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
                            value={email}
                            onChangeText={setEmail}
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
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Confirma tu contraseña"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={true}
                            autoCapitalize="none"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={styles.registerButton}
                        activeOpacity={0.8}
                        onPress={handleRegister}
                    >
                        <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                    </TouchableOpacity>

                    {/* Login Link */}
                    <TouchableOpacity style={styles.loginContainer}>
                        <Text
                            style={styles.loginText}
                            onPress={() => router.push('/auth/login')}
                        >
                            Ya Tengo una Cuenta
                        </Text>
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
