const fs = require("fs");

const fileEnv = fs.existsSync(".env") ? fs.readFileSync(".env", "utf8").split(/\r?\n/).reduce((values, line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) values[match[1].trim()] = match[2].trim();
  return values;
}, {}) : {};
const env = {
  ...fileEnv,
  SUPABASE_URL: process.env.SUPABASE_URL || fileEnv.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || fileEnv.SUPABASE_ANON_KEY
};

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  throw new Error(".env must contain SUPABASE_URL and SUPABASE_ANON_KEY");
}
if (/\s/.test(env.SUPABASE_URL) || /\s/.test(env.SUPABASE_ANON_KEY)) {
  throw new Error("Supabase values in .env must not contain spaces");
}

const output = "window.GatekeeperConfig = " + JSON.stringify({
  supabaseUrl: env.SUPABASE_URL,
  supabaseAnonKey: env.SUPABASE_ANON_KEY
}) + ";\n";
fs.writeFileSync("js/config.js", output);
console.log("Generated js/config.js");
