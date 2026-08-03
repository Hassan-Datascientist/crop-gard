import { API_URL } from "../constants/api";

const TIMEOUT_MS = 20000;

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request(path, { method = "GET", body, token, timeout = TIMEOUT_MS } = {}) {
  const headers = {};
  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (e) {
    const err = new Error("NETWORK_ERROR");
    err.cause = e;
    throw err;
  }

  const data = await parseBody(res);
  if (!res.ok) {
    const detail = data?.detail;
    throw new Error(typeof detail === "string" ? detail : `HTTP_${res.status}`);
  }
  return data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export function registerApi({ firstName, lastName, email, password, language }) {
  return request("/api/auth/register", {
    method: "POST",
    body: {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      language_pref: language || "en",
    },
  });
}

export function loginApi(email, password) {
  return request("/api/auth/login", { method: "POST", body: { email, password } });
}

export function getMeApi(token) {
  return request("/api/auth/me", { token });
}

export function updateMeApi(token, fields) {
  return request("/api/auth/me", { method: "PATCH", token, body: fields });
}

export function changePasswordApi(token, currentPassword, newPassword) {
  return request("/api/auth/change-password", {
    method: "POST",
    token,
    body: { current_password: currentPassword, new_password: newPassword },
  });
}

function buildImageForm(uri, fallbackName) {
  const form = new FormData();
  const fileName = String(uri).split("/").pop() || fallbackName;
  const ext = (fileName.split(".").pop() || "jpg").toLowerCase();
  const type =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  form.append("file", { uri, name: fileName, type });
  return form;
}

export function uploadAvatarApi(token, uri) {
  return request("/api/auth/avatar", {
    method: "POST",
    token,
    body: buildImageForm(uri, "avatar.jpg"),
  });
}

export function removeAvatarApi(token) {
  return request("/api/auth/avatar", { method: "DELETE", token });
}

// ─── Sync ────────────────────────────────────────────────────────────────────

export function uploadImageApi(token, uri) {
  return request("/api/images", {
    method: "POST",
    token,
    body: buildImageForm(uri, "photo.jpg"),
  });
}

export function syncApi(token, { since, scans }) {
  return request("/api/sync", {
    method: "POST",
    token,
    body: { since, scans },
  });
}
