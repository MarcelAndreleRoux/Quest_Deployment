import { useAuth } from "react-oidc-context";

export function useAuthState() {
    const auth = useAuth();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const signOutRedirect = () => {
        auth.removeUser();
        const clientId = "8v7j9shv683p12k78rcdmjfl2";
        const logoutUri = baseUrl;
        const cognitoDomain = "https://us-east-1y90morfaw.auth.us-east-1.amazoncognito.com";
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

    const signupRedirect = () => {
        const clientId = "8v7j9shv683p12k78rcdmjfl2";
        const redirectUri = baseUrl;
        const cognitoDomain = "https://us-east-1y90morfaw.auth.us-east-1.amazoncognito.com";
        window.location.href = `${cognitoDomain}/login?client_id=${clientId}&response_type=code&scope=openid+profile+email&redirect_uri=${encodeURIComponent(redirectUri)}&screen_hint=signup`;
    };

    return {
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
        user: auth.user,
        error: auth.error,
        signin: auth.signinRedirect,
        signout: signOutRedirect,
        signup: signupRedirect,
    };
}