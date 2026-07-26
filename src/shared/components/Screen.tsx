import type { ReactNode, RefObject } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../theme/colors";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  scrollRef?: RefObject<ScrollView | null>;
};

export function Screen({ children, scroll = true, scrollRef }: Props) {
  if (!scroll) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surfaceSoft
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 92
  }
});
