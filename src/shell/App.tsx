import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ArchivesScreen } from "../features/archives/screens/ArchivesScreen";
import { FriendsScreen } from "../features/social/screens/FriendsScreen";
import { GoalsScreen } from "../features/projects/screens/GoalsScreen";
import { HomeScreen } from "../features/home/screens/HomeScreen";
import { LogScreen } from "../features/logging/screens/LogScreen";
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
  const [logOpen, setLogOpen] = useState(false);

  if (!isReady || !data) {
    return (
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.purple} size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.app}>
        <StatusBar style="light" />
        {logOpen ? (
          <LogScreen
            data={data}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onLog={actions.logItem}
            onClose={() => setLogOpen(false)}
          />
        ) : activeTab === "home" && (
          <HomeScreen
            data={data}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onToggleBreakDay={actions.toggleBreakDay}
            onOpenLog={() => setLogOpen(true)}
            onOpenReflection={() => setReflectionOpen(true)}
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
        {activeTab === "friends" && (
          <FriendsScreen
            data={data}
            onAddFriend={actions.addDemoFriend}
            onToggleFeedback={actions.toggleFriendFeedback}
            onAddComment={actions.addComment}
          />
        )}
        {activeTab === "archives" && (
          <ArchivesScreen data={data} onUpdateLogNote={actions.updateLogNote} />
        )}
        {activeTab === "you" && (
          <YouScreen
            data={data}
            onReset={actions.reset}
            onUpdateProfile={actions.updateProfile}
            onSetNotificationPreference={actions.setNotificationPreference}
            onOpenFriends={() => setActiveTab("friends")}
          />
        )}

        <BottomTabs activeTab={activeTab} onChange={(tab) => { setLogOpen(false); setActiveTab(tab); }} />
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
    width: "100%",
    backgroundColor: colors.surfaceSoft
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSoft
  }
});
