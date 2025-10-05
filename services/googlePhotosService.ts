import type { ListAlbumsResponse } from '../types';

const API_BASE_URL = 'https://photoslibrary.googleapis.com/v1';

/**
 * Custom error class for detailed Google Photos API errors.
 */
export class PhotosApiError extends Error {
    public status: string;
    public code: number;

    constructor(message: string, status: string, code: number) {
        super(message);
        this.name = 'PhotosApiError';
        this.status = status;
        this.code = code;
        // Allows for 'instanceof PhotosApiError' to work correctly
        Object.setPrototypeOf(this, PhotosApiError.prototype);
    }

    /**
     * Checks if the error is due to a permission issue.
     */
    isPermissionDenied(): boolean {
        return this.status === 'PERMISSION_DENIED';
    }
}


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
            const errorDetails = errorData.error || {};
            throw new PhotosApiError(
                errorDetails.message || `API request failed with status ${response.status}`,
                errorDetails.status || 'UNKNOWN_STATUS',
                errorDetails.code || response.status
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch albums:", error);
        throw error;
    }
};
