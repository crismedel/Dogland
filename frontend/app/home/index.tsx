import {
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Linking,
} from "react-native"
import { router } from "expo-router"

const { width, height } = Dimensions.get("window")

export default function Index() {
    const openSocialMedia = (platform: string) => {
        const urls = {
            facebook: "https://facebook.com",
            twitter: "https://twitter.com",
            instagram: "https://instagram.com",
        }
        Linking.openURL(urls[platform as keyof typeof urls])
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <View style={styles.overlay} />

            <View style={styles.content}>
                {/* Welcome Message */}
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeText}>Bienvenido/a Admin</Text>
                </View>

                {/* Main Actions */}
                <View style={styles.actionsContainer}>
                    {/* Report Dog Section */}
                    <View style={styles.actionSection}>
                        <Text style={styles.questionText}>¿Viste un perrito que necesita ayuda?</Text>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.reportButton]}
                            activeOpacity={0.8}
                            onPress={() => router.push('/alerts')}
                        >
                            <Text style={styles.actionButtonText}>Dar aviso</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Adopt Dog Section */}
                    <View style={styles.actionSection}>
                        <Text style={styles.questionText}>¿Te gustaría adoptar un perrito?</Text>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.adoptButton]}
                            activeOpacity={0.8}
                            onPress={() => router.push('/adoption')}
                        >
                            <Text style={styles.actionButtonText}>¡Si quiero adoptar!</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Report Dog Section */}
                    <View style={styles.actionSection}>
                        <Text style={styles.questionText}>Mapa Comunitario</Text>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.mapButton]}
                            activeOpacity={0.8}
                            onPress={() => router.push('/community_maps')}
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
                            <Text style={styles.socialButtonText}>f</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.socialButton, styles.twitterButton]}
                            onPress={() => openSocialMedia("twitter")}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.socialButtonText}>t</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.socialButton, styles.instagramButton]}
                            onPress={() => openSocialMedia("instagram")}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.socialButtonText}>i</Text>
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
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        minWidth: 200,
    },
    reportButton: {
        backgroundColor: "#ef4444", // Red for emergency/report
    },
    adoptButton: {
        backgroundColor: "#22c55e", // Green for positive action
    },
    mapButton: {
        backgroundColor: "#1071d1ff", // Green for positive action
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
    socialButtonText: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
    },
})
