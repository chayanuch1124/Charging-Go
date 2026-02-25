import { StorageService } from './storage';

export interface Connector {
    id: string;
    type: 'AC Type 2' | 'DC CCS Combo 2' | 'DC CHAdeMO';
    position: string; // ซ้าย, กลาง, ขวา, A, B
    label: string;
    power: number; // kW
    price: number; // B/kWh
    status: 'available' | 'busy' | 'offline';
}

export interface ChargingStation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    status: 'available' | 'busy' | 'offline';
    plugType: string[];
    connectors: Connector[];
    openingHours?: string;
    lastUpdated?: string;
}

const MOCK_DATA: ChargingStation[] = [
    {
        id: '1',
        name: 'พีทีที สเตชั่น บจ.พันธ์เจริญกรุ๊ป (2)',
        latitude: 13.7462,
        longitude: 100.5399,
        address: 'เขตปทุมวัน, กรุงเทพมหานคร',
        status: 'available',
        plugType: ['Type 2', 'CCS2'],
        openingHours: 'เปิด 24 ชั่วโมง',
        lastUpdated: '21:11 น.',
        connectors: [
            { id: 'c1', type: 'AC Type 2', position: 'ซ้าย', label: 'ที-2', power: 22, price: 7.9, status: 'available' },
            { id: 'c2', type: 'DC CCS Combo 2', position: 'กลาง', label: 'A', power: 120, price: 7.9, status: 'available' },
            { id: 'c3', type: 'DC CCS Combo 2', position: 'ขวา', label: 'B', power: 120, price: 7.9, status: 'busy' },
        ]
    },
    {
        id: '2',
        name: 'Siam Paragon G Floor',
        latitude: 13.7468,
        longitude: 100.5352,
        address: 'Siam Square, Bangkok',
        status: 'busy',
        plugType: ['CCS2', 'CHAdeMO'],
        openingHours: '10:00 - 22:00',
        lastUpdated: '21:10 น.',
        connectors: [
            { id: 'c4', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 150, price: 8.5, status: 'busy' },
            { id: 'c5', type: 'DC CHAdeMO', position: 'B', label: '1', power: 50, price: 8.5, status: 'available' },
        ]
    },
    {
        id: '3',
        name: 'Siam Center Parking',
        latitude: 13.7465,
        longitude: 100.5328,
        address: 'Pathum Wan, Bangkok',
        status: 'available',
        plugType: ['Type 2'],
        connectors: [
            { id: 'c6', type: 'AC Type 2', position: 'A', label: '1', power: 22, price: 7.5, status: 'available' },
        ]
    },
    {
        id: '4',
        name: 'Central Rama 9 B2',
        latitude: 13.7588,
        longitude: 100.5661,
        address: 'ถ.รัชดาภิเษก, ดินแดง',
        status: 'available',
        plugType: ['CCS2', 'Type 2'],
        connectors: [
            { id: 'c7', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 120, price: 7.9, status: 'available' },
            { id: 'c8', type: 'AC Type 2', position: 'B', label: '1', power: 22, price: 7.9, status: 'available' },
        ]
    },
    {
        id: '5',
        name: 'The EmQuartier',
        latitude: 13.7317,
        longitude: 100.5683,
        address: 'ถ.สุขุมวิท, คลองเตย',
        status: 'busy',
        plugType: ['CCS2'],
        connectors: [
            { id: 'c9', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 150, price: 8.9, status: 'busy' },
        ]
    },
    {
        id: '6',
        name: 'Icon Siam Parking',
        latitude: 13.7267,
        longitude: 100.5106,
        address: 'ถ.เจริญนคร, คลองสาน',
        status: 'available',
        plugType: ['CCS2', 'CHAdeMO'],
        connectors: [
            { id: 'c10', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 120, price: 8.0, status: 'available' },
            { id: 'c11', type: 'DC CHAdeMO', position: 'B', label: '1', power: 50, price: 8.0, status: 'available' },
        ]
    },
    {
        id: '7',
        name: 'Bangchak Srinakarin',
        latitude: 13.6823,
        longitude: 100.6457,
        address: 'ถ.ศรีนครินทร์, ประเวศ',
        status: 'available',
        plugType: ['DC Fast'],
        connectors: [
            { id: 'c12', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 100, price: 7.5, status: 'available' },
        ]
    },
    {
        id: '8',
        name: 'PTT Station Bang Na Outbound',
        latitude: 13.6672,
        longitude: 100.6358,
        address: 'ถ.บางนา-ตราด, บางนา',
        status: 'available',
        plugType: ['CCS2', 'Type 2'],
        connectors: [
            { id: 'c13', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 120, price: 7.7, status: 'available' },
            { id: 'c14', type: 'AC Type 2', position: 'B', label: '1', power: 22, price: 7.7, status: 'available' },
        ]
    },
    {
        id: '9',
        name: 'Shell Helix Ngamwongwan',
        latitude: 13.8589,
        longitude: 100.5401,
        address: 'ถ.งามวงศ์วาน, นนทบุรี',
        status: 'busy',
        plugType: ['CCS2'],
        connectors: [
            { id: 'c15', type: 'DC CCS Combo 2', position: 'A', label: 'RE', power: 180, price: 8.2, status: 'busy' },
        ]
    },
    {
        id: '10',
        name: 'PEA Volta Mega Bangna',
        latitude: 13.6458,
        longitude: 100.6802,
        address: 'บางแก้ว, สมุทรปราการ',
        status: 'available',
        plugType: ['CCS2', 'CHAdeMO', 'Type 2'],
        connectors: [
            { id: 'c16', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 120, price: 7.9, status: 'available' },
            { id: 'c17', type: 'DC CHAdeMO', position: 'B', label: '1', power: 50, price: 7.9, status: 'available' },
            { id: 'c18', type: 'AC Type 2', position: 'C', label: '1', power: 22, price: 7.9, status: 'available' },
        ]
    },
    {
        id: '11',
        name: 'PTT Station Kanchanaphisek',
        latitude: 13.8123,
        longitude: 100.4123,
        address: 'บางกรวย, นนทบุรี',
        status: 'available',
        plugType: ['CCS2'],
        connectors: [
            { id: 'c19', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 120, price: 7.5, status: 'available' },
        ]
    },
    {
        id: '12',
        name: 'Susco Phutthamonthon Sai 4',
        latitude: 13.7654,
        longitude: 100.3211,
        address: 'สามพราน, นครปฐม',
        status: 'available',
        plugType: ['CCS2', 'Type 2'],
        connectors: [
            { id: 'c20', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 100, price: 7.2, status: 'available' },
            { id: 'c21', type: 'AC Type 2', position: 'B', label: '1', power: 22, price: 7.2, status: 'available' },
        ]
    },
    {
        id: '13',
        name: 'Evolt Central Westgate',
        latitude: 13.8765,
        longitude: 100.4111,
        address: 'บางใหญ่, นนทบุรี',
        status: 'available',
        plugType: ['CCS2', 'Type 2'],
        connectors: [
            { id: 'c22', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 120, price: 7.9, status: 'available' },
            { id: 'c23', type: 'AC Type 2', position: 'B', label: '1', power: 43, price: 7.9, status: 'available' },
        ]
    },
    {
        id: '14',
        name: 'Charge+ HomePro Rama 3',
        latitude: 13.6923,
        longitude: 100.5234,
        address: 'ถ.พระราม 3, บางคอแหลม',
        status: 'busy',
        plugType: ['CCS2'],
        connectors: [
            { id: 'c24', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 60, price: 7.5, status: 'busy' },
        ]
    },
    {
        id: '15',
        name: 'MG Super Charge Phahonyothin',
        latitude: 13.8234,
        longitude: 100.5645,
        address: 'จตุจักร, กรุงเทพฯ',
        status: 'available',
        plugType: ['CCS2'],
        connectors: [
            { id: 'c25', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 120, price: 7.0, status: 'available' },
        ]
    },
    {
        id: '16',
        name: 'Gwm Charge Gateway Bangna',
        latitude: 13.6745,
        longitude: 100.6123,
        address: 'บางนา, กรุงเทพฯ',
        status: 'available',
        plugType: ['CCS2', 'Type 2'],
        connectors: [
            { id: 'c26', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 120, price: 7.9, status: 'available' },
            { id: 'c27', type: 'AC Type 2', position: 'B', label: '1', power: 22, price: 7.9, status: 'available' },
        ]
    },
    {
        id: '17',
        name: 'Caltex Tiwanon',
        latitude: 13.9123,
        longitude: 100.5234,
        address: 'ถ.ติวานนท์, ปากเกร็ด',
        status: 'available',
        plugType: ['CCS2', 'CHAdeMO'],
        connectors: [
            { id: 'c28', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 100, price: 7.5, status: 'available' },
            { id: 'c29', type: 'DC CHAdeMO', position: 'B', label: '1', power: 50, price: 7.5, status: 'available' },
        ]
    },
    {
        id: '18',
        name: 'PTT Station Lam Lukka Klong 4',
        latitude: 13.9345,
        longitude: 100.6876,
        address: 'ลำลูกกา, ปทุมธานี',
        status: 'available',
        plugType: ['CCS2', 'Type 2'],
        connectors: [
            { id: 'c30', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 120, price: 7.5, status: 'available' },
            { id: 'c31', type: 'AC Type 2', position: 'B', label: '1', power: 22, price: 7.5, status: 'available' },
        ]
    },
    {
        id: '19',
        name: 'Bangchak Vibhavadi 60',
        latitude: 13.8654,
        longitude: 100.5876,
        address: 'ถ.วิภาวดีรังสิต, หลักสี่',
        status: 'busy',
        plugType: ['CCS2'],
        connectors: [
            { id: 'c32', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 120, price: 7.9, status: 'busy' },
        ]
    },
    {
        id: '20',
        name: 'Susco Ratchaphruek',
        latitude: 13.8234,
        longitude: 100.4567,
        address: 'ถ.ราชพฤกษ์, ปากเกร็ด',
        status: 'available',
        plugType: ['CCS2', 'Type 2'],
        connectors: [
            { id: 'c33', type: 'DC CCS Combo 2', position: 'A', label: '1', power: 100, price: 7.5, status: 'available' },
            { id: 'c34', type: 'AC Type 2', position: 'B', label: '1', power: 22, price: 7.5, status: 'available' },
        ]
    },
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

    // 2. Perform Fetch (Real API Call)
    try {
        console.log('Fetching from network...');

        // ทดสอบดึงข้อมูลจาก API จริง (JSONPlaceholder) และแปลงข้อมูลให้เข้ากับ Mobile App ของเรา
        const API_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=8';

        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawData = await response.json();

        // แปลงข้อมูล (Mapping) จาก API ให้เป็นรูปแบบ ChargingStation
        const data: ChargingStation[] = rawData.map((item: any, index: number) => ({
            id: item.id.toString(),
            name: `สถานี: ${item.title.substring(0, 15)}...`,
            latitude: 13.75 + (index * 0.005), // จำลองพิกัดในกรุงเทพฯ
            longitude: 100.50 + (index * 0.005),
            address: `เขตปทุมวัน, กรุงเทพมหานคร (ข้อมูลจาก API)`,
            status: index % 3 === 0 ? 'busy' : 'available',
            plugType: index % 2 === 0 ? ['CCS2', 'Type 2'] : ['Type 2'],
            openingHours: 'เปิด 24 ชั่วโมง',
            lastUpdated: '12:00 น.',
            connectors: [
                { id: `c${item.id}-1`, type: 'DC CCS Combo 2', position: 'A', label: '1', power: 120, price: 7.9, status: index % 3 === 0 ? 'busy' : 'available' },
                { id: `c${item.id}-2`, type: 'AC Type 2', position: 'B', label: '1', power: 22, price: 7.9, status: 'available' },
            ]
        }));

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

