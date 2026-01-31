const fs = require('fs');

function generate(results, outputPath) {
    let md = '# 🕵️ Agentic Prompt Audit Report\n\n';
    md += `**Date:** ${new Date().toISOString().split('T')[0]}\n`;
    md += `**Total Prompts Scanned:** ${results.length}\n\n`;

    // Overview Table
    md += '## 📊 Score Overview\n\n';
    md += '| File | Score | Status | Issues |\n';
    md += '|------|-------|--------|--------|\n';

    results.forEach(r => {
        const icon = r.score >= 80 ? '✅' : r.score >= 50 ? '⚠️' : '❌';
        md += `| ${r.filename} | **${r.score}** | ${icon} | ${r.issues.length} |\n`;
    });

    md += '\n---\n\n';

    // Detailed Breakdown
    results.forEach(r => {
        md += `## 📄 ${r.filename} (Score: ${r.score})\n\n`;

        md += '### Issues Detected\n';
        if (r.issues.length === 0) {
            md += '✅ No issues found. Excellent prompt!\n';
        } else {
            r.issues.forEach(i => {
                const badge = i.severity === 'high' ? '🔴' : i.severity === 'medium' ? 'Vk' : '🔵';
                md += `- ${badge} **[${i.severity.toUpperCase()}]** ${i.issue}\n`;
            });
        }

        if (r.suggestions) {
            md += '\n### 🤖 Suggested Optimization\n';
            md += '```text\n';
            md += r.suggestions;
            md += '\n```\n';
        } else if (r.score < 100 && r.issues.length > 0) {
            md += '\n*No automated optimization available. Please review issues manually.*\n';
        }

        md += '\n---\n\n';
    });

    fs.writeFileSync(outputPath, md);
}

module.exports = { generate };
