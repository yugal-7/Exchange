import type { Config } from "tailwindcss";
import {nextui} from "@nextui-org/react";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		backgroundImage: {
			"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
			"gradient-conic":
			  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
		  },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			baseBackgroundL0: '#0b0d12',
  			baseBackgroundL1: '#12151c',
  			baseBackgroundL2: '#1a1e28',
  			baseBackgroundL3: '#242938',
  			baseBorderLight: '#242938',
  			baseBorderMed: '#2f3547',
  			baseBorderFocus: '#4a5273',
  			baseTextHighEmphasis: '#f4f5f7',
  			baseTextMedEmphasis: '#8b93a7',
  			baseTextLowEmphasis: '#5b6274',
  			accentBlue: '#5b8def',
  			greenText: '#1fd18c',
  			greenBorder: '#1fd18c',
  			greenBackgroundTransparent: 'rgba(31, 209, 140, 0.08)',
  			greenPrimaryButtonBackground: '#1fd18c',
  			greenPrimaryButtonText: '#08130f',
  			redText: '#f24968',
  			redBorder: '#f24968',
  			redBackgroundTransparent: 'rgba(242, 73, 104, 0.08)',
  			redPrimaryButtonBackground: '#f24968',
  			redPrimaryButtonText: '#180509'
  		}
  	}
  },
  plugins: [nextui(), require("tailwindcss-animate")],
};
export default config;
