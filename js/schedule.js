/* Gatekeeper — shared data + storage layer, loaded on every page before the page's own script. */
(function (global) {
  "use strict";

  const LINKS = {
    math: "https://www.youtube.com/playlist?list=PLvTTv60o7qj_tdY9zH7YceES7jfXiZkAz",
    os: "https://www.youtube.com/playlist?list=PL3eEXnCBViH8VzPps-6bxQUhwZ0MnYqTT",
    algo: "https://youtube.com/playlist?list=PLOG_8OlGMp71sEpjL2T7p8eAvuScptLWl",
    ds: "https://www.youtube.com/playlist?list=PL3eEXnCBViH_v3UqA7bY7Fh8sIe-a2H-S",
    dbms: null,
  };

  const LECTURE_LINKS = {
    math: {
      1: "https://www.youtube.com/watch?v=b-UZJVdLbXc",
      2: "https://www.youtube.com/watch?v=OWykXurjpFU",
      3: "https://www.youtube.com/watch?v=HyaeoGZyX10",
      4: "https://www.youtube.com/watch?v=tUDr-4sVOf4",
      5: "https://www.youtube.com/watch?v=UbNtMrCDAKA",
      6: "https://www.youtube.com/watch?v=lriozzCRpHY",
      7: "https://www.youtube.com/watch?v=zZ5OXIeYtYQ",
      8: "https://www.youtube.com/watch?v=GRdSTBaAZMY",
      9: "https://www.youtube.com/watch?v=0DpfmzwAvjE",
      10: "https://www.youtube.com/watch?v=dN42j0bGOjs",
      11: "https://www.youtube.com/watch?v=1mw7fpPbYMU",
      12: "https://www.youtube.com/watch?v=SzMQzgQHIkg",
      13: "https://www.youtube.com/watch?v=Cg71bRRYZsc",
      14: "https://www.youtube.com/watch?v=r1p8pUd7AWs",
      15: "https://www.youtube.com/watch?v=W8uG3SUGjVM",
      16: "https://www.youtube.com/watch?v=YCBD6_NK3T4",
      17: "https://www.youtube.com/watch?v=yLcmMa33Ydc",
      18: "https://www.youtube.com/watch?v=T0MwNyNBuw4",
      19: "https://www.youtube.com/watch?v=J7pdWz2M3zg",
      20: "https://www.youtube.com/watch?v=5y70mUdzHT4",
      21: "https://www.youtube.com/watch?v=Z5S3tLEUgjQ",
      22: "https://www.youtube.com/watch?v=uwYi9MVBTcc",
      23: "https://www.youtube.com/watch?v=HtuVQxzT73k",
      24: "https://www.youtube.com/watch?v=jZqXMuwiGTI",
      25: "https://www.youtube.com/watch?v=iAyZFAX_FCk",
      26: "https://www.youtube.com/watch?v=JQOKmUnfdVk",
      27: "https://www.youtube.com/watch?v=t8kqlaslMBk",
      28: "https://www.youtube.com/watch?v=qWZAwOUJNDQ",
      29: "https://www.youtube.com/watch?v=Wal1EA_rYhE",
      30: "https://www.youtube.com/watch?v=H1sXMwVUgpE",
      31: "https://www.youtube.com/watch?v=NrwpmbIS-Os",
      32: "https://www.youtube.com/watch?v=f3MkZBFLuHs",
      33: "https://www.youtube.com/watch?v=2oEVuehArX4",
      34: "https://www.youtube.com/watch?v=GFuaHgR3OEQ",
      35: "https://www.youtube.com/watch?v=Jhz5wt4W0AQ",
      36: "https://www.youtube.com/watch?v=gGzklL88YI8",
      37: "https://www.youtube.com/watch?v=OMjIOGXQhpk",
      38: "https://www.youtube.com/watch?v=Ucmpugts1dw",
    },
    os: {
      1: "https://www.youtube.com/watch?v=_yYxoqsEGo0",
      2: "https://www.youtube.com/watch?v=JD9Q8jWW6iM",
      3: "https://www.youtube.com/watch?v=K71pRtq7aB4",
      4: "https://www.youtube.com/watch?v=-_oQS2ACtY4",
      5: "https://www.youtube.com/watch?v=uVzaPlD69Y4",
      6: "https://www.youtube.com/watch?v=hoBLxlcxhXs",
      7: "https://www.youtube.com/watch?v=Ak1a0MnvTH0",
    },
    ds: {
      1: "https://www.youtube.com/watch?v=GicSPlosq-I",
      2: "https://www.youtube.com/watch?v=55W7AOLL3-U",
      3: "https://www.youtube.com/watch?v=HDolI680pr8",
      4: "https://www.youtube.com/watch?v=v7emeyxACjE",
      5: "https://www.youtube.com/watch?v=iU-WT3DPSf4",
      6: "https://www.youtube.com/watch?v=VnZPAS0Cfas",
      7: "https://www.youtube.com/watch?v=3STggS0LVTQ",
      8: "https://www.youtube.com/watch?v=jFbpavkuF6A",
      9: "https://www.youtube.com/watch?v=bj3Z5SPF70I",
      10: "https://www.youtube.com/watch?v=LYek8Rhl-o0",
      11: "https://www.youtube.com/watch?v=rn-Yo162kjU",
    },
    algo: {
      1: "https://www.youtube.com/watch?v=o-_z_p7dS_A",
      2: "https://www.youtube.com/watch?v=EjUNRTc4iao",
      3: "https://www.youtube.com/watch?v=Yfs4EVXYl74",
      4: "https://www.youtube.com/watch?v=QLG9w4DAIFg",
      5: "https://www.youtube.com/watch?v=BMA_aaok58g",
      6: "https://www.youtube.com/watch?v=iFSeErtrk-E",
      7: "https://www.youtube.com/watch?v=wZelDjl3LmE",
      8: "https://www.youtube.com/watch?v=t_06o5t-zEQ",
      9: "https://www.youtube.com/watch?v=kXXQvRkBjQc",
      10: "https://www.youtube.com/watch?v=2ZECXmq3_nc",
      11: "https://www.youtube.com/watch?v=TGdeRn3Yr4A",
      12: "https://www.youtube.com/watch?v=QmMqvrFRi0I",
      13: "https://www.youtube.com/watch?v=kmPLQ_E82dk",
      14: "https://www.youtube.com/watch?v=XEo79g8ggzI",
      15: "https://www.youtube.com/watch?v=_c1BrHhTxr4",
      16: "https://www.youtube.com/watch?v=QXVGlRedhJE",
      17: "https://www.youtube.com/watch?v=Y-UDSqPwPRM",
    },
    dbms: {},
  };

  function L(subjectKey, name, label, link) {
    if (link !== undefined) {
      return { subjectKey, name, label, link };
    }
    const match = label && label.match(/Lec-(\d+)/i);
    if (match && LECTURE_LINKS[subjectKey] && LECTURE_LINKS[subjectKey][match[1]]) {
      return { subjectKey, name, label, link: LECTURE_LINKS[subjectKey][match[1]] };
    }
    return { subjectKey, name, label, link: LINKS[subjectKey] || null };
  }

  // Known subjects get a fixed, deliberate color. Anything added later gets one
  // assigned automatically from PALETTE so new subjects never break the design.
  const SUBJECT_META = {
    math: { name: "Engineering Maths", color: "#C7973F" },
    os: { name: "Operating Systems", color: "#6C93A6" },
    ds: { name: "Data Structures", color: "#8E7FB5" },
    algo: { name: "Algorithms", color: "#71916B" },
    dbms: { name: "DBMS", color: "#B5583C" },
    revision: { name: "Revision & Practice", color: "#8C9099" },
  };
  const PALETTE = ["#C7973F", "#6C93A6", "#8E7FB5", "#71916B", "#B5583C", "#9AA15E", "#6E85B5", "#B5729B"];
  function hashKey(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }
  function metaFor(subjectKey, fallbackName) {
    if (SUBJECT_META[subjectKey]) return SUBJECT_META[subjectKey];
    const color = PALETTE[hashKey(subjectKey) % PALETTE.length];
    const meta = { name: fallbackName || subjectKey, color };
    SUBJECT_META[subjectKey] = meta; // cache so it stays stable this session
    return meta;
  }

  const BASE_SCHEDULE = [
    { date: "2026-09-03", dayCount: 3, lectures: [L("math", "Math", "Lec-10"), L("os", "OS", "Lec-3")] },
    { date: "2026-09-04", dayCount: 4, lectures: [L("math", "Math", "Lec-11"), L("os", "OS", "Lec-4")] },
    { date: "2026-09-05", dayCount: 5, lectures: [L("math", "Math", "Lec-12"), L("os", "OS", "Lec-5")] },
    { date: "2026-09-06", dayCount: 6, lectures: [L("math", "Math", "Lec-13"), L("os", "OS", "Lec-6")] },
    { date: "2026-09-07", dayCount: 7, lectures: [L("math", "Math", "Lec-31"), L("os", "OS", "Lec-7")] },
    { date: "2026-09-08", dayCount: 8, lectures: [L("math", "Math", "Lec-32"), L("ds", "DS", "Lec-1")] },
    { date: "2026-09-09", dayCount: 9, lectures: [L("math", "Math", "Lec-33"), L("ds", "DS", "Lec-2")] },
    { date: "2026-09-10", dayCount: 10, lectures: [L("math", "Math", "Lec-34"), L("ds", "DS", "Lec-3")] },
    { date: "2026-09-11", dayCount: 11, lectures: [L("math", "Math", "Lec-35"), L("ds", "DS", "Lec-4")] },
    { date: "2026-09-12", dayCount: 12, lectures: [L("math", "Math", "Lec-36"), L("ds", "DS", "Lec-5")] },
    { date: "2026-09-13", dayCount: 13, lectures: [L("math", "Math", "Lec-37"), L("ds", "DS", "Lec-6")] },
    { date: "2026-09-14", dayCount: 14, lectures: [L("math", "Math", "Lec-14"), L("ds", "DS", "Lec-7")] },
    { date: "2026-09-15", dayCount: 15, lectures: [L("math", "Math", "Lec-15"), L("ds", "DS", "Lec-8")] },
    { date: "2026-09-16", dayCount: 16, lectures: [L("math", "Math", "Lec-16"), L("ds", "DS", "Lec-9")] },
    { date: "2026-09-17", dayCount: 17, lectures: [L("math", "Math", "Lec-17"), L("ds", "DS", "Lec-10")] },
    { date: "2026-09-18", dayCount: 18, lectures: [L("math", "Math", "Lec-18"), L("ds", "DS", "Lec-11")] },
    { date: "2026-09-19", dayCount: 19, lectures: [L("math", "Math", "Lec-19"), L("algo", "Algo", "Lec-1")] },
    { date: "2026-09-20", dayCount: 20, lectures: [L("math", "Math", "Lec-20"), L("algo", "Algo", "Lec-2")] },
    { date: "2026-09-21", dayCount: 21, lectures: [L("math", "Math", "Lec-21"), L("algo", "Algo", "Lec-3")] },
    { date: "2026-09-22", dayCount: 22, lectures: [L("math", "Math", "Lec-22"), L("algo", "Algo", "Lec-4")] },
    { date: "2026-09-23", dayCount: 23, lectures: [L("math", "Math", "Lec-23"), L("algo", "Algo", "Lec-5")] },
    { date: "2026-09-24", dayCount: 24, lectures: [L("math", "Math", "Lec-24"), L("algo", "Algo", "Lec-6")] },
    { date: "2026-09-25", dayCount: 25, lectures: [L("math", "Math", "Lec-25"), L("algo", "Algo", "Lec-7")] },
    { date: "2026-09-26", dayCount: 26, lectures: [L("math", "Math", "Lec-26"), L("algo", "Algo", "Lec-8")] },
    { date: "2026-09-27", dayCount: 27, lectures: [L("math", "Math", "Lec-27"), L("algo", "Algo", "Lec-9")] },
    { date: "2026-09-28", dayCount: 28, lectures: [L("math", "Math", "Lec-28"), L("algo", "Algo", "Lec-10")] },
    { date: "2026-09-29", dayCount: 29, lectures: [L("math", "Math", "Lec-29"), L("algo", "Algo", "Lec-11")] },
    { date: "2026-09-30", dayCount: 30, lectures: [L("math", "Math", "Lec-30"), L("algo", "Algo", "Lec-12")] },
    { date: "2026-10-01", dayCount: 1, lectures: [L("math", "Math", "Lec-38"), L("algo", "Algo", "Lec-13")] },
    { date: "2026-10-02", dayCount: 2, lectures: [L("algo", "Algo", "Lec-14")] },
    { date: "2026-10-03", dayCount: 3, lectures: [L("algo", "Algo", "Lec-15"), L("dbms", "DBMS", "Lec-1 (2 Hrs)")] },
    { date: "2026-10-04", dayCount: 4, lectures: [L("algo", "Algo", "Lec-16"), L("dbms", "DBMS", "Lec-2 (2 Hrs)")] },
    { date: "2026-10-05", dayCount: 5, lectures: [L("algo", "Algo", "Lec-17"), L("dbms", "DBMS", "Lec-3 (2 Hrs)")] },
    { date: "2026-10-06", dayCount: 6, lectures: [L("revision", "Revision", "Revision & Practice", null)] },
    { date: "2026-10-07", dayCount: 7, lectures: [L("revision", "Revision", "Revision & Practice", null)] },
    { date: "2026-10-08", dayCount: 8, lectures: [L("revision", "Revision", "Revision & Practice", null)] },
    { date: "2026-10-09", dayCount: 9, lectures: [L("revision", "Revision", "Revision & Practice", null)] },
    { date: "2026-10-10", dayCount: 10, lectures: [L("revision", "Revision", "Revision & Practice", null)] },
    { date: "2026-10-11", dayCount: 11, lectures: [L("revision", "Revision", "Revision & Practice", null)] },
  ];

  const TICKS_KEY = "gatekeeper_ticks_v1";
  const EXTRA_KEY = "gatekeeper_extra_days_v1";

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function saveJSON(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  let ticks = loadJSON(TICKS_KEY, {}); // { lectureId: true }
  let extraDays = loadJSON(EXTRA_KEY, []); // user-added day objects (raw, pre-id)

  function syncProgress() {
    if (global.GatekeeperAuth) global.GatekeeperAuth.saveProgress(ticks, extraDays).catch(() => {});
  }

  // Start with local data for an instant render, then replace it with the signed-in user's data.
  if (global.GatekeeperAuth && global.GatekeeperAuth.isConfigured()) {
    global.GatekeeperAuth.loadProgress().then((data) => {
      ticks = data && data.ticks && typeof data.ticks === "object" ? data.ticks : {};
      extraDays = data && Array.isArray(data.extra_days) ? data.extra_days : [];
      global.dispatchEvent(new Event("gatekeeper:progress-ready"));
    }).catch(() => {});
  }

  function assignIds(days) {
    days.forEach((day) => {
      day.lectures.forEach((lec, i) => {
        lec.id = day.date + "__" + i;
        metaFor(lec.subjectKey, lec.name);
      });
    });
    return days;
  }

  function getSchedule() {
    const merged = BASE_SCHEDULE.map((d) => ({ date: d.date, dayCount: d.dayCount, lectures: d.lectures, added: false })).concat(
      extraDays.map((d) => ({ date: d.date, dayCount: d.dayCount || null, lectures: d.lectures, added: true }))
    );
    merged.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    assignIds(merged);
    return merged;
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
  function isDayComplete(day) {
    return day.lectures.length > 0 && day.lectures.every((l) => isDone(l.id));
  }

  function todayLocalISO() {
    const now = new Date();
    const y = now.getFullYear(),
      m = String(now.getMonth() + 1).padStart(2, "0"),
      d = String(now.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function computeStats() {
    const schedule = getSchedule();
    const todayISO = todayLocalISO();
    let idxAtOrBefore = -1;
    for (let i = 0; i < schedule.length; i++) {
      if (schedule[i].date <= todayISO) idxAtOrBefore = i;
      else break;
    }
    let i = idxAtOrBefore;
    if (i >= 0 && !isDayComplete(schedule[i])) i--;
    let current = 0;
    while (i >= 0 && isDayComplete(schedule[i])) {
      current++;
      i--;
    }

    let best = 0,
      run = 0;
    schedule.forEach((day) => {
      if (isDayComplete(day)) {
        run++;
        best = Math.max(best, run);
      } else run = 0;
    });

    let done = 0,
      total = 0;
    const bySubjectTotal = {},
      bySubjectDone = {};
    schedule.forEach((day) =>
      day.lectures.forEach((l) => {
        total++;
        bySubjectTotal[l.subjectKey] = (bySubjectTotal[l.subjectKey] || 0) + 1;
        if (isDone(l.id)) {
          done++;
          bySubjectDone[l.subjectKey] = (bySubjectDone[l.subjectKey] || 0) + 1;
        }
      })
    );

    const daysComplete = schedule.filter(isDayComplete).length;

    return {
      schedule,
      todayISO,
      idxAtOrBefore,
      current,
      best,
      done,
      total,
      bySubjectTotal,
      bySubjectDone,
      daysComplete,
      daysTotal: schedule.length,
    };
  }

  function resetTicks() {
    ticks = {};
    saveJSON(TICKS_KEY, ticks);
    syncProgress();
  }

  function resetExtraDays() {
    extraDays = [];
    saveJSON(EXTRA_KEY, extraDays);
    syncProgress();
  }

  // Add days from a user-pasted JSON array. Each entry:
  // { "date": "2026-10-12", "lectures": [ { "subjectKey": "cn", "name": "CN", "label": "Lec-1", "link": "https://..." } ] }
  // Returns { ok, count, error }
  function addExtraDays(jsonText) {
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      return { ok: false, error: "That isn't valid JSON — check for a missing comma or bracket." };
    }
    if (!Array.isArray(parsed)) return { ok: false, error: "Expected a JSON array of day objects." };
    const existingDates = new Set(getSchedule().map((d) => d.date));
    const clean = [];
    for (const entry of parsed) {
      if (!entry.date || typeof entry.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
        return { ok: false, error: "Every day needs a date like \"2026-10-12\"." };
      }
      if (existingDates.has(entry.date)) {
        return { ok: false, error: "Day " + entry.date + " is already on the schedule." };
      }
      if (!Array.isArray(entry.lectures) || entry.lectures.length === 0) {
        return { ok: false, error: "Day " + entry.date + " needs a non-empty \"lectures\" array." };
      }
      const lectures = [];
      for (const lec of entry.lectures) {
        if (!lec.subjectKey || !lec.label) {
          return { ok: false, error: "Each lecture needs at least \"subjectKey\" and \"label\"." };
        }
        lectures.push({
          subjectKey: String(lec.subjectKey).toLowerCase(),
          name: lec.name || lec.subjectKey,
          label: lec.label,
          link: lec.link || null,
        });
      }
      clean.push({ date: entry.date, dayCount: entry.dayCount || null, lectures });
      existingDates.add(entry.date);
    }
    extraDays = extraDays.concat(clean);
    saveJSON(EXTRA_KEY, extraDays);
    syncProgress();
    return { ok: true, count: clean.length };
  }

  global.Gatekeeper = {
    getSchedule,
    isDone,
    setDone,
    isDayComplete,
    computeStats,
    todayLocalISO,
    metaFor,
    resetTicks,
    resetExtraDays,
    addExtraDays,
    hasExtraDays: () => extraDays.length > 0,
  };
})(window);
