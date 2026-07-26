import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { reportError } from "../../services/monitoring/monitoring";

type Props = { children: ReactNode };
type State = { error: Error | null; incidentId: string | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null, incidentId: null };

  static getDerivedStateFromError(error: Error): State {
    return { error, incidentId: `ui-${Date.now().toString(36)}` };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const incidentId = reportError(error, { componentStack: info.componentStack });
    this.setState({ incidentId });
  }

  private retry = () => this.setState({ error: null, incidentId: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View accessibilityRole="alert" style={styles.screen}>
        <Text style={styles.eyebrow}>PROGRESS</Text>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>Your saved data remains on this device. Try reopening this screen.</Text>
        <Text selectable style={styles.reference}>Reference: {this.state.incidentId}</Text>
        {__DEV__ && <Text selectable style={styles.debug}>{this.state.error.message}</Text>}
        <Pressable accessibilityRole="button" onPress={this.retry} style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    padding: 28,
    justifyContent: "center"
  },
  eyebrow: {
    color: colors.purple,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 12
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900"
  },
  body: {
    color: colors.inkMuted,
    lineHeight: 21,
    fontWeight: "600",
    marginTop: 8
  },
  reference: {
    color: colors.inactive,
    fontSize: 12,
    marginTop: 14
  },
  debug: {
    color: colors.coral,
    fontSize: 11,
    marginTop: 8
  },
  button: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.purple,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20
  },
  buttonText: {
    color: colors.surfaceSoft,
    fontWeight: "900"
  }
});
