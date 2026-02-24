import { COLORS, globalStyles, PROMOTIONS } from '@/constants/theme';
import { ChargingStation, fetchChargingStations } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeDashboard() {
    const [stations, setStations] = useState<ChargingStation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStations();
    }, []);

    const loadStations = async (force = false) => {
        setLoading(true);
        try {
            const data = await fetchChargingStations(force);
            setStations(data);
        } catch (error) {
            console.error('Error loading stations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={globalStyles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>สวัสดีครับ!</Text>
                    <Text style={styles.userName}>คุณกำลังมองหาจุดชาร์จใช่ไหม?</Text>
                </View>
                <TouchableOpacity style={styles.notificationBtn}>
                    <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>85%</Text>
                    <Text style={styles.statLabel}>แบตเตอรี่</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>12.5</Text>
                    <Text style={styles.statLabel}>กม. วันนี้</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>โปรโมชั่นแนะนำ</Text>
            <FlatList
                data={PROMOTIONS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.promoList}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.promoCard}>
                        <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.promoImage} />
                        <Text style={styles.promoText}>{item.title}</Text>
                    </TouchableOpacity>
                )}
            />

            <Text style={styles.sectionTitle}>สถานีใกล้คุณ</Text>
            {loading && stations.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>กำลังค้นหาสถานี...</Text>
                </View>
            ) : (
                stations.slice(0, 3).map((station) => (
                    <TouchableOpacity key={station.id} style={globalStyles.card}>
                        <View style={styles.stationRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name="flash" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.stationInfo}>
                                <Text style={styles.stationName}>{station.name}</Text>
                                <Text style={styles.stationAddress}>{station.address}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
    },
    welcomeText: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    userName: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    notificationBtn: {
        backgroundColor: COLORS.secondary,
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statsRow: {
        flexDirection: 'row',
        padding: 20,
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: COLORS.background,
        width: '48%',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statValue: {
        color: COLORS.primary,
        fontSize: 28,
        fontWeight: 'bold',
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 4,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 20,
        marginTop: 20,
        marginBottom: 15,
    },
    promoList: {
        paddingLeft: 20,
        paddingRight: 5,
    },
    promoCard: {
        width: 280,
        marginRight: 15,
    },
    promoImage: {
        width: '100%',
        height: 150,
        borderRadius: 20,
    },
    promoText: {
        color: COLORS.text,
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    stationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(0, 189, 104, 0.1)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stationInfo: {
        flex: 1,
        marginLeft: 15,
    },
    stationName: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
    stationAddress: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
});
