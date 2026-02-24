import { COLORS, globalStyles } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AccountScreen() {
    const [carModel, setCarModel] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem('carModel');
                if (saved) setCarModel(saved);
            } catch (_error) {
                console.error('AsyncStorage Error:', _error);
            }
        })();
    }, []);

    const saveCarModel = async () => {
        try {
            await AsyncStorage.setItem('carModel', carModel);
            Alert.alert('สำเร็จ', 'บันทึกรุ่นรถของคุณแล้ว');
        } catch (_e) {
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
        }
    };

    return (
        <ScrollView style={globalStyles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={50} color={COLORS.primary} />
                </View>
                <Text style={styles.userName}>ผู้ใช้งานทั่วไป</Text>
                <Text style={styles.userEmail}>user@example.com</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ข้อมูลยานพาหนะ</Text>
                <View style={styles.inputCard}>
                    <Text style={styles.label}>รุ่นรถไฟฟ้าของคุณ</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="เช่น Tesla Model 3, BYD Atto 3"
                        placeholderTextColor={COLORS.textSecondary}
                        value={carModel}
                        onChangeText={setCarModel}
                    />
                    <TouchableOpacity style={styles.saveBtn} onPress={saveCarModel}>
                        <Text style={styles.saveBtnText}>บันทึกข้อมูล</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.menuSection}>
                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="notifications" size={20} color={COLORS.primary} />
                    <Text style={styles.menuText}>การตั้งค่าการแจ้งเตือน</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
                    <Ionicons name="help-circle" size={20} color={COLORS.primary} />
                    <Text style={styles.menuText}>ช่วยเหลือและสนับสนุน</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutBtn}>
                <Text style={styles.logoutText}>ออกจากระบบ</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: { paddingBottom: 100 },
    header: { alignItems: 'center', padding: 40, backgroundColor: COLORS.secondary, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0, 255, 157, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: COLORS.primary },
    userName: { color: COLORS.text, fontSize: 22, fontWeight: 'bold' },
    userEmail: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4 },
    section: { padding: 20 },
    sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    inputCard: { backgroundColor: COLORS.secondary, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    label: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 8 },
    input: { backgroundColor: COLORS.background, borderRadius: 12, padding: 15, color: COLORS.text, fontSize: 16, marginBottom: 15 },
    saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 15, alignItems: 'center' },
    saveBtnText: { color: COLORS.background, fontWeight: 'bold' },
    menuSection: { marginHorizontal: 20, backgroundColor: COLORS.secondary, borderRadius: 20, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    menuText: { flex: 1, color: COLORS.text, marginLeft: 15, fontSize: 16 },
    logoutBtn: { margin: 20, marginTop: 40, padding: 18, borderRadius: 15, borderWidth: 1, borderColor: COLORS.danger, alignItems: 'center' },
    logoutText: { color: COLORS.danger, fontWeight: 'bold' },
});
