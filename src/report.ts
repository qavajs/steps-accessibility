import type { AxeResults, ImpactValue, NodeResult, Result } from 'axe-core';

const IMPACT_ORDER: Record<string, number> = { critical: 0, serious: 1, moderate: 2, minor: 3 };

export function escapeHtml(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatTarget(target: NodeResult['target']): string {
    return (target as unknown[])
        .map(selector => Array.isArray(selector) ? selector.join(' >>> ') : String(selector))
        .join(' → ');
}

function impactBadge(impact?: ImpactValue | null): string {
    if (!impact) return '';
    return `<span class="badge impact-${escapeHtml(impact)}">${escapeHtml(impact)}</span>`;
}

function sortByImpact(rules: Result[]): Result[] {
    return [...rules].sort((a, b) =>
        (IMPACT_ORDER[a.impact ?? ''] ?? 4) - (IMPACT_ORDER[b.impact ?? ''] ?? 4)
    );
}

function renderNode(node: NodeResult): string {
    const summary = node.failureSummary
        ? `<pre class="summary">${escapeHtml(node.failureSummary)}</pre>`
        : '';
    return `<li class="node">
<div class="target"><code>${escapeHtml(formatTarget(node.target))}</code></div>
<pre class="html">${escapeHtml(node.html)}</pre>
${summary}
</li>`;
}

function renderRule(rule: Result, showNodes: boolean): string {
    const nodes = showNodes && rule.nodes.length
        ? `<ol class="nodes">${rule.nodes.map(renderNode).join('')}</ol>`
        : '';
    return `<details class="rule"${showNodes ? ' open' : ''}>
<summary>${impactBadge(rule.impact)}<strong>${escapeHtml(rule.id)}</strong> — ${escapeHtml(rule.help)}<span class="count">${rule.nodes.length}</span></summary>
<div class="rule-body">
<p>${escapeHtml(rule.description)} <a href="${escapeHtml(rule.helpUrl)}" target="_blank" rel="noopener">Learn more</a></p>
<p class="tags">${rule.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</p>
${nodes}
</div>
</details>`;
}

function renderSection(title: string, rules: Result[] | undefined, showNodes: boolean, open: boolean): string {
    const list = rules ?? [];
    const body = list.length
        ? sortByImpact(list).map(rule => renderRule(rule, showNodes)).join('')
        : '<p class="empty">None</p>';
    return `<details class="section"${open ? ' open' : ''}>
<summary><h2>${escapeHtml(title)} <span class="count">${list.length}</span></h2></summary>
${body}
</details>`;
}

const STYLES = `
:root{color-scheme:light dark;--bg:#fff;--fg:#1b1f24;--muted:#57606a;--border:#d0d7de;--card:#f6f8fa;--code:#eff1f3;
--critical:#b42318;--serious:#c4320a;--moderate:#a15c07;--minor:#475467;}
@media (prefers-color-scheme:dark){:root{--bg:#0d1117;--fg:#e6edf3;--muted:#8d96a0;--border:#30363d;--card:#161b22;--code:#1f242c;
--critical:#f97066;--serious:#fd853a;--moderate:#fdb022;--minor:#98a2b3;}}
*{box-sizing:border-box}
body{margin:0;padding:24px 16px;background:var(--bg);color:var(--fg);font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1100px;margin:0 auto}
h1{font-size:22px;margin:0 0 4px}h2{display:inline;font-size:17px;margin:0}
.meta{color:var(--muted);margin:0 0 20px;word-break:break-all}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px}
.stat{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px}
.stat b{display:block;font-size:24px}.stat span{color:var(--muted)}
.stat.fail b{color:var(--critical)}
details>summary{cursor:pointer}
.section{margin-bottom:16px}.section>summary{padding:8px 0}
.rule{background:var(--card);border:1px solid var(--border);border-radius:8px;margin:8px 0}
.rule>summary{padding:10px 12px;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}
.rule-body{padding:0 12px 12px}
.count{margin-left:auto;color:var(--muted);font-variant-numeric:tabular-nums}
.badge{border:1px solid currentColor;border-radius:999px;padding:0 8px;font-size:12px;text-transform:uppercase;font-weight:600}
.impact-critical{color:var(--critical)}.impact-serious{color:var(--serious)}
.impact-moderate{color:var(--moderate)}.impact-minor{color:var(--minor)}
.tag{display:inline-block;background:var(--code);border-radius:4px;padding:0 6px;margin:0 4px 4px 0;font-size:12px}
.nodes{padding-left:20px}.node{margin:10px 0}
pre{background:var(--code);border-radius:6px;padding:8px;overflow-x:auto;white-space:pre-wrap;word-break:break-word;margin:4px 0}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-all}
a{color:inherit}.empty{color:var(--muted)}
`;

export function createHtmlReport(results: AxeResults): string {
    const violations = results.violations ?? [];
    const affectedNodes = violations.reduce((sum, rule) => sum + rule.nodes.length, 0);
    const stat = (label: string, value: number, fail = false) =>
        `<div class="stat${fail && value > 0 ? ' fail' : ''}"><b>${value}</b><span>${escapeHtml(label)}</span></div>`;
    const engine = results.testEngine ? `${results.testEngine.name} ${results.testEngine.version}` : 'axe-core';

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Accessibility Report</title>
<style>${STYLES}</style>
</head>
<body>
<main>
<h1>Accessibility Report</h1>
<p class="meta">${escapeHtml(results.url)} · ${escapeHtml(results.timestamp)} · ${escapeHtml(engine)}</p>
<div class="stats">
${stat('Violations', violations.length, true)}
${stat('Affected elements', affectedNodes, true)}
${stat('Needs review', results.incomplete?.length ?? 0)}
${stat('Passed rules', results.passes?.length ?? 0)}
${stat('Inapplicable', results.inapplicable?.length ?? 0)}
</div>
${renderSection('Violations', violations, true, true)}
${renderSection('Needs review', results.incomplete, true, false)}
${renderSection('Passed', results.passes, false, false)}
${renderSection('Inapplicable', results.inapplicable, false, false)}
</main>
</body>
</html>`;
}
