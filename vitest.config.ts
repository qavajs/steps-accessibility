import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['test/**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            exclude: ['lib/**', 'node_modules/**', 'test-e2e/**'],
            thresholds: {
                branches: 90,
                functions: 90,
                lines: 90,
                statements: -10,
            },
        },
    },
});
