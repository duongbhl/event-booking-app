module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  clearMocks: true,
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.test.json",
      },
    ],
  },
  collectCoverageFrom: [
    "src/controllers/**/*.ts",
    "src/utils/**/*.ts",
    "!src/**/*.d.ts",
  ],
  moduleFileExtensions: ["ts", "js", "json"],
};
