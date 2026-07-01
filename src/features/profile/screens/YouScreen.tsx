import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "../../../shared/components/AppButton";
import { Screen } from "../../../shared/components/Screen";
import { summarizeTerm, summarizeWeek } from "../../../domain/selectors/progress";
import { colors } from "../../../shared/theme/colors";
import type { AppData } from "../../../domain/model/types";

type Props = {
  data: AppData;
  onReset: () => void;
};

export function YouScreen({ data, onReset }: Props) {
  const week = summarizeWeek(data);
  const term = summarizeTerm(data);
  const latestReflections = data.reflections.slice(0, 4);
  const profile = data.currentUser.profile;
  const traitNamesById = new Map(data.traitOptions.map((trait) => [trait.id, trait.name]));

  return (
    <Screen>
      <Text style={styles.title}>You</Text>
      <Text style={styles.subtitle}>{profile.handle || "@handle"} - private insights and reflection retrieval.</Text>

      <View style={styles.statsGrid}>
        <Stat label="Week" value={`${Math.round(week.completion * 100)}%`} />
        <Stat label="Term tasks" value={`${Math.round(term.completion * 100)}%`} />
        <Stat label="Reflections" value={`${data.reflections.length}`} />
        <Stat label="Friends" value={`${data.friends.length}`} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Trait library</Text>
        <View style={styles.traits}>
          {data.traitOptions.map((trait) => {
            const count = data.reflections.filter((reflection) =>
              reflection.traits.includes(trait.id)
            ).length;
            return (
              <View key={trait.id} style={styles.trait}>
                <Text style={styles.traitText}>{trait.name}</Text>
                <Text style={styles.traitCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent reflections</Text>
        {latestReflections.length === 0 ? (
          <Text style={styles.empty}>No reflections yet.</Text>
        ) : (
          latestReflections.map((reflection) => (
            <View key={reflection.id} style={styles.reflection}>
              <Text style={styles.reflectionDate}>{reflection.date}</Text>
              <Text style={styles.reflectionText}>{reflection.text}</Text>
              <Text style={styles.reflectionTraits}>
                {reflection.traits.map((traitId) => traitNamesById.get(traitId) ?? traitId).join(", ") || "Untagged"}
              </Text>
            </View>
          ))
        )}
      </View>

      <AppButton label="Reset demo data" onPress={onReset} tone="ghost" />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.inkMuted,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 16
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14
  },
  stat: {
    width: "47%",
    backgroundColor: colors.surface,
    borderColor: colors.stroke,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16
  },
  statValue: {
    color: colors.purple,
    fontSize: 25,
    fontWeight: "900"
  },
  statLabel: {
    color: colors.inkMuted,
    fontWeight: "800",
    marginTop: 4
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.stroke,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12
  },
  traits: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9
  },
  trait: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceSoft
  },
  traitText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800"
  },
  traitCount: {
    color: colors.purple,
    fontSize: 12,
    fontWeight: "900"
  },
  reflection: {
    borderTopWidth: 1,
    borderTopColor: colors.stroke,
    paddingTop: 12,
    marginTop: 12
  },
  reflectionDate: {
    color: colors.purple,
    fontSize: 12,
    fontWeight: "900"
  },
  reflectionText: {
    color: colors.ink,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 5
  },
  reflectionTraits: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 7
  },
  empty: {
    color: colors.inkMuted,
    fontWeight: "700"
  }
});
