import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { AppText } from '@/src/components/AppText';
import CustomButton from '@/src/components/UI/CustomButton';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Item = { title: string; content: React.ReactNode };

export default function HelpScreen() {
  const [open, setOpen] = useState<string | null>(null);

  const faqs: Item[] = [
    {
      title: '¿Qué es Ayuda Animal Temuco?',
      content: (
        <AppText>
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
          <AppText>
            - Activa ubicación y toma una foto clara (opcional).
          </AppText>
          <AppText>
            - Describe el estado del animal y el lugar (referencias).
          </AppText>
          <AppText>- Evita publicar datos personales de terceros.</AppText>
        </View>
      ),
    },
    {
      title: '¿Qué significan las alertas?',
      content: (
        <View style={{ gap: 6 }}>
          <AppText>- Informativas: presencia de animales vulnerables.</AppText>
          <AppText>- Riesgo sanitario: posibles focos de enfermedad.</AppText>
          <AppText>
            - Recuerda: son orientativas y no sustituyen a autoridades.
          </AppText>
        </View>
      ),
    },
    {
      title: '¿Cómo postulo a adopción?',
      content: (
        <AppText>
          Desde la sección Adopciones podrás ver animales disponibles y
          postular. La evaluación la realizan refugios/ONGs según sus
          protocolos.
        </AppText>
      ),
    },
    {
      title: 'Privacidad y ubicación',
      content: (
        <AppText>
          La ubicación se usa para georreferenciar reportes y mostrar focos
          cercanos. No rastreamos en segundo plano sin tu autorización.
        </AppText>
      ),
    },
    {
      title: 'Contactos locales',
      content: (
        <View style={{ gap: 6 }}>
          <AppText>
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
            <Ionicons name="chevron-back" size={24} color="#fff" />
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
                    color="#7A5C3A"
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7EF' },
  content: { padding: 16, paddingBottom: 32, gap: 16 },
  intro: { color: '#7A5C3A' },
  card: {
    backgroundColor: '#FFFDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F2D8A7',
  },
  sectionTitle: { color: '#CC5803', fontSize: 18, marginBottom: 12 },
  faqItem: {
    borderWidth: 1,
    borderColor: '#F2E6C8',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  faqTitle: { color: '#7A5C3A' },
  faqBody: { paddingHorizontal: 12, paddingBottom: 12, gap: 6 },
  updatedAt: { textAlign: 'center', color: '#9C815F', marginTop: 8 },
});
