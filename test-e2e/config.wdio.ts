import Memory from './memory';
import AxeBuilder from '@axe-core/webdriverio';

export default {
    paths: ['test-e2e/features/*.feature'],
    require: [
        'node_modules/@qavajs/steps-wdio/index.js',
        'node_modules/@qavajs/steps-memory/index.js',
        'test-e2e/step-definitions/*.ts',
        'src/*.ts'
    ],
    format: [
        'junit:test-e2e/report.xml',
        '@qavajs/console-formatter',
        '@qavajs/html-formatter:test-e2e/report.html'
    ],
    browser: {
        logLevel: 'warn',
        capabilities: {
            browserName: 'chrome',
            'goog:chromeOptions': {
                args: [
                    '--window-size=1280,720',
                    '--headless'
                ]
            }
        }
    },
    axe: function (instance: AxeBuilder) {
        return instance.withTags('cat.color')
    },
    defaultTimeout: 30000,
    memory: new Memory(),
    parallel: 1
}
