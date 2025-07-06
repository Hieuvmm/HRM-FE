/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  important: true,
  theme: {
    extend: {
      backgroundColor: (theme) => ({
        ...theme("colors"),
      }),
      boxShadow: {
        DEFAULT: "0 2px 6px 0 rgba(0, 0, 0, 0.15)",
        5: "5px 5px 5px rgba(0, 0, 0, 0.35)",
        7: "1px 3px 12px 1px rgba(0, 0, 0, 0.5)",
        md: "0px 2px 12px #00000029",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.01)",
        xl: "0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)",
        "2xl": "1px 5px 35px 1px #949494",
      },
      colors: {
        "primary-green": "#c9ebca",
        "second-green": "#f3fefa",
        "dark-green": "#036666",
        "light-green": "#d9e9e3",
        "primary-gray": "#e7eaee",
        "second-gray": "#374A67",
        "dark-gray": "#A7A7A7",
        "primary-pink": "#F98A8A",
        "light-pink": "#FFF6F6",
        "primary-red": "#D1293D",
        "green-df": "#036666",
        "green-2": "#deeee8",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        roboto: ["Roboto", "sans-serif"],
      },
      fontSize: {
        13: ["13px", { lineHeight: "1.5" }],
        15: "15px",
      },
      width: {
        70: "70%",
        30: "30%",
      },
      backgroundImage: {
        "login-pattern":
          "url('https://files.at-tech.vn/development/COM-AT/hrm/background-Login.png')",
      },
      keyframes: {
        ringring: {
          "10%, 90%": { transform: "translate3d(-1px, 0, 0)" },
          "20%, 80%": { transform: "translate3d(2px, 0, 0)" },
          "30%, 50%, 70%": { transform: "translate3d(-4px, 0, 0)" },
          "40%, 60%": { transform: "translate3d(4px, 0, 0)" },
        },
      },
      animation: {
        ringring: "ringring 1s linear",
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
      screens: {
        mobile: { max: "640px" },
        tablet: { max: "768px" },
        xl: "1500px",
        "2xl": "1750px",
      },
      borderRadius: {
        DEFAULT: "4px",
        10: "10px",
        20: "20px",
      },
      spacing: {
        13: "52px",
        18: "72px",
      },
      zIndex: {
        1: "1",
        2: "2",
        3: "3",
      },
      container: {
        center: true,
      },
    },
  },
  variants: {
    extend: {
      margin: ["first", "last"],
      borderWidth: ["first", "last"],
      padding: ["first", "last"],
      textColor: ["active"],
      animation: ["hover", "group-hover"],
    },
  },
  plugins: [require("tailwindcss-animated")],
};
