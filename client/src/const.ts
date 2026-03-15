export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Simple login URL - using Supabase Auth directly
// This avoids URL construction errors with missing environment variables
export const getLoginUrl = () => {
  return "/auth/login";
};
