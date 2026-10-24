import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Reuse the app's own env file. The first file loaded wins, so .env.test can override.
dotenv.config({ path: ".env.test" });
dotenv.config({ path: ".env.local" });

const CI = !!process.env.CI;
const PORT = process.env.PORT ?? "3000";
const baseURL = `http://localhost:${PORT}`;

export const ADMIN_STATE = "tests/.auth/admin.json";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: CI ? [["html", { open: "never" }], ["github"]] : "html",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [
    { name: "setup-admin", testMatch: /setup\/admin\.setup\.ts/ },

    // PUBLIC: never authenticated
    {
      name: "public-desktop",
      testMatch: /public\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "public-mobile",
      testMatch: /public\/.*\.spec\.ts/,
      use: { ...devices["Pixel 7"] },
    },

    // SECURITY: visitors (anonymous = non-admin) must never reach admin routes
    {
      name: "security",
      testMatch: /security\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // ADMIN
    {
      name: "admin-desktop",
      testMatch: /admin\/.*\.spec\.ts/,
      testIgnore: /\.mobile\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: ADMIN_STATE },
      dependencies: ["setup-admin"],
    },
    {
      name: "admin-mobile",
      testMatch: /admin\/.*\.mobile\.spec\.ts/,
      use: { ...devices["Pixel 7"], storageState: ADMIN_STATE },
      dependencies: ["setup-admin"],
    },
  ],
  webServer: {
    command: CI ? `npm run build && npm run start -- -p ${PORT}` : "npm run dev",
    url: baseURL,
    reuseExistingServer: !CI,
    timeout: 180 * 1000,
  },
});
