import { supabase } from '../lib/supabase';

export interface Vehicle {
    id?: string;
    brand: string;
    model: string;
    license_plate: string;
    province: string;
    created_at?: string;
}

export const VehicleService = {
    async getVehicles(): Promise<Vehicle[]> {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching vehicles:', error);
            throw error;
        }
        return data || [];
    },

    async addVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at'>): Promise<Vehicle> {
        const { data, error } = await supabase
            .from('vehicles')
            .insert([vehicle])
            .select()
            .single();

        if (error) {
            console.error('Error adding vehicle:', error);
            throw error;
        }
        return data;
    },

    async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
        const { data, error } = await supabase
            .from('vehicles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating vehicle:', error);
            throw error;
        }
        return data;
    },

    async deleteVehicle(id: string): Promise<void> {
        const { error } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting vehicle:', error);
            throw error;
        }
    }
};
