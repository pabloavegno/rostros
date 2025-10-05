import React, { useState, useEffect, useCallback } from 'react';
import { listAlbums, PhotosApiError } from '../services/googlePhotosService';
import type { Album, GoogleTokenResponse, ListAlbumsResponse } from '../types';

// --- Helper Components (defined outside to prevent re-creation on re-renders) ---

const Spinner: React.FC = () => (
    <div className="flex justify-center items-center p-8">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

interface AlbumCardProps {
    album: Album;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl">
        <a href={album.productUrl} target="_blank" rel="noopener noreferrer">
            <img 
                src={`${album.coverPhotoBaseUrl}=w400-h300-c`} 
                alt={album.title} 
                className="w-full h-48 object-cover" 
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-white font-semibold truncate group-hover:underline">{album.title || "Untitled Album"}</h3>
                <p className="text-sm text-gray-300">{album.mediaItemsCount || 0} items</p>
            </div>
        </a>
    </div>
);

const EnableApiError: React.FC = () => (
    <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-lg shadow-md max-w-2xl mx-auto">
        <h3 className="text-xl font-bold mb-2">Action Required: Enable the Google Photos API</h3>
        <p className="mb-4">
            To allow this application to view your albums, you must enable the "Photos Library API" in your Google Cloud project.
            This is a one-time setup step.
        </p>
        <a
            href="https://console.cloud.google.com/apis/library/photoslibrary.googleapis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
        >
            Enable API in Google Cloud
        </a>
        <p className="text-xs mt-4">
            After enabling the API, please log out and sign back in. It might take a minute for the change to take effect.
        </p>
    </div>
);

// --- Main Explorer Component ---

interface AlbumExplorerProps {
    tokenResponse: GoogleTokenResponse;
    onLogout: () => void;
}

const AlbumExplorer: React.FC<AlbumExplorerProps> = ({ tokenResponse, onLogout }) => {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorNode, setErrorNode] = useState<React.ReactNode | null>(null);
    const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const fetchAlbums = useCallback(async (token: string, pageToken?: string) => {
        if (pageToken) setIsLoadingMore(true);
        else setLoading(true);

        try {
            const data: ListAlbumsResponse = await listAlbums(token, pageToken);
            setAlbums(prev => [...prev, ...(data.albums || [])]);
            setNextPageToken(data.nextPageToken);
            setErrorNode(null);
        } catch (err) {
            if (err instanceof PhotosApiError && err.isPermissionDenied() && err.message.includes('Photos Library API has not been used')) {
                setErrorNode(<EnableApiError />);
            } else {
                 const message = err instanceof Error ? err.message : 'An unknown error occurred.';
                 const genericError = (
                    <div className="text-center p-8 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">
                        <p className="font-semibold">An Error Occurred</p>
                        <p>{message}</p>
                        <p className="text-sm mt-2">Your session may have expired. Please try logging out and in again.</p>
                    </div>
                );
                setErrorNode(genericError);
            }
            console.error(err);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchAlbums(tokenResponse.access_token);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenResponse]);

    const handleLoadMore = () => {
        if (nextPageToken) {
            fetchAlbums(tokenResponse.access_token, nextPageToken);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-2xl mr-2" role="img" aria-label="photo album">🖼️</span>
                            <h1 className="text-xl font-bold">Album Explorer</h1>
                        </div>
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                 {loading ? (
                    <Spinner />
                ) : errorNode ? (
                    errorNode
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Your Google Photos Albums</h2>
                            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                                Albums automatically created for people & pets are usually listed here.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {albums.map(album => (
                                <AlbumCard key={album.id} album={album} />
                            ))}
                        </div>
                        {nextPageToken && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:focus:ring-offset-gray-900"
                                >
                                    {isLoadingMore ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                        {albums.length === 0 && !loading && (
                           <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg col-span-full">
                                <p className="font-semibold">No Albums Found</p>
                                <p>It looks like you don't have any albums in your Google Photos account.</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AlbumExplorer;
