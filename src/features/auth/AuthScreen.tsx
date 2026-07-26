import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "../../services/auth/AuthProvider";
import { colors } from "../../shared/theme/colors";

export function AuthScreen() {
  const auth = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || password.length < 8) {
      setMessage("Enter an email and a password with at least 8 characters.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      if (mode === "signIn") await auth.signIn(email.trim(), password);
      else if (await auth.signUp(email.trim(), password) === "confirmation_required") {
        setMessage("Check your email to confirm your account, then sign in.");
        setMode("signIn");
      }
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    if (!email.trim()) {
      setMessage("Enter your email first.");
      return;
    }
    setBusy(true);
    try {
      await auth.sendPasswordReset(email.trim());
      setMessage("Password reset instructions were sent if that account exists.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "The reset email could not be sent.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>PROGRESS</Text>
      <Text style={styles.title}>{mode === "signIn" ? "Welcome back" : "Create your account"}</Text>
      <Text style={styles.body}>Your goals stay available offline and synchronize securely when connected.</Text>
      <TextInput accessibilityLabel="Email" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.inactive} style={styles.input} />
      <TextInput accessibilityLabel="Password" autoCapitalize="none" autoComplete={mode === "signIn" ? "current-password" : "new-password"} secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.inactive} style={styles.input} />
      {!!message && <Text accessibilityRole="alert" style={styles.message}>{message}</Text>}
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => { void submit(); }} style={styles.primary}>
        {busy ? <ActivityIndicator color={colors.surfaceSoft} /> : <Text style={styles.primaryText}>{mode === "signIn" ? "Sign in" : "Sign up"}</Text>}
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => { setMode((current) => current === "signIn" ? "signUp" : "signIn"); setMessage(""); }} style={styles.switchButton}>
        <Text style={styles.switchText}>{mode === "signIn" ? "Need an account? Sign up" : "Already have an account? Sign in"}</Text>
      </Pressable>
      {mode === "signIn" && <Pressable accessibilityRole="button" accessibilityLabel="Reset password" disabled={busy} onPress={() => { void resetPassword(); }} style={styles.resetButton}>
        <Text style={styles.resetText}>Forgot password?</Text>
      </Pressable>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surfaceSoft, padding: 24, justifyContent: "center" },
  eyebrow: { color: colors.purple, fontWeight: "900", letterSpacing: 2, marginBottom: 10 },
  title: { color: colors.ink, fontSize: 27, fontWeight: "900" },
  body: { color: colors.inkMuted, lineHeight: 21, fontWeight: "600", marginTop: 8, marginBottom: 22 },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.stroke, borderRadius: 12, backgroundColor: colors.surface, color: colors.ink, paddingHorizontal: 14, marginBottom: 10 },
  message: { color: colors.coral, fontWeight: "700", lineHeight: 19, marginBottom: 10 },
  primary: { minHeight: 50, borderRadius: 12, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center" },
  primaryText: { color: colors.surfaceSoft, fontWeight: "900" },
  switchButton: { minHeight: 48, alignItems: "center", justifyContent: "center", marginTop: 8 },
  switchText: { color: colors.purple, fontWeight: "800" }
  ,resetButton: { minHeight: 44, alignItems: "center", justifyContent: "center" }
  ,resetText: { color: colors.inkMuted, fontWeight: "700" }
});
