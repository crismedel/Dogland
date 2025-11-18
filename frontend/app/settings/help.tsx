import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import CustomHeader from '@/src/components/UI/CustomHeader';
import {
  AppText,
  fontWeightBold,
  fontWeightMedium,
  fontWeightSemiBold,
} from '@/src/components/AppText';
import CustomButton from '@/src/components/UI/CustomButton';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// 1. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

type Item = { title: string; content: React.ReactNode };

export default function HelpScreen() {
  // 2. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [open, setOpen] = useState<string | null>(null);

  const faqs: Item[] = [
    {
      title: '¿Qué es Ayuda Animal Temuco?',
      content: (
        // 7. Aplicar estilo de párrafo
        <AppText style={styles.paragraphText}>
          Plataforma colaborativa para reportar animales en riesgo, coordinar
          operativos sanitarios, emitir alertas y facilitar adopciones
          responsables en Temuco.
        </AppText>
      ),
    },
    {
      title: '¿Cómo hago un reporte correcto?',
      content: (
        <View style={{ gap: 6 }}>
          <AppText style={styles.paragraphText}>
            - Activa ubicación y toma una foto clara (opcional).
          </AppText>
          <AppText style={styles.paragraphText}>
            - Describe el estado del animal y el lugar (referencias).
          </AppText>
          <AppText style={styles.paragraphText}>
            - Evita publicar datos personales de terceros.
          </AppText>
        </View>
      ),
    },
    {
      title: '¿Qué significan las alertas?',
      content: (
        <View style={{ gap: 6 }}>
          <AppText style={styles.paragraphText}>
            - Informativas: presencia de animales vulnerables.
          </AppText>
          <AppText style={styles.paragraphText}>
            - Riesgo sanitario: posibles focos de enfermedad.
          </AppText>
          <AppText style={styles.paragraphText}>
            - Recuerda: son orientativas y no sustituyen a autoridades.
          </AppText>
        </View>
      ),
    },
    {
      title: '¿Cómo postulo a adopción?',
      content: (
        <AppText style={styles.paragraphText}>
          Desde la sección Adopciones podrás ver animales disponibles y
          postular. La evaluación la realizan refugios/ONGs según sus
          protocolos.
        </AppText>
      ),
    },
    {
      title: 'Privacidad y ubicación',
      content: (
        <AppText style={styles.paragraphText}>
          La ubicación se usa para georreferenciar reportes y mostrar focos
          cercanos. No rastreamos en segundo plano sin tu autorización.
        </AppText>
      ),
    },
    {
      title: 'Contactos locales',
      content: (
        <View style={{ gap: 6 }}>
          <AppText style={styles.paragraphText}>
            Los contactos actualizados estarán disponibles en esta sección.
          </AppText>
        </View>
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Centro de ayuda"
        leftComponent={
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {/* 3. Usar colores del tema (texto oscuro sobre fondo amarillo) */}
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDark ? colors.lightText : colors.text}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={styles.intro}>
          Encuentra respuestas rápidas y guías para usar la app.
        </AppText>

        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Preguntas frecuentes</AppText>

          <View style={{ gap: 8 }}>
            {faqs.map((item) => (
              <View key={item.title} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() =>
                    setOpen(open === item.title ? null : item.title)
                  }
                >
                  <AppText style={styles.faqTitle}>{item.title}</AppText>
                  <Ionicons
                    name={open === item.title ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.darkGray} // 4. Usar colores del tema
                  />
                </TouchableOpacity>
                {open === item.title && (
                  <View style={styles.faqBody}>{item.content}</View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>¿Aún necesitas ayuda?</AppText>
          <CustomButton
            title="Escribir a soporte"
            icon="mail-outline"
            style={{ width: '100%' }}
            onPress={() =>
              Linking.openURL(
                'mailto:soporte@tu-dominio.com?subject=Ayuda%20Animal%20Temuco%20-%20Soporte',
              )
            }
          />
          <CustomButton
            title="WhatsApp (opcional)"
            icon="logo-whatsapp"
            variant="secondary"
            style={{ width: '100%', marginTop: 8 }}
            onPress={() => Linking.openURL('https://wa.me/569XXXXXXXX')}
          />
        </View>

        <AppText style={styles.updatedAt}>
          Última actualización: 28/10/2025
        </AppText>
      </ScrollView>
    </View>
  );
}

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background }, // Dinámico
    content: { padding: 16, paddingBottom: 32, gap: 16 },
    intro: { color: colors.darkGray, fontSize: 16, lineHeight: 22 }, // Dinámico
    card: {
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.secondary, // Dinámico
    },
    sectionTitle: {
      color: colors.secondary, // Dinámico
      fontSize: 18,
      marginBottom: 12,
      fontWeight: fontWeightBold,
    },
    faqItem: {
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
      borderRadius: 10,
      backgroundColor: colors.background, // Dinámico
    },
    faqHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    faqTitle: {
      color: colors.text, // Dinámico
      fontWeight: fontWeightSemiBold,
      flex: 1,
    },
    faqBody: {
      paddingHorizontal: 12,
      paddingBottom: 12,
      gap: 6,
      borderTopWidth: 1,
      borderTopColor: colors.gray, // Dinámico
    },
    updatedAt: {
      textAlign: 'center',
      color: colors.darkGray, // Dinámico
      marginTop: 8,
      fontStyle: 'italic',
    },
    // 7. Añadir estilo de párrafo
    paragraphText: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 22,
    },
  });