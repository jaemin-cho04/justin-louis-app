import assert from "node:assert/strict";

import { seedData } from "../src/domain/fixtures/seed";
import { logsForItem, scheduledItems, summarizeDay, summarizeWeek } from "../src/domain/selectors/progress";
import { formatBreakdownLabel } from "../src/shared/utils/dates";
import { deleteProjectData, deleteWorkItemData, makeHabitWorkItem } from "../src/domain/operations/projects";
import { clearLogData } from "../src/domain/operations/logs";
import { buildAppDataIndex, logKey } from "../src/domain/selectors/appDataIndex";
import { CURRENT_SCHEMA_VERSION, createAppDataEnvelope, decodeStoredAppData, decodeStoredAppDataWithReport, normalizeAppData, normalizeAppDataWithReport } from "../src/services/storage/appDataSchema";
import { createAppActions } from "../src/services/store/appActions";
import type { AppData } from "../src/domain/model/types";
import { bindDataToUser } from "../src/domain/operations/userIdentity";
import { isValidHandle, normalizeHandle } from "../src/shared/utils/validation";

const testDate = "2026-06-01";

const testData: AppData = {
  ...seedData,
  workItems: [
    {
      id: "done-habit",
      projectId: "project-mcat",
      kind: "habit",
      title: "Done habit",
      effort: 2,
      weekdays: [1]
    },
    {
      id: "attempted-habit",
      projectId: "project-mcat",
      kind: "habit",
      title: "Attempted habit",
      effort: 1,
      weekdays: [1]
    },
    {
      id: "open-task",
      projectId: "project-research",
      kind: "task",
      title: "Open task",
      effort: 3,
      dueDate: testDate
    }
  ],
  logs: [
    {
      id: "test-done",
      itemId: "done-habit",
      date: testDate,
      status: "done",
      createdAt: new Date().toISOString()
    },
    {
      id: "test-attempted",
      itemId: "attempted-habit",
      date: testDate,
      status: "attempted",
      createdAt: new Date().toISOString()
    }
  ],
  breakDays: []
};

const baseSummary = summarizeDay(testData, testDate);
assert.equal(baseSummary.doneWeight, 2);
assert.equal(baseSummary.attemptedWeight, 1);
assert.equal(baseSummary.totalWeight, 6);
assert.equal(Math.round(baseSummary.completion * 100), 33);

const skippedData: AppData = {
  ...testData,
  logs: [
    ...testData.logs,
    {
      id: "test-skip",
      itemId: "open-task",
      date: testDate,
      status: "skipped",
      createdAt: new Date().toISOString()
    }
  ]
};

const skippedSummary = summarizeDay(skippedData, testDate);
assert.equal(skippedSummary.skippedWeight, 3);
assert.equal(skippedSummary.totalWeight, 3);
assert.equal(Math.round(skippedSummary.completion * 100), 67);

const deferredData: AppData = {
  ...testData,
  breakDays: [{ date: testDate }],
  logs: []
};

const deferredSummary = summarizeDay(deferredData, testDate);
assert.equal(deferredSummary.totalWeight, 0);
assert.equal(deferredSummary.deferredWeight, 6);

const partiallyLoggedBreakDay = summarizeDay({ ...deferredData, logs: testData.logs }, testDate);
assert.equal(partiallyLoggedBreakDay.doneWeight, 2);
assert.equal(partiallyLoggedBreakDay.attemptedWeight, 1);
assert.equal(partiallyLoggedBreakDay.deferredWeight, 3);

const weekSummary = summarizeWeek(testData);
assert.equal(weekSummary.totalWeight > 0, true);

assert.equal(formatBreakdownLabel("2026-06-01", "2026-06-01"), "TODAY'S BREAKDOWN");
assert.equal(formatBreakdownLabel("2026-05-31", "2026-06-01"), "YESTERDAY'S BREAKDOWN");
assert.equal(formatBreakdownLabel("2026-06-02", "2026-06-01"), "TOMORROW'S BREAKDOWN");
assert.match(formatBreakdownLabel("2026-05-30", "2026-06-01"), /MAY 30 BREAKDOWN$/);

const doneHabitLogs = logsForItem(testData, "done-habit");
assert.deepEqual(doneHabitLogs.map((entry) => entry.id), ["test-done"]);
assert.equal(doneHabitLogs.some((entry) => entry.itemId !== "done-habit"), false);

const monthlyHabit = makeHabitWorkItem("project-mcat", "monthly-habit", "Monthly review", "Monthly");
assert.equal(monthlyHabit.monthlyDay, 1);
assert.equal(scheduledItems({ ...testData, workItems: [monthlyHabit] }, "2026-06-01").length, 1);
assert.equal(scheduledItems({ ...testData, workItems: [monthlyHabit] }, "2026-06-02").length, 0);

const deletedProject = deleteProjectData(testData, "project-mcat");
assert.equal(deletedProject.projects.some((project) => project.id === "project-mcat"), false);
assert.equal(deletedProject.workItems.some((item) => item.projectId === "project-mcat"), false);
assert.equal(deletedProject.logs.some((entry) => ["done-habit", "attempted-habit"].includes(entry.itemId)), false);

const deletedWorkItem = deleteWorkItemData(testData, "done-habit");
assert.equal(deletedWorkItem.workItems.some((item) => item.id === "done-habit"), false);
assert.equal(deletedWorkItem.logs.some((entry) => entry.itemId === "done-habit"), false);
assert.equal(deletedWorkItem.workItems.some((item) => item.id === "attempted-habit"), true);

const clearedLog = clearLogData(testData, "done-habit", testDate);
assert.equal(clearedLog.logs.some((entry) => entry.id === "test-done"), false);
assert.equal(clearedLog.logs.some((entry) => entry.id === "test-attempted"), true);

const indexed = buildAppDataIndex(testData);
assert.equal(indexed.projectById.get("project-mcat")?.title, "MCAT prep");
assert.equal(indexed.logByItemAndDate.get(logKey("done-habit", testDate))?.status, "done");
assert.deepEqual(indexed.logsByItemId.get("attempted-habit")?.map((entry) => entry.id), ["test-attempted"]);

const legacyData = decodeStoredAppData({
  ...testData,
  profile: { name: "Legacy user", handle: "@legacy", termLabel: "Legacy term" },
  currentUser: undefined,
  projects: testData.projects.map((project, index) => index === 0 ? { ...project, visibility: "friends" } : project)
});
assert.equal(legacyData.currentUser.profile.name, "Legacy user");
assert.equal(legacyData.projects[0]?.visibility, "closeFriends");

const dataWithInvalidRelations = normalizeAppData({
  ...testData,
  logs: [
    ...testData.logs,
    { ...testData.logs[0], id: "duplicate-log", status: "missed" },
    { ...testData.logs[0], id: "orphan-log", itemId: "missing-item" }
  ],
  customFields: { futureFeature: { enabled: true } }
});
assert.equal(dataWithInvalidRelations.logs.length, testData.logs.length);
assert.equal(dataWithInvalidRelations.logs.some((entry) => entry.id === "orphan-log"), false);
assert.deepEqual(dataWithInvalidRelations.customFields, { futureFeature: { enabled: true } });

const envelope = createAppDataEnvelope(dataWithInvalidRelations, 7);
assert.equal(envelope.schemaVersion, CURRENT_SCHEMA_VERSION);
assert.equal(envelope.revision, 7);
assert.equal(decodeStoredAppData(envelope).projects.length, dataWithInvalidRelations.projects.length);

const repairedMalformedData = normalizeAppData({
  ...testData,
  projects: [null, ...testData.projects],
  friends: [{ id: "bad-friend" }, ...testData.friends],
  traitOptions: [null, ...testData.traitOptions]
});
assert.equal(repairedMalformedData.projects.length, testData.projects.length);
assert.equal(repairedMalformedData.friends.length, testData.friends.length);
assert.equal(repairedMalformedData.traitOptions.length, testData.traitOptions.length);

const legacyReport = decodeStoredAppDataWithReport({ ...testData, currentUser: undefined });
assert.equal(legacyReport.diagnostics.some((issue) => issue.code === "legacy_migrated"), true);

const futureReport = decodeStoredAppDataWithReport({ ...envelope, schemaVersion: CURRENT_SCHEMA_VERSION + 1 });
assert.equal(futureReport.diagnostics.some((issue) => issue.code === "future_schema"), true);

const repairReport = normalizeAppDataWithReport({
  ...testData,
  logs: [...testData.logs, { ...testData.logs[0], id: "duplicate" }]
});
assert.equal(repairReport.diagnostics.some((issue) => issue.code === "records_repaired" && issue.collection === "logs"), true);

let actionData = testData;
const actions = createAppActions({
  selectedDate: testDate,
  update(recipe) { actionData = recipe(actionData); },
  replace(nextData) { actionData = nextData; },
  async reset() { return seedData; }
});
actions.addReflection("  Store action reflection  ", ["growth"], { itemId: "open-task", projectId: "project-1" });
assert.equal(actionData.reflections[0]?.text, "Store action reflection");
assert.equal(actionData.reflections[0]?.itemId, "open-task");
assert.equal(actionData.reflections[0]?.projectId, "project-1");
actions.logItem("open-task", "done");
assert.equal(actionData.logs.some((entry) => entry.itemId === "open-task" && entry.status === "done"), true);
actions.clearLog("open-task");
assert.equal(actionData.logs.some((entry) => entry.itemId === "open-task"), false);
const friendCount = actionData.friends.length;
actions.addFriend("New friend", "@newfriend");
assert.equal(actionData.friends.length, friendCount + 1);
const addedFriend = actionData.friends.at(-1)!;
actions.removeFriend(addedFriend.id);
assert.equal(actionData.friends.some((friend) => friend.id === addedFriend.id), false);
actions.addComment("shared-test-runs", "Delete this local comment");
const localComment = actionData.reactions.at(-1)!;
actions.deleteComment(localComment.id);
assert.equal(actionData.reactions.some((reaction) => reaction.id === localComment.id), false);

actions.updateProfile({ name: "Updated QA", handle: "@updated_qa" });
assert.equal(actionData.currentUser.profile.name, "Updated QA");
actions.setNotificationPreference("ownTaskReminders", true);
assert.equal(actionData.currentUser.notificationPreferences.ownTaskReminders, true);

const reflectionId = actionData.reflections[0]!.id;
actions.updateReflection(reflectionId, "Edited reflection");
assert.equal(actionData.reflections.find((reflection) => reflection.id === reflectionId)?.text, "Edited reflection");
actions.deleteReflection(reflectionId);
assert.equal(actionData.reflections.some((reflection) => reflection.id === reflectionId), false);

actions.addProject({ title: "CRUD project", description: "Created in tests", goalType: "project", milestones: [{ title: "First", timing: "Week 1" }] });
const crudProject = actionData.projects.at(-1)!;
actions.updateProject(crudProject.id, { title: "CRUD habit", description: "Updated", goalType: "habit", cadence: "Weekly" });
assert.equal(actionData.projects.find((project) => project.id === crudProject.id)?.goalType, "habit");
assert.equal(actionData.workItems.some((item) => item.projectId === crudProject.id), true);
actions.deleteProject(crudProject.id);
assert.equal(actionData.projects.some((project) => project.id === crudProject.id), false);
assert.equal(actionData.workItems.some((item) => item.projectId === crudProject.id), false);

const rebound = bindDataToUser(seedData, "00000000-0000-4000-8000-000000000001");
assert.equal(rebound.currentUser.id, "00000000-0000-4000-8000-000000000001");
assert.equal(rebound.projects.every((project) => project.ownerId !== seedData.currentUser.id), true);
assert.equal(rebound.memberships.some((membership) => membership.userId === seedData.currentUser.id), false);
assert.equal(isValidHandle("valid_handle_1"), true);
assert.equal(isValidHandle("no"), false);
assert.equal(isValidHandle("invalid handle"), false);
assert.equal(normalizeHandle("  @Mixed_CASE "), "@mixed_case");

const largeData: AppData = {
  ...testData,
  logs: Array.from({ length: 10_000 }, (_, index) => ({
    id: `performance-log-${index}`,
    itemId: index % 2 ? "done-habit" : "attempted-habit",
    date: testDate,
    status: index % 2 ? "done" as const : "attempted" as const,
    createdAt: new Date(2026, 0, 1, 0, 0, index).toISOString()
  }))
};
const performanceStart = performance.now();
const largeIndex = buildAppDataIndex(largeData);
assert.equal(largeIndex.logsByItemId.get("done-habit")?.length, 5_000);
assert.equal(performance.now() - performanceStart < 1_500, true, "10k-record indexing exceeded the performance budget");

console.log("Progress selector tests passed.");
