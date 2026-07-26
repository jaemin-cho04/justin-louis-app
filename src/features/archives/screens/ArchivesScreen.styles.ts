import { StyleSheet } from "react-native";

import { colors } from "../../../shared/theme/colors";

export const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyText: {
    color: colors.inkMuted,
    fontSize: 13,
    textAlign: "center"
  },
  reflectionTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8
  },
  reflectionText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 5
  },
  reflectionTraits: {
    color: colors.purple,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 8
  },
  heading: {
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
  folderStack: {
    gap: 12
  },
  folder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 20
  },
  folderCopy: {
    flex: 1
  },
  folderTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  folderMeta: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2
  },
  crumb: {
    color: colors.inactive,
    fontSize: 10.5,
    fontWeight: "600",
    marginBottom: 10
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16
  },
  detailTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  archiveHelp: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginBottom: 12
  },
  reflectionDeleteActions: {
    gap: 6
  },
  reflectionCancel: {
    minHeight: 36,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: "center",
    justifyContent: "center"
  },
  reflectionCancelText: {
    color: colors.inkMuted,
    fontSize: 10,
    fontWeight: "900"
  },
  reflectionDelete: {
    minHeight: 36,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center"
  },
  reflectionDeleteText: {
    color: colors.surfaceSoft,
    fontSize: 10,
    fontWeight: "900"
  },
  reflectionInput: {
    minHeight: 72,
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surfaceSoft,
    color: colors.ink,
    padding: 10,
    textAlignVertical: "top"
  },
  reflectionEdit: {
    minHeight: 40,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  reflectionEditText: {
    color: colors.purple,
    fontSize: 11,
    fontWeight: "900"
  },
  reflectionEditActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8
  },
  reflectionSave: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.purple,
    alignItems: "center",
    justifyContent: "center"
  },
  reflectionSaveText: {
    color: colors.surfaceSoft,
    fontSize: 11,
    fontWeight: "900"
  },
  detailMeta: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "600"
  },
  logStack: {
    gap: 8
  },
  logTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  logCopy: {
    flex: 1
  },
  logTitle: {
    color: colors.ink,
    fontSize: 14.5,
    fontWeight: "900"
  },
  logDate: {
    color: colors.inactive,
    fontSize: 10.5,
    fontWeight: "600",
    marginTop: 2
  },
  noteBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.stroke
  },
  noteLine: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6
  },
  noteValue: {
    color: colors.ink,
    fontWeight: "900"
  },
  noteLabel: {
    color: colors.inkMuted,
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6
  },
  noteInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surfaceSoft,
    color: colors.ink,
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: "600"
  },
  saveNote: {
    alignSelf: "flex-start",
    marginTop: 8
  }
});
