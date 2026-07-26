import { StyleSheet } from "react-native";

import { colors } from "../../../shared/theme/colors";

export const styles = StyleSheet.create({
  sendButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  manageButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 10,
    paddingHorizontal: 12
  },
  manageText: { color: colors.purple, fontSize: 12, fontWeight: "900" },
  feedbackButton: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.stroke,
    paddingHorizontal: 14,
    marginBottom: 18
  },
  feedbackTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
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
    marginBottom: 14
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  friendCopy: {
    flex: 1
  },
  friendTop: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between"
  },
  friendName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  progressValue: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900"
  },
  friendMeta: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    marginBottom: 7
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  note: {
    color: colors.inactive,
    fontSize: 10.5,
    fontWeight: "600"
  },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  manageSheet: { position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "82%", backgroundColor: colors.surfaceSoft, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 18, paddingBottom: 32 },
  manageHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  manageHelp: { color: colors.inkMuted, fontSize: 12, fontWeight: "700", lineHeight: 18, marginBottom: 12 },
  manageInput: { minHeight: 44, borderWidth: 1, borderColor: colors.stroke, borderRadius: 10, color: colors.ink, backgroundColor: colors.surface, paddingHorizontal: 12, marginBottom: 8 },
  errorText: { color: "#F87171", fontSize: 12, marginBottom: 8 },
  addButton: { minHeight: 44, borderRadius: 10, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center" },
  addButtonText: { color: colors.surfaceSoft, fontWeight: "900" },
  manageList: { marginTop: 12, gap: 8 },
  manageRow: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: colors.stroke },
  removeActions: { flexDirection: "row", gap: 6 },
  removeCancel: { minHeight: 40, paddingHorizontal: 9, borderRadius: 9, borderWidth: 1, borderColor: colors.stroke, alignItems: "center", justifyContent: "center" },
  removeCancelText: { color: colors.inkMuted, fontSize: 11, fontWeight: "900" },
  removeConfirm: { minHeight: 40, paddingHorizontal: 9, borderRadius: 9, backgroundColor: colors.coral, alignItems: "center", justifyContent: "center" },
  removeConfirmText: { color: colors.surfaceSoft, fontSize: 11, fontWeight: "900" },
  sectionLabel: { color: colors.inactive, fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginTop: 16, marginBottom: 8 },
  inlineRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  flexInput: { flex: 1, marginBottom: 0 },
  secondaryButton: { minHeight: 44, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.stroke, alignItems: "center", justifyContent: "center" },
  secondaryText: { color: colors.purple, fontWeight: "900", fontSize: 12 },
  inviteButton: { minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.stroke, alignItems: "center", justifyContent: "center", marginTop: 8 },
  requestRow: { minHeight: 54, flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderBottomColor: colors.stroke },
  addSmall: { minHeight: 40, paddingHorizontal: 10, borderRadius: 9, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center" },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16
  },
  detailName: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  friendHero: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 6
  },
  eyebrow: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 8
  },
  percentRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 10
  },
  detailPercent: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "900"
  },
  percentMark: {
    color: colors.inkMuted,
    fontSize: 14,
    fontWeight: "900"
  },
  measurement: {
    color: colors.inactive,
    fontSize: 10,
    fontStyle: "italic",
    marginBottom: 14
  },
  sharedCard: {
    marginTop: 0
  },
  sharedTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 2
  },
  sharedTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
    flex: 1
  },
  done: {
    color: colors.mint,
    fontSize: 11,
    fontWeight: "900"
  },
  sharedMeta: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 25,
    marginBottom: 8
  },
  comment: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    marginBottom: 8
  },
  commentBubble: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7
  },
  commentAuthor: {
    color: colors.ink,
    fontSize: 10.5,
    fontWeight: "900"
  },
  commentTime: {
    color: colors.inactive,
    fontWeight: "600"
  },
  commentText: {
    color: colors.whiteMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  commentInput: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surfaceSoft,
    color: colors.ink,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: "600"
  }
});
