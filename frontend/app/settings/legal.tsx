import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { AppText } from '@/src/components/AppText';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type TabKey = 'terms' | 'privacy' | 'licenses';

export default function LegalScreen() {
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
            <Ionicons name="chevron-back" size={24} color="#fff" />
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
  return (
    <View style={{ marginBottom: 16 }}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}

function Terms() {
  return (
    <View>
      <Section title="Objeto del Servicio">
        <AppText>
          “Ayuda Animal Temuco” es una plataforma para reportar animales en
          situación de vulnerabilidad, coordinar operativos sanitarios, emitir
          alertas y facilitar adopciones responsables en la comuna de Temuco.
        </AppText>
      </Section>
      <Section title="Cuenta del Usuario">
        <AppText>El usuario debe proporcionar información veraz.</AppText>
        <AppText>
          Está prohibido suplantar identidades o publicar contenido falso,
          difamatorio o engañoso.
        </AppText>
      </Section>
      <Section title="Reportes, Mapa y Georreferenciación">
        <AppText>
          Los reportes deben ser precisos y respetuosos. Evita exponer datos
          personales de terceros.
        </AppText>
        <AppText>
          La georreferenciación es aproximada; no garantizamos exactitud GPS.
        </AppText>
      </Section>
      <Section title="Alertas y Responsabilidad">
        <AppText>
          Las alertas son informativas. En emergencias, contacta a autoridades o
          servicios veterinarios. No somos responsables por decisiones tomadas
          solo con base en la app.
        </AppText>
      </Section>
      <Section title="Propiedad Intelectual">
        <AppText>
          La marca, diseño, código y contenidos pertenecen al equipo del
          proyecto o a sus titulares. El usuario conserva derechos sobre su
          contenido, otorgando licencia para mostrarlo en la app.
        </AppText>
      </Section>
      <Section title="Conducta Prohibida">
        <AppText>
          Prohibido contenido violento, cruel con animales, ilegal,
          discriminatorio o con datos personales de terceros sin consentimiento.
        </AppText>
      </Section>
      <Section title="Suspensión y Modificaciones">
        <AppText>
          Podemos suspender cuentas por incumplimientos. Estos términos pueden
          actualizarse y se informará dentro de la app.
        </AppText>
      </Section>
    </View>
  );
}

function Privacy() {
  return (
    <View>
      <Section title="Responsable">
        <AppText>
          Equipo “Ayuda Animal Temuco”. Finalidad académica y comunitaria.
        </AppText>
      </Section>
      <Section title="Datos que Recopilamos">
        <AppText>- Cuenta: nombre, email.</AppText>
        <AppText>
          - Reportes: texto, fotos opcionales, geolocalización aproximada,
          fecha/hora.
        </AppText>
        <AppText>- Uso de la app: métricas anónimas para mejoras.</AppText>
      </Section>
      <Section title="Finalidades">
        <AppText>
          Gestionar reportes georreferenciados, emitir alertas, coordinar
          campañas sanitarias, facilitar adopciones y mejorar la app.
        </AppText>
      </Section>
      <Section title="Base Legal y Consentimiento">
        <AppText>
          Solicitamos tu consentimiento para ubicación, cámara/galería y
          comunicaciones. Puedes retirarlo desde Ajustes del dispositivo.
        </AppText>
      </Section>
      <Section title="Ubicación">
        <AppText>
          Solo se usa para crear reportes y mostrar focos cercanos. No
          rastreamos en segundo plano salvo autorización explícita.
        </AppText>
      </Section>
      <Section title="Conservación">
        <AppText>
          Conservamos los datos el tiempo necesario para los fines del proyecto.
          Puedes solicitar eliminación de cuenta y datos.
        </AppText>
      </Section>
      <Section title="Compartición">
        <AppText>
          Podremos compartir datos solo cuando sea necesario para operativos
          sanitarios o adopciones, minimizando datos personales.
        </AppText>
      </Section>
      <Section title="Seguridad">
        <AppText>
          Aplicamos medidas razonables de seguridad; ningún sistema es 100%
          infalible.
        </AppText>
      </Section>
      <Section title="Derechos del Usuario">
        <AppText>
          Acceso, rectificación, eliminación, oposición y portabilidad.
          Escríbenos al correo del proyecto.
        </AppText>
      </Section>
      <Section title="Cambios a esta Política">
        <AppText>Publicaremos actualizaciones en esta sección.</AppText>
      </Section>
    </View>
  );
}

function Licenses() {
  return (
    <View>
      <Section title="Librerías y Licencias">
        {/* Core */}
        <AppText>React — MIT</AppText>
        <AppText>React Native — MIT</AppText>
        <AppText>Expo — MIT</AppText>

        {/* Routing / Navegación */}
        <AppText>Expo Router — MIT</AppText>
        <AppText>@react-navigation/native — MIT</AppText>

        {/* Ecosistema RN esencial */}
        <AppText>react-native-gesture-handler — MIT</AppText>
        <AppText>react-native-reanimated — MIT</AppText>
        <AppText>react-native-screens — MIT</AppText>
        <AppText>react-native-safe-area-context — MIT</AppText>

        {/* Funcionalidades clave que usas */}
        <AppText>expo-location — MIT</AppText>
        <AppText>expo-notifications — MIT</AppText>
        <AppText>expo-secure-store — MIT</AppText>
        <AppText>react-native-maps — MIT</AppText>

        {/* Íconos y almacenamiento */}
        <AppText>@expo/vector-icons (Ionicons) — MIT</AppText>
        <AppText>@react-native-async-storage/async-storage — MIT</AppText>

        {/* Utilidades comunes */}
        <AppText>axios — MIT</AppText>
      </Section>

      <Section title="Recursos">
        <AppText>Iconografía: @expo/vector-icons (Ionicons) — MIT.</AppText>
        <AppText>
          Fuentes: especificar nombre y licencia (p. ej., Google Fonts — SIL
          OFL).
        </AppText>
        <AppText>
          Imágenes/ilustraciones: indicar autor y licencia si aplica.
        </AppText>
        <AppText>
          Mapas/datos: si usas Google/Apple/OSM/Mapbox, incluir la atribución
          requerida.
        </AppText>
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7EF',
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
    borderColor: '#F2D8A7',
    backgroundColor: '#FFFDF4',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#F9E7BD',
    borderColor: '#E5C889',
  },
  tabLabel: {
    color: '#7A5C3A',
  },
  tabLabelActive: {
    color: '#CC5803',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  sectionTitle: {
    color: '#CC5803',
    fontSize: 16,
    marginBottom: 6,
  },
  updatedAt: {
    marginTop: 24,
    color: '#9C815F',
  },
});
