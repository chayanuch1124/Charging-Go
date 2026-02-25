import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@charging_stations_favorites';

export const FavoritesService = {
    /**
     * Get all favorite station IDs
     */
    async getFavorites(): Promise<string[]> {
        try {
            const data = await AsyncStorage.getItem(FAVORITES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('--- FavoritesService: Error getting favorites ---', error);
            return [];
        }
    },

    /**
     * Toggle a station ID in the favorites list
     */
    async toggleFavorite(id: string): Promise<string[]> {
        try {
            const favorites = await this.getFavorites();
            const index = favorites.indexOf(id);
            let updatedFavorites;

            if (index > -1) {
                // Remove from favorites
                updatedFavorites = favorites.filter(favId => favId !== id);
            } else {
                // Add to favorites
                updatedFavorites = [...favorites, id];
            }

            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
            return updatedFavorites;
        } catch (error) {
            console.error('--- FavoritesService: Error toggling favorite ---', error);
            return [];
        }
    },

    /**
     * Check if a station ID is in favorites
     */
    async isFavorite(id: string): Promise<boolean> {
        const favorites = await this.getFavorites();
        return favorites.includes(id);
    }
};
