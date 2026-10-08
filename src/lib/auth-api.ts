import { API_URL } from '@/constants/api';

export type Profile = {
  username: string;
  email: string;
  displayName: string;
  birthday: string | null;
  profilePicUrl: string;
  bio: string;
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  profile: Profile;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

type ApiErrorBody = {
  detail?: string;
  non_field_errors?: string[];
  [key: string]: unknown;
};

function authHeaders(token?: string) {
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

function readApiError(body: ApiErrorBody) {
  if (body.detail) return body.detail;
  if (body.non_field_errors?.length) return body.non_field_errors[0];

  const firstFieldError = Object.values(body).find(
    (value): value is string[] => Array.isArray(value) && typeof value[0] === 'string',
  );
  return firstFieldError?.[0] ?? 'Something went wrong. Please try again.';
}

async function readApiBody(response: Response) {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return null;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...authHeaders(token),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Unable to reach the server. Check your connection and try again.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await readApiBody(response);
  if (!data) {
    throw new Error('Something went wrong. Please try again.');
  }

  if (!response.ok) {
    throw new Error(readApiError(data));
  }

  return data as T;
}

export function login(identifier: string, password: string) {
  return apiFetch<AuthResponse>('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
}

export function register(
  username: string,
  email: string,
  password: string,
  confirmPassword: string,
  displayName: string,
) {
  return apiFetch<AuthResponse>('/api/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, confirmPassword, displayName }),
  });
}

export function getCurrentUser(token: string) {
  return apiFetch<AuthUser>('/api/auth/me/', {}, token);
}

export function logout(token: string) {
  return apiFetch<void>('/api/auth/logout/', { method: 'POST' }, token);
}
