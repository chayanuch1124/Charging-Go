import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, PanResponder, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { COLORS } from '../../constants/theme';
import { ChargingStation, fetchChargingStations } from '../../services/api';

export default function ExploreScreen() {
    const [stations, setStations] = useState<ChargingStation[]>([]);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
    const mapRef = useRef<MapView>(null);

    // Bottom Sheet Animation
    const COLLAPSED_VISIBLE_HEIGHT = 80;
    const SHEET_TOTAL_HEIGHT = 500; // Reduced from 700 to prevent full-screen covering

    // Initial position: Pushed down so only COLLAPSED_VISIBLE_HEIGHT is visible
    const translateY = useRef(new Animated.Value(SHEET_TOTAL_HEIGHT - COLLAPSED_VISIBLE_HEIGHT)).current;
    const [isExpanded, setIsExpanded] = useState(false);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
            onPanResponderMove: (_, gestureState) => {
                const initialPos = isExpanded ? 0 : SHEET_TOTAL_HEIGHT - COLLAPSED_VISIBLE_HEIGHT;
                const newY = initialPos + gestureState.dy;

                // Clamping: Don't drag too high or too low
                if (newY >= 0 && newY <= SHEET_TOTAL_HEIGHT - COLLAPSED_VISIBLE_HEIGHT) {
                    translateY.setValue(newY);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                const threshold = 100;
                if (isExpanded) {
                    if (gestureState.dy > threshold) {
                        toggleSheet(false);
                    } else {
                        toggleSheet(true);
                    }
                } else {
                    if (gestureState.dy < -threshold) {
                        toggleSheet(true);
                    } else {
                        toggleSheet(false);
                    }
                }
            },
        })
    ).current;

    const toggleSheet = (expand: boolean) => {
        setIsExpanded(expand);
        Animated.spring(translateY, {
            toValue: expand ? 0 : SHEET_TOTAL_HEIGHT - COLLAPSED_VISIBLE_HEIGHT,
            useNativeDriver: true,
            friction: 8,
            tension: 50,
        }).start();
    };

    useEffect(() => {
        loadData();

        let subscription: any;
        if (Platform.OS !== 'web') {
            subscription = startTracking();
        }

        return () => {
            if (subscription && typeof subscription.then === 'function') {
                subscription.then((sub: any) => sub.remove()).catch(() => { });
            }
        };
    }, []);

    const startTracking = async () => {
        try {
            return await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Balanced,
                    timeInterval: 5000,
                    distanceInterval: 10,
                },
                (newLocation) => {
                    setLocation(newLocation);
                }
            );
        } catch (e) {
            console.warn('Tracking error:', e);
            return null;
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);

            // Parallel fetch stations and permission/location
            const stationPromise = fetchChargingStations();

            let locationPromise: Promise<any> = Promise.resolve(null);
            if (Platform.OS !== 'web') {
                locationPromise = (async () => {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        setErrorMsg('Permission denied');
                        return null;
                    }
                    return await Location.getCurrentPositionAsync({});
                })();
            }

            const [stationData, currentLoc] = await Promise.all([stationPromise, locationPromise]);

            setStations(stationData);
            if (currentLoc) setLocation(currentLoc);
        } catch (error) {
            console.error('Error loading data:', error);
            setErrorMsg('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleStationSelect = (station: ChargingStation) => {
        setSelectedStation(station);
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: station.latitude - 0.01, // Offset slightly to accommodate bottom sheet
                longitude: station.longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
            }, 800);
        }
    };

    const centerOnUser = () => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 1000);
        }
    };

    if (loading && !stations.length) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary || '#00FF9D'} />
                <Text style={styles.loadingText}>กำลังโหลดข้อมูลระบบพิกัด...</Text>
            </View>
        );
    }

    // Web Fallback or Map Error Fallback
    if (Platform.OS === 'web') {
        return (
            <View style={styles.container}>
                <View style={styles.webFallback}>
                    <MaterialCommunityIcons name="map-marker-radius" size={64} color={COLORS.primary || '#00FF9D'} />
                    <Text style={styles.webFallbackText}>
                        ระบบแผนที่รองรับการทำงานเต็มรูปแบบบน iOS และ Android{"\n"}
                        กรุณาเปิดด้วยแอป Expo Go เพื่อประสบการณ์ที่ดีที่สุด
                    </Text>
                    <View style={styles.stationList}>
                        <Text style={styles.stationListTitle}>สถานีชาร์จใกล้เคียง ({stations.length}):</Text>
                        {stations.map(station => (
                            <View key={station.id} style={styles.stationItem}>
                                <View style={styles.stationHeader}>
                                    <Text style={styles.stationName}>{station.name}</Text>
                                    <View style={[styles.statusDot, { backgroundColor: station.status === 'available' ? COLORS.success : COLORS.danger }]} />
                                </View>
                                <Text style={styles.stationAddress}>{station.address}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Top Search & Filter UI */}
            <View style={styles.topOverlay}>
                <View style={styles.searchBarWrapper}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                        <TextInput
                            placeholder="ค้นหาชื่อสถานี, ที่อยู่"
                            placeholderTextColor={COLORS.textSecondary}
                            style={styles.searchInput}
                        />
                    </View>
                    <TouchableOpacity style={styles.favoriteBtn}>
                        <Ionicons name="heart-outline" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    <TouchableOpacity style={styles.filterChip}>
                        <Ionicons name="options-outline" size={16} color={COLORS.text} style={{ marginRight: 4 }} />
                        <Text style={styles.filterText}>ตัวกรอง</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Text style={styles.filterText}>พร้อมใช้งาน</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterChip, { borderColor: COLORS.primary }]}>
                        <MaterialCommunityIcons name="flash" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
                        <Text style={[styles.filterText, { color: COLORS.primary }]}>Auto Charge</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: location ? location.coords.latitude : 13.7462,
                    longitude: location ? location.coords.longitude : 100.5399,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                userInterfaceStyle="light"
            >
                {stations.map((station) => (
                    <Marker
                        key={station.id}
                        coordinate={{
                            latitude: station.latitude,
                            longitude: station.longitude,
                        }}
                        onPress={() => handleStationSelect(station)}
                    >
                        <View style={[
                            styles.markerCircle,
                            { backgroundColor: station.status === 'available' ? COLORS.primary : COLORS.danger }
                        ]}>
                            <MaterialCommunityIcons name="ev-station" size={16} color="white" />
                        </View>
                    </Marker>
                ))}
            </MapView>

            <View style={styles.mapControls}>
                <TouchableOpacity style={styles.mapControlBtn}>
                    <Ionicons name="information-outline" size={24} color="#555" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.mapControlBtn, { marginTop: 10 }]} onPress={centerOnUser}>
                    <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#555" />
                </TouchableOpacity>
            </View>

            {/* Bottom Station List Panel */}
            <Animated.View
                style={[
                    styles.bottomSheet,
                    { transform: [{ translateY }] }
                ]}
            >
                <View style={styles.sheetHeader} {...panResponder.panHandlers}>
                    <Text style={styles.sheetTitle}>รายชื่อ <Text style={{ color: '#00BD68' }}>ค้นเจอ {stations.length} สถานี</Text></Text>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity>
                            <Ionicons name="list" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleSheet(!isExpanded)} style={{ marginLeft: 15 }}>
                            <Ionicons name={isExpanded ? "chevron-down" : "chevron-up"} size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.refreshBadge}>
                    <TouchableOpacity style={styles.refreshBtn}>
                        <Ionicons name="refresh-outline" size={16} color={COLORS.text} style={{ marginRight: 6 }} />
                        <Text style={styles.refreshText}>กดเพื่ออัปเดตข้อมูล</Text>
                    </TouchableOpacity>
                    <Text style={styles.timestampText}>ข้อมูลล่าสุด ณ 08:01 น.</Text>
                </View>

                <FlatList
                    data={stations}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.stationCard} onPress={() => handleStationSelect(item)}>
                            <View style={styles.stationBrandBox}>
                                <MaterialCommunityIcons name="ev-station" size={24} color={COLORS.primary} />
                            </View>
                            <View style={styles.stationDetails}>
                                <Text style={styles.stationTitleText}>{item.name}</Text>
                                <Text style={styles.stationSubText} numberOfLines={1}>{item.address}</Text>
                                <Text style={styles.stationMetaText}>
                                    {item.openingHours || 'เปิด 24 ชั่วโมง'}  •  ≈ 2.3 กม. (4 นาที)
                                </Text>
                                <View style={styles.tagRow}>
                                    <View style={[styles.statusTag, { backgroundColor: item.status === 'available' ? '#EBF5FF' : '#FFEBEB' }]}>
                                        <Text style={[styles.statusTagText, { color: item.status === 'available' ? '#007AFF' : COLORS.danger }]}>
                                            {item.status === 'available' ? 'พร้อมใช้งาน' : 'ไม่ว่าง'}
                                        </Text>
                                    </View>
                                    <View style={styles.iconTag}>
                                        <MaterialCommunityIcons name="flash" size={14} color="#00BD68" />
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </Animated.View>

            {/* --- STATION DETAIL FOCUS MODAL --- */}
            {selectedStation && (
                <Animated.View style={styles.focusModal}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                        {/* Header Image/Banner Area */}
                        <View style={styles.focusHeader}>
                            <TouchableOpacity style={styles.closeFocus} onPress={() => setSelectedStation(null)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                            <View style={styles.stationLogoBox}>
                                <MaterialCommunityIcons name="ev-station" size={32} color={COLORS.primary} />
                            </View>
                        </View>

                        <View style={styles.focusContent}>
                            <View style={styles.statusRow}>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusBadgeText}>พร้อมใช้งาน</Text>
                                </View>
                            </View>

                            <Text style={styles.focusStationName}>{selectedStation.name}</Text>
                            <Text style={styles.focusStationMeta}>
                                <Text style={{ color: COLORS.primary }}>เปิด</Text> 24 ชั่วโมง  •  ≈ 7.8 กม. (12 นาที)
                            </Text>

                            <TouchableOpacity>
                                <Text style={styles.moreInfoLink}>ข้อมูลเพิ่มเติม {'>'}</Text>
                            </TouchableOpacity>

                            {/* Filter Tabs */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
                                <TouchableOpacity style={[styles.tabBtn, styles.activeTab]}>
                                    <Text style={[styles.tabBtnText, styles.activeTabText]}>แสดงทั้งหมด</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.tabBtn}>
                                    <Text style={styles.tabBtnText}>หัวชาร์จที่ว่างตอนนี้</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.tabBtn}>
                                    <Ionicons name="flash" size={16} color={COLORS.primary} />
                                    <Text style={styles.tabBtnText}>Auto Charge</Text>
                                </TouchableOpacity>
                            </ScrollView>

                            {/* Connectors List */}
                            <Text style={styles.sectionHeader}>CC (กระแสสูงสุด 200A) <Ionicons name="information-circle-outline" size={16} color="#999" /></Text>
                            <Text style={styles.machineId}>รหัสเครื่องชาร์จ : 1156</Text>

                            {selectedStation.connectors.map((connector) => (
                                <View key={connector.id} style={styles.connectorCard}>
                                    <View style={styles.connectorInfo}>
                                        <View style={styles.connectorIconBox}>
                                            <MaterialCommunityIcons
                                                name={connector.type.includes('AC') ? "nut" : "power-plug-outline"}
                                                size={30}
                                                color="#333"
                                            />
                                        </View>
                                        <View style={styles.connectorDetails}>
                                            <Text style={styles.connectorType}>{connector.type}</Text>
                                            <Text style={styles.connectorPos}>{connector.position} {connector.label}</Text>
                                            <Text style={styles.connectorPower}>สูงสุด <Text style={{ fontWeight: 'bold' }}>{connector.power} kW</Text>  |  <Text style={{ fontWeight: 'bold' }}>{connector.price.toFixed(2)}</Text> ฿/kWh</Text>
                                        </View>
                                    </View>
                                    <View style={styles.connectorAction}>
                                        <View style={[styles.miniStatus, { backgroundColor: connector.status === 'available' ? '#EBF5FF' : '#FFEBEB' }]}>
                                            <Text style={[styles.miniStatusText, { color: connector.status === 'available' ? COLORS.primary : COLORS.danger }]}>
                                                {connector.status === 'available' ? 'พร้อมใช้งาน' : 'มีผู้ใช้งาน'}
                                            </Text>
                                        </View>
                                        {connector.status === 'available' && (
                                            <TouchableOpacity style={styles.bookBtn}>
                                                <Text style={styles.bookBtnText}>จอง</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </Animated.View>
            )}

            {errorMsg && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    topOverlay: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingHorizontal: 20,
    },
    searchBarWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 55,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: COLORS.text,
    },
    favoriteBtn: {
        width: 55,
        height: 55,
        backgroundColor: 'white',
        borderRadius: 12,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    filterScroll: {
        marginTop: 15,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    filterText: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '500',
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        color: COLORS.textSecondary,
        marginTop: 10,
    },
    markerCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    mapControls: {
        position: 'absolute',
        bottom: 100, // Balanced distance above collapsed sheet
        right: 20,
    },
    mapControlBtn: {
        backgroundColor: 'white',
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 500, // Matches SHEET_TOTAL_HEIGHT
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1, // Slightly stronger shadow for visibility
        shadowRadius: 20,
        elevation: 10,
        paddingHorizontal: 20,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    refreshBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 20,
    },
    refreshBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    refreshText: {
        fontSize: 12,
        color: COLORS.text,
    },
    timestampText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 10,
    },
    stationCard: {
        flexDirection: 'row',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    stationBrandBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    stationDetails: {
        flex: 1,
    },
    stationTitleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    stationSubText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginVertical: 4,
    },
    stationMetaText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    tagRow: {
        flexDirection: 'row',
    },
    statusTag: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 8,
    },
    statusTagText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
    },
    iconTag: {
        backgroundColor: 'rgba(0, 189, 104, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorBanner: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: COLORS.danger,
        padding: 10,
        borderRadius: 8,
    },
    errorText: {
        color: 'white',
        textAlign: 'center',
    },
    webFallback: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    webFallbackText: {
        color: COLORS.text,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 30,
        lineHeight: 24,
    },
    stationList: {
        width: '100%',
        padding: 20,
        backgroundColor: COLORS.secondary,
        borderRadius: 20,
    },
    stationListTitle: {
        color: COLORS.primary,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    stationItem: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        paddingBottom: 10,
    },
    stationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    stationName: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    stationAddress: {
        color: COLORS.textSecondary,
        fontSize: 13,
    },

    // Focus Modal Styles
    focusModal: {
        position: 'absolute',
        top: 60,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        zIndex: 100,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    focusHeader: {
        height: 180,
        backgroundColor: COLORS.primary, // Changed from blue to green
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    closeFocus: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stationLogoBox: {
        width: 80,
        height: 80,
        backgroundColor: 'white',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        position: 'absolute',
        bottom: -40,
        left: 20,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    focusContent: {
        flex: 1,
        marginTop: 50,
        paddingHorizontal: 20,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    statusBadge: {
        backgroundColor: '#EBF5FF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 5,
    },
    statusBadgeText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    focusStationName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    focusStationMeta: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 10,
    },
    moreInfoLink: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    tabScroll: {
        marginBottom: 20,
        maxHeight: 45,
    },
    tabBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#EEE',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    tabBtnText: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '500',
    },
    activeTabText: {
        color: 'white',
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
        marginTop: 10,
    },
    machineId: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    connectorCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    connectorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    connectorIconBox: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    connectorDetails: {
        flex: 1,
    },
    connectorType: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    connectorPos: {
        fontSize: 13,
        color: '#666',
        marginVertical: 2,
    },
    connectorPower: {
        fontSize: 13,
        color: '#333',
    },
    connectorAction: {
        alignItems: 'flex-end',
    },
    miniStatus: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 8,
    },
    miniStatusText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    bookBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    bookBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    focusFooter: {
        height: 100,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: 'white',
    },
    footerIconBtn: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#EEE',
        marginHorizontal: 10,
    },
    mainActionBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        height: 55,
        borderRadius: 15,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainActionText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});
