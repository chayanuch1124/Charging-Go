import { COLORS, globalStyles } from '@/constants/theme';
import { Vehicle, VehicleService } from '@/services/vehicleService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CAR_BRANDS = ['Tesla', 'BYD', 'MG', 'GWM', 'BMW', 'Mercedes-Benz', 'Volvo', 'Hyundai', 'Other'];

export default function AccountScreen() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentVehicle, setCurrentVehicle] = useState<Partial<Vehicle>>({
        brand: 'Tesla',
        model: '',
        license_plate: '',
        province: '',
    });

    useEffect(() => {
        loadVehicles();
    }, []);

    const loadVehicles = async () => {
        setLoading(true);
        try {
            const data = await VehicleService.getVehicles();
            setVehicles(data);
        } catch (error) {
            console.error('Failed to load vehicles:', error);
            // Alert.alert('Error', 'Unable to connect to Supabase. Please ensure the table exists.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const { brand, model, license_plate, province } = currentVehicle;
        if (!brand || !model || !license_plate || !province) {
            Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            if (isEditing && currentVehicle.id) {
                await VehicleService.updateVehicle(currentVehicle.id, currentVehicle);
                Alert.alert('สำเร็จ', 'อัปเดตข้อมูลรถเรียบร้อยแล้ว');
            } else {
                await VehicleService.addVehicle(currentVehicle as Omit<Vehicle, 'id' | 'created_at'>);
                Alert.alert('สำเร็จ', 'บันทึกข้อมูลรถเรียบร้อยแล้ว');
            }
            resetForm();
            loadVehicles();
        } catch (error) {
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับ Supabase ได้');
        }
    };

    const handleEdit = (vehicle: Vehicle) => {
        setCurrentVehicle(vehicle);
        setIsEditing(true);
    };

    const handleDelete = (id: string) => {
        Alert.alert('ยืนยัน', 'คุณต้องการลบข้อมูลรถคันนี้ใช่หรือไม่?', [
            { text: 'ยกเลิก', style: 'cancel' },
            {
                text: 'ลบ',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await VehicleService.deleteVehicle(id);
                        loadVehicles();
                    } catch (error) {
                        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้');
                    }
                }
            }
        ]);
    };

    const resetForm = () => {
        setCurrentVehicle({ brand: 'Tesla', model: '', license_plate: '', province: '' });
        setIsEditing(false);
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
                <Text style={styles.sectionTitle}>จัดการยานพาหนะ</Text>

                {/* Form Section */}
                <View style={styles.inputCard}>
                    <Text style={styles.label}>ยี่ห้อรถ</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandContainer}>
                        {CAR_BRANDS.map((b) => (
                            <TouchableOpacity
                                key={b}
                                style={[styles.brandChip, currentVehicle.brand === b && styles.selectedChip]}
                                onPress={() => setCurrentVehicle({ ...currentVehicle, brand: b })}
                            >
                                <Text style={[styles.brandChipText, currentVehicle.brand === b && styles.selectedChipText]}>{b}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.label}>รุ่น</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="เช่น Model 3, Atto 3"
                        placeholderTextColor={COLORS.textSecondary}
                        value={currentVehicle.model}
                        onChangeText={(text) => setCurrentVehicle({ ...currentVehicle, model: text })}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.label}>ทะเบียน</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="1กข 1234"
                                placeholderTextColor={COLORS.textSecondary}
                                value={currentVehicle.license_plate}
                                onChangeText={(text) => setCurrentVehicle({ ...currentVehicle, license_plate: text })}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>จังหวัด</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="กรุงเทพฯ"
                                placeholderTextColor={COLORS.textSecondary}
                                value={currentVehicle.province}
                                onChangeText={(text) => setCurrentVehicle({ ...currentVehicle, province: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.btnRow}>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveBtnText}>{isEditing ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}</Text>
                        </TouchableOpacity>
                        {isEditing && (
                            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* List Section */}
                <Text style={[styles.sectionTitle, { marginTop: 30 }]}>รถของคุณ</Text>
                {loading ? (
                    <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
                ) : vehicles.length === 0 ? (
                    <View style={styles.emptyView}>
                        <Text style={styles.emptyText}>ยังไม่พบข้อมูลรถของคุณ</Text>
                    </View>
                ) : (
                    vehicles.map((v) => (
                        <View key={v.id} style={styles.vehicleItem}>
                            <View style={styles.vehicleInfo}>
                                <Text style={styles.vehicleBrandName}>{v.brand} {v.model}</Text>
                                <Text style={styles.vehiclePlateText}>{v.license_plate} {v.province}</Text>
                            </View>
                            <View style={styles.actionRow}>
                                <TouchableOpacity onPress={() => handleEdit(v)} style={styles.actionBtn}>
                                    <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(v.id!)} style={styles.actionBtn}>
                                    <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
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
    inputCard: { backgroundColor: COLORS.secondary, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border },
    label: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 8 },
    input: { backgroundColor: COLORS.background, borderRadius: 12, padding: 15, color: COLORS.text, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
    brandContainer: { marginBottom: 15 },
    brandChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, backgroundColor: COLORS.background, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
    selectedChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    brandChipText: { color: COLORS.textSecondary, fontSize: 14 },
    selectedChipText: { color: 'white', fontWeight: 'bold' },
    row: { flexDirection: 'row' },
    btnRow: { flexDirection: 'row', marginTop: 5 },
    saveBtn: { flex: 2, backgroundColor: COLORS.primary, borderRadius: 12, padding: 15, alignItems: 'center' },
    saveBtnText: { color: 'white', fontWeight: 'bold' },
    cancelBtn: { flex: 1, backgroundColor: 'transparent', borderRadius: 12, padding: 15, alignItems: 'center', marginLeft: 10, borderWidth: 1, borderColor: COLORS.border },
    cancelBtnText: { color: COLORS.textSecondary },
    vehicleItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
    vehicleInfo: { flex: 1 },
    vehicleBrandName: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
    vehiclePlateText: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
    actionRow: { flexDirection: 'row' },
    actionBtn: { marginLeft: 15, padding: 5 },
    emptyView: { padding: 40, alignItems: 'center' },
    emptyText: { color: COLORS.textSecondary },
    logoutBtn: { margin: 20, marginTop: 40, padding: 18, borderRadius: 15, borderWidth: 1, borderColor: COLORS.danger, alignItems: 'center' },
    logoutText: { color: COLORS.danger, fontWeight: 'bold' },
});

