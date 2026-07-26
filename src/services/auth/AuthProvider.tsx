import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { Linking } from "react-native";

import { remoteBackendConfigured } from "../../config/runtime";
import { getSupabaseClient } from "../remote/supabaseClient";
import { brandConfig } from "../../config/brand";

type AuthContextValue = {
  configured: boolean;
  ready: boolean;
  user: User | null;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<"signed_in" | "confirmation_required">;
  signOut(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!remoteBackendConfigured);

  useEffect(() => {
    if (!remoteBackendConfigured) return;
    const client = getSupabaseClient();

    void client.auth.getSession().then(({ data, error }) => {
      if (error) console.error("[auth] Session restore failed", { message: error.message });
      setSession(data.session);
      setReady(true);
    }).catch((cause) => {
      console.error("[auth] Session restore failed", { message: cause instanceof Error ? cause.message : "Unknown error" });
      setReady(true);
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setReady(true);
    });
    const openUrl = Linking.addEventListener("url", ({ url }) => { void restoreSessionFromUrl(url).catch(logLinkedSessionError); });
    void Linking.getInitialURL().then(async (url) => { if (url) await restoreSessionFromUrl(url); }).catch(logLinkedSessionError);
    return () => { listener.subscription.unsubscribe(); openUrl.remove(); };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    configured: remoteBackendConfigured,
    ready,
    user: session?.user ?? null,
    async signIn(email, password) {
      const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
    },
    async signUp(email, password) {
      const { data, error } = await getSupabaseClient().auth.signUp({ email, password });
      if (error) throw new Error(error.message);
      return data.session ? "signed_in" : "confirmation_required";
    },
    async signOut() {
      const { error } = await getSupabaseClient().auth.signOut();
      if (error) throw new Error(error.message);
    },
    async sendPasswordReset(email) {
      const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${brandConfig.urlScheme}://auth/reset`
      });
      if (error) throw new Error(error.message);
    },
    async updatePassword(password) {
      const { error } = await getSupabaseClient().auth.updateUser({ password });
      if (error) throw new Error(error.message);
    }
  }), [ready, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function restoreSessionFromUrl(url: string): Promise<void> {
  const parameters = new URLSearchParams(url.includes("#") ? url.split("#")[1] : url.split("?")[1] ?? "");
  const accessToken = parameters.get("access_token");
  const refreshToken = parameters.get("refresh_token");
  if (!accessToken || !refreshToken) return;
  const { error } = await getSupabaseClient().auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  if (error) console.error("[auth] Could not restore the linked session", { message: error.message });
}

function logLinkedSessionError(cause: unknown): void {
  console.error("[auth] Could not process the linked session", { message: cause instanceof Error ? cause.message : "Unknown error" });
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
