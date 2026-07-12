import { StyleSheet, View } from "react-native";

import { colors } from "../theme/colors";
import type { ProgressSummary } from "../../domain/selectors/progress";

type Props = {
  summary: ProgressSummary;
  height?: number;
};

const segmentColor = {
  done: colors.mint,
  attempted: colors.purple,
  missed: colors.inactive,
  skipped: colors.stroke,
  deferred: colors.sky,
  open: colors.slate
};

export function ProgressBar({ summary, height = 12 }: Props) {
  const total = summary.segments.reduce((sum, segment) => sum + segment.weight, 0);

  return (
    <View style={[styles.track, { height }]}>
      {summary.segments.length === 0 ? (
        <View style={[styles.segment, { backgroundColor: colors.lavender, flex: 1 }]} />
      ) : (
        summary.segments.map((segment, index) => (
          <View
            key={`${segment.status}-${index}`}
            style={[
              styles.segment,
              {
                backgroundColor: segmentColor[segment.status],
                flex: total === 0 ? 1 : segment.weight
              }
            ]}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.stroke,
    borderRadius: 3,
    flexDirection: "row",
    overflow: "hidden"
  },
  segment: {
    minWidth: 3
  }
});
