import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";

import { getBrandKicker } from "../../../config/brand";
import { emptyProfile, productTagline } from "../../../domain/fixtures/seed";
import { AppButton } from "../../../shared/components/AppButton";
import { colors } from "../../../shared/theme/colors";
import type { UserProfile } from "../../../domain/model/types";

type Props = {
  onComplete: (profile: UserProfile) => void;
};

export function OnboardingScreen({ onComplete }: Props) {
  const [profile, setProfile] = useState<UserProfile>({
    ...emptyProfile,
    name: "",
    handle: ""
  });

  const update = (key: keyof UserProfile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.wrap}
    >
      <View style={styles.brandMark} />
      <Text style={styles.kicker}>{getBrandKicker()}</Text>
      <Text style={styles.title}>Build quiet progress with your close circle.</Text>
      <Text style={styles.subtitle}>{productTagline}</Text>

      <View style={styles.form}>
        <Field label="Name" value={profile.name} onChangeText={(value) => update("name", value)} />
        <Field label="Handle" value={profile.handle} onChangeText={(value) => update("handle", value)} />
        <Field
          label="Term label"
          value={profile.termLabel}
          onChangeText={(value) => update("termLabel", value)}
        />
      </View>

      <AppButton label="Start tracking" onPress={() => onComplete(profile)} />
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#948CA2"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.surfaceSoft
  },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.purple,
    marginBottom: 18,
    shadowColor: colors.purpleDeep,
    shadowOpacity: 0.26,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 }
  },
  kicker: {
    color: colors.purple,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 8
  },
  title: {
    color: colors.ink,
    fontSize: 36,
    lineHeight: 41,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.inkMuted,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 28
  },
  form: {
    gap: 14,
    marginBottom: 22
  },
  field: {
    gap: 7
  },
  fieldLabel: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.stroke,
    paddingHorizontal: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
    fontSize: 16,
    fontWeight: "700"
  }
});
