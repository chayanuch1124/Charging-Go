import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    STATIONS_CACHE: 'stations_cache',
    USER_PREFS: 'user_preferences',
    LAST_UPDATE: 'last_stations_update',
};

export const StorageService = {
    // --- Station Caching ---
    async cacheStations(stations: any[]) {
        try {
            await AsyncStorage.setItem(KEYS.STATIONS_CACHE, JSON.stringify(stations));
            await AsyncStorage.setItem(KEYS.LAST_UPDATE, Date.now().toString());
        } catch (e) {
            console.error('Error caching stations:', e);
        }
    },

    async getCachedStations() {
        try {
            const data = await AsyncStorage.getItem(KEYS.STATIONS_CACHE);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error getting cached stations:', e);
            return null;
        }
    },

    // --- User Preferences ---
    async saveUserPreferences(prefs: object) {
        try {
            const current = await this.getUserPreferences();
            const updated = { ...current, ...prefs };
            await AsyncStorage.setItem(KEYS.USER_PREFS, JSON.stringify(updated));
        } catch (e) {
            console.error('Error saving user preferences:', e);
        }
    },

    async getUserPreferences() {
        try {
            const data = await AsyncStorage.getItem(KEYS.USER_PREFS);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Error getting user preferences:', e);
            return {};
        }
    },

    // --- General ---
    async clearAll() {
        try {
            await AsyncStorage.clear();
        } catch (e) {
            console.error('Error clearing storage:', e);
        }
    }
};
