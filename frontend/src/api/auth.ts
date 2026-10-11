import http, { type Resp, unwrap } from "./client";

export interface TokenOut {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface CurrentUser {
  id: number;
  username: string;
  display_name: string | null;
  tenant_id: number;
  tenant_name: string | null;
  is_platform_admin: boolean;
  role_codes: string[];
  permission_codes: string[];
}

export async function loginApi(username: string, password: string) {
  return unwrap<TokenOut>(
    http.post<Resp<TokenOut>>("/v1/auth/login", { username, password })
  );
}

export async function refreshApi(refresh_token: string) {
  return unwrap<TokenOut>(
    http.post<Resp<TokenOut>>("/v1/auth/refresh", { refresh_token })
  );
}

export async function fetchMe() {
  return unwrap<CurrentUser>(http.get<Resp<CurrentUser>>("/v1/auth/me"));
}