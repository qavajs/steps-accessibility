import { When } from '@cucumber/cucumber';
import AxeBuilderPlaywright from '@axe-core/playwright';
import AxeBuilderWDIO from '@axe-core/webdriverio';
import { createHtmlReport } from 'axe-html-reporter';
import { AxeResults } from 'axe-core';

declare global {
    var browser: any;
    var page: any;
    var config: any;
}

function htmlAttachment(results: AxeResults) {
    const reportHTML = createHtmlReport({
        results,
        options: {
            doNotCreateReportFile: true,
        },
    });
    return Buffer.from(reportHTML).toString('base64');
}
/**
 * Perform accessibility check using axe library
 * @example
 * When I perform accessibility check
 */
When('I perform accessibility check', async function () {
    if (!global.page && !global.browser) throw new Error('Browser instance does not exist! Make sure that webdriverio or playwright steps are installed')
    const axe = global.page
        ? new AxeBuilderPlaywright({ page: global.page })
        : new AxeBuilderWDIO( { client: global.browser });
    const axeConfig = config.axe ? config.axe : (axe: AxeBuilderPlaywright | AxeBuilderWDIO) => axe;
    const results = await axeConfig(axe).analyze();
    this.attach(htmlAttachment(results), 'base64:text/html');
    if (results.violations.length > 0) {
        throw new Error(`Accessibility check failed! Found ${results.violations.length} violations`);
    }
});
