import { When, IWorld } from '@cucumber/cucumber';
import AxeBuilderPlaywright from '@axe-core/playwright';
import AxeBuilderWDIO from '@axe-core/webdriverio';
import { AxeResults } from 'axe-core';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import memory from '@qavajs/memory';

declare global {
    var browser: any;
    var page: any;
    var config: any;
}

async function htmlAttachment(results: AxeResults) {
    const reportTemplate = await readFile(resolve('template/reportTemplate.html'), 'utf-8');
    const reportHTML = reportTemplate.replace('{{ RESULTS }}', JSON.stringify(results));
    return Buffer.from(reportHTML).toString('base64');
}

async function audit(world: IWorld) {
    if (!global.page && !global.browser) throw new Error('Browser instance does not exist! Make sure that webdriverio or playwright steps are installed')
    const axe = global.page
        ? new AxeBuilderPlaywright({ page: global.page })
        : new AxeBuilderWDIO( { client: global.browser });
    const axeConfig = config.axe ? config.axe : (axe: AxeBuilderPlaywright | AxeBuilderWDIO) => axe;
    const results = await axeConfig(axe).analyze();
    world.attach(await htmlAttachment(results), 'base64:text/html');
    return results;
}
/**
 * Perform accessibility check using axe library
 * @example
 * When I perform accessibility check
 */
When('I perform accessibility check', async function (this: IWorld) {
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
When('I perform accessibility check and save results as {string}', async function (this: IWorld, memoryKey) {
    const results = await audit(this);
    memory.setValue(memoryKey, results);
});
