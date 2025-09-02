
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				// Voice mode colors
				'voice-bg': 'hsl(var(--voice-bg))',
				'voice-text': 'hsl(var(--voice-text))',
				'voice-accent': 'hsl(var(--voice-accent))',
				// Text mode colors
				'text-bg': 'hsl(var(--text-bg))',
				'text-card': 'hsl(var(--text-card))',
				'text-border': 'hsl(var(--text-border))',
				// Level colors
				'level-1': 'hsl(var(--level-1))',
				'level-2': 'hsl(var(--level-2))',
				'level-3': 'hsl(var(--level-3))',
				'level-4': 'hsl(var(--level-4))',
				// Post type colors
				'info-post': 'hsl(var(--info-post))',
				'social-post': 'hsl(var(--social-post))',
				'nonverbal-post': 'hsl(var(--nonverbal-post))',
				'other-post': 'hsl(var(--other-post))',
				// Semantic colors
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				error: 'hsl(var(--error))',
				info: 'hsl(var(--info))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 4px)',
				sm: 'calc(var(--radius) - 8px)',
				xl: 'calc(var(--radius) + 4px)',
				'2xl': 'calc(var(--radius) + 8px)',
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'medium': 'var(--shadow-medium)',
				'strong': 'var(--shadow-strong)',
			},
			fontFamily: {
				sans: ['-apple-system', 'BlinkMacSystemFont', 'Apple SD Gothic Neo', 'Pretendard Variable', 'Pretendard', 'Roboto', 'Noto Sans KR', 'Segoe UI', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'sans-serif'],
			},
			animation: {
				'fade-in': 'fadeIn 0.5s ease-out forwards',
				'slide-up': 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
				'scale-in': 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
				'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				slideUp: {
					'0%': {
						opacity: '0',
						transform: 'translateY(100%)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				scaleIn: {
					'0%': {
						opacity: '0',
						transform: 'scale(0.9)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				pulseGentle: {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.7'
					}
				}
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
