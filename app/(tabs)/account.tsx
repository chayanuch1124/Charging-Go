import { COLORS, globalStyles } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Profile, ProfileService } from '@/services/profileService';
import { Vehicle, VehicleService } from '@/services/vehicleService';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CAR_BRANDS = ['Tesla', 'BYD', 'MG', 'GWM', 'BMW', 'Mercedes-Benz', 'Volvo', 'Hyundai', 'Other'];
const AC_CONNECTORS = ['None', 'Type 2', 'Type 1', 'GB/T'];
const DC_CONNECTORS = ['None', 'CCS2', 'CHAdeMO', 'GB/T'];

export default function AccountScreen() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentVehicle, setCurrentVehicle] = useState<Partial<Vehicle>>({
        brand: 'Tesla',
        model: '',
        license_plate: '',
        province: '',
        connector_ac: 'Type 2',
        connector_dc: 'CCS2',
    });
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [tempUsername, setTempUsername] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                const userId = user?.id || '00000000-0000-0000-0000-000000000000'; // Fallback for dev
                await loadProfile(userId);
            } catch (error) {
                console.error('Init error:', error);
                await loadProfile('00000000-0000-0000-0000-000000000000');
            }
            loadVehicles();
        };
        init();
    }, []);

    const loadProfile = async (userId: string) => {
        try {
            const data = await ProfileService.getProfile(userId);
            if (data) {
                setProfile(data);
                setTempUsername(data.username || '');
            } else {
                // Create profile if doesn't exist
                const newProfile = await ProfileService.updateProfile({
                    id: userId,
                    username: 'ผู้ใช้งานใหม่',
                    avatar_url: null
                });
                setProfile(newProfile);
                setTempUsername(newProfile.username || '');
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets[0].uri) {
                setIsUploading(true);
                const targetId = profile?.id || '00000000-0000-0000-0000-000000000000';
                const publicUrl = await ProfileService.uploadAvatar(targetId, result.assets[0].uri, result.assets[0].base64 || undefined);

                const updatedProfile: Profile = {
                    id: targetId,
                    username: tempUsername || 'ผู้ใช้งานใหม่',
                    avatar_url: publicUrl
                };

                await ProfileService.updateProfile(updatedProfile);
                setProfile(updatedProfile);
                Alert.alert('สำเร็จ', 'อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว');
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัปโหลดรูปภาพได้ กรุณาตรวจสอบการตั้งค่า Supabase Storage');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        const targetId = profile?.id || '00000000-0000-0000-0000-000000000000';
        try {
            const updatedProfile: Profile = {
                id: targetId,
                username: tempUsername,
                avatar_url: profile?.avatar_url || null
            };
            const result = await ProfileService.updateProfile(updatedProfile);
            setProfile(result);
            setIsEditingProfile(false);
            Alert.alert('สำเร็จ', 'อัปเดตชื่อผู้ใช้งานเรียบร้อยแล้ว');
        } catch (error) {
            console.error('Save profile error:', error);
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        }
    };

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
        setCurrentVehicle({
            brand: 'Tesla',
            model: '',
            license_plate: '',
            province: '',
            connector_ac: 'Type 2',
            connector_dc: 'CCS2'
        });
        setIsEditing(false);
    };

    return (
        <ScrollView style={globalStyles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickImage} disabled={isUploading}>
                    <View style={styles.avatar}>
                        {isUploading ? (
                            <ActivityIndicator color={COLORS.primary} />
                        ) : profile?.avatar_url ? (
                            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                        ) : (
                            <Ionicons name="person" size={50} color={COLORS.primary} />
                        )}
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera" size={16} color="white" />
                        </View>
                    </View>
                </TouchableOpacity>

                {isEditingProfile ? (
                    <View style={styles.editUsernameRow}>
                        <TextInput
                            style={styles.usernameInput}
                            value={tempUsername}
                            onChangeText={setTempUsername}
                            autoFocus
                        />
                        <TouchableOpacity onPress={handleSaveProfile} style={styles.checkBtn}>
                            <Ionicons name="checkmark-circle" size={28} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsEditingProfile(false)} style={styles.closeBtn}>
                            <Ionicons name="close-circle" size={28} color={COLORS.danger} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.usernameRow}>
                        <Text style={styles.userName}>{profile?.username || 'ผู้ใช้งานทั่วไป'}</Text>
                        <TouchableOpacity onPress={() => setIsEditingProfile(true)} style={styles.editBtn}>
                            <Ionicons name="create-outline" size={18} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>
                )}
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

                    <Text style={styles.label}>หัวชาร์จ AC</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandContainer}>
                        {AC_CONNECTORS.map((c) => (
                            <TouchableOpacity
                                key={c}
                                style={[styles.brandChip, currentVehicle.connector_ac === c && styles.selectedChip]}
                                onPress={() => setCurrentVehicle({ ...currentVehicle, connector_ac: c })}
                            >
                                <Text style={[styles.brandChipText, currentVehicle.connector_ac === c && styles.selectedChipText]}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.label}>หัวชาร์จ DC</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandContainer}>
                        {DC_CONNECTORS.map((c) => (
                            <TouchableOpacity
                                key={c}
                                style={[styles.brandChip, currentVehicle.connector_dc === c && styles.selectedChip]}
                                onPress={() => setCurrentVehicle({ ...currentVehicle, connector_dc: c })}
                            >
                                <Text style={[styles.brandChipText, currentVehicle.connector_dc === c && styles.selectedChipText]}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

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
                                <View style={styles.connectorTags}>
                                    {v.connector_ac && v.connector_ac !== 'None' && (
                                        <View style={styles.tag}>
                                            <Ionicons name="flash-outline" size={10} color={COLORS.primary} />
                                            <Text style={styles.tagText}>AC: {v.connector_ac}</Text>
                                        </View>
                                    )}
                                    {v.connector_dc && v.connector_dc !== 'None' && (
                                        <View style={[styles.tag, { backgroundColor: 'rgba(255, 102, 0, 0.1)' }]}>
                                            <Ionicons name="flash" size={10} color="#FF6600" />
                                            <Text style={[styles.tagText, { color: '#FF6600' }]}>DC: {v.connector_dc}</Text>
                                        </View>
                                    )}
                                </View>
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
    avatarWrapper: { marginBottom: 15 },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0, 255, 157, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary, position: 'relative' },
    avatarImage: { width: 96, height: 96, borderRadius: 48 },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.secondary },
    userName: { color: COLORS.text, fontSize: 22, fontWeight: 'bold' },
    usernameRow: { flexDirection: 'row', alignItems: 'center' },
    editBtn: { marginLeft: 10 },
    editUsernameRow: { flexDirection: 'row', alignItems: 'center', width: '80%', justifyContent: 'center' },
    usernameInput: { flex: 1, backgroundColor: COLORS.background, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 8, color: COLORS.text, fontSize: 18, borderWidth: 1, borderColor: COLORS.border },
    checkBtn: { marginLeft: 10 },
    closeBtn: { marginLeft: 5 },
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
    vehiclePlateText: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4, marginBottom: 8 },
    connectorTags: { flexDirection: 'row', flexWrap: 'wrap' },
    tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 189, 104, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8, marginTop: 4 },
    tagText: { fontSize: 10, color: COLORS.primary, fontWeight: 'bold', marginLeft: 4 },
    actionRow: { flexDirection: 'row' },
    actionBtn: { marginLeft: 15, padding: 5 },
    emptyView: { padding: 40, alignItems: 'center' },
    emptyText: { color: COLORS.textSecondary },
    logoutBtn: { margin: 20, marginTop: 40, padding: 18, borderRadius: 15, borderWidth: 1, borderColor: COLORS.danger, alignItems: 'center' },
    logoutText: { color: COLORS.danger, fontWeight: 'bold' },
});

