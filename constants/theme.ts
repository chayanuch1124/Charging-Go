import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#00BD68', // Professional Green
  secondary: '#F8F9FA', // Very Light Grey
  background: '#FFFFFF', // Pure White
  text: '#121212', // Near Black
  textSecondary: '#666666', // Medium Grey
  accent: '#00D1FF',
  success: '#00BD68',
  danger: '#FF4B4B',
  warning: '#FFAC33',
  border: '#EEEEEE',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});

export interface Station {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  status: 'available' | 'busy' | 'offline';
  type: string;
  distance?: string;
}

export interface ChargingHistory {
  id: string;
  stationName: string;
  date: string;
  energy: string;
  cost: string;
  duration: string;
}

export const MOCK_STATIONS: Station[] = [
  {
    id: '1',
    name: 'สถานีชาร์จเซ็นทรัลเวิลด์',
    location: { latitude: 13.7462, longitude: 100.5399 },
    address: 'ชั้น B1 โซนจอดรถสีเขียว',
    status: 'available',
    type: 'DC Fast Charge 120kW',
  },
  {
    id: '2',
    name: 'สยามพารากอน EV Station',
    location: { latitude: 13.7468, longitude: 100.5352 },
    address: 'ชั้น B2 ฝั่งโรงแรมพาร์ค ไฮแอท',
    status: 'busy',
    type: 'AC Type 2 22kW',
  },
  {
    id: '3',
    name: 'ปตท. วิภาวดีรังสิต',
    location: { latitude: 13.8475, longitude: 100.5693 },
    address: 'ปากซอยวิภาวดี 62',
    status: 'available',
    type: 'DC Fast Charge 50kW',
  },
  {
    id: '4',
    name: 'เทสลา ซูเปอร์ชาร์จเจอร์ อารีย์',
    location: { latitude: 13.7796, longitude: 100.5447 },
    address: 'อาคารลาวิลล่า อารีย์',
    status: 'available',
    type: 'Tesla Supercharger 250kW',
  },
];

export const MOCK_HISTORY: ChargingHistory[] = [
  {
    id: 'h1',
    stationName: 'สถานีชาร์จเซ็นทรัลเวิลด์',
    date: '20 ก.พ. 2024',
    energy: '45.5 kWh',
    cost: '341.25 บาท',
    duration: '45 นาที',
  },
  {
    id: 'h2',
    stationName: 'สยามพารากอน EV Station',
    date: '15 ก.พ. 2024',
    energy: '22.0 kWh',
    cost: '165.00 บาท',
    duration: '60 นาที',
  },
];

export const PROMOTIONS = [
  { id: 'p1', title: 'เติมที่ PTT ลด 10%', image: require('../assets/images/promo_ptt.png') },
  { id: 'p2', title: 'สะสมแต้มคูณสองวันหยุด', image: require('../assets/images/promo_double.png') },
  { id: 'p3', title: 'Shell Recharge ส่วนลดพิเศษ', image: require('../assets/images/promo_shell.png') },
  { id: 'p4', title: 'ชาร์จกลางคืนลดครึ่งราคา', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=2072&auto=format&fit=crop' },
  { id: 'p5', title: 'รับฟรี! กาแฟระหว่างรอชาร์จ', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1974&auto=format&fit=crop' },
];
