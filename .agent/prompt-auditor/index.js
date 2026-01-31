const fs = require('fs');
const path = require('path');
const evaluator = require('./evaluator');
const reporter = require('./reporter');

const PROMPTS_DIR = path.join(process.cwd(), 'prompts');
const REPORT_FILE = path.join(process.cwd(), 'PROMPT_AUDIT.md');

async function run() {
    console.log('🕵️  Agentic Reviewer starting...');

    if (!fs.existsSync(PROMPTS_DIR)) {
        console.error('❌ prompts directory not found. Please create it and add .txt files.');
        process.exit(1);
    }

    const files = fs.readdirSync(PROMPTS_DIR).filter(f => f.endsWith('.txt') || f.endsWith('.md'));

    if (files.length === 0) {
        console.log('⚠️  No prompt files found in /prompts');
        process.exit(0);
    }

    console.log(`📂 Found ${files.length} prompts to audit.`);

    const results = [];

    for (const file of files) {
        const content = fs.readFileSync(path.join(PROMPTS_DIR, file), 'utf-8');
        console.log(`   Analyzing ${file}...`);

        const evaluation = evaluator.evaluate(content);
        results.push({
            filename: file,
            content,
            ...evaluation
        });
    }

    console.log('📝 Generating audit report...');
    reporter.generate(results, REPORT_FILE);

    console.log(`✅ Audit complete! Report saved to ${REPORT_FILE}`);
}

run().catch(console.error);
