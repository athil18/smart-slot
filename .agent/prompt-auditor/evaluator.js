const VAGUE_WORDS = [
    'good', 'bad', 'nice', 'great', 'better', 'best', 'some', 'many',
    'few', 'several', 'various', 'appropriate', 'suitable', 'proper',
    'reasonable', 'significant', 'considerable', 'substantial', 'adequate',
    'sufficient', 'relevant', 'important', 'useful', 'helpful', 'effective',
    'efficient', 'optimal', 'ideal', 'perfect', 'excellent', 'outstanding'
];

const ACTION_VERBS = [
    'analyze', 'create', 'write', 'generate', 'summarize', 'explain',
    'describe', 'list', 'identify', 'extract', 'compare', 'evaluate',
    'classify', 'translate', 'convert', 'calculate', 'determine', 'find',
    'suggest', 'recommend', 'propose', 'design', 'develop', 'build',
    'implement', 'review', 'assess', 'critique', 'edit', 'rewrite',
    'format', 'organize', 'prioritize', 'rank', 'sort', 'filter'
];

const CONTRADICTION_PAIRS = [
    ['concise', 'comprehensive'],
    ['brief', 'detailed'],
    ['short', 'thorough'],
    ['simple', 'complex'],
    ['minimal', 'exhaustive']
];

function evaluate(prompt) {
    const words = prompt.toLowerCase().split(/\s+/);
    const sentences = prompt.split(/[.!?]+/).filter(s => s.trim());

    const dimensions = {
        structure: analyzeStructure(prompt, words, sentences),
        clarity: analyzeClarity(prompt, words, sentences),
        completeness: analyzeCompleteness(prompt, words),
        specificity: analyzeSpecificity(prompt, words),
        format: analyzeFormat(prompt)
    };

    const issues = collectIssues(dimensions);
    const score = calculateOverallScore(dimensions);

    const suggestions = generateSuggestions(issues, prompt);

    return { score, dimensions, issues, suggestions };
}

function analyzeStructure(prompt, words, sentences) {
    const checks = [];
    let score = 0;
    let maxScore = 0;

    maxScore += 25;
    const hasActionVerb = ACTION_VERBS.some(verb => words.includes(verb) || words.some(w => w.startsWith(verb)));
    if (hasActionVerb) score += 25;
    else checks.push({ issue: 'No clear action verb found', severity: 'high' });

    maxScore += 25;
    let hasContradiction = false;
    for (const [word1, word2] of CONTRADICTION_PAIRS) {
        if (words.includes(word1) && words.includes(word2)) {
            hasContradiction = true;
            checks.push({ issue: `Contradiction detected: "${word1}" vs "${word2}"`, severity: 'high' });
            break;
        }
    }
    if (!hasContradiction) score += 25;

    maxScore += 25;
    if (words.length < 10) checks.push({ issue: 'Prompt is too short (< 10 words)', severity: 'medium' });
    else if (words.length > 500) checks.push({ issue: 'Prompt is too long (> 500 words)', severity: 'low' });
    else score += 25;

    maxScore += 25;
    if (sentences.length < 2) checks.push({ issue: 'Only one sentence - may lack instruction', severity: 'low' });
    else score += 25;

    return { name: 'Structure', score: Math.round((score / maxScore) * 100), checks };
}

function analyzeClarity(prompt, words, sentences) {
    const checks = [];
    let score = 0;
    let maxScore = 0;

    maxScore += 40;
    const vagueFound = VAGUE_WORDS.filter(v => words.includes(v));
    if (vagueFound.length === 0) score += 40;
    else if (vagueFound.length <= 2) {
        score += 25;
        checks.push({ issue: `Vague terms found: "${vagueFound.join('", "')}"`, severity: 'low' });
    } else {
        score += 10;
        checks.push({ issue: `Multiple vague terms: "${vagueFound.slice(0, 3).join('", "')}..."`, severity: 'medium' });
    }

    maxScore += 30;
    const avgSentenceLength = words.length / Math.max(sentences.length, 1);
    if (avgSentenceLength > 35) checks.push({ issue: 'Sentences are very long', severity: 'medium' });
    else if (avgSentenceLength < 5) {
        checks.push({ issue: 'Sentences are very short', severity: 'low' });
        score += 15;
    } else score += 30;

    maxScore += 30;
    const ambiguousPronouns = ['it', 'this', 'that', 'they', 'them'];
    const firstWords = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase());
    const startsWithPronoun = firstWords.some(w => ambiguousPronouns.includes(w));
    if (startsWithPronoun) {
        score += 15;
        checks.push({ issue: 'Sentence starts with ambiguous pronoun', severity: 'low' });
    } else score += 30;

    return { name: 'Clarity', score: Math.round((score / maxScore) * 100), checks };
}

function analyzeCompleteness(prompt, words) {
    const checks = [];
    let score = 0;
    let maxScore = 0;

    maxScore += 25;
    const hasRole = /you are|act as|as a|your role|assume the role/i.test(prompt);
    if (hasRole) score += 25;
    else checks.push({ issue: 'No role/persona defined', severity: 'low' });

    maxScore += 25;
    const hasConstraints = /do not|don't|avoid|never|only|must not|should not|exclude|without/i.test(prompt);
    if (hasConstraints) score += 25;
    else checks.push({ issue: 'No constraints specified', severity: 'medium' });

    maxScore += 25;
    const hasOutput = /output|format|structure|return|provide|give me|respond with|in the form of/i.test(prompt);
    if (hasOutput) score += 25;
    else checks.push({ issue: 'No output format specified', severity: 'high' });

    maxScore += 25;
    const hasContext = /following|below|above|here|provided|given|input:|text:|data:/i.test(prompt);
    if (hasContext) score += 25;
    else checks.push({ issue: 'No input/context marker found', severity: 'medium' });

    return { name: 'Completeness', score: Math.round((score / maxScore) * 100), checks };
}

function analyzeSpecificity(prompt, words) {
    const checks = [];
    let score = 0;
    let maxScore = 0;

    maxScore += 35;
    const hasNumbers = /\d+|one|two|three|four|five|first|second|third|top \d|at least|at most|maximum|minimum/i.test(prompt);
    if (hasNumbers) score += 35;
    else checks.push({ issue: 'No specific quantities/numbers', severity: 'medium' });

    maxScore += 35;
    const hasExamples = /example|e\.g\.|for instance|such as|like this|```|".*"/i.test(prompt);
    if (hasExamples) score += 35;
    else checks.push({ issue: 'No examples provided', severity: 'low' });

    maxScore += 30;
    const hasSuccess = /goal|objective|success|should result in|aim|purpose|so that|in order to/i.test(prompt);
    if (hasSuccess) score += 30;
    else checks.push({ issue: 'No success criteria defined', severity: 'low' });

    return { name: 'Specificity', score: Math.round((score / maxScore) * 100), checks };
}

function analyzeFormat(prompt) {
    const checks = [];
    let score = 0;
    let maxScore = 0;

    maxScore += 50;
    const hasFormatting = /bullet|numbered|list|table|markdown|json|xml|heading|section|paragraph/i.test(prompt);
    if (hasFormatting) score += 50;
    else checks.push({ issue: 'No specific format preference (bullets, json, etc.)', severity: 'low' });

    maxScore += 50;
    const hasLength = /word|sentence|paragraph|brief|detailed|concise|short|long|summary|comprehensive|\d+ words|\d+ sentences/i.test(prompt);
    if (hasLength) score += 50;
    else checks.push({ issue: 'No length guidance', severity: 'medium' });

    return { name: 'Format', score: Math.round((score / maxScore) * 100), checks };
}

function collectIssues(dimensions) {
    const allIssues = [];
    for (const dim of Object.values(dimensions)) {
        for (const check of dim.checks) {
            allIssues.push(check);
        }
    }
    const severityOrder = { high: 0, medium: 1, low: 2 };
    allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    return allIssues;
}

function calculateOverallScore(dimensions) {
    const weights = { structure: 0.25, clarity: 0.20, completeness: 0.25, specificity: 0.15, format: 0.15 };
    let total = 0;
    for (const [key, dim] of Object.entries(dimensions)) {
        total += dim.score * weights[key];
    }
    return Math.round(total);
}

function generateSuggestions(issues, originalPrompt) {
    let suggestion = originalPrompt;

    // Heuristic fixes
    if (issues.some(i => i.issue.includes('No clear action verb'))) {
        suggestion = "Analyze the provided input and " + suggestion;
    }
    if (issues.some(i => i.issue.includes('No role/persona'))) {
        suggestion = "You are an expert AI assistant. " + suggestion;
    }
    if (issues.some(i => i.issue.includes('No output format'))) {
        suggestion += "\n\nOutput Format:\n- Item 1\n- Item 2";
    }
    if (issues.some(i => i.issue.includes('No constraints'))) {
        suggestion += "\n\nConstraints:\n- Do not halluncinate.\n- Be concise.";
    }

    return suggestion === originalPrompt ? null : suggestion;
}

module.exports = { evaluate };
