import { supabase } from '../lib/supabase';

export interface Profile {
    id: string;
    username: string | null;
    avatar_url: string | null;
    updated_at?: string;
}

export const ProfileService = {
    async getProfile(userId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            console.error('Error fetching profile:', error);
            throw error;
        }
        return data;
    },

    async updateProfile(profile: Profile): Promise<Profile> {
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                ...profile,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
        return data;
    },

    async uploadAvatar(userId: string, imageUri: string, base64?: string): Promise<string> {
        const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        let uploadData: any;

        if (base64) {
            console.log('ProfileService: Received base64 data, length:', base64.length);
            // Robust Base64 to Uint8Array for React Native
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            const lookup = new Uint8Array(256);
            for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;

            const decode = (base64Str: string) => {
                let bufferLength = base64Str.length * 0.75;
                let len = base64Str.length;
                let p = 0;
                let encoded1, encoded2, encoded3, encoded4;

                if (base64Str[base64Str.length - 1] === "=") {
                    bufferLength--;
                    if (base64Str[base64Str.length - 2] === "=") bufferLength--;
                }

                const arrayBuffer = new Uint8Array(bufferLength);
                for (let i = 0; i < len; i += 4) {
                    encoded1 = lookup[base64Str.charCodeAt(i)];
                    encoded2 = lookup[base64Str.charCodeAt(i + 1)];
                    encoded3 = lookup[base64Str.charCodeAt(i + 2)];
                    encoded4 = lookup[base64Str.charCodeAt(i + 3)];

                    arrayBuffer[p++] = (encoded1 << 2) | (encoded2 >> 4);
                    arrayBuffer[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
                    arrayBuffer[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
                }
                return arrayBuffer;
            };

            uploadData = decode(base64);
            console.log('ProfileService: Decoded data size:', uploadData.length, 'bytes');
        } else {
            console.log('ProfileService: Missing base64, falling back to XHR');
            uploadData = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resolve(xhr.response);
                };
                xhr.onerror = function (e) {
                    console.error('XHR Error:', e);
                    reject(new TypeError("Network request failed"));
                };
                xhr.responseType = "blob";
                xhr.open("GET", imageUri, true);
                xhr.send(null);
            });
        }

        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, uploadData, {
                cacheControl: '3600',
                upsert: true,
                contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`
            });

        if (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        return publicUrl;
    }
};
