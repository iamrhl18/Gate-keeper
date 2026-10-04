/* ============================================================
   Gatekeeper — 30-Day GATE CSE Study Plan Runtime & Data Engine
   Version: 2026-30-DAY-GATE-V2
   ============================================================ */
(function (global) {
  "use strict";

  const PLAN_VERSION = "2026-30-DAY-GATE-V2";
  const TICKS_KEY = "gateKeeper30DayPlanProgress";
  const VERSION_KEY = "gatekeeper_plan_version";
  const START_DATE_KEY = "gatekeeper_30day_start_date";
  const ACTIVE_DAY_KEY = "gatekeeper_30day_active_day";

  // Subject metadata with distinct, refined modern color palette
  const SUBJECT_META = {
    aptitude: {
      name: "General Aptitude",
      shortName: "Aptitude",
      color: "#F5A623",
      tagBg: "rgba(245, 166, 35, 0.12)",
      border: "rgba(245, 166, 35, 0.25)",
      icon: "🧠"
    },
    de: {
      name: "Digital Electronics",
      shortName: "DE",
      color: "#06B6D4",
      tagBg: "rgba(6, 182, 212, 0.12)",
      border: "rgba(6, 182, 212, 0.25)",
      icon: "💻"
    },
    coa: {
      name: "Computer Organization & Architecture",
      shortName: "COA",
      color: "#A855F7",
      tagBg: "rgba(168, 85, 247, 0.12)",
      border: "rgba(168, 85, 247, 0.25)",
      icon: "🖥️"
    },
    cn: {
      name: "Computer Networks",
      shortName: "CN",
      color: "#3B82F6",
      tagBg: "rgba(59, 130, 246, 0.12)",
      border: "rgba(59, 130, 246, 0.25)",
      icon: "🌐"
    },
    toc: {
      name: "Theory of Computation",
      shortName: "TOC",
      color: "#EC4899",
      tagBg: "rgba(236, 72, 153, 0.12)",
      border: "rgba(236, 72, 153, 0.25)",
      icon: "⚙️"
    },
    cd: {
      name: "Compiler Design",
      shortName: "CD",
      color: "#10B981",
      tagBg: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.25)",
      icon: "📝"
    },
    practice: {
      name: "Practice / PYQs",
      shortName: "Practice",
      color: "#F97316",
      tagBg: "rgba(249, 115, 22, 0.12)",
      border: "rgba(249, 115, 22, 0.25)",
      icon: "⚡"
    },
    revision: {
      name: "Daily Revision",
      shortName: "Revision",
      color: "#94A3B8",
      tagBg: "rgba(148, 163, 184, 0.12)",
      border: "rgba(148, 163, 184, 0.25)",
      icon: "🔄"
    },
    mock: {
      name: "Full Mock Test",
      shortName: "Mock Test",
      color: "#EF4444",
      tagBg: "rgba(239, 68, 68, 0.12)",
      border: "rgba(239, 68, 68, 0.25)",
      icon: "🔥"
    }
  };

  function getStorageItem(key) {
    try {
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(key);
      }
    } catch (e) {}
    return null;
  }

  function setStorageItem(key, val) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, val);
      }
    } catch (e) {}
  }

  function loadJSON(key, fallback) {
    try {
      const raw = getStorageItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJSON(key, val) {
    try {
      setStorageItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  // Version check: ensure clean state on new plan version
  const storedVersion = getStorageItem(VERSION_KEY);
  if (storedVersion !== PLAN_VERSION) {
    // New plan version migration
    setStorageItem(VERSION_KEY, PLAN_VERSION);
    // If old ticks key exists, do not mix it
    if (!getStorageItem(TICKS_KEY)) {
      saveJSON(TICKS_KEY, {});
    }
  }

  let ticks = loadJSON(TICKS_KEY, {});

  function syncProgress() {
    if (global.GatekeeperAuth && global.GatekeeperAuth.isConfigured()) {
      global.GatekeeperAuth.saveProgress(ticks, {
        startDate: getStartDate(),
        version: PLAN_VERSION
      }).catch(() => {});
    }
  }

  // Cloud sync listener
  if (global.GatekeeperAuth && global.GatekeeperAuth.isConfigured()) {
    global.GatekeeperAuth.loadProgress().then((data) => {
      if (data && data.ticks && typeof data.ticks === "object") {
        ticks = data.ticks;
        saveJSON(TICKS_KEY, ticks);
        global.dispatchEvent(new Event("gatekeeper:progress-ready"));
      }
    }).catch(() => {});
  }

  // Get raw plan from GATE_30_DAY_PLAN (loaded by js/planData.js)
  function getRawPlan() {
    if (global.GATE_30_DAY_PLAN && global.GATE_30_DAY_PLAN.days) {
      return global.GATE_30_DAY_PLAN;
    }
    return { days: [] };
  }

  function todayLocalISO() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function getStartDate() {
    let d = getStorageItem(START_DATE_KEY);
    if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      d = todayLocalISO();
      setStorageItem(START_DATE_KEY, d);
    }
    return d;
  }

  function setStartDate(dateStr) {
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      setStorageItem(START_DATE_KEY, dateStr);
      if (typeof global.dispatchEvent === "function") {
        global.dispatchEvent(new Event("gatekeeper:progress-ready"));
      }
    }
  }

  function getActiveDay() {
    const stored = parseInt(getStorageItem(ACTIVE_DAY_KEY), 10);
    if (stored >= 1 && stored <= 30) return stored;
    
    // Compute day relative to start date
    const start = new Date(getStartDate() + "T00:00:00");
    const today = new Date(todayLocalISO() + "T00:00:00");
    const diffDays = Math.floor((today - start) / 86400000) + 1;
    if (diffDays >= 1 && diffDays <= 30) return diffDays;
    if (diffDays < 1) return 1;
    return 30;
  }

  function setActiveDay(dayNum) {
    const d = Math.max(1, Math.min(30, parseInt(dayNum, 10) || 1));
    setStorageItem(ACTIVE_DAY_KEY, String(d));
    if (typeof global.dispatchEvent === "function") {
      global.dispatchEvent(new Event("gatekeeper:active-day-changed"));
    }
    return d;
  }

  function metaFor(subjectKey, fallbackName) {
    const key = (subjectKey || "").toLowerCase();
    if (SUBJECT_META[key]) return SUBJECT_META[key];
    // Dynamic fallback
    return {
      name: fallbackName || subjectKey || "Subject",
      shortName: fallbackName || subjectKey || "SUB",
      color: "#C7973F",
      tagBg: "rgba(199, 151, 63, 0.15)",
      border: "rgba(199, 151, 63, 0.35)",
      icon: "📚"
    };
  }

  function getDateForDay(dayNum) {
    const start = new Date(getStartDate() + "T00:00:00");
    const target = new Date(start.getTime() + (dayNum - 1) * 86400000);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function getSchedule() {
    const plan = getRawPlan();
    return plan.days.map((dayObj) => {
      const dateStr = getDateForDay(dayObj.day);
      return {
        day: dayObj.day,
        dayTitle: dayObj.dayTitle,
        isFinalDay: dayObj.isFinalDay,
        date: dateStr,
        lectures: dayObj.lectures.map((l) => ({
          ...l,
          isDone: !!ticks[l.id],
          meta: metaFor(l.subjectKey, l.subject)
        }))
      };
    });
  }

  function isDone(id) {
    return !!ticks[id];
  }

  function setDone(id, val) {
    if (val) ticks[id] = true;
    else delete ticks[id];
    saveJSON(TICKS_KEY, ticks);
    syncProgress();
  }

  function toggleDone(id) {
    const nextVal = !ticks[id];
    setDone(id, nextVal);
    return nextVal;
  }

  function isDayComplete(dayOrDayNum) {
    const schedule = getSchedule();
    const targetDay = typeof dayOrDayNum === "number"
      ? schedule.find((d) => d.day === dayOrDayNum)
      : dayOrDayNum;
    if (!targetDay || !targetDay.lectures || targetDay.lectures.length === 0) return false;
    return targetDay.lectures.every((l) => isDone(l.id));
  }

  function getDayProgress(dayOrDayNum) {
    const schedule = getSchedule();
    const targetDay = typeof dayOrDayNum === "number"
      ? schedule.find((d) => d.day === dayOrDayNum)
      : dayOrDayNum;
    if (!targetDay || !targetDay.lectures) return { done: 0, total: 0, pct: 0, isComplete: false };
    const total = targetDay.lectures.length;
    const done = targetDay.lectures.filter((l) => isDone(l.id)).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, total, pct, isComplete: total > 0 && done === total };
  }

  function getNextLecture() {
    const schedule = getSchedule();
    for (const day of schedule) {
      for (const lec of day.lectures) {
        if (!isDone(lec.id) && lec.youtubeLink) {
          return {
            ...lec,
            day: day.day,
            dayTitle: day.dayTitle,
            date: day.date
          };
        }
      }
    }
    return null;
  }

  function computeStats() {
    const schedule = getSchedule();
    const todayISO = todayLocalISO();
    const activeDayNum = getActiveDay();
    const startDate = getStartDate();

    let done = 0;
    let total = 0;
    let lecturesDone = 0;
    let totalLectures = 0;

    const bySubjectTotal = {};
    const bySubjectDone = {};

    schedule.forEach((day) => {
      day.lectures.forEach((l) => {
        total++;
        if (l.isLecture) totalLectures++;

        const key = l.subjectKey;
        bySubjectTotal[key] = (bySubjectTotal[key] || 0) + 1;

        if (isDone(l.id)) {
          done++;
          if (l.isLecture) lecturesDone++;
          bySubjectDone[key] = (bySubjectDone[key] || 0) + 1;
        }
      });
    });

    // Days completed count
    let daysComplete = 0;
    schedule.forEach((day) => {
      if (isDayComplete(day)) daysComplete++;
    });

    // Streak calculation (consecutive completed days in schedule up to today/active day)
    let currentStreak = 0;
    let streakIdx = activeDayNum - 1;
    // If active day is not complete, look from day before
    if (streakIdx >= 0 && !isDayComplete(schedule[streakIdx])) {
      streakIdx--;
    }
    while (streakIdx >= 0 && isDayComplete(schedule[streakIdx])) {
      currentStreak++;
      streakIdx--;
    }

    // Best streak in entire 30 days
    let bestStreak = 0;
    let runningStreak = 0;
    schedule.forEach((day) => {
      if (isDayComplete(day)) {
        runningStreak++;
        if (runningStreak > bestStreak) bestStreak = runningStreak;
      } else {
        runningStreak = 0;
      }
    });

    const activeDaySchedule = schedule.find((d) => d.day === activeDayNum) || schedule[0];
    const todayProgress = getDayProgress(activeDaySchedule);
    const nextLecture = getNextLecture();
    const overallPct = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      version: PLAN_VERSION,
      totalDays: 30,
      daysTotal: 30,
      daysComplete,
      done,
      total,
      lecturesDone,
      totalLectures,
      overallPct,
      current: currentStreak,
      currentStreak,
      best: bestStreak,
      bestStreak,
      activeDayNum,
      todayDay: activeDayNum,
      activeDaySchedule,
      todayProgress,
      nextLecture,
      startDate,
      todayISO,
      schedule,
      bySubjectTotal,
      bySubjectDone
    };
  }

  function resetTicks() {
    ticks = {};
    saveJSON(TICKS_KEY, ticks);
    syncProgress();
    global.dispatchEvent(new Event("gatekeeper:progress-ready"));
  }

  function exportProgress() {
    return JSON.stringify({
      version: PLAN_VERSION,
      startDate: getStartDate(),
      ticks: ticks,
      exportedAt: new Date().toISOString()
    });
  }

  function importProgress(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data && typeof data.ticks === "object") {
        ticks = data.ticks;
        saveJSON(TICKS_KEY, ticks);
        if (data.startDate) setStartDate(data.startDate);
        syncProgress();
        global.dispatchEvent(new Event("gatekeeper:progress-ready"));
        return { ok: true };
      }
      return { ok: false, error: "Invalid backup data structure" };
    } catch (e) {
      return { ok: false, error: "Malformed JSON file" };
    }
  }

  function getMotivationalMessage(pct) {
    if (pct === 100) return "30 days complete. You showed up and conquered the gate.";
    if (pct >= 75) return "You're in the final stretch. Hold the line.";
    if (pct >= 50) return "Halfway there. Don't slow down now.";
    if (pct >= 25) return "You're building serious momentum. Keep going.";
    if (pct > 0) return "Great start. Consistency will win the rank.";
    return "Day 1 starts now. The gate opens with consistency.";
  }

  function getWeekStreak() {
    const schedule = getSchedule();
    const activeDayNum = getActiveDay();
    // Return last 7 days status ending at activeDayNum
    const days = [];
    const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
    const startIdx = Math.max(0, activeDayNum - 7);
    for (let i = 0; i < 7; i++) {
      const targetDayNum = startIdx + i + 1;
      if (targetDayNum <= 30) {
        const day = schedule[targetDayNum - 1];
        const isComplete = isDayComplete(day);
        days.push({
          dayNum: targetDayNum,
          label: "D" + targetDayNum,
          dayOfWeek: dayLabels[i % 7],
          isComplete: isComplete,
          isCurrent: targetDayNum === activeDayNum,
          isPast: targetDayNum <= activeDayNum
        });
      }
    }
    return days;
  }

  function navigateDay(delta) {
    const current = getActiveDay();
    const next = Math.max(1, Math.min(30, current + delta));
    return setActiveDay(next);
  }

  global.Gatekeeper = {
    PLAN_VERSION,
    SUBJECT_META,
    getSchedule,
    isDone,
    setDone,
    toggleDone,
    isDayComplete,
    getDayProgress,
    getNextLecture,
    computeStats,
    getStartDate,
    setStartDate,
    getActiveDay,
    setActiveDay,
    navigateDay,
    getMotivationalMessage,
    getWeekStreak,
    todayLocalISO,
    metaFor,
    resetTicks,
    exportProgress,
    importProgress
  };
})(typeof window !== "undefined" ? window : global);
