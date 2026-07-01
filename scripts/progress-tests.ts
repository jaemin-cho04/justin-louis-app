import assert from "node:assert/strict";

import { seedData } from "../src/domain/fixtures/seed";
import { scheduledItems, summarizeDay, summarizeWeek } from "../src/domain/selectors/progress";
import type { AppData } from "../src/domain/model/types";

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
  logs: scheduledItems(testData, testDate).map((item) => ({
    id: `deferred-${item.id}`,
    itemId: item.id,
    date: testDate,
    status: "deferred" as const,
    createdAt: new Date().toISOString()
  }))
};

const deferredSummary = summarizeDay(deferredData, testDate);
assert.equal(deferredSummary.totalWeight, 0);
assert.equal(deferredSummary.deferredWeight, 6);

const weekSummary = summarizeWeek(testData);
assert.equal(weekSummary.totalWeight > 0, true);

console.log("Progress selector tests passed.");
