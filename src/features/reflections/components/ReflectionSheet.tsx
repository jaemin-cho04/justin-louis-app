import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AppButton } from "../../../shared/components/AppButton";
import { IconGlyph } from "../../../shared/components/DraftUI";
import { colors } from "../../../shared/theme/colors";
import type { Trait } from "../../../domain/model/types";

type Props = {
  visible: boolean;
  traits: Trait[];
  contextTitle?: string;
  onClose: () => void;
  onSave: (text: string, traits: string[]) => void;
};

export function ReflectionSheet({ visible, traits, contextTitle, onClose, onSave }: Props) {
  const [text, setText] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [error, setError] = useState("");

  const toggleTrait = (traitId: string) => {
    setSelectedTraits((current) =>
      current.includes(traitId)
        ? current.filter((item) => item !== traitId)
        : [...current, traitId]
    );
  };

  const save = () => {
    if (!text.trim()) {
      setError("Write a reflection before saving.");
      return;
    }

    onSave(text, selectedTraits);
    setText("");
    setSelectedTraits([]);
    setError("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modal} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss reflection" style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.titleRow}>
            <View style={styles.titleCopy}>
              <Text style={styles.title}>New reflection</Text>
              {!!contextTitle && <Text style={styles.contextTitle}>For {contextTitle}</Text>}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close reflection" onPress={onClose} style={styles.closeButton}>
              <IconGlyph name="close" size={18} color={colors.inkMuted} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>Capture it before it fades, then tag the trait it showed.</Text>
            <TextInput
              value={text}
              onChangeText={(value) => { setText(value); if (error) setError(""); }}
              accessibilityLabel="Reflection"
              multiline
              placeholder="What happened? What did it reveal about you?"
              placeholderTextColor="#948CA2"
              style={styles.input}
              textAlignVertical="top"
            />
            {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
            <View style={styles.traits}>
              {traits.map((trait) => {
                const isSelected = selectedTraits.includes(trait.id);
                return (
                  <Pressable
                    key={trait.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => toggleTrait(trait.id)}
                    style={[styles.trait, isSelected && styles.traitSelected]}
                  >
                    <Text style={[styles.traitText, isSelected && styles.traitTextSelected]}>{trait.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            <AppButton label="Save reflection" onPress={save} style={styles.button} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "flex-end"
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,12,24,0.34)"
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: "92%"
  },
  grabber: {
    alignSelf: "center",
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.stroke,
    marginBottom: 18
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  titleCopy: {
    flex: 1,
    paddingRight: 8
  },
  contextTitle: {
    color: colors.purple,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  subtitle: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 18
  },
  input: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 18,
    padding: 16,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 21,
    backgroundColor: colors.surface
  },
  traits: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 16
  },
  error: {
    color: "#F87171",
    fontSize: 12,
    marginTop: 8
  },
  trait: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  traitSelected: {
    borderColor: colors.purple,
    backgroundColor: colors.lavender
  },
  traitText: {
    color: colors.inkMuted,
    fontWeight: "800",
    fontSize: 12
  },
  traitTextSelected: {
    color: colors.purple
  },
  button: {
    marginTop: 18
  }
});
