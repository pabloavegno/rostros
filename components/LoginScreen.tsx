import React, { useCallback, useState } from 'react';
import type { GoogleTokenResponse } from '../types';

const SCOPES = 'https://www.googleapis.com/auth/photoslibrary.readonly https://www.googleapis.com/auth/photoslibrary.sharing';
// IMPORTANT: You must replace this placeholder value with your own Google Client ID.
// Follow the instructions on the login screen if you see a configuration error.
const CLIENT_ID = '446766335213-8t2ms4b9aaio03g827qoc151o99ikf9l.apps.googleusercontent.com';


interface LoginScreenProps {
    onLoginSuccess: (response: GoogleTokenResponse) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [error, setError] = useState<React.ReactNode | null>(null);

    const handleLogin = useCallback(() => {
        setError(null); // Clear previous errors

        // Pre-flight check to ensure the developer has replaced the placeholder client ID.
        if (CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID_HERE')) {
             setError(
                <>
                    <p className="font-bold mb-2">Configuration Error: Google Client ID is missing!</p>
                    <p className="mb-2">You need to create your own OAuth 2.0 Client ID in the Google Cloud Console and add it to the application code.</p>
                    <p className="font-semibold mt-3 mb-1">Follow these steps:</p>
                    <ol className="list-decimal list-inside space-y-2 text-left">
                        <li>
                            Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Google Cloud Credentials</a> page.
                        </li>
                        <li>Click <strong>"+ CREATE CREDENTIALS"</strong> and select <strong>"OAuth client ID"</strong>.</li>
                        <li>
                            For "Application type", choose <strong>"Web application"</strong>.
                        </li>
                        <li>
                            Under <strong>"Authorized JavaScript origins"</strong>, click "+ ADD URI" and add this app's URL:
                            <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded my-1 text-sm break-all">{window.location.origin}</code>
                        </li>
                         <li>
                            After creating it, copy your new <strong>Client ID</strong>.
                        </li>
                        <li>
                            Paste it into the `CLIENT_ID` constant at the top of the `components/LoginScreen.tsx` file.
                        </li>
                    </ol>
                     <p className="mt-4 text-xs">
                        After updating the code, the app will reload. You can then try signing in again.
                    </p>
                </>
            );
            return;
        }

        try {
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (tokenResponse: GoogleTokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        onLoginSuccess(tokenResponse);
                    } else if(tokenResponse.error) {
                         console.error("Google Auth Error:", tokenResponse);
                         setError(`Google authentication failed: ${tokenResponse.error}. Please check your Client ID configuration.`);
                    }
                },
                error_callback: (error: any) => {
                    console.error("GSI Error:", error);
                    if (error && (error.type === 'popup_closed' || error.type === 'popup_failed_to_open' || error.type === 'token_failed')) {
                        const origin = window.location.origin;
                        setError(
                            <>
                                <p className="font-bold mb-2">Authentication Failed: Let's Troubleshoot</p>
                                <p className="mb-3">The sign-in window closed unexpectedly. This is a common but fixable issue. Let's go through the most likely causes.</p>
                                
                                <div className="space-y-4 text-left">
                                    <div>
                                        <h4 className="font-semibold text-lg">1. The #1 Cause: URL Mismatch</h4>
                                        <p className="text-xs">
                                            The URL in your browser's address bar <strong>must exactly match</strong> one of the URLs in the "Authorized JavaScript origins" list in your Google Cloud credentials. Check for typos, `http` vs `https`, or missing `www`.
                                        </p>
                                        <p className="text-xs mt-1">Your current URL is:</p>
                                        <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded my-1 text-sm break-all">{origin}</code>
                                        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-xs">Verify your Authorized JavaScript origins &rarr;</a>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-lg">2. Google Project Configuration</h4>
                                        <p className="text-xs mb-2">Ensure these two settings are correct in your project:</p>
                                        <ul className="list-disc list-inside text-xs space-y-2">
                                            <li><strong>OAuth Consent Screen:</strong> If your app's "Publishing status" is <strong>Testing</strong>, you MUST add your email to the list of <strong>Test users</strong>.</li>
                                            <li><strong>Enabled API:</strong> Make sure the <strong>Google Photos Library API</strong> is enabled.</li>
                                        </ul>
                                         <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-xs">Check Consent Screen &amp; Test Users &rarr;</a>
                                    </div>

                                     <div>
                                        <h4 className="font-semibold text-lg">3. Browser Environment</h4>
                                        <p className="text-xs mb-2">Sometimes your browser's settings can interfere with the login popup:</p>
                                         <ul className="list-disc list-inside text-xs space-y-2">
                                            <li><strong>Popup Blockers:</strong> Disable any popup blockers for this site.</li>
                                            <li><strong>Browser Extensions:</strong> Temporarily disable ad blockers or privacy-focused extensions, as they can block the sign-in process.</li>
                                            <li><strong>Third-Party Cookies:</strong> Google's login requires third-party cookies. Ensure they are not blocked by your browser settings.</li>
                                            <li><strong>Try Incognito:</strong> Open an Incognito or Private window and try signing in again. This often bypasses issues with extensions and cached data.</li>
                                        </ul>
                                    </div>
                                </div>
                                <p className="mt-4 text-xs text-center">
                                    After making any changes in Google Cloud, wait a minute, then refresh the page and try again.
                                </p>
                            </>
                        );
                    } else {
                        setError('An unexpected error occurred during sign-in. Please try again.');
                    }
                }
            });
            tokenClient.requestAccessToken();
        } catch (err) {
            console.error("Failed to initialize Google Sign-In", err);
            setError('Could not initialize the sign-in process. Please refresh the page.');
        }
    }, [onLoginSuccess]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <div className="mb-8">
                    <span className="text-6xl" role="img" aria-label="photo album">🖼️</span>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-4">
                        Google Photos Album Explorer
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Sign in to securely browse your Google Photos albums and find pictures of people and pets.
                    </p>
                </div>

                {error && (
                    <div className="my-4 p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 rounded-md text-sm" role="alert">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-transform transform hover:scale-105"
                >
                    <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574	l6.19,5.238C39.99,35.536,44,30.169,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default LoginScreen;