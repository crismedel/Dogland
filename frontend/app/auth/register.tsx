import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/src/api/client';
import { useNotification } from '@/src/components/notifications';
import { Region, Ciudad } from '@/src/types/location';
import { Colors } from '@/src/constants/colors';
import { registerSchema } from '@/src/schemas/';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
import CustomPicker from '@/src/components/UI/CustomPicker';
import CustomCalendar from '@/src/components/UI/calendary/CustomCalendar';

const { width } = Dimensions.get('window');

export default function RegisterWithValidation() {
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showError, showSuccess } = useNotification();

  // React Hook Form con validacion Zod
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      nombre_usuario: '',
      apellido_paterno: '',
      apellido_materno: '',
      telefono: '',
      fecha_nacimiento: new Date(),
      id_sexo: 0,
      id_ciudad: 0,
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Observar password en tiempo real para mostrar requisitos
  const password = watch('password', '');
  const confirmPassword = watch('confirmPassword', '');
  const fecha_nacimiento = watch('fecha_nacimiento');

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Cargar regiones
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await apiClient.get('/regions');
        setRegiones(response.data.data);
      } catch (error: any) {
        showError('Error', 'No se pudieron cargar las regiones.');
      } finally {
        setIsLoadingRegions(false);
      }
    };
    fetchRegions();
  }, []);

  // Cargar ciudades cuando cambia la región
  useEffect(() => {
    const fetchCities = async (regionId: number | null) => {
      if (!regionId) {
        setCiudades([]);
        return;
      }
      setIsLoadingCities(true);
      setCiudades([]);

      try {
        const response = await apiClient.get(`/cities/${regionId}`);
        setCiudades(response.data.data);
      } catch (error: any) {
        showError('Error', 'No se pudieron cargar las ciudades.');
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCities(selectedRegion);
  }, [selectedRegion]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const userData = {
        nombre_usuario: data.nombre_usuario,
        apellido_paterno: data.apellido_paterno,
        apellido_materno: data.apellido_materno || null,
        id_sexo: data.id_sexo || null,
        fecha_nacimiento: new Date(data.fecha_nacimiento)
          .toISOString()
          .split('T')[0],
        telefono: data.telefono || null,
        email: data.email,
        password_hash: data.password, // Backend espera password_hash
        id_ciudad: data.id_ciudad || null,
      };

      const response = await apiClient.post('/auth/register', userData);
      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Ocurrió un error en el registro.',
        );
      }

      showSuccess(
        'Éxito',
        'Cuenta creada correctamente. Ahora puedes iniciar sesión.',
      );
      setTimeout(() => {
        router.push('/auth/login');
      }, 500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      showError('Error de Registro', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image
          source={require('../../assets/images/volver.png')}
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <AppText style={styles.welcomeTitle}>
            Crea tu cuenta en Dogland
          </AppText>

          {/* Nombre de usuario */}
          <View style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>Nombre *</AppText>
            <Controller
              control={control}
              name="nombre_usuario"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.nombre_usuario && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={errors.nombre_usuario ? '#EF4444' : '#6B7280'}
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Ingresa tu nombre"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </View>
                  {errors.nombre_usuario && (
                    <AppText style={styles.errorText}>
                      {errors.nombre_usuario.message}
                    </AppText>
                  )}
                </>
              )}
            />
          </View>

          {/* Apellido Paterno */}
          <View style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>Apellido Paterno *</AppText>
            <Controller
              control={control}
              name="apellido_paterno"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.apellido_paterno && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={errors.apellido_paterno ? '#EF4444' : '#6B7280'}
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Ingresa tu apellido"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </View>
                  {errors.apellido_paterno && (
                    <AppText style={styles.errorText}>
                      {errors.apellido_paterno.message}
                    </AppText>
                  )}
                </>
              )}
            />
          </View>

          {/* Apellido Materno (opcional) */}
          <View style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>
              Apellido Materno (Opcional)
            </AppText>
            <Controller
              control={control}
              name="apellido_materno"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#6B7280"
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu apellido"
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </View>
              )}
            />
          </View>

          {/* Teléfono */}
          <View style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>Teléfono (Opcional)</AppText>
            <Controller
              control={control}
              name="telefono"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.telefono && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={errors.telefono ? '#EF4444' : '#6B7280'}
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: 912345678"
                      value={value || ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                    />
                  </View>
                  {errors.telefono && (
                    <AppText style={styles.errorText}>
                      {errors.telefono.message}
                    </AppText>
                  )}
                </>
              )}
            />
          </View>

          {/* Fecha de Nacimiento */}
          <View style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>Fecha de Nacimiento *</AppText>
            <Controller
              control={control}
              name="fecha_nacimiento"
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.inputWrapper,
                        errors.fecha_nacimiento && styles.inputError,
                      ]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={errors.fecha_nacimiento ? '#EF4444' : '#6B7280'}
                        style={styles.icon}
                      />
                      <AppText
                        style={[
                          styles.inputText,
                          !value && { color: '#9CA3AF' },
                        ]}
                      >
                        {value
                          ? formatDate(value)
                          : 'Selecciona una fecha'}
                      </AppText>
                    </View>
                  </TouchableOpacity>

                  <CustomCalendar
                    visible={showDatePicker}
                    onClose={() => setShowDatePicker(false)}
                    onDateSelect={(date) => {
                      onChange(date);
                      setShowDatePicker(false);
                    }}
                    selectedDate={value}
                    title="Fecha de Nacimiento"
                    theme="light"
                  />

                  {errors.fecha_nacimiento && (
                    <AppText style={styles.errorText}>
                      {errors.fecha_nacimiento.message}
                    </AppText>
                  )}
                </>
              )}
            />
          </View>

          {/* Sexo */}
          <View style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>Sexo *</AppText>
            <Controller
              control={control}
              name="id_sexo"
              render={({ field: { onChange, value } }) => (
                <>
                  <CustomPicker
                    options={[
                      { label: 'Selecciona tu sexo...', value: 0 },
                      { label: 'Masculino', value: 1 },
                      { label: 'Femenino', value: 2 },
                      { label: 'Otro', value: 3 },
                    ]}
                    selectedValue={value}
                    onValueChange={onChange}
                    placeholder="Selecciona tu sexo"
                    icon="male-female-outline"
                  />
                  {errors.id_sexo && (
                    <AppText style={styles.errorText}>
                      {errors.id_sexo.message}
                    </AppText>
                  )}
                </>
              )}
            />
          </View>

          {/* Región */}
          <View style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>Región</AppText>
            <CustomPicker
              options={[
                { label: 'Selecciona una región...', value: null },
                ...regiones.map((r) => ({
                  label: r.nombre_region,
                  value: r.id_region,
                })),
              ]}
              selectedValue={selectedRegion}
              onValueChange={(value) => {
                setSelectedRegion(value);
                setValue('id_ciudad', 0); // Resetear ciudad
              }}
              placeholder="Selecciona una región"
              icon="map-outline"
            />
          </View>

          {/* Ciudad */}
          <View style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>Ciudad</AppText>
            <Controller
              control={control}
              name="id_ciudad"
              render={({ field: { onChange, value } }) => (
                <>
                  {isLoadingCities ? (
                    <View style={styles.inputWrapper}>
                      <ActivityIndicator size="small" color={Colors.primary} />
                    </View>
                  ) : (
                    <CustomPicker
                      options={[
                        {
                          label: selectedRegion
                            ? 'Selecciona una ciudad...'
                            : 'Elige una región primero',
                          value: 0,
                        },
                        ...ciudades.map((c) => ({
                          label: c.nombre_ciudad,
                          value: c.id_ciudad,
                        })),
                      ]}
                      selectedValue={value}
                      onValueChange={onChange}
                      placeholder="Selecciona una ciudad"
                      icon="location-outline"
                    />
                  )}
                  {errors.id_ciudad && (
                    <AppText style={styles.errorText}>
                      {errors.id_ciudad.message}
                    </AppText>
                  )}
                </>
              )}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>Correo Electrónico *</AppText>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.email && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={errors.email ? '#EF4444' : '#6B7280'}
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="correo@ejemplo.com"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.email && (
                    <AppText style={styles.errorText}>
                      {errors.email.message}
                    </AppText>
                  )}
                </>
              )}
            />
          </View>

          {/* Contraseña con validación en tiempo real */}
          <View style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>Contraseña *</AppText>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.password && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={errors.password ? '#EF4444' : '#6B7280'}
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Mínimo 8 caracteres"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Indicador de fortaleza en tiempo real */}
                  {password.length > 0 && (
                    <View style={styles.strengthContainer}>
                      <View style={styles.strengthBar}>
                        <View
                          style={[
                            styles.strengthFill,
                            {
                              width: `${(passwordStrength / 4) * 100}%`,
                              backgroundColor:
                                passwordStrength <= 1
                                  ? '#EF4444'
                                  : passwordStrength === 2
                                    ? '#F59E0B'
                                    : passwordStrength === 3
                                      ? '#FBBF24'
                                      : '#10B981',
                            },
                          ]}
                        />
                      </View>
                      <AppText style={styles.strengthText}>
                        {passwordStrength <= 1
                          ? '⚠️ Vulnerable'
                          : passwordStrength === 2
                            ? '⚡ Aceptable'
                            : passwordStrength === 3
                              ? '✅ Fuerte'
                              : '🔒 Muy fuerte'}
                      </AppText>
                    </View>
                  )}

                  {/* Checklist de requisitos en tiempo real */}
                  {password.length > 0 && (
                    <View style={styles.requirements}>
                      <AppText
                        style={
                          password.length >= 8 ? styles.valid : styles.invalid
                        }
                      >
                        {password.length >= 8 ? '✓' : '✗'} Mínimo 8 caracteres
                      </AppText>
                      <AppText
                        style={
                          /[A-Z]/.test(password) ? styles.valid : styles.invalid
                        }
                      >
                        {/[A-Z]/.test(password) ? '✓' : '✗'} Una mayúscula
                      </AppText>
                      <AppText
                        style={
                          /[a-z]/.test(password) ? styles.valid : styles.invalid
                        }
                      >
                        {/[a-z]/.test(password) ? '✓' : '✗'} Una minúscula
                      </AppText>
                      <AppText
                        style={
                          /[0-9]/.test(password) ? styles.valid : styles.invalid
                        }
                      >
                        {/[0-9]/.test(password) ? '✓' : '✗'} Un número
                      </AppText>
                    </View>
                  )}

                  {errors.password && (
                    <AppText style={styles.errorText}>
                      {errors.password.message}
                    </AppText>
                  )}
                </>
              )}
            />
          </View>

          {/* Confirmar Contraseña */}
          <View style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>Confirmar Contraseña *</AppText>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.confirmPassword && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={errors.confirmPassword ? '#EF4444' : '#6B7280'}
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Repite la contraseña"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Indicador de coincidencia en tiempo real */}
                  {confirmPassword.length > 0 && (
                    <View style={styles.matchContainer}>
                      {password === confirmPassword ? (
                        <AppText style={styles.match}>
                          ✓ Las contraseñas coinciden
                        </AppText>
                      ) : (
                        <AppText style={styles.noMatch}>
                          ✗ Las contraseñas no coinciden
                        </AppText>
                      )}
                    </View>
                  )}

                  {errors.confirmPassword && (
                    <AppText style={styles.errorText}>
                      {errors.confirmPassword.message}
                    </AppText>
                  )}
                </>
              )}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <AppText style={styles.submitButtonText}>Crear Cuenta</AppText>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            style={styles.loginLinkContainer}
          >
            <AppText style={styles.loginLinkText}>Ya Tengo una Cuenta</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightText,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  scrollContainer: {
    paddingTop: 100,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    width: width * 0.9,
    maxWidth: 400,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: fontWeightSemiBold,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: fontWeightSemiBold,
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
  },
  strengthText: {
    fontSize: 12,
    marginTop: 4,
    color: '#6B7280',
  },
  requirements: {
    marginTop: 8,
  },
  valid: {
    color: '#10B981',
    fontSize: 12,
    marginBottom: 2,
  },
  invalid: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 2,
  },
  matchContainer: {
    marginTop: 4,
  },
  match: {
    color: '#10B981',
    fontSize: 12,
  },
  noMatch: {
    color: '#EF4444',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: fontWeightSemiBold,
  },
  loginLinkContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  loginLinkText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: fontWeightMedium,
    textDecorationLine: 'underline',
  },
});
