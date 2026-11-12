import { describe, expect, it } from 'vitest';
import type { AxeResults } from 'axe-core';
import { createHtmlReport, escapeHtml } from '../src/report';

const results = {
    url: 'https://example.com/?a=1&b=2',
    timestamp: '2026-11-12T00:00:00.000Z',
    testEngine: { name: 'axe-core', version: '4.11.2' },
    violations: [
        {
            id: 'color-contrast',
            impact: 'minor',
            tags: ['wcag2aa'],
            description: 'Contrast',
            help: 'Elements must have sufficient color contrast',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.11/color-contrast',
            nodes: [{ html: '<p class="x">low</p>', target: ['p.x'], failureSummary: 'Fix this', any: [], all: [], none: [] }],
        },
        {
            id: 'image-alt',
            impact: 'critical',
            tags: ['wcag2a'],
            description: 'Images need alt',
            help: 'Images must have alternate text',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.11/image-alt',
            nodes: [
                { html: '<img src="a">', target: [['iframe', 'img']], any: [], all: [], none: [] },
                { html: '<img src="b">', target: ['img.b'], any: [], all: [], none: [] },
            ],
        },
    ],
    passes: [{ id: 'html-has-lang', impact: null, tags: [], description: 'd', help: 'h', helpUrl: 'u', nodes: [] }],
    incomplete: [],
    inapplicable: [],
} as unknown as AxeResults;

describe('createHtmlReport', () => {
    const html = createHtmlReport(results);

    it('produces a standalone html document', () => {
        expect(html.startsWith('<!doctype html>')).toBe(true);
        expect(html).toContain('<title>Accessibility Report</title>');
    });

    it('escapes page content', () => {
        expect(html).toContain('&lt;p class=&quot;x&quot;&gt;low&lt;/p&gt;');
        expect(html).not.toContain('<img src="a">');
        expect(html).toContain('https://example.com/?a=1&amp;b=2');
    });

    it('shows summary counts', () => {
        expect(html).toMatch(/<b>2<\/b><span>Violations<\/span>/);
        expect(html).toMatch(/<b>3<\/b><span>Affected elements<\/span>/);
        expect(html).toMatch(/<b>1<\/b><span>Passed rules<\/span>/);
    });

    it('sorts violations by impact and renders shadow/frame selectors', () => {
        expect(html.indexOf('image-alt')).toBeLessThan(html.indexOf('color-contrast'));
        expect(html).toContain('iframe &gt;&gt;&gt; img');
        expect(html).toContain('Fix this');
    });

    it('handles empty results', () => {
        const empty = createHtmlReport({ violations: [], passes: [], incomplete: [], inapplicable: [] } as unknown as AxeResults);
        expect(empty).toMatch(/<b>0<\/b><span>Violations<\/span>/);
        expect(empty).toContain('None');
    });
});

describe('createHtmlReport with partial results', () => {
    it('tolerates missing sections, engine and impact', () => {
        const html = createHtmlReport({
            violations: [
                { id: 'a', impact: null, tags: [], description: '', help: '', helpUrl: '', nodes: [] },
                { id: 'b', impact: 'unknown', tags: [], description: '', help: '', helpUrl: '', nodes: [] },
                { id: 'c', impact: 'serious', tags: [], description: '', help: '', helpUrl: '', nodes: [] },
            ],
        } as unknown as AxeResults);
        expect(html).toContain('axe-core');
        expect(html).toMatch(/<b>0<\/b><span>Needs review<\/span>/);
        expect(html.indexOf('<strong>c</strong>')).toBeLessThan(html.indexOf('<strong>a</strong>'));
    });

    it('tolerates missing violations', () => {
        expect(createHtmlReport({} as AxeResults)).toMatch(/<b>0<\/b><span>Violations<\/span>/);
    });
});

describe('escapeHtml', () => {
    it('escapes special characters', () => {
        expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
        expect(escapeHtml(undefined)).toBe('');
    });
});
