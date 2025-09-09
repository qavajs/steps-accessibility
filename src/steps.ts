import { AxeResults, RunOptions } from 'axe-core';
import { createHtmlReport } from 'axe-html-reporter';
import { type MemoryValue, When } from '@qavajs/core';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { parse } from 'node:path';

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

async function audit(world: World, options?: RunOptions & { context?: any, saveAs?: string }) {
    if (!world.wdio && !world.playwright) throw new Error('Browser instance does not exist! Make sure that webdriverio or playwright steps are installed');
    const axeCode = await readFile('node_modules/axe-core/axe.min.js', { encoding: 'utf8' });
    let results;
    const context = options?.context;
    if (world.playwright) {
        await world.playwright.page.evaluate(axeCode);
        results = await world.playwright.page.evaluate(({ context, options }: any) => {
            const accContext = context ?? document;
            // @ts-ignore
            return window.axe.run(accContext, options);
        }, { context, options });
    }
    if (world.wdio) {
        await world.wdio.browser.execute(axeCode);
        results = await world.wdio.browser.executeAsync(({ context, options }: any, done: any) => {
            const accContext = context ?? window.document;
            // @ts-ignore
            return window.axe.run(accContext, options).then(done)
        }, { context, options });
    }
    if (options?.saveAs) {
        const path = parse(options.saveAs);
        if (path.dir) {
            await mkdir(path.dir, { recursive: true });
        }
        await writeFile(options.saveAs, JSON.stringify(results));
    }
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
 * Perform configure accessibility check using axe library
 * Configuration https://github.com/dequelabs/axe-core/blob/9a743ee298df3ac300006335128bbdd1ca63ccd5/doc/API.md#api-name-axerun
 * @example
 * When I perform accessibility check:
 * """
 * {
 *   "include": ["div", "a"]
 * }
 * """
 */
When('I perform accessibility check:', async function (this: World, optionsMultiline: string) {
    const options = JSON.parse(optionsMultiline);
    const results = await audit(this, options);
    if (results.violations.length > 0) {
        throw new Error(`Accessibility check failed! Found ${results.violations.length} violations`);
    }
});


/**
 * Perform accessibility check using axe library and save result to memory variable
 * Results https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#results-object
 * @example
 * When I perform accessibility check and save results as 'axeReport'
 * Then I expect '$axeReport.violations.length' to equal '0'
 */
When('I perform accessibility check and save results as {value}', async function (this: World, memoryKey: MemoryValue) {
    const results = await audit(this);
    memoryKey.set(results);
});

/**
 * Perform configured accessibility check using axe library and save result to memory variable
 * Results https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#results-object
 * Configuration https://github.com/dequelabs/axe-core/blob/9a743ee298df3ac300006335128bbdd1ca63ccd5/doc/API.md#api-name-axerun
 * @example
 * When I perform accessibility check and save results as 'axeReport':
 * """
 * {
 *   "include": ["div", "a"]
 * }
 * """
 * Then I expect '$axeReport.violations.length' to equal '0'
 */
When('I perform accessibility check and save results as {value}:', async function (this: World, memoryKey: MemoryValue, optionsMultiline: string) {
    const options = JSON.parse(optionsMultiline);
    const results = await audit(this, options);
    memoryKey.set(results);
});