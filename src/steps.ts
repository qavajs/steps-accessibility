import { When } from '@cucumber/cucumber';
import AxeBuilderPlaywright from '@axe-core/playwright';
import AxeBuilderWDIO from '@axe-core/webdriverio';
import { AxeResults } from 'axe-core';
import { createHtmlReport } from 'axe-html-reporter';
import {MemoryValue} from "@qavajs/core";

function htmlAttachment(results: AxeResults) {
    const reportHTML = createHtmlReport({
        results,
        options: {
            doNotCreateReportFile: true,
        },
    });
    return Buffer.from(reportHTML).toString('base64');
}

type World = { config: any, wdio?: any, playwright?: any, attach: (attachment: any, mime: string) => void };

async function audit(world: World) {
    if (!world.wdio && !world.playwright) throw new Error('Browser instance does not exist! Make sure that webdriverio or playwright steps are installed')
    const axe = world.playwright
        ? new AxeBuilderPlaywright({ page: world.playwright.page})
        : new AxeBuilderWDIO( { client: world.wdio.browser });
    const axeConfig = world.config.axe ? world.config.axe : (axe: AxeBuilderPlaywright | AxeBuilderWDIO) => axe;
    const results = await axeConfig(axe).analyze();
    world.attach(htmlAttachment(results), 'base64:text/html');
    return results;
}
/**
 * Perform accessibility check using axe library
 * @example
 * When I perform accessibility check
 */
When('I perform accessibility check', async function (this: World) {
    const results = await audit(this);
    if (results.violations.length > 0) {
        throw new Error(`Accessibility check failed! Found ${results.violations.length} violations`);
    }
});

/**
 * Perform accessibility check using axe library and save result to memory variable
 * https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#results-object
 * @example
 * When I perform accessibility check and save results as 'axeReport'
 * Then I expect '$axeReport.violations.length' to equal '0'
 */
When('I perform accessibility check and save results as {value}', async function (this: World, memoryKey: MemoryValue) {
    const results = await audit(this);
    memoryKey.set(results);
});
