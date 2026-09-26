/** @type {import('tailwindcss').Config} */

const color = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: color("accent"),
          foreground: color("accent-foreground"),
        },

        background: color("background"),
        border: color("border"),

        card: {
          DEFAULT: color("card"),
          foreground: color("card-foreground"),
        },

        destructive: {
          DEFAULT: color("destructive"),
          foreground: color("destructive-foreground"),
        },

        disabled: {
          DEFAULT: color("disabled"),
          foreground: color("disabled-foreground"),
        },

        foreground: color("foreground"),

        input: {
          DEFAULT: color("input"),
          border: color("input-border"),
        },

        muted: {
          DEFAULT: color("muted"),
          foreground: color("muted-foreground"),
        },

        overlay: color("overlay"),

        primary: {
          DEFAULT: color("primary"),
          foreground: color("primary-foreground"),
          hover: color("primary-hover"),
          muted: color("primary-muted"),
        },

        ring: color("ring"),

        secondary: {
          DEFAULT: color("secondary"),
          foreground: color("secondary-foreground"),
        },

        success: {
          DEFAULT: color("success"),
          foreground: color("success-foreground"),
          muted: color("success-muted"),
        },

        "tab-background": color("tab-background"),

        warning: {
          DEFAULT: color("warning"),
          foreground: color("warning-foreground"),
          muted: color("warning-muted"),
        },
      },

      fontFamily: {
        sans: ["Inter_400Regular"],
        inter: ["Inter_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
      },

      borderRadius: {
        app: "12px",
        control: "10px",
        sheet: "24px",
      },

      boxShadow: {
        xs: "0 1px 2px rgb(0 0 0 / 0.04)",
      },
    },
  },

  plugins: [],
};
