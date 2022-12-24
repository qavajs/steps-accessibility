import Memory from './memory';
import AxeBuilder from '@axe-core/playwright';

export default {
    paths: ['test-e2e/features/*.feature'],
    require: [
        'node_modules/@qavajs/steps-playwright/lib/*.js',
        'test-e2e/step-definitions/*.ts',
        'src/*.ts'
    ],
    format: [
        '@qavajs/xunit-formatter:test-e2e/report.xml',
        '@qavajs/console-formatter',
        '@qavajs/html-formatter:test-e2e/report.html'
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
    axe: function (instance: AxeBuilder) {
        return instance.withTags('wcag2a')
    },
    defaultTimeout: 30000,
    memory: new Memory(),
    parallel: 1,
    publishQuiet: true
}
