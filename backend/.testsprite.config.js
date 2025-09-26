module.exports = {
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'ts'],
    testMatch: ['**/*.spec.ts'],
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.spec.json'
        }
    },
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    coverageDirectory: '<rootDir>/coverage',
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.spec.{ts,js}'],
    reporters: ['default', 'jest-junit'],
    testTimeout: 30000
};