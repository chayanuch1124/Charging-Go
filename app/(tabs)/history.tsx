import { COLORS, globalStyles } from '@/constants/theme';
import { HistoryRecord, HistoryService } from '@/services/historyService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        setupData();
    }, []);

    const setupData = async () => {
        try {
            // ดึงข้อมูลผ่าน API/GitHub และเก็บใน AsyncStorage
            const data = await HistoryService.fetchHistoryFromApi();
            setHistory(data);
        } catch (error) {
            console.error('Failed to load history:', error);
            // ถ้าเน็ตไม่มี ให้ลองโหลดจาก Cache
            const cachedData = await HistoryService.getCachedHistory();
            setHistory(cachedData);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        const data = await HistoryService.fetchHistoryFromApi();
        setHistory(data);
        setRefreshing(false);
    };

    const renderItem = ({ item }: { item: HistoryRecord }) => (
        <View style={[globalStyles.card, styles.historyCard]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#F8F9FA' }]}>
                    <Ionicons name="flash" size={20} color="#00BD68" />
                </View>
                <View style={styles.titleInfo}>
                    <Text style={styles.stationName}>{item.stationName}</Text>
                    <Text style={styles.dateText}>{item.date}</Text>
                </View>
                <Text style={styles.costText}>฿{item.cost.toFixed(2)}</Text>
            </View>

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>พลังงาน</Text>
                    <Text style={styles.detailValue}>{item.energy} kWh</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>ระยะเวลา</Text>
                    <Text style={styles.detailValue}>{item.duration}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[globalStyles.container, { backgroundColor: '#F8F9FA' }]}>
            <View style={styles.header}>
                <Text style={styles.title}>ประวัติการใช้งาน</Text>
                <Text style={styles.subtitle}>รายการชาร์จรถไฟฟ้าของคุณ</Text>
            </View>

            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.listPadding}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={50} color={COLORS.textSecondary} />
                        <Text style={styles.emptyText}>ยังไม่มีประวัติการชาร์จ</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: { padding: 20, paddingTop: 60, backgroundColor: 'white' },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
    subtitle: { fontSize: 13, color: '#666', marginTop: 4 },
    listPadding: { padding: 20, paddingBottom: 100 },
    historyCard: {
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    titleInfo: { flex: 1, marginLeft: 12 },
    stationName: { color: COLORS.text, fontSize: 15, fontWeight: 'bold' },
    dateText: { color: '#999', fontSize: 12, marginTop: 2 },
    costText: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
    detailItem: { flex: 1 },
    detailLabel: { color: '#999', fontSize: 11, marginBottom: 2 },
    detailValue: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
    emptyContainer: { padding: 50, alignItems: 'center' },
    emptyText: { color: COLORS.textSecondary, marginTop: 10 },
});

