const path = require("path");

// Secrets are NOT set here — each app loads its own .env file (web reads
// .env.local via Next's built-in dotenv support, cms reads cms/.env via
// Strapi's). Keeps this file safe to commit.
module.exports = {
  apps: [
    {
      name: "web",
      cwd: __dirname,
      script: "npm",
      args: "run start",
      env: { NODE_ENV: "production" },
    },
    {
      name: "cms",
      cwd: path.join(__dirname, "cms"),
      script: "npm",
      args: "run start",
      env: { NODE_ENV: "production" },
    },
  ],
};
