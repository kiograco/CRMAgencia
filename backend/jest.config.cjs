module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/src/tests/setupEnv.ts"],
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "CommonJS",
          moduleResolution: "Node",
          esModuleInterop: true
        }
      }
    ]
  },
  clearMocks: true
};
