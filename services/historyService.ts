import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HistoryRecord {
    id: string;
    stationName: string;
    date: string;
    energy: number;
    cost: number;
    duration: string;
}

const STORAGE_KEY = '@charging_history_cache';

const API_URL = 'https://raw.githubusercontent.com/chayanuch1124/Charging-Go/main/assets/data/history.json';

export const HistoryService = {
    /**
     * Fetch history from API/GitHub and cache it in AsyncStorage
     */
    async fetchHistoryFromApi(): Promise<HistoryRecord[]> {
        try {
            // 1. Fetch from URL
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error('Failed to fetch from API');
            }

            const data: HistoryRecord[] = await response.json();

            // 2. Save to AsyncStorage for offline use
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));

            console.log('--- HistoryService: Data fetched and cached! ---');
            return data;
        } catch (error) {
            console.warn('--- HistoryService: Fetch failed, using cache ---', error);
            // 3. If fetch fails, try to return cached data
            return this.getCachedHistory();
        }
    },

    /**
     * Get data from AsyncStorage cache
     */
    async getCachedHistory(): Promise<HistoryRecord[]> {
        try {
            const cachedData = await AsyncStorage.getItem(STORAGE_KEY);
            return cachedData ? JSON.parse(cachedData) : [];
        } catch (error) {
            console.error('--- HistoryService: Error reading cache ---', error);
            return [];
        }
    },

    /**
     * Clear the cache
     */
    async clearCache(): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEY);
    }
};
