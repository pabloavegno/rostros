
import type { ListAlbumsResponse } from '../types';

const API_BASE_URL = 'https://photoslibrary.googleapis.com/v1';

export const listAlbums = async (
    accessToken: string, 
    pageToken?: string
): Promise<ListAlbumsResponse> => {
    const params = new URLSearchParams({
        pageSize: '50',
    });
    if (pageToken) {
        params.append('pageToken', pageToken);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/albums?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || `API request failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch albums:", error);
        throw error;
    }
};
