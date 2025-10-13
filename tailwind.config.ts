// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
	darkMode: "class",
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	theme: {
		colors: {
			transparent: "transparent",
			current: "currentColor",

			border: "hsl(var(--border))",
			input: "hsl(var(--input))",
			ring: "hsl(var(--ring))",
			background: "hsl(var(--background))",
			foreground: "hsl(var(--foreground))",

			primary: {
				DEFAULT: "hsl(var(--primary))",
				foreground: "hsl(var(--primary-foreground))",
			},
			secondary: {
				DEFAULT: "hsl(var(--secondary))",
				foreground: "hsl(var(--secondary-foreground))",
			},
			accent: {
				DEFAULT: "hsl(var(--accent))",
				foreground: "hsl(var(--accent-foreground))",
			},

			// Voice mode colors
			"voice-bg": "hsl(var(--voice-bg))",
			"voice-text": "hsl(var(--voice-text))",
			"voice-accent": "hsl(var(--voice-accent))",

			// Text mode colors
			"text-bg": "hsl(var(--text-bg))",
			"text-card": "hsl(var(--text-card))",
			"text-border": "hsl(var(--text-border))",

			// Level colors
			"level-1": "hsl(var(--level-1))",
			"level-2": "hsl(var(--level-2))",
			"level-3": "hsl(var(--level-3))",
			"level-4": "hsl(var(--level-4))",

			// Post type colors
			"info-post": "hsl(var(--info-post))",
			"social-post": "hsl(var(--social-post))",
			"nonverbal-post": "hsl(var(--nonverbal-post))",
			"other-post": "hsl(var(--other-post))",

			// Semantic colors
			success: "hsl(var(--success))",
			warning: "hsl(var(--warning))",
			error: "hsl(var(--error))",
			info: "hsl(var(--info))",
		},
		extend: {
			// borderRadius, boxShadow, animation 등 나머지 설정은 유지
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
