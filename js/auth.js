/* Gatekeeper auth and cloud persistence. Add your Supabase values before deploying. */
(function (global) {
  "use strict";

  const config = global.GatekeeperConfig || {};
  const SUPABASE_URL = config.supabaseUrl || "";
  const SUPABASE_ANON_KEY = config.supabaseAnonKey || "";
  const configured = !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_ANON_KEY.startsWith("YOUR_");
  const client = configured && global.supabase
    ? global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  function isConfigured() { return !!client; }
  function getUser() { return client ? client.auth.getUser().then(result => result.data.user) : Promise.resolve(null); }
  function signIn(email, password) { return client.auth.signInWithPassword({ email, password }); }
  function signUp(email, password) { return client.auth.signUp({ email, password }); }
  function signOut() { return client.auth.signOut(); }
  function loadProgress() {
    return getUser().then(user => {
      if (!user) return null;
      return client.from("user_progress").select("ticks, extra_days").eq("user_id", user.id).maybeSingle()
        .then(result => result.error ? Promise.reject(result.error) : result.data);
    });
  }
  function saveProgress(ticks, extraDays) {
    return getUser().then(user => {
      if (!user) return;
      return client.from("user_progress").upsert({
        user_id: user.id,
        ticks: ticks || {},
        extra_days: extraDays || [],
        updated_at: new Date().toISOString()
      });
    });
  }

  global.GatekeeperAuth = { isConfigured, getUser, signIn, signUp, signOut, loadProgress, saveProgress };

  function paintAuth() {
    const area = document.getElementById("authArea");
    if (!area) return;
    if (!isConfigured()) {
      area.innerHTML = '<a href="auth.html">Sign in</a>';
      return;
    }
    getUser().then(user => {
      if (user) {
        area.innerHTML = '<span class="user-email">' + user.email + '</span><button class="btn btn-ghost btn-sm" id="signOutBtn">Sign out</button>';
        document.getElementById("signOutBtn").addEventListener("click", () => signOut().then(() => location.reload()));
      } else {
        area.innerHTML = '<a class="nav-cta" href="auth.html">Sign in</a>';
      }
    });
  }
  document.addEventListener("DOMContentLoaded", paintAuth);
})(window);
