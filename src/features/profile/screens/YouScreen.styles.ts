import { StyleSheet } from "react-native";

import { colors } from "../../../shared/theme/colors";

export const styles = StyleSheet.create({
  dataStatus: {
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  dataStatusError: {
    borderColor: colors.coral
  },
  dataStatusCopy: {
    flex: 1
  },
  dataStatusTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  dataStatusText: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 17,
    marginTop: 3
  },
  profile: {
    alignItems: "center",
    marginBottom: 18
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 10
  },
  profilePhoto: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.purpleDeep
  },
  camera: {
    position: "absolute",
    right: -12,
    bottom: -12,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  cameraVisual: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.surfaceSoft,
    backgroundColor: colors.purple,
    alignItems: "center",
    justifyContent: "center"
  },
  name: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "900"
  },
  handle: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2
  },
  friendCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6
  },
  friendText: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "600"
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14
  },
  statCard: {
    width: "48%",
    padding: 14
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8
  },
  statValue: {
    fontSize: 20,
    fontWeight: "900"
  },
  statLabel: {
    color: colors.inkMuted,
    fontSize: 10.5,
    fontWeight: "600",
    marginTop: 2
  },
  settingsCard: {
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginBottom: 14
  },
  settingRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4
  },
  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke
  },
  settingLabel: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: "900"
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)"
  },
  modal: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: colors.surfaceSoft,
    maxHeight: "88%",
    padding: 20,
    paddingBottom: 34
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18
  },
  modalTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  spacer: { width: 18 },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  fieldLabel: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    color: colors.ink,
    paddingHorizontal: 12,
    fontSize: 14
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: colors.purple,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18
  },
  primaryText: { color: colors.surfaceSoft, fontWeight: "900" },
  errorText: {
    color: "#F87171",
    fontSize: 12,
    marginTop: 8
  },
  toggleRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke
  },
  panelCopy: {
    color: colors.whiteMuted,
    fontSize: 14,
    lineHeight: 21
  },
  resetButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18
  },
  resetText: { color: colors.inkMuted, fontWeight: "700" }
  ,accountMessage: { color: colors.mint, fontSize: 12, fontWeight: "700", marginTop: 10 }
  ,deleteButton: { minHeight: 44, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 18, borderWidth: 1, borderColor: "#7F1D1D" }
  ,deleteText: { color: "#F87171", fontWeight: "900" }
  ,confirmBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface
  },
  confirmText: {
    color: colors.whiteMuted,
    fontSize: 13,
    lineHeight: 19
  },
  confirmActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  cancelButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  dangerButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7F1D1D"
  },
  dangerText: {
    color: colors.ink,
    fontWeight: "900"
  }
});
