import { apiClient, setStoredAuthToken, getStoredAuthToken } from "./client";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  locale?: string;
  is_admin: boolean;
  two_factor_enabled?: boolean;
  roles: string[];
  abilities?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
  device_name?: string;
}

export interface LoginResponse {
  data: {
    user?: UserProfile;
    token?: string | null;
    token_type?: string | null;
    two_factor_required?: boolean;
    two_factor_token?: string;
    expires_in?: number;
  };
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

export interface UserAbilitiesResponse {
  data: {
    roles: string[];
    permissions: string[];
    scopes: Record<string, string>;
    is_admin: boolean;
  };
  meta?: {
    request_id?: string;
  };
}

/**
 * Login via API and save personal access token
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      ...credentials,
      token: true, // Request Bearer token for SPA
    }),
  });

  if (response?.data?.token) {
    setStoredAuthToken(response.data.token);
  }

  return response;
}

/**
 * Verify 2FA challenge code
 */
export async function challenge2fa(
  twoFactorToken: string,
  code: string,
  deviceName = "NextJs-Client"
): Promise<LoginResponse> {
  const response = await apiClient<LoginResponse>("/auth/2fa/challenge", {
    method: "POST",
    body: JSON.stringify({
      two_factor_token: twoFactorToken,
      code,
      device_name: deviceName,
    }),
  });

  if (response?.data?.token) {
    setStoredAuthToken(response.data.token);
  }

  return response;
}

/**
 * Use 2FA recovery code
 */
export async function recovery2fa(
  twoFactorToken: string,
  recoveryCode: string,
  deviceName = "NextJs-Client"
): Promise<LoginResponse> {
  const response = await apiClient<LoginResponse>("/auth/2fa/recovery", {
    method: "POST",
    body: JSON.stringify({
      two_factor_token: twoFactorToken,
      recovery_code: recoveryCode,
      device_name: deviceName,
    }),
  });

  if (response?.data?.token) {
    setStoredAuthToken(response.data.token);
  }

  return response;
}

/**
 * Fetch authenticated user profile
 */
export async function getMe(): Promise<UserProfile | null> {
  const token = getStoredAuthToken();
  if (!token) return null;

  try {
    const res = await apiClient<{ data: UserProfile }>("/me");
    return res.data;
  } catch {
    // If token expired (401), clean up
    setStoredAuthToken(null);
    return null;
  }
}

let cachedAbilities: UserAbilitiesResponse["data"] | null = null;
let pendingAbilitiesPromise: Promise<UserAbilitiesResponse["data"] | null> | null = null;

/**
 * Fetch user abilities & permission scopes (cached in-memory)
 */
export async function getAbilities(forceRefresh = false): Promise<UserAbilitiesResponse["data"] | null> {
  const token = getStoredAuthToken();
  if (!token) {
    cachedAbilities = null;
    return null;
  }

  if (cachedAbilities && !forceRefresh) {
    return cachedAbilities;
  }

  if (pendingAbilitiesPromise && !forceRefresh) {
    return pendingAbilitiesPromise;
  }

  pendingAbilitiesPromise = apiClient<UserAbilitiesResponse>("/me/abilities")
    .then((res) => {
      cachedAbilities = res.data;
      return res.data;
    })
    .catch(() => null)
    .finally(() => {
      pendingAbilitiesPromise = null;
    });

  return pendingAbilitiesPromise;
}

/**
 * Request password reset link
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await apiClient<{ data: { message: string } }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return res.data;
}

/**
 * Terminate session and revoke API token
 */
export async function logout(): Promise<void> {
  const token = getStoredAuthToken();
  cachedAbilities = null;
  if (token) {
    try {
      await apiClient("/auth/logout", {
        method: "POST",
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  setStoredAuthToken(null);
}
