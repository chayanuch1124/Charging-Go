import { StorageService } from './storage';

export interface ChargingStation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    status: 'available' | 'busy' | 'offline';
    plugType: string[];
}

const MOCK_DATA: ChargingStation[] = [
    { id: '1', name: 'Central World Tower', latitude: 13.7462, longitude: 100.5399, address: 'Pathum Wan, Bangkok', status: 'available', plugType: ['Type 2', 'CCS2'] },
    { id: '2', name: 'Siam Paragon G Floor', latitude: 13.7468, longitude: 100.5352, address: 'Siam Square, Bangkok', status: 'busy', plugType: ['CCS2', 'CHAdeMO'] },
    { id: '3', name: 'Siam Center Parking', latitude: 13.7465, longitude: 100.5328, address: 'Pathum Wan, Bangkok', status: 'available', plugType: ['Type 2'] },
    { id: '4', name: 'MBK Center B1', latitude: 13.7445, longitude: 100.5299, address: 'Phayathai Rd, Bangkok', status: 'available', plugType: ['CCS2'] },
    { id: '21', name: 'PTT Station Vibhavadi', latitude: 13.8475, longitude: 100.5693, address: 'Chatuchak, Bangkok', status: 'available', plugType: ['DC Fast', 'Type 2'] },
];

export const fetchChargingStations = async (forceRefresh: boolean = false): Promise<ChargingStation[]> => {
    // 1. Try to get from Cache first if not forcing refresh
    if (!forceRefresh) {
        const cached = await StorageService.getCachedStations();
        if (cached) {
            console.log('Serving from cache...');
            // Trigger a background refresh
            refreshCacheInBackground();
            return cached;
        }
    }

    // 2. Perform Fetch (Simulated for now, replace URL with real endpoint)
    try {
        console.log('Fetching from network...');
        // Example of a real fetch call:
        // const response = await fetch('https://api.example.com/stations');
        // const data = await response.json();

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        const data = MOCK_DATA;

        // 3. Save to Cache
        await StorageService.cacheStations(data);
        return data;
    } catch (error) {
        console.error('Fetch failed:', error);
        // Fallback to cache or empty
        return await StorageService.getCachedStations() || [];
    }
};

const refreshCacheInBackground = async () => {
    try {
        // Just call fetch with forceRefresh=true but don't return anything
        const data = MOCK_DATA; // Replace with real fetch
        await new Promise(resolve => setTimeout(resolve, 800));
        await StorageService.cacheStations(data);
        console.log('Background cache refreshed.');
    } catch (e) {
        console.error('Background refresh failed');
    }
};

