import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert,
    Zap,
    MessageSquare,
    Layout,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    Sparkles,
    Search
} from 'lucide-react';
import { Card, Button } from '../../design-system';

interface AuditResult {
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

interface RefactorResult {
    versions: {
        refined: string;
        structured: string;
        minimal: string;
    };
    improvementsMade: string[];
}

const PromptAuditor: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
    const [refactorResult, setRefactorResult] = useState<RefactorResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'audit' | 'refactor'>('audit');

    const handleAudit = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        try {
            const response = await fetch('/api/v1/ai/audit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ prompt })
            });
            const result = await response.json();
            if (result.success) {
                setAuditResult(result.data);
                setActiveTab('audit');
            }
        } catch (error) {
            console.error('Audit failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefactor = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        try {
            const response = await fetch('/api/v1/ai/refactor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ prompt })
            });
            const result = await response.json();
            if (result.success) {
                setRefactorResult(result.data);
                setActiveTab('refactor');
            }
        } catch (error) {
            console.error('Refactor failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-500';
        if (score >= 5) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex justify-between items-center bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-blue-400" />
                        Prompt Auditor
                    </h1>
                    <p className="text-gray-400 mt-1">Refine your AI instructions using the 7-Dimension Framework</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="secondary"
                        onClick={() => setPrompt('')}
                    >
                        Clear
                    </Button>
                    <Button
                        onClick={handleAudit}
                        disabled={loading || !prompt}
                    >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                        Audit Prompt
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Editor Side */}
                <Card className="p-6 bg-slate-900 border-white/5 shadow-2xl h-[600px] flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400 text-sm font-medium flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-400" />
                            INPUT PROMPT
                        </span>
                        <span className="text-gray-500 text-xs">{prompt.length} characters</span>
                    </div>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your prompt here (e.g., 'Draft a schedule for a chemistry lab session...')"
                        className="flex-grow bg-slate-950/50 text-white p-6 rounded-xl border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none resize-none font-mono text-sm shadow-inner transition-all leading-relaxed"
                    />
                    <div className="mt-6">
                        <Button
                            onClick={handleRefactor}
                            disabled={loading || !prompt}
                            fullWidth
                            className="py-6"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate Gold Standard Versions
                        </Button>
                    </div>
                </Card>

                {/* Results Side */}
                <div className="space-y-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('audit')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'audit' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Analysis & Scores
                        </button>
                        <button
                            onClick={() => setActiveTab('refactor')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'refactor' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Refactored Versions
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'audit' && auditResult && (
                            <motion.div
                                key="audit"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                {/* Overall Score */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
                                        <div className="text-4xl font-bold text-blue-400 mb-1">{auditResult.overallScore}/10</div>
                                        <div className="text-gray-400 text-sm uppercase tracking-wider">Overall Score</div>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
                                        <div className={`text-4xl font-bold mb-1 ${auditResult.riskScore > 50 ? 'text-red-400' : 'text-green-400'}`}>
                                            {auditResult.riskScore}%
                                        </div>
                                        <div className="text-gray-400 text-sm uppercase tracking-wider">Risk Score</div>
                                    </div>
                                </div>

                                {/* Individual Scores */}
                                <Card className="p-6 bg-slate-900 border-white/5">
                                    <h3 className="text-white font-medium mb-6 flex items-center gap-2">
                                        <Layout className="w-4 h-4 text-blue-400" />
                                        7-Dimension Audit Breakdown
                                    </h3>
                                    <div className="space-y-4">
                                        {Object.entries(auditResult.scores).map(([key, score]) => (
                                            <div key={key} className="space-y-2">
                                                <div className="flex justify-between text-sm uppercase tracking-tight">
                                                    <span className="text-gray-400">{key}</span>
                                                    <span className={`font-bold ${getScoreColor(score)}`}>{score}/10</span>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${score * 10}%` }}
                                                        className={`h-full ${score >= 8 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                {/* Weaknesses & Tips */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                                        <h4 className="text-red-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                                            <AlertTriangle className="w-3 h-3" />
                                            Weaknesses
                                        </h4>
                                        <ul className="space-y-2">
                                            {auditResult.weaknesses.map((w, i) => (
                                                <li key={i} className="text-gray-300 text-xs flex gap-2">
                                                    <span className="text-red-500">•</span> {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/10">
                                        <h4 className="text-green-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Refactoring Tips
                                        </h4>
                                        <ul className="space-y-2">
                                            {auditResult.refactoringTips.map((t, i) => (
                                                <li key={i} className="text-gray-300 text-xs flex gap-2">
                                                    <span className="text-green-500">→</span> {t}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'refactor' && refactorResult && (
                            <motion.div
                                key="refactor"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                {/* Refactored Versions */}
                                <Card className="overflow-hidden bg-slate-900 border-white/5 h-[600px] flex flex-col">
                                    <div className="p-4 bg-white/5 border-b border-white/5">
                                        <h3 className="text-white font-medium flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-purple-400" />
                                            Gold Standard Refactors
                                        </h3>
                                    </div>
                                    <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-grow">
                                        {Object.entries(refactorResult.versions).map(([type, content]) => (
                                            <div key={type} className="space-y-3 group">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/5 inline-block ${type === 'structured' ? 'text-purple-400' : type === 'minimal' ? 'text-blue-400' : 'text-green-400'
                                                        }`}>
                                                        {type.replace('_', ' ')} VERSION
                                                    </span>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(content)}
                                                        className="text-gray-500 hover:text-white transition-colors p-1"
                                                    >
                                                        <Layout className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5 group-hover:border-purple-500/30 transition-all font-mono text-xs whitespace-pre-wrap leading-relaxed text-gray-300">
                                                    {content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                {/* Improvements Summary */}
                                <div className="bg-purple-600/10 p-4 rounded-xl border border-purple-600/20">
                                    <h4 className="text-purple-400 text-xs font-bold uppercase mb-3">Key Improvements Made</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {refactorResult.improvementsMade.map((m, i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-950 text-purple-300 text-[10px] rounded-full border border-purple-600/30">
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {!auditResult && !refactorResult && !loading && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/5 rounded-3xl border border-dashed border-white/10 opacity-50">
                                <Search className="w-16 h-16 text-gray-600 mb-4" />
                                <h3 className="text-xl font-medium text-gray-400">Ready to Analyze</h3>
                                <p className="text-gray-500 text-sm max-w-xs mt-2">Enter a prompt and hit "Audit" or "Generate Gold" to see the AI evaluation.</p>
                            </div>
                        )}

                        {loading && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12">
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full"
                                    />
                                    <Sparkles className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <h3 className="text-xl font-medium text-white mt-6">Crunching Numbers...</h3>
                                <p className="text-gray-500 text-sm mt-2 font-mono">Running 7-Dimension Audit Framework</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PromptAuditor;
