import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /global\.setup\.ts/ },
    {
      name: "admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/.auth/admin.json",
      },
      dependencies: ["setup"],
      testMatch: /.*\.admin\.spec\.ts/,
    },
    {
      name: "cgm",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/.auth/cgm.json",
      },
      dependencies: ["setup"],
      testMatch: /.*\.cgm\.spec\.ts/,
    },
    {
      name: "client",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/.auth/client.json",
      },
      dependencies: ["setup"],
      testMatch: /.*\.client\.spec\.ts/,
    },
    {
      name: "anon",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
      testMatch: /.*\.anon\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
