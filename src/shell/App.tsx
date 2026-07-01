import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { FriendsScreen } from "../features/social/screens/FriendsScreen";
import { GoalsScreen } from "../features/projects/screens/GoalsScreen";
import { HomeScreen } from "../features/home/screens/HomeScreen";
import { LogScreen } from "../features/logging/screens/LogScreen";
import { OnboardingScreen } from "../features/onboarding/screens/OnboardingScreen";
import { ReflectionSheet } from "../features/reflections/components/ReflectionSheet";
import { YouScreen } from "../features/profile/screens/YouScreen";
import { BottomTabs } from "../shared/components/BottomTabs";
import { colors } from "../shared/theme/colors";
import { useAppStore } from "../services/store/useAppStore";
import type { AppTab } from "../domain/model/types";

export default function App() {
  const { data, actions, selectedDate, setSelectedDate, isReady } = useAppStore();
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [reflectionOpen, setReflectionOpen] = useState(false);

  if (!isReady || !data) {
    return (
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.purple} size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!data.hasOnboarded) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <OnboardingScreen onComplete={actions.completeOnboarding} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.app}>
        <StatusBar style="dark" />
        {activeTab === "home" && (
          <HomeScreen
            data={data}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onToggleBreakDay={actions.toggleBreakDay}
            onOpenLog={() => setActiveTab("log")}
            onOpenReflection={() => setReflectionOpen(true)}
          />
        )}
        {activeTab === "log" && (
          <LogScreen
            data={data}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onLog={actions.logItem}
          />
        )}
        {activeTab === "friends" && (
          <FriendsScreen
            data={data}
            onAddFriend={actions.addDemoFriend}
            onToggleFeedback={actions.toggleFriendFeedback}
          />
        )}
        {activeTab === "goals" && (
          <GoalsScreen
            data={data}
            onMoveProject={actions.moveProject}
            onSetVisibility={actions.setProjectVisibility}
            onAddProject={actions.addProject}
          />
        )}
        {activeTab === "you" && <YouScreen data={data} onReset={actions.reset} />}

        <BottomTabs activeTab={activeTab} onChange={setActiveTab} />
        <ReflectionSheet
          visible={reflectionOpen}
          traits={data.traitOptions}
          onClose={() => setReflectionOpen(false)}
          onSave={actions.addReflection}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.surfaceSoft
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSoft
  }
});
