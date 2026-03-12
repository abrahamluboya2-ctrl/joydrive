export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime - using Supabase Auth
// This function is kept for compatibility but Supabase handles OAuth directly
export const getLoginUrl = () => {
  try {
    const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
    const appId = import.meta.env.VITE_APP_ID;
    
    // If environment variables are not set, use default login page
    if (!oauthPortalUrl || !appId) {
      return "/auth/login";
    }
    
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);

    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    // If URL construction fails, fallback to login page
    console.error("Error constructing login URL:", error);
    return "/auth/login";
  }
};
