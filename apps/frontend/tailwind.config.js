/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            colors: {
                // Primary Brand (Indigo/Blue)
                primary: {
                    DEFAULT: '#6366f1', // Indigo 500
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
                // Backgrounds (Dark Mode Native)
                bg: {
                    dark: '#020617',    // Slate 950 (Vantablack-ish)
                    card: '#0f172a',    // Slate 900
                    surface: '#1e293b', // Slate 800
                },
                // Semantic Text
                text: {
                    main: '#f8fafc',    // Slate 50
                    muted: '#94a3b8',   // Slate 400
                    subtle: '#64748b',  // Slate 500
                },
                // Functional
                accent: {
                    DEFAULT: '#22d3ee', // Cyan 400
                    glow: '#0891b2',
                },
                success: '#22c55e',
                warning: '#eab308',
                error: '#ef4444',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glass': 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.6) 100%)',
                'glass-hover': 'linear-gradient(145deg, rgba(51, 65, 85, 0.7) 0%, rgba(30, 41, 59, 0.6) 100%)',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'neon': '0 0 10px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.3)',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
