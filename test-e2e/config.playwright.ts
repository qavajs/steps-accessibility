import Memory from './memory';

export default {
    paths: ['test-e2e/features/*.feature'],
    require: [
        'node_modules/@qavajs/steps-playwright/index.js',
        'node_modules/@qavajs/steps-memory/index.js',
        'test-e2e/step-definitions/*.ts',
        'src/*.ts'
    ],
    format: [
        '@qavajs/console-formatter',
        ['junit', 'test-e2e/report.xml'],
        ['@qavajs/html-formatter', 'test-e2e/report.html']
    ],
    browser: {
        logLevel: 'warn',
        timeout: {
            page: 5000
        },
        capabilities: {
            browserName: 'chromium'
        }
    },
    defaultTimeout: 30000,
    memory: new Memory(),
    parallel: 1
}
