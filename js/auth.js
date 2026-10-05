/* ============================================================
   Gatekeeper — Authentication & Cloud Progress Sync (Supabase)
   ============================================================ */
(function (global) {
  "use strict";

  const DEFAULT_SUPABASE_URL = "https://hxckizhzvxwhktepeghd.supabase.co";
  const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Y2tpemh6dnh3aGt0ZXBlZ2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MjAxNzMsImV4cCI6MjEwMzk5NjE3M30.dx3jdPIK8MIICcnsQ7vA_upj66xsPhC7JsS1or-7jQE";

  function getSavedCustomConfig() {
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem("gatekeeper_custom_supabase_config");
        return raw ? JSON.parse(raw) : null;
      }
    } catch (e) {}
    return null;
  }

  function saveCustomConfig(url, anonKey) {
    try {
      if (typeof localStorage !== "undefined") {
        if (url && anonKey) {
          localStorage.setItem("gatekeeper_custom_supabase_config", JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
        } else {
          localStorage.removeItem("gatekeeper_custom_supabase_config");
        }
      }
    } catch (e) {}
  }

  const customConfig = getSavedCustomConfig();
  const fileConfig = global.GatekeeperConfig || {};

  const SUPABASE_URL = (customConfig && customConfig.url) || fileConfig.supabaseUrl || DEFAULT_SUPABASE_URL;
  const SUPABASE_ANON_KEY = (customConfig && customConfig.anonKey) || fileConfig.supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY;

  const configured = !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_ANON_KEY.startsWith("YOUR_") && SUPABASE_URL.length > 0;
  
  let client = null;
  try {
    if (configured && global.supabase && typeof global.supabase.createClient === "function") {
      client = global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  } catch (e) {
    console.warn("Gatekeeper Supabase init notice:", e);
  }

  function isConfigured() {
    return !!client;
  }

  function getConfig() {
    return {
      supabaseUrl: SUPABASE_URL,
      supabaseAnonKey: SUPABASE_ANON_KEY,
      isCustom: !!customConfig
    };
  }

  function setCredentials(url, key) {
    saveCustomConfig(url, key);
    location.reload();
  }

  function resetCredentials() {
    saveCustomConfig(null, null);
    location.reload();
  }

  function getUser() {
    if (!client) return Promise.resolve(null);
    return client.auth.getUser()
      .then(result => (result && result.data ? result.data.user : null))
      .catch(() => null);
  }

  function signIn(email, password) {
    if (!client) return Promise.resolve({ error: { message: "Supabase authentication is not configured yet. Add your credentials in Settings." } });
    return client.auth.signInWithPassword({ email, password }).catch(err => ({ error: err }));
  }

  function signUp(email, password) {
    if (!client) return Promise.resolve({ error: { message: "Supabase authentication is not configured yet. Add your credentials in Settings." } });
    return client.auth.signUp({ email, password }).catch(err => ({ error: err }));
  }

  function signOut() {
    if (!client) return Promise.resolve();
    return client.auth.signOut().catch(() => {});
  }

  function loadProgress() {
    return getUser().then(user => {
      if (!user || !client) return null;
      return client.from("user_progress").select("ticks, extra_days").eq("user_id", user.id).maybeSingle()
        .then(result => result.error ? Promise.reject(result.error) : result.data)
        .catch(() => null);
    });
  }

  function saveProgress(ticks, extraDays) {
    return getUser().then(user => {
      if (!user || !client) return;
      return client.from("user_progress").upsert({
        user_id: user.id,
        ticks: ticks || {},
        extra_days: extraDays || [],
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" })
        .then(result => {
          if (result && result.error) {
            console.warn("Gatekeeper: saveProgress error:", result.error);
          }
        })
        .catch(err => console.warn("Gatekeeper: saveProgress failed:", err));
    });
  }

  function testConnection() {
    if (!configured) return Promise.resolve({ ok: false, error: "Credentials missing or incomplete" });
    return fetch(SUPABASE_URL + "/auth/v1/settings", {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + SUPABASE_ANON_KEY
      }
    }).then(res => {
      if (res.ok) return { ok: true, status: res.status };
      return { ok: false, status: res.status, error: "Server returned status " + res.status };
    }).catch(err => {
      return { 
        ok: false, 
        error: "Network / DNS connection failed. If your Supabase project was inactive, it may be paused. Visit supabase.com dashboard to restore it, or enter new project credentials." 
      };
    });
  }

  function paintAuth() {
    const area = document.getElementById("authArea");
    if (!area) return;

    getUser().then(user => {
      if (user) {
        area.innerHTML = 
          '<span class="user-email" title="' + (user.email || 'User') + '">👤 ' + (user.email || 'Account') + '</span>' +
          '<button class="btn btn-ghost btn-sm" id="signOutBtn" title="Sign out of account" style="padding:6px 12px; font-size:12.5px;">Sign Out</button>';
        const signOutBtn = document.getElementById("signOutBtn");
        if (signOutBtn) {
          signOutBtn.addEventListener("click", () => signOut().then(() => location.reload()));
        }
      } else {
        area.innerHTML = '<a href="auth.html" class="btn btn-ghost btn-sm" style="padding:6px 14px; font-size:13px; border-color:var(--border);">Sign In</a>';
      }
    }).catch(() => {
      area.innerHTML = '<a href="auth.html" class="btn btn-ghost btn-sm" style="padding:6px 14px; font-size:13px; border-color:var(--border);">Sign In</a>';
    });
  }

  // Real-time auth state listener
  if (client) {
    try {
      client.auth.onAuthStateChange((event, session) => {
        paintAuth();
        if (session && session.user) {
          loadProgress().then(data => {
            if (data && data.ticks && global.Gatekeeper) {
              // Use importTicks to atomically replace the full ticks object.
              // Do NOT use setDone() in a loop — it only marks true (never clears
              // unchecked items) and triggers a redundant syncProgress() per key.
              if (typeof global.Gatekeeper.importTicks === "function") {
                global.Gatekeeper.importTicks(data.ticks);
              } else {
                // Fallback for older versions
                Object.keys(data.ticks).forEach(k => {
                  if (data.ticks[k]) global.Gatekeeper.setDone(k, true);
                });
              }
              global.dispatchEvent(new Event("gatekeeper:progress-ready"));
            }
          }).catch(err => console.warn("Gatekeeper: loadProgress error:", err));
        }
      });
    } catch (e) {}
  }

  // Safe immediate and event-based initialization
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", paintAuth);
    } else {
      paintAuth();
    }
  }

  global.GatekeeperAuth = {
    isConfigured,
    getConfig,
    setCredentials,
    resetCredentials,
    testConnection,
    getUser,
    signIn,
    signUp,
    signOut,
    loadProgress,
    saveProgress,
    paintAuth
  };
})(typeof window !== "undefined" ? window : global);
