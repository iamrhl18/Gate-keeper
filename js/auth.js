/* ============================================================
   Gatekeeper — Authentication & Cloud Progress Sync (Supabase)
   ============================================================ */
(function (global) {
  "use strict";

  const config = global.GatekeeperConfig || {};
  const SUPABASE_URL = config.supabaseUrl || "";
  const SUPABASE_ANON_KEY = config.supabaseAnonKey || "";
  const configured = !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_ANON_KEY.startsWith("YOUR_") && SUPABASE_URL.length > 0;
  
  const client = configured && global.supabase
    ? global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  function isConfigured() {
    return !!client;
  }

  function getUser() {
    if (!client) return Promise.resolve(null);
    return client.auth.getUser()
      .then(result => (result && result.data ? result.data.user : null))
      .catch(() => null);
  }

  function signIn(email, password) {
    if (!client) return Promise.resolve({ error: { message: "Supabase authentication is not configured yet. Add your credentials to js/config.js or .env." } });
    return client.auth.signInWithPassword({ email, password });
  }

  function signUp(email, password) {
    if (!client) return Promise.resolve({ error: { message: "Supabase authentication is not configured yet. Add your credentials to js/config.js or .env." } });
    return client.auth.signUp({ email, password });
  }

  function signOut() {
    if (!client) return Promise.resolve();
    return client.auth.signOut();
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
      });
    });
  }

  function paintAuth() {
    const area = document.getElementById("authArea");
    if (!area) return;

    if (!isConfigured()) {
      area.innerHTML = '<a href="auth.html" class="btn btn-ghost btn-sm" style="padding:6px 14px; font-size:13px; border-color:var(--border);">Sign In</a>';
      return;
    }

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
    client.auth.onAuthStateChange((event, session) => {
      paintAuth();
      if (session && session.user) {
        loadProgress().then(data => {
          if (data && data.ticks && global.Gatekeeper) {
            Object.keys(data.ticks).forEach(k => {
              if (data.ticks[k]) global.Gatekeeper.setDone(k, true);
            });
            global.dispatchEvent(new Event("gatekeeper:progress-ready"));
          }
        });
      }
    });
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
    getUser,
    signIn,
    signUp,
    signOut,
    loadProgress,
    saveProgress,
    paintAuth
  };
})(typeof window !== "undefined" ? window : global);
