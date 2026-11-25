import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azul de acento único (Apple Store).
        brand: {
          50: "#eaf3ff",
          100: "#d6e8ff",
          200: "#add1ff",
          300: "#7ab5ff",
          400: "#3d93ff",
          500: "#0071e3",
          600: "#0071e3",
          700: "#0062c4",
          800: "#0050a0",
          900: "#003d7a",
        },
        apple: {
          ink: "#1d1d1f",
          muted: "#6e6e73",
          surface: "#f5f5f7",
          line: "#d2d2d7",
          blue: "#0071e3",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.03), 0 12px 32px -20px rgb(0 0 0 / 0.18)",
        lift: "0 18px 40px -24px rgb(0 0 0 / 0.25)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Inter",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 500ms ease-out both",
        "fade-up": "fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
