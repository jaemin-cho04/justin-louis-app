import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppButton } from "../../../shared/components/AppButton";
import { colors } from "../../../shared/theme/colors";
import type { Trait } from "../../../domain/model/types";

type Props = {
  visible: boolean;
  traits: Trait[];
  onClose: () => void;
  onSave: (text: string, traits: string[]) => void;
};

export function ReflectionSheet({ visible, traits, onClose, onSave }: Props) {
  const [text, setText] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  const toggleTrait = (traitId: string) => {
    setSelectedTraits((current) =>
      current.includes(traitId)
        ? current.filter((item) => item !== traitId)
        : [...current, traitId]
    );
  };

  const save = () => {
    onSave(text, selectedTraits);
    setText("");
    setSelectedTraits([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <Text style={styles.title}>New reflection</Text>
        <Text style={styles.subtitle}>Capture it before it fades, then tag the trait it showed.</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder="What happened? What did it reveal about you?"
          placeholderTextColor="#948CA2"
          style={styles.input}
          textAlignVertical="top"
        />
        <View style={styles.traits}>
          {traits.map((trait) => {
            const isSelected = selectedTraits.includes(trait.id);
            return (
              <Pressable
                key={trait.id}
                onPress={() => toggleTrait(trait.id)}
                style={[styles.trait, isSelected && styles.traitSelected]}
              >
                <Text style={[styles.traitText, isSelected && styles.traitTextSelected]}>{trait.name}</Text>
              </Pressable>
            );
          })}
        </View>
        <AppButton label="Save reflection" onPress={save} style={styles.button} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,12,24,0.34)"
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0
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
  trait: {
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
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
