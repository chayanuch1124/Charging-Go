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
                <View style={styles.cameraContainer}>
                    <CameraView
                        style={StyleSheet.absoluteFill}
                        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    />

                    {/* --- Professional Scanner Overlay --- */}
                    <View style={styles.overlayContainer}>
                        {/* Top Mask */}
                        <View style={styles.maskSide} />

                        <View style={styles.maskCenterRow}>
                            {/* Left Mask */}
                            <View style={styles.maskSide} />

                            {/* Scanner Box (The "Hole") */}
                            <View style={styles.focusedContainer}>
                                {/* Corner Accents */}
                                <View style={[styles.corner, styles.topLeft]} />
                                <View style={[styles.corner, styles.topRight]} />
                                <View style={[styles.corner, styles.bottomLeft]} />
                                <View style={[styles.corner, styles.bottomRight]} />

                                {/* Scanning Laser Line Animation (Static for now) */}
                                <View style={styles.laserLine} />
                            </View>

                            {/* Right Mask */}
                            <View style={styles.maskSide} />
                        </View>

                        {/* Bottom Mask */}
                        <View style={styles.maskBottom}>
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>สแกนเพื่อชาร์จ</Text>
                                <Text style={styles.subtitle}>กรุณาวาง QR Code ให้อยู่ในกรอบ</Text>
                            </View>

                            <TouchableOpacity style={styles.flashBtn} onPress={() => setScanned(false)}>
                                <Ionicons name="refresh" size={24} color="white" />
                                <Text style={styles.refreshText}>สแกนใหม่</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
    cameraContainer: { flex: 1, backgroundColor: 'black' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    permissionText: { color: COLORS.text, textAlign: 'center', fontSize: 16, marginBottom: 20 },
    permissionBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
    btnText: { color: 'white', fontWeight: 'bold' },

    // Overlay Masking
    overlayContainer: { ...StyleSheet.absoluteFillObject },
    maskSide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    maskCenterRow: { flexDirection: 'row', height: 260 },
    maskBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', paddingTop: 30 },

    focusedContainer: {
        width: 260,
        height: 260,
        backgroundColor: 'transparent',
    },

    // Corner Accents
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: COLORS.primary,
    },
    topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 15 },
    topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 15 },
    bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 15 },
    bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 15 },

    laserLine: {
        position: 'absolute',
        top: '50%',
        left: '10%',
        right: '10%',
        height: 2,
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 10,
    },

    textContainer: { alignItems: 'center', marginBottom: 40 },
    title: { color: 'white', fontSize: 22, fontWeight: 'bold' },
    subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 8 },

    flashBtn: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    refreshText: { color: 'white', marginLeft: 10, fontWeight: '600' }
});
