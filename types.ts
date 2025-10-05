
export interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    error?: string;
}

export interface Album {
    id: string;
    title: string;
    productUrl: string;
    mediaItemsCount: string;
    coverPhotoBaseUrl: string;
    coverPhotoMediaItemId: string;
}

export interface ListAlbumsResponse {
    albums?: Album[];
    nextPageToken?: string;
}
