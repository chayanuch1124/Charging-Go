import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#00BD68', // Green from theme
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'หน้าแรก',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'แผนที่',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "map" : "map-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'สแกน',
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.scanButtonContainer}>
                            <View style={styles.scanButton}>
                                <MaterialCommunityIcons name="qrcode-scan" size={28} color="white" />
                            </View>
                        </View>
                    ),
                    tabBarLabelStyle: { display: 'none' }, // Hide label for scan
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'ประวัติ',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "time" : "time-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: 'บัญชี',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#FFFFFF',
        height: 70,
        paddingBottom: 10,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    tabBarLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
    scanButtonContainer: {
        top: -15, // Floating effect
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#00BD68', // Professional Green
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#00BD68',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
});
