module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.integration.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.integration.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage-integration',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@repo/back-share/(.*)$': '<rootDir>/../../back-share/src/$1',
    '^@repo/postgres/(.*)$': '<rootDir>/../../postgres/src/$1',
    '^@repo/dtos/(.*)$': '<rootDir>/../../dtos/src/$1',
    '^@repo/enums$': '<rootDir>/../../enums/src/index',
    '^@repo/http-errors$': '<rootDir>/../../http-errors/src/index',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  testTimeout: 30000, // Integration tests may take longer
};
