import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import CustomHeader from '@/src/components/UI/CustomHeader';
import CustomButton from '@/src/components/UI/CustomButton';
import { AppText, fontWeightBold, fontWeightMedium, fontWeightSemiBold } from '@/src/components/AppText';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// 1. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

type TabKey = 'terms' | 'privacy' | 'licenses';

export default function LegalScreen() {
  // 2. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [tab, setTab] = useState<TabKey>('terms');

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Términos y privacidad"
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

      {/* Pestañas simples */}
      <View style={styles.tabs}>
        <TabButton
          label="Términos"
          active={tab === 'terms'}
          onPress={() => setTab('terms')}
        />
        <TabButton
          label="Privacidad"
          active={tab === 'privacy'}
          onPress={() => setTab('privacy')}
        />
        <TabButton
          label="Licencias"
          active={tab === 'licenses'}
          onPress={() => setTab('licenses')}
        />
      </View>

      {/* Contenido */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'terms' && <Terms />}
        {tab === 'privacy' && <Privacy />}
        {tab === 'licenses' && <Licenses />}
        <AppText style={styles.updatedAt}>
          Última actualización: 28/10/2025
        </AppText>
      </ScrollView>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  // 2. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabBtn, active && styles.tabBtnActive]}
    >
      <AppText style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

/* ========== CONTENIDOS ========== */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  // 2. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <View style={{ marginBottom: 16 }}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}

function Terms() {
  // 2. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <View>
      <Section title="Objeto del Servicio">
        <AppText style={styles.paragraphText}>
          “Ayuda Animal Temuco” es una plataforma para reportar animales en
          situación de vulnerabilidad, coordinar operativos sanitarios, emitir
          alertas y facilitar adopciones responsables en la comuna de Temuco.
        </AppText>
      </Section>
      <Section title="Cuenta del Usuario">
        <AppText style={styles.paragraphText}>
          El usuario debe proporcionar información veraz.
        </AppText>
        <AppText style={styles.paragraphText}>
          Está prohibido suplantar identidades o publicar contenido falso,
          difamatorio o engañoso.
        </AppText>
      </Section>
      <Section title="Reportes, Mapa y Georreferenciación">
        <AppText style={styles.paragraphText}>
          Los reportes deben ser precisos y respetuosos. Evita exponer datos
          personales de terceros.
        </AppText>
        <AppText style={styles.paragraphText}>
          La georreferenciación es aproximada; no garantizamos exactitud GPS.
        </AppText>
      </Section>
      <Section title="Alertas y Responsabilidad">
        <AppText style={styles.paragraphText}>
          Las alertas son informativas. En emergencias, contacta a autoridades o
          servicios veterinarios. No somos responsables por decisiones tomadas
          solo con base en la app.
        </AppText>
      </Section>
      <Section title="Propiedad Intelectual">
        <AppText style={styles.paragraphText}>
          La marca, diseño, código y contenidos pertenecen al equipo del
          proyecto o a sus titulares. El usuario conserva derechos sobre su
          contenido, otorgando licencia para mostrarlo en la app.
        </AppText>
      </Section>
      <Section title="Conducta Prohibida">
        <AppText style={styles.paragraphText}>
          Prohibido contenido violento, cruel con animales, ilegal,
          discriminatorio o con datos personales de terceros sin consentimiento.
        </AppText>
      </Section>
      <Section title="Suspensión y Modificaciones">
        <AppText style={styles.paragraphText}>
          Podemos suspender cuentas por incumplimientos. Estos términos pueden
          actualizarse y se informará dentro de la app.
        </AppText>
      </Section>
    </View>
  );
}

function Privacy() {
  // 2. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <View>
      <Section title="Responsable">
        <AppText style={styles.paragraphText}>
          Equipo “Ayuda Animal Temuco”. Finalidad académica y comunitaria.
        </AppText>
      </Section>
      <Section title="Datos que Recopilamos">
        <AppText style={styles.paragraphText}>
          - Cuenta: nombre, email.
        </AppText>
        <AppText style={styles.paragraphText}>
          - Reportes: texto, fotos opcionales, geolocalización aproximada,
          fecha/hora.
        </AppText>
        <AppText style={styles.paragraphText}>
          - Uso de la app: métricas anónimas para mejoras.
        </AppText>
      </Section>
      <Section title="Finalidades">
        <AppText style={styles.paragraphText}>
          Gestionar reportes georreferenciados, emitir alertas, coordinar
          campañas sanitarias, facilitar adopciones y mejorar la app.
        </AppText>
      </Section>
      <Section title="Base Legal y Consentimiento">
        <AppText style={styles.paragraphText}>
          Solicitamos tu consentimiento para ubicación, cámara/galería y
          comunicaciones. Puedes retirarlo desde Ajustes del dispositivo.
        </AppText>
      </Section>
      <Section title="Ubicación">
        <AppText style={styles.paragraphText}>
          Solo se usa para crear reportes y mostrar focos cercanos. No
          rastreamos en segundo plano salvo autorización explícita.
        </AppText>
      </Section>
      <Section title="Conservación">
        <AppText style={styles.paragraphText}>
          Conservamos los datos el tiempo necesario para los fines del proyecto.
          Puedes solicitar eliminación de cuenta y datos.
        </AppText>
      </Section>
      <Section title="Compartición">
        <AppText style={styles.paragraphText}>
          Podremos compartir datos solo cuando sea necesario para operativos
          sanitarios o adopciones, minimizando datos personales.
        </AppText>
      </Section>
      <Section title="Seguridad">
        <AppText style={styles.paragraphText}>
          Aplicamos medidas razonables de seguridad; ningún sistema es 100%
          infalible.
        </AppText>
      </Section>
      <Section title="Derechos del Usuario">
        <AppText style={styles.paragraphText}>
          Acceso, rectificación, eliminación, oposición y portabilidad.
          Escríbenos al correo del proyecto.
        </AppText>
      </Section>
      <Section title="Cambios a esta Política">
        <AppText style={styles.paragraphText}>
          Publicaremos actualizaciones en esta sección.
        </AppText>
      </Section>
    </View>
  );
}

function Licenses() {
  // 2. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <View>
      <Section title="Librerías y Licencias">
        {/* Core */}
        <AppText style={styles.paragraphText}>React — MIT</AppText>
        <AppText style={styles.paragraphText}>React Native — MIT</AppText>
        <AppText style={styles.paragraphText}>Expo — MIT</AppText>

        {/* Routing / Navegación */}
        <AppText style={styles.paragraphText}>Expo Router — MIT</AppText>
        <AppText style={styles.paragraphText}>
          @react-navigation/native — MIT
        </AppText>

        {/* Ecosistema RN esencial */}
        <AppText style={styles.paragraphText}>
          react-native-gesture-handler — MIT
        </AppText>
        <AppText style={styles.paragraphText}>
          react-native-reanimated — MIT
        </AppText>
        <AppText style={styles.paragraphText}>react-native-screens — MIT</AppText>
        <AppText style={styles.paragraphText}>
          react-native-safe-area-context — MIT
        </AppText>

        {/* Funcionalidades clave que usas */}
        <AppText style={styles.paragraphText}>expo-location — MIT</AppText>
        <AppText style={styles.paragraphText}>expo-notifications — MIT</AppText>
        <AppText style={styles.paragraphText}>expo-secure-store — MIT</AppText>
        <AppText style={styles.paragraphText}>react-native-maps — MIT</AppText>

        {/* Íconos y almacenamiento */}
        <AppText style={styles.paragraphText}>
          @expo/vector-icons (Ionicons) — MIT
        </AppText>
        <AppText style={styles.paragraphText}>
          @react-native-async-storage/async-storage — MIT
        </AppText>

        {/* Utilidades comunes */}
        <AppText style={styles.paragraphText}>axios — MIT</AppText>
      </Section>

      <Section title="Recursos">
        <AppText style={styles.paragraphText}>
          Iconografía: @expo/vector-icons (Ionicons) — MIT.
        </AppText>
        <AppText style={styles.paragraphText}>
          Fuentes: especificar nombre y licencia (p. ej., Google Fonts — SIL
          OFL).
        </AppText>
        <AppText style={styles.paragraphText}>
          Imágenes/ilustraciones: indicar autor y licencia si aplica.
        </AppText>
        <AppText style={styles.paragraphText}>
          Mapas/datos: si usas Google/Apple/OSM/Mapbox, incluir la atribución
          requerida.
        </AppText>
      </Section>
    </View>
  );
}

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Dinámico
    },
    tabs: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
      backgroundColor: colors.cardBackground, // Dinámico
      alignItems: 'center',
    },
    tabBtnActive: {
      backgroundColor: `${colors.primary}30`, // Dinámico
      borderColor: colors.primary, // Dinámico
    },
    tabLabel: {
      color: colors.darkGray, // Dinámico
    },
    tabLabelActive: {
      color: colors.secondary, // Dinámico
      fontWeight: '600',
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 32,
    },
    sectionTitle: {
      color: colors.secondary, // Dinámico
      fontSize: 16,
      marginBottom: 6,
      fontWeight: fontWeightBold, // Hacerlo más fuerte
    },
    // 6. Nuevo estilo para párrafos
    paragraphText: {
      color: colors.text, // Dinámico
      fontSize: 15,
      lineHeight: 22,
    },
    updatedAt: {
      marginTop: 24,
      color: colors.darkGray, // Dinámico
      fontSize: 12,
      fontStyle: 'italic',
    },
  });