export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const getDistanceInfo = (userLocation: any, stationLat: number, stationLon: number) => {
    if (!userLocation) return { distance: '-- กม.', time: '-- นาที' };
    const dist = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        stationLat,
        stationLon
    );
    const time = Math.round((dist / 30) * 60); // Assuming 30km/h average in BKK
    return {
        distance: `≈ ${dist.toFixed(1)} กม.`,
        time: `(${time} นาที)`
    };
};
