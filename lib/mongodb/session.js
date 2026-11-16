"use client";

import { EMAIL_KEY, TOKEN_KEY } from "./config";

/** The access token and email live in the browser; MONGODB_URI never does. */
export function getSession() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { token, email: localStorage.getItem(EMAIL_KEY) } : null;
  } catch {
    return null;
  }
}

export function setSession(token, email) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email ?? "");
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
}
