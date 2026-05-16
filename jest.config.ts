import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)', '**/*.test.(ts|tsx)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@/features/(.*)$': '<rootDir>/src/features/$1',
    '^@/shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@/data/(.*)$': '<rootDir>/src/data/$1',
    '^@/core/(.*)$': '<rootDir>/src/core/$1',
    '^@/providers/(.*)$': '<rootDir>/src/providers/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  collectCoverageFrom: [
    'src/domain/**/*.ts',
    'src/core/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
};

export default config;
