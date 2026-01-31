/**
 * Centralized environment configuration with fail-fast behavior.
 * No fallbacks - missing variables cause immediate failure.
 * 
 * Per PROMPT_AUDIT prompt_19: "Zod schema validation with fail-fast behavior"
 */

function requireEnv(key: string): string {
    const value = import.meta.env[key];
    if (value === undefined || value === '') {
        throw new Error(
            `❌ Missing required environment variable: ${key}\n` +
            `Please ensure ${key} is defined in your .env file.`
        );
    }
    return value;
}

export const env = {
    /** API base URL - REQUIRED, no fallback */
    VITE_API_URL: requireEnv('VITE_API_URL'),
} as const;
