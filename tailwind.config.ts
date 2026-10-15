import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0b1e3d",
          dark: "#071530",
          light: "#122a52",
        },
        electric: {
          DEFAULT: "#2a7de1",
          light: "#4f9bff",
        },
        hot: "#e2492a",
        ink: "#1b1f27",
        paper: "#ffffff",
        mist: "#f4f6f9",
        line: "#e4e8ee",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      maxWidth: {
        shell: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
