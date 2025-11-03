module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
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
};
