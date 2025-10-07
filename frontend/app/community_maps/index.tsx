import React, { useState, useEffect, useRef, useCallback } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated,  Modal, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../src/api/client';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import { ReporteMarker } from '../../src/components/report/ReporteMarker';
import { ReporteDetails } from '../../src/components/report/ReporteDetails';
import { Colors } from '../../src/constants/colors';
import MapsFilterModal from '../../src/components/community_maps/MapsFilterModal';

interface Reporte {
    id_avistamiento: number;
    descripcion: string;
    direccion: string;
    id_especie: number;
    id_estado_salud: number;
    id_estado_avistamiento: number;
    fecha_creacion: string;
    latitude: number;
    longitude: number;
}

interface CurrentFilters {
    especieId?: number | string;
    estadoSaludId?: number | string;
    zona?: string;
}

const CommunityMapScreen = () => {
    const router = useRouter();
    const mapRef = useRef<MapView>(null);
    const { showError, showSuccess, confirm } = useNotification();

    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [currentFilters, setCurrentFilters] = useState<CurrentFilters>({});
    const [hasActiveFilters, setHasActiveFilters] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasSearchedWithFilters, setHasSearchedWithFilters] = useState(false);

    const [location, setLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [mapRegion, setMapRegion] = useState({
        latitude: -38.7369,
        longitude: -72.5994,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [menuVisible, setMenuVisible] = useState(false);
    const [reportes, setReportes] = useState<Reporte[]>([]);
    const [selectedSighting, setSelectedSighting] = useState<Reporte | null>(
        null,
    );

    // Verificar si hay filtros activos
    useEffect(() => {
        const hasFilters = Object.keys(currentFilters).length > 0 && 
            (currentFilters.especieId || currentFilters.estadoSaludId || currentFilters.zona);
        setHasActiveFilters(!!hasFilters); // ⭐️ CORRECCIÓN: Convertir a booleano explícito
    }, [currentFilters]);


    const obtenerUbicacionActual = useCallback(async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc.coords);
            setMapRegion({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
        } else {
            showError('Permiso Denegado', 'No se puede acceder a la ubicación.');
        }
    }, [showError]);

    // ⭐️ FUNCIÓN CORREGIDA: Con manejo de estados de carga y sin resultados ⭐️
    const obtenerReportes = useCallback(async (filters: CurrentFilters = {}) => {
        setLoading(true);
        try {
            const params: Record<string, any> = {};

            // Mapeo y Conversión de Tipo
            if (filters.especieId) {
                params.id_especie = Number(filters.especieId); 
            }
            if (filters.estadoSaludId) {
                params.id_estado_salud = Number(filters.estadoSaludId);
            }
            if (filters.zona) {
                params.zona = filters.zona; 
            }
            
            // Eliminamos cualquier parámetro con valor undefined
            const filteredParams = Object.fromEntries(
                Object.entries(params).filter(([_, v]) => v !== undefined)
            );
            
            // Determina el endpoint. Si no hay filtros, se llama a /sightings/filter con params vacíos.
            const endpoint = `/sightings/filter`;

            // Llamada a la API usando el objeto 'params' de Axios
            const response = await apiClient.get(endpoint, {
                params: filteredParams, 
            });
            
            const validReportes = response.data.data.filter(
                (r: Reporte) => r.latitude && r.longitude
            );
            setReportes(validReportes);

            // Si hay filtros activos y no hay resultados, marcamos que se buscó con filtros
            if (Object.keys(filteredParams).length > 0) {
                setHasSearchedWithFilters(true);
            } else {
                setHasSearchedWithFilters(false);
            }

        } catch (error: any) {
            console.error('Error al obtener los reportes:', error);
            if (error.response && error.response.status === 404) {
                setReportes([]);
                setHasSearchedWithFilters(true);
                // No mostramos mensaje de éxito aquí para evitar confusión
            } else {
                showError('Error', 'No se pudieron cargar los reportes');
                setHasSearchedWithFilters(false);
            }
        } finally {
            setLoading(false);
        }
    }, [showError]);

    const handleDelete = async () => {
        if (!selectedSighting) return;
        confirm({
            title: 'Confirmar Eliminación',
            message: '¿Estás seguro de que deseas eliminar este reporte?',
            confirmLabel: 'Eliminar',
            cancelLabel: 'Cancelar',
            destructive: true,
            onConfirm: async () => {
                try {
                    await apiClient.delete(
                        `/sightings/${selectedSighting.id_avistamiento}`,
                    );
                    setSelectedSighting(null);
                    obtenerReportes(currentFilters);
                    showSuccess('Éxito', 'Reporte eliminado');
                } catch {
                    showError('Error', 'No se pudo eliminar el reporte.');
                }
            },
        });
    };
    
    const handleApplyFilter = (filters: CurrentFilters) => {
        setCurrentFilters(filters);
        setFilterModalVisible(false);
        // No llamamos obtenerReportes aquí, se ejecutará en el useEffect
    };

    const handleClearFilters = () => {
        setCurrentFilters({});
        setHasSearchedWithFilters(false);
        // El useEffect se encargará de obtener todos los reportes
    };

    useEffect(() => {
        obtenerReportes(currentFilters); 
    }, [currentFilters, obtenerReportes]);

    useEffect(() => {
        obtenerUbicacionActual();
    }, [obtenerUbicacionActual]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Mapa Comunitario</Text>

            <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => {
                    setMenuVisible(false); 
                    setSelectedSighting(null); 
                    setFilterModalVisible(true);
                }}
                activeOpacity={0.8}
            >
                <Ionicons name="filter" size={24} color={Colors.lightText || 'white'} />
                {hasActiveFilters && (
                    <View style={styles.filterIndicator} />
                )}
            </TouchableOpacity>
            
            {/* Estado de carga */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Buscando avistamientos...</Text>
                </View>
            )}

            {/* Estado sin resultados con filtros */}
            {!loading && hasSearchedWithFilters && reportes.length === 0 && (
                <View style={styles.noResultsContainer}>
                    <Ionicons name="search-outline" size={64} color={Colors.gray} />
                    <Text style={styles.noResultsTitle}>No se encontraron resultados</Text>
                    <Text style={styles.noResultsText}>
                        No hay avistamientos que coincidan con los filtros aplicados.
                    </Text>
                    <TouchableOpacity 
                        style={styles.clearFilterButton}
                        onPress={handleClearFilters}
                    >
                        <Text style={styles.clearFilterText}>Limpiar filtros</Text>
                    </TouchableOpacity>
                </View>
            )}

            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={[
                    styles.map,
                    (loading || (hasSearchedWithFilters && reportes.length === 0)) && styles.hiddenMap
                ]}
                region={mapRegion}
                onPress={() => setSelectedSighting(null)}
            >
                {location && (
                    <Marker
                        coordinate={location}
                        title="Ubicación Actual"
                        pinColor="blue"
                    />
                )}

                {reportes.map((r) => (
                    <ReporteMarker
                        key={r.id_avistamiento}
                        reporte={r}
                        onSelect={setSelectedSighting}
                    />
                ))}
            </MapView>

            {selectedSighting && (
                <ReporteDetails
                    reporte={selectedSighting}
                    onClose={() => setSelectedSighting(null)}
                    onDelete={handleDelete}
                />
            )}

            {menuVisible && (
                <Animated.View style={styles.fabMenuContainer}>
                    <TouchableOpacity
                        style={styles.fabMenuItem}
                        onPress={() => {
                            setMenuVisible(false);
                            router.push('/create-report');
                        }}
                    >
                        <Text style={styles.fabMenuItemText}>Crear Reporte</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.fabMenuItem, { marginTop: 10 }]}
                        onPress={() => {
                            setMenuVisible(false);
                            router.push('/alerts/create-alert');
                        }}
                    >
                        <Text style={styles.fabMenuItemText}>Crear Alerta</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={() => setMenuVisible(!menuVisible)}
            >
                <Text style={styles.fabText}>{menuVisible ? '×' : '+'}</Text>
            </TouchableOpacity>
            
            <Modal
                animationType="slide"
                transparent={true}
                visible={filterModalVisible}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <MapsFilterModal
                    isVisible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)}
                    onApplyFilter={handleApplyFilter}
                    currentFilters={currentFilters}
                    hasActiveFilters={hasActiveFilters}
                />
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: Colors.background || '#F8F8F8' 
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text || '#333',
        paddingVertical: 15,
        textAlign: 'center',
        backgroundColor: Colors.lightText || 'white',
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray || '#E0E0E0',
    },
    map: { 
        flex: 1 
    },
    hiddenMap: {
        opacity: 0.3,
    },
    filterButton: {
        position: 'absolute',
        top: 60, 
        left: 20, 
        backgroundColor: Colors.accent || '#007AFF', 
        borderRadius: 30,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 10,
    },
    filterIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.success || '#4CAF50',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: Colors.success || '#4CAF50',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        zIndex: 10,
    },
    fabText: { 
        color: Colors.lightText || 'white', 
        fontSize: 24, 
        fontWeight: 'bold' 
    },
    fabMenuContainer: {
        position: 'absolute',
        bottom: 90,
        right: 24,
        backgroundColor: Colors.lightText || 'white',
        borderRadius: 15,
        padding: 12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        zIndex: 10,
    },
    fabMenuItem: {
        paddingVertical: 12,
        paddingHorizontal: 18,
        backgroundColor: Colors.background || '#F0F0F0',
        borderRadius: 10,
        alignItems: 'center',
    },
    fabMenuItemText: { 
        fontSize: 16, 
        color: Colors.accent || '#007AFF', 
        fontWeight: '500' 
    },
    loadingContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -75 }, { translateY: -50 }],
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        zIndex: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: Colors.text,
    },
    noResultsContainer: {
        position: 'absolute',
        top: '40%',
        left: '10%',
        right: '10%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 30,
        borderRadius: 15,
        alignItems: 'center',
        zIndex: 20,
        elevation: 5,
    },
    noResultsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    noResultsText: {
        fontSize: 14,
        color: Colors.gray,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    clearFilterButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    clearFilterText: {
        color: Colors.lightText,
        fontWeight: '600',
        fontSize: 16,
    },
});

export default CommunityMapScreen;