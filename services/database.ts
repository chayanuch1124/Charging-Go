import * as SQLite from 'expo-sqlite';

export interface HistoryRecord {
    id?: number;
    stationName: string;
    date: string;
    energy: number; // kWh
    cost: number;
    duration: string;
}

const dbName = 'charging_history.db';

export const initDatabase = async () => {
    const db = await SQLite.openDatabaseAsync(dbName);

    await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY NOT NULL, 
      stationName TEXT NOT NULL, 
      date TEXT NOT NULL, 
      energy REAL NOT NULL, 
      cost REAL NOT NULL, 
      duration TEXT NOT NULL
    );
  `);

    return db;
};

export const fetchHistory = async (): Promise<HistoryRecord[]> => {
    const db = await SQLite.openDatabaseAsync(dbName);
    const allRows = await db.getAllAsync<HistoryRecord>('SELECT * FROM history ORDER BY id DESC');
    return allRows;
};

export const addHistoryRecord = async (record: HistoryRecord) => {
    const db = await SQLite.openDatabaseAsync(dbName);
    const result = await db.runAsync(
        'INSERT INTO history (stationName, date, energy, cost, duration) VALUES (?, ?, ?, ?, ?)',
        [record.stationName, record.date, record.energy, record.cost, record.duration]
    );
    return result.lastInsertRowId;
};

export const seedMockData = async () => {
    const history = await fetchHistory();
    if (history.length === 0) {
        const mockData: HistoryRecord[] = [
            {
                stationName: 'Central World Tower',
                date: '24 Feb 2026, 14:30',
                energy: 25.5,
                cost: 127.5,
                duration: '45 min'
            },
            {
                stationName: 'Siam Paragon G Floor',
                date: '22 Feb 2026, 10:15',
                energy: 18.2,
                cost: 91.0,
                duration: '32 min'
            },
            {
                stationName: 'MBK Center B1',
                date: '20 Feb 2026, 18:45',
                energy: 30.0,
                cost: 150.0,
                duration: '55 min'
            },
            {
                stationName: 'PTT Station Vibhavadi',
                date: '18 Feb 2026, 08:20',
                energy: 12.4,
                cost: 62.0,
                duration: '22 min'
            }
        ];

        for (const item of mockData) {
            await addHistoryRecord(item);
        }
        console.log('--- SQLite: Mock data seeded successfully! ---');
    } else {
        console.log(`--- SQLite: Found ${history.length} records in database. ---`);
    }

    /**
     * Note for SQLite Viewer:
     * - iOS Simulator: /Users/<user>/Library/Developer/CoreSimulator/Devices/<device-id>/data/Containers/Data/Application/<app-id>/Documents/SQLite/charging_history.db
     * - Android Emulator: /data/data/<package-name>/databases/charging_history.db
     * - Web: Uses IndexedDB (Open DevTools -> Application -> IndexedDB)
     */
};
