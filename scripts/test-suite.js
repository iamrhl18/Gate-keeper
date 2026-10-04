const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("==========================================");
console.log("RUNNING COMPREHENSIVE 30-DAY PLAN TEST SUITE");
console.log("==========================================\n");

// 1. Verify CSV Data file
const csvContent = fs.readFileSync(path.join(__dirname, "..", "GATE_CSE_30_Day_Final_Plan.csv"), "utf8");
assert(csvContent.length > 500, "CSV content must be non-empty");
console.log("✔ Test 1: GATE_CSE_30_Day_Final_Plan.csv exists and is populated.");

// 2. Mock Browser Environment for Engine Test
const mockStorage = {};
global.localStorage = {
  getItem: (k) => (k in mockStorage ? mockStorage[k] : null),
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
global.window = global;
global.dispatchEvent = () => {};
global.Event = function(name) { this.name = name; };

require("../js/planData.js");
require("../js/schedule.js");

const GK = global.Gatekeeper;
assert(GK, "Gatekeeper runtime must be defined");
console.log("✔ Test 2: planData.js and schedule.js loaded successfully.");

// 3. Test Schedule Structure
const stats = GK.computeStats();
assert.strictEqual(stats.totalDays, 30, "Must have exactly 30 total days");
assert.strictEqual(stats.total, 185, "Must have exactly 185 sessions");
assert.strictEqual(stats.totalLectures, 114, "Must have exactly 114 video lectures");
console.log("✔ Test 3: Plan totals verified (30 Days, 185 Sessions, 114 Video Lectures).");

// 4. Test Day 1 Structure & Time Slots
const day1 = stats.schedule[0];
assert.strictEqual(day1.day, 1, "Day 1 must have day number 1");
assert.strictEqual(day1.lectures.length, 6, "Day 1 must have 6 slots");
assert.strictEqual(day1.lectures[0].subject, "Aptitude");
assert.strictEqual(day1.lectures[0].lecture, 11);
assert.strictEqual(day1.lectures[0].time, "07:00-08:30");
assert(day1.lectures[0].youtubeLink.includes("uVnd48hTx_I"), "Day 1 Aptitude Lec 11 link match");

assert.strictEqual(day1.lectures[2].subject, "Digital Electronics");
assert.strictEqual(day1.lectures[2].lecture, 1);
assert.strictEqual(day1.lectures[2].time, "10:00-12:00");
assert(day1.lectures[2].youtubeLink.includes("iuw4Wfa70xs"), "Day 1 DE Lec 1 link match");

assert.strictEqual(day1.lectures[3].subject, "COA");
assert.strictEqual(day1.lectures[3].lecture, 1);
assert.strictEqual(day1.lectures[3].time, "14:00-16:00");
assert(day1.lectures[3].youtubeLink.includes("Ow6nOdrBvTw"), "Day 1 COA Lec 1 link match");
console.log("✔ Test 4: Day 1 schedule and time slots match specifications.");

// 5. Test Day 30 Structure & Final Revision Day
const day30 = stats.schedule[29];
assert.strictEqual(day30.day, 30, "Day 30 must have day number 30");
assert.strictEqual(day30.isFinalDay, true, "Day 30 must be flagged as final day");
assert.strictEqual(day30.lectures.length, 8, "Day 30 must have 8 slots (4 clock lectures + revision + mock + practice + daily revision)");
assert.strictEqual(day30.lectures[0].topic, "Clock Part 1");
assert.strictEqual(day30.lectures[3].topic, "Clock Part 4");
assert.strictEqual(day30.lectures[4].subject, "Revision / PYQs");
assert.strictEqual(day30.lectures[5].subject, "Mock Test");
console.log("✔ Test 5: Day 30 Final Revision & Mock Day verified.");

// 6. Test TOC & Compiler Design URLs
const day11 = stats.schedule[10];
const tocLec1 = day11.lectures.find(l => l.subjectKey === "toc");
assert(tocLec1, "Day 11 must contain TOC Lec 1");
assert.strictEqual(tocLec1.youtubeLink, "https://www.youtube.com/live/Y0UpuWYOHd8?si=tpXxcYxH3kE3cxiV", "TOC URL must match requirement");

const day16 = stats.schedule[15];
const cdLec1 = day16.lectures.find(l => l.subjectKey === "cd");
assert(cdLec1, "Day 16 must contain CD Lec 1");
assert.strictEqual(cdLec1.youtubeLink, "https://www.youtube.com/live/TNRixXGSSkY?si=dKfUA-T2sQsn23S0", "CD URL must match requirement");
console.log("✔ Test 6: TOC and Compiler Design exact YouTube links verified.");

// 7. Test Checkbox & Dynamic Progress Calculation
assert.strictEqual(GK.computeStats().overallPct, 0);
assert.strictEqual(GK.isDone(day1.lectures[0].id), false);

// Tick Day 1 Lecture 1
GK.setDone(day1.lectures[0].id, true);
assert.strictEqual(GK.isDone(day1.lectures[0].id), true);
let s2 = GK.computeStats();
assert.strictEqual(s2.done, 1);
assert.strictEqual(s2.lecturesDone, 1);
assert(s2.overallPct >= 1, "Overall progress must be >= 1%");

// Untick Day 1 Lecture 1
GK.setDone(day1.lectures[0].id, false);
assert.strictEqual(GK.isDone(day1.lectures[0].id), false);
assert.strictEqual(GK.computeStats().done, 0);
console.log("✔ Test 7: Ticking / unticking lectures dynamically updates completion count and progress percentage.");

// 8. Test Streak Calculation
GK.setActiveDay(3);
// Complete all 6 lectures of Day 1
day1.lectures.forEach(l => GK.setDone(l.id, true));
assert.strictEqual(GK.isDayComplete(day1), true, "Day 1 must be complete");

// Complete all lectures of Day 2
const day2 = stats.schedule[1];
day2.lectures.forEach(l => GK.setDone(l.id, true));
assert.strictEqual(GK.isDayComplete(day2), true, "Day 2 must be complete");

let sStreak = GK.computeStats();
assert.strictEqual(sStreak.current, 2, "Current streak should be 2 consecutive completed days");
assert.strictEqual(sStreak.best, 2, "Best streak should be 2");

// Reset ticks
GK.resetTicks();
assert.strictEqual(GK.computeStats().done, 0);
assert.strictEqual(GK.computeStats().current, 0);
console.log("✔ Test 8: Streak calculations and reset functionality verified.");

// 9. Verify HTML files content
const indexHtml = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const trackerHtml = fs.readFileSync(path.join(__dirname, "..", "tracker.html"), "utf8");
const statsHtml = fs.readFileSync(path.join(__dirname, "..", "stats.html"), "utf8");

assert(indexHtml.includes("30-DAY GATE CSE CRASH PLAN"), "index.html must have new plan title");
assert(!indexHtml.includes("Engineering Maths"), "index.html must NOT have old subjects");
assert(!indexHtml.includes("Operating System"), "index.html must NOT have old subjects");

assert(trackerHtml.includes("Full 30-Day Roadmap"), "tracker.html must have full roadmap header");
assert(trackerHtml.includes("btn-yt"), "tracker.html must have YouTube button class");
assert(trackerHtml.includes("dayNavScroll"), "tracker.html must have horizontal day navigator");

assert(statsHtml.includes("30-Day Grid"), "stats.html must have 30-day grid header");
assert(statsHtml.includes("Silicon Master"), "stats.html must have DE achievement");
assert(statsHtml.includes("Network Navigator"), "stats.html must have CN achievement");
console.log("✔ Test 9: HTML templates verified clean of old plan references.");

console.log("\n==========================================");
console.log("ALL 9 AUTOMATED TESTS PASSED SUCCESSFULLY!");
console.log("==========================================");
