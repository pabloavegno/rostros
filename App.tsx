
import React, { useState, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import AlbumExplorer from './components/AlbumExplorer';
import type { GoogleTokenResponse } from './types';

declare global {
    interface Window {
        google: any;
    }
}

const App: React.FC = () => {
    const [tokenResponse, setTokenResponse] = useState<GoogleTokenResponse | null>(null);

    const handleLoginSuccess = useCallback((response: GoogleTokenResponse) => {
        setTokenResponse(response);
    }, []);

    const handleLogout = useCallback(() => {
        if (tokenResponse) {
            window.google.accounts.oauth2.revoke(tokenResponse.access_token, () => {
                console.log('Token revoked.');
            });
        }
        setTokenResponse(null);
    }, [tokenResponse]);

    if (!tokenResponse) {
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    return <AlbumExplorer tokenResponse={tokenResponse} onLogout={handleLogout} />;
};

export default App;
