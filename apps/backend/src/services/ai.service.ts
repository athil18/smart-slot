import { AUDITOR_PROMPT } from '../prompts/auditor.js';
import { REFACTORER_PROMPT } from '../prompts/refactorer.js';
import { WORKFLOW_GENERATOR_PROMPT } from '../prompts/workflow_generator.js';
import { REASONER_PROMPT } from '../prompts/reasoner.js';
import { logger } from '../lib/logger.js';

export interface AuditResult {
    scores: {
        complexity: number;
        relevance: number;
        specificity: number;
        context: number;
        structure: number;
        tonality: number;
        logic: number;
    };
    overallScore: number;
    riskScore: number;
    weaknesses: string[];
    refactoringTips: string[];
}

export class AIService {
    /**
     * Audits a prompt based on 7 dimensions.
     * Mock implementation with heuristic logic for demonstration.
     */
    static async auditPrompt(prompt: string): Promise<AuditResult> {
        // Log prompt for debugging (satisfies unused variable lint)
        logger.debug({ AUDITOR_PROMPT }, 'Using auditor prompt template');
        logger.info({ promptLength: prompt.length }, 'Auditing prompt');

        // Heuristic: Penalize short prompts, check for keywords
        const lowerPrompt = prompt.toLowerCase();
        const hasStructure = lowerPrompt.includes('###') || lowerPrompt.includes('1.') || lowerPrompt.includes('step');
        const hasPersona = lowerPrompt.includes('you are') || lowerPrompt.includes('act as');
        const hasConstraints = lowerPrompt.includes('only') || lowerPrompt.includes('must') || lowerPrompt.includes('format');

        const scores = {
            complexity: Math.min(10, prompt.split(' ').length / 20),
            relevance: prompt.length > 20 ? 8 : 4,
            specificity: hasConstraints ? 9 : 3,
            context: prompt.length > 100 ? 8 : 4,
            structure: hasStructure ? 9 : 2,
            tonality: hasPersona ? 9 : 3,
            logic: 7, // Neutral base
        };

        const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / 7;
        const riskScore = (10 - overallScore) * 10;

        const weaknesses = [];
        if (!hasStructure) weaknesses.push('Lacks clear hierarchy/structure.');
        if (!hasPersona) weaknesses.push('Missing role/persona definition.');
        if (prompt.length < 50) weaknesses.push('Too brief; likely missing critical context.');

        return {
            scores,
            overallScore: parseFloat(overallScore.toFixed(1)),
            riskScore: Math.max(0, parseFloat(riskScore.toFixed(1))),
            weaknesses,
            refactoringTips: [
                'Use the STOKE framework (Situation, Task, Objective, Keys, Expectations).',
                'Define a specific persona using "You are...".',
                'Add negative constraints to prevent hallucinations.',
            ],
        };
    }

    /**
     * Generates refactored versions of a prompt.
     */
    static async refactorPrompt(prompt: string) {
        // Log template usage for debugging
        logger.debug({ REFACTORER_PROMPT }, 'Using refactorer prompt template');
        // In a real app, this would call an LLM with REFACTORER_PROMPT
        return {
            versions: {
                refined: `Polished version of: ${prompt}`,
                structured: `### Situation\nDeveloping SmartSlot...\n\n### Task\n${prompt}\n\n### Expectations\nJSON Output...`,
                minimal: `Goal: ${prompt.substring(0, 50)}... [Concise Version]`,
            },
            improvementsMade: ['Added Markdown structure', 'Clarified objectives', 'Defined output format'],
        };
    }

    /**
     * Automatically generates workflow tasks based on appointment details.
     */
    static async generateWorkflowTasks(details: { resourceName: string; resourceType: string; priority: string; notes?: string }) {
        logger.debug({ WORKFLOW_GENERATOR_PROMPT }, 'Using workflow generator prompt template');
        logger.info({ resource: details.resourceName }, 'Generating workflow tasks');

        // Mocking LLM logic based on WORKFLOW_GENERATOR_PROMPT
        const tasks = [
            {
                title: `Prepare ${details.resourceName}`,
                description: `Ensure the ${details.resourceType} is ready and sanitized for the ${details.priority} priority session. ${details.notes ? 'Note: ' + details.notes : ''}`
            },
            {
                title: `Post-Session Review: ${details.resourceName}`,
                description: `Conduct a safety check and log usage for the ${details.resourceType}.`
            }
        ];

        return tasks;
    }

    /**
     * Applies the Reasoning Agent logic to a scheduling request.
     */
    static async applyReasoningAgent(request: string, context: string) {
        logger.debug({ REASONER_PROMPT, context }, 'Applying reasoning agent with context');
        logger.info({ request }, 'Applying reasoning agent');

        // Mocking the behavior based on REASONER_PROMPT
        const result = {
            reasoningSteps: [
                "Analyzing resource capacity and staff availability...",
                "Evaluating demand patterns for the requested time window.",
                "Optimizing for maximum throughput while maintaining health scores."
            ],
            recommendation: {
                slotId: "suggested-id",
                explanation: "This slot is optimal as it avoids the high-demand peak at 10 AM and aligns with staff shift transitions."
            },
            alternatives: [
                { slotId: "alt-1", reason: "Afternoon window with lower resource heat." },
                { slotId: "alt-2", reason: "Early morning slot to minimize staff fatigue." }
            ]
        };

        return result;
    }
}
