import React, { useState } from "react"
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Linking,
    Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

const { width, height } = Dimensions.get("window")

export default function Index() {
    const [menuVisible, setMenuVisible] = useState(false)
    const [token, setToken] = useState("mi_token") // Token simulado

    const openSocialMedia = (platform: string) => {
        const urls = {
            facebook: "https://facebook.com",
            twitter: "https://twitter.com",
            instagram: "https://instagram.com",
        }
        Linking.openURL(urls[platform as keyof typeof urls])
    }

    const handleLogout = () => {
        Alert.alert(
            "Confirmar",
            "¿Estás seguro de que quieres cerrar sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Cerrar sesión",
                    style: "destructive",
                    onPress: () => {
                        // Simulación: eliminar token
                        setToken("")
                        setMenuVisible(false)

                        // Mostrar alerta de sesión cerrada
                        Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.", [
                            {
                                text: "OK",
                                onPress: () => {
                                    router.replace("/auth/") // Redirigir a login
                                },
                            },
                        ])
                    },
                },
            ]
        )
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <View style={styles.overlay} />

            {/* Botón de Configuración en esquina */}
            <View style={styles.settingsContainer}>
                <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
                    <Ionicons name="settings-outline" size={28} color="black" />
                </TouchableOpacity>

                {menuVisible && (
                    <View style={styles.dropdownMenu}>
                        <TouchableOpacity disabled style={styles.menuItem}>
                            <Text style={styles.menuTextDisabled}>Configuración de usuario</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                            <Text style={styles.menuText}>Cerrar sesión</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                {/* Welcome Message */}
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeText}>Bienvenido/a Admin</Text>
                </View>

                {/* Main Actions */}
                <View style={styles.actionsContainer}>
                    <View style={styles.actionSection}>
                        <Text style={styles.questionText}>¿Viste un perrito que necesita ayuda?</Text>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.reportButton]}
                            activeOpacity={0.8}
                            onPress={() => router.push("/alerts")}
                        >
                            <Text style={styles.actionButtonText}>Dar aviso</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionSection}>
                        <Text style={styles.questionText}>¿Te gustaría adoptar un perrito?</Text>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.adoptButton]}
                            activeOpacity={0.8}
                            onPress={() => router.push("/adoption")}
                        >
                            <Text style={styles.actionButtonText}>¡Si quiero adoptar!</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionSection}>
                        <Text style={styles.questionText}>Mapa Comunitario</Text>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.mapButton]}
                            activeOpacity={0.8}
                            onPress={() => router.push("/community_maps")}
                        >
                            <Text style={styles.actionButtonText}>Mapa Comunitario</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Social Media Section */}
                <View style={styles.socialContainer}>
                    <Text style={styles.socialText}>Puedes buscarnos en:</Text>
                    <View style={styles.socialButtons}>
                        <TouchableOpacity
                            style={[styles.socialButton, styles.facebookButton]}
                            onPress={() => openSocialMedia("facebook")}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="logo-facebook" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.socialButton, styles.twitterButton]}
                            onPress={() => openSocialMedia("twitter")}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="logo-twitter" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.socialButton, styles.instagramButton]}
                            onPress={() => openSocialMedia("instagram")}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="logo-instagram" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    settingsContainer: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
    },
    dropdownMenu: {
        marginTop: 10,
        backgroundColor: "white",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        paddingVertical: 5,
        width: 180,
    },
    menuItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    menuText: {
        fontSize: 16,
        color: "red",
        fontWeight: "600",
    },
    menuTextDisabled: {
        fontSize: 16,
        color: "#999",
    },
    content: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 30,
        paddingVertical: 60,
    },
    welcomeContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    welcomeText: {
        color: "#000000",
        fontSize: 28,
        fontWeight: "700",
        textAlign: "center",
    },
    actionsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    actionSection: {
        alignItems: "center",
        marginVertical: 20,
        width: "100%",
    },
    questionText: {
        color: "#000000",
        fontSize: 18,
        fontWeight: "500",
        textAlign: "center",
        marginBottom: 15,
        lineHeight: 24,
    },
    actionButton: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        minWidth: 200,
    },
    reportButton: {
        backgroundColor: "#ef4444",
    },
    adoptButton: {
        backgroundColor: "#22c55e",
    },
    mapButton: {
        backgroundColor: "#1071d1ff",
    },
    actionButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
    socialContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    socialText: {
        color: "#000000",
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 15,
    },
    socialButtons: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 15,
    },
    socialButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    facebookButton: {
        backgroundColor: "#1877f2",
    },
    twitterButton: {
        backgroundColor: "#1da1f2",
    },
    instagramButton: {
        backgroundColor: "#e4405f",
    },
})
