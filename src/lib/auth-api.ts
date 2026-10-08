import { API_URL } from '@/constants/api';

export type Profile = {
  username: string;
  email: string;
  displayName: string;
  birthday: string | null;
  showAge: boolean;
  showBirthday: boolean;
  profilePicUrl: string;
  bio: string;
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  profile: Profile;
};

export type UserGroup = {
  id: number;
  name: string;
  description: string;
  members: GroupMember[];
  createdAt: string;
};

export type UserPost = {
  id: number;
  author: {
    id: number;
    username: string;
  };
  group: number;
  createdAt: string;
  content: string;
  editedAt: string | null;
};

export type GroupMember = {
  id: number;
  username: string;
  profile: {
    displayName: string;
    birthday: string | null;
    showAge: boolean;
    showBirthday: boolean;
  };
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

function authHeaders(token?: string, isFormData = false) {
  return {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

function readApiError(body: ApiErrorBody) {
  if (body.detail) return body.detail;
  if (body.non_field_errors?.length) return body.non_field_errors[0];

  const firstFieldError = Object.values(body).find(
    (value): value is string | string[] => (
      typeof value === 'string' || (Array.isArray(value) && typeof value[0] === 'string')
    ),
  );
  if (Array.isArray(firstFieldError)) return firstFieldError[0];
  return firstFieldError ?? 'Something went wrong. Please try again.';
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
        ...authHeaders(token, options.body instanceof FormData),
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

export function resetPassword(identifier: string, password: string, confirmPassword: string) {
  return apiFetch<{ detail: string }>('/api/auth/reset-password/', {
    method: 'POST',
    body: JSON.stringify({ identifier, password, confirmPassword }),
  });
}

export function checkResetIdentifier(identifier: string) {
  return apiFetch<{ detail: string }>('/api/auth/reset-password/check/', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
  });
}

export function googleLogin(idToken: string) {
  return apiFetch<AuthResponse>('/api/auth/google/', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export function googleLoginWithCode(
  code: string,
  codeVerifier: string,
  redirectUri: string,
  clientId: string,
) {
  return apiFetch<AuthResponse>('/api/auth/google/', {
    method: 'POST',
    body: JSON.stringify({ code, codeVerifier, redirectUri, clientId }),
  });
}

export function getCurrentUser(token: string) {
  return apiFetch<AuthUser>('/api/auth/me/', {}, token);
}

export function getProfile(token: string) {
  return apiFetch<Profile>('/api/profile/', {}, token);
}

export function getGroups(token: string) {
  return apiFetch<UserGroup[]>('/api/groups/', {}, token);
}

export function createGroup(
  token: string,
  group: Pick<UserGroup, 'name' | 'description'>,
) {
  return apiFetch<UserGroup>('/api/groups/', {
    method: 'POST',
    body: JSON.stringify(group),
  }, token);
}

export function getGroup(token: string, groupId: number) {
  return apiFetch<UserGroup>(`/api/groups/${groupId}/`, {}, token);
}

export function getGroupPosts(token: string, groupId: number) {
  return apiFetch<UserPost[]>(`/api/groups/${groupId}/posts/`, {}, token);
}

export function createPost(
  token: string,
  groupId: number,
  post: Pick<UserPost, 'content' | 'createdAt'>,
) {
  return apiFetch<UserPost>(`/api/groups/${groupId}/posts/`, {
    method: 'POST',
    body: JSON.stringify(post),
  }, token);
}

export function deletePost(token: string, postId: number) {
  return apiFetch<void>(`/api/posts/${postId}/`, {
    method: 'DELETE',
  }, token);
}

export function updatePost(token: string, postId: number, content: string, createdAt: string) {
  return apiFetch<UserPost>(`/api/posts/${postId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ content, createdAt }),
  }, token);
}

export function updateGroup(
  token: string,
  groupId: number,
  updates: Pick<UserGroup, 'name' | 'description'>,
) {
  return apiFetch<UserGroup>(`/api/groups/${groupId}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }, token);
}

export function deleteGroup(token: string, groupId: number) {
  return apiFetch<void>(`/api/groups/${groupId}/`, {
    method: 'DELETE',
  }, token);
}

export function updateProfile(
  token: string,
  profile: Pick<Profile, 'username' | 'displayName' | 'birthday' | 'showAge' | 'showBirthday' | 'bio'>,
) {
  return apiFetch<Profile>('/api/profile/', {
    method: 'PATCH',
    body: JSON.stringify(profile),
  }, token);
}

export function updateUsername(token: string, username: string) {
  return apiFetch<Profile>('/api/profile/', {
    method: 'PATCH',
    body: JSON.stringify({ username }),
  }, token);
}

export function updateProfilePicture(
  token: string,
  image: { base64: string; name: string; type: string },
) {
  return apiFetch<Profile>('/api/profile/picture/', {
    method: 'POST',
    body: JSON.stringify(image),
  }, token);
}

export function updateEmail(token: string, email: string) {
  return apiFetch<{ email: string }>('/api/auth/email/', {
    method: 'PATCH',
    body: JSON.stringify({ email }),
  }, token);
}

export function updatePassword(token: string, password: string, confirmPassword: string) {
  return apiFetch<{ detail: string }>('/api/auth/password/', {
    method: 'PATCH',
    body: JSON.stringify({ password, confirmPassword }),
  }, token);
}

export function logout(token: string) {
  return apiFetch<void>('/api/auth/logout/', { method: 'POST' }, token);
}
