import { COLORS, globalStyles } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ScanScreen() {
    const isFocused = useIsFocused();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    if (!permission) return <View style={styles.centerContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    if (!permission.granted) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.permissionText}>จำเป็นต้องเข้าถึงกล้องเพื่อสแกน QR Code</Text>
                <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                    <Text style={styles.btnText}>อนุญาตเข้าถึงกล้อง</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        setScanned(true);
        alert(`สแกนสำเร็จ: ${data}`);
    };

    return (
        <View style={globalStyles.container}>
            {isFocused && (
                <CameraView
                    style={styles.camera}
                    onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                >
                    <View style={styles.overlay}>
                        <View style={styles.topContent}>
                            <Text style={styles.title}>สแกนเพื่อชาร์จ</Text>
                            <Text style={styles.subtitle}>สแกน QR Code ที่ตู้ชาร์จ</Text>
                        </View>
                        <View style={styles.scanFrame} />
                        <TouchableOpacity style={styles.flashBtn} onPress={() => setScanned(false)}>
                            <Ionicons name="refresh" size={28} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                </CameraView>
            )}
            {!isFocused && (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    camera: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, padding: 20 },
    permissionText: { color: COLORS.text, textAlign: 'center', fontSize: 16, marginBottom: 20 },
    permissionBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
    btnText: { color: COLORS.background, fontWeight: 'bold' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 100 },
    topContent: { alignItems: 'center' },
    title: { color: COLORS.text, fontSize: 24, fontWeight: 'bold' },
    subtitle: { color: COLORS.textSecondary, fontSize: 14, marginTop: 8 },
    scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: COLORS.primary, borderRadius: 30 },
    flashBtn: { backgroundColor: 'rgba(26,26,26,0.8)', padding: 15, borderRadius: 40 },
});
