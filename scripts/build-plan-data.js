const fs = require("fs");
const path = require("path");

function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const row = [];
    let insideQuotes = false;
    let currentField = "";
    
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(currentField.trim());
        currentField = "";
      } else {
        currentField += char;
      }
    }
    row.push(currentField.trim());
    rows.push(row);
  }
  return rows;
}

const csvPath = path.join(__dirname, "..", "GATE_CSE_30_Day_Final_Plan.csv");
const csvContent = fs.readFileSync(csvPath, "utf8");
const rawRows = parseCSV(csvContent);

// Subject mapping and key normalization
function getSubjectKey(subject) {
  const s = subject.trim().toLowerCase();
  if (s.includes("digital electronics")) return "de";
  if (s.includes("coa") || s.includes("computer organization")) return "coa";
  if (s.includes("computer networks") || s === "cn") return "cn";
  if (s.includes("theory of computation") || s === "toc") return "toc";
  if (s.includes("compiler design") || s === "cd") return "cd";
  if (s.includes("aptitude")) return "aptitude";
  if (s.includes("mock")) return "mock";
  if (s.includes("practice")) return "practice";
  if (s.includes("revision")) return "revision";
  return "other";
}

const subjectMeta = {
  aptitude: { name: "Aptitude", shortName: "Aptitude", color: "#F9A826" },
  de: { name: "Digital Electronics", shortName: "DE", color: "#E58E26" },
  coa: { name: "Computer Organization & Architecture", shortName: "COA", color: "#4A90E2" },
  cn: { name: "Computer Networks", shortName: "CN", color: "#2ECC71" },
  toc: { name: "Theory of Computation", shortName: "TOC", color: "#9B5DE5" },
  cd: { name: "Compiler Design", shortName: "CD", color: "#E056FD" },
  practice: { name: "Practice / PYQs", shortName: "Practice", color: "#8E9AA8" },
  revision: { name: "Daily Revision", shortName: "Revision", color: "#A4B0BE" },
  mock: { name: "Mock Test", shortName: "Mock Test", color: "#FF5252" }
};

const daysMap = {};
let totalItems = 0;
let lectureItems = 0;

rawRows.forEach((row, index) => {
  const [dayStr, time, subject, lectureStr, topic, youtubeLink, task] = row;
  const day = parseInt(dayStr, 10);
  const subjectKey = getSubjectKey(subject);
  
  if (!daysMap[day]) {
    daysMap[day] = {
      day: day,
      dayTitle: day === 30 ? "Day 30 — Final Revision Day" : `Day ${day}`,
      isFinalDay: day === 30,
      lectures: []
    };
  }

  const isLecture = lectureStr && lectureStr !== "-" && lectureStr.trim() !== "";
  const lectureNum = isLecture ? parseInt(lectureStr, 10) || lectureStr : null;
  const id = `day${day}_${subjectKey}_${lectureNum || index}`;

  const item = {
    id: id,
    day: day,
    time: time || "",
    subject: subject.trim(),
    subjectKey: subjectKey,
    lecture: lectureNum,
    topic: topic.trim(),
    youtubeLink: youtubeLink ? youtubeLink.trim() : null,
    task: task ? task.trim() : "",
    isLecture: !!isLecture
  };

  daysMap[day].lectures.push(item);
  totalItems++;
  if (isLecture) lectureItems++;
});

const planArray = Object.keys(daysMap)
  .map(k => parseInt(k, 10))
  .sort((a, b) => a - b)
  .map(k => daysMap[k]);

console.log("Plan processed:");
console.log("Total Days:", planArray.length);
console.log("Total Sessions/Rows:", totalItems);
console.log("Total Core/Aptitude Lectures with numbers:", lectureItems);

// Ensure data directory exists
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write 30-day-plan.json
const jsonOutput = {
  version: "2026-30-DAY-GATE-V2",
  planName: "30-Day GATE CSE Plan",
  totalDays: planArray.length,
  totalItems: totalItems,
  subjectMeta: subjectMeta,
  days: planArray
};

fs.writeFileSync(
  path.join(dataDir, "30-day-plan.json"),
  JSON.stringify(jsonOutput, null, 2),
  "utf8"
);
console.log("Written data/30-day-plan.json");

// Write js/planData.js as a bundleable / script-tag loadable object
const jsOutput = `/* Gatekeeper 30-Day GATE CSE Plan Data (Generated from GATE_CSE_30_Day_Final_Plan.csv) */
(function (global) {
  "use strict";
  global.GATE_30_DAY_PLAN = ${JSON.stringify(jsonOutput, null, 2)};
})(typeof window !== "undefined" ? window : global);
`;

fs.writeFileSync(
  path.join(__dirname, "..", "js", "planData.js"),
  jsOutput,
  "utf8"
);
console.log("Written js/planData.js");
