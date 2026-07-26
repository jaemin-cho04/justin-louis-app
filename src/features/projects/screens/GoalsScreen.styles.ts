import { StyleSheet } from "react-native";

import { colors } from "../../../shared/theme/colors";

export const styles = StyleSheet.create({
  inviteHelp: {
    color: colors.inactive,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 7
  },
  collaboratorRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18
  },
  title: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2
  },
  list: {
    gap: 10,
    marginBottom: 20
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  copy: {
    flex: 1
  },
  rowTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  rowMeta: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2
  },
  projectTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.stroke,
    overflow: "hidden",
    marginLeft: 27,
    marginTop: 10
  },
  editHelp: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginBottom: 12
  },
  projectFill: {
    height: "100%",
    backgroundColor: colors.mint
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
    backgroundColor: colors.surfaceSoft,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 18,
    paddingBottom: 26
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  sheetTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  headerSpacer: {
    width: 18
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  errorText: {
    color: "#F87171",
    fontSize: 12,
    marginTop: 6
  },
  label: {
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
    backgroundColor: colors.surfaceSoft,
    color: colors.ink,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "700"
  },
  typeRow: {
    flexDirection: "row",
    gap: 8
  },
  typeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333338",
    alignItems: "center",
    justifyContent: "center"
  },
  typeActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple
  },
  typeMuted: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "800"
  },
  typeActiveText: {
    color: colors.surfaceSoft,
    fontSize: 12,
    fontWeight: "900"
  },
  cadenceButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#333338",
    alignItems: "center",
    justifyContent: "center"
  },
  cadenceActive: {
    backgroundColor: colors.surface,
    borderColor: colors.purple
  },
  cadenceActiveText: {
    color: colors.purple
  },
  milestone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6
  },
  milestoneCheck: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.inactive,
    alignItems: "center",
    justifyContent: "center"
  },
  milestoneCheckDone: {
    backgroundColor: colors.mint,
    borderColor: colors.mint
  },
  removeMilestone: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  milestoneTitle: {
    flex: 1,
    minHeight: 44,
    fontSize: 12
  },
  weekInput: {
    width: 62,
    minHeight: 44,
    textAlign: "center",
    fontSize: 11,
    paddingHorizontal: 4
  },
  dashed: {
    borderStyle: "dashed",
    marginTop: 2
  },
  createButton: {
    marginTop: 10
  },
  deleteButton: {
    marginTop: 8,
    borderColor: "#7F1D1D"
  },
  deleteConfirm: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#7F1D1D",
    padding: 12
  },
  deleteWarning: {
    color: colors.whiteMuted,
    fontSize: 12,
    lineHeight: 18
  },
  deleteActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10
  },
  deleteAction: {
    flex: 1
  },
  deleteDanger: {
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: "#7F1D1D",
    alignItems: "center",
    justifyContent: "center"
  },
  deleteDangerText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900"
  }
});
