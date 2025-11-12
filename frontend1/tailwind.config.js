/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#F76B10",
        yellow: "#F4BE47",
        blue: "#2B57FF",
        green: "#22C997",
        darkOrange: "#8C3700",
        white: "#FFFFFF",
        grey: "#A0A0A0",
        grey2: "#E1E1E1",
        softDarkish: "#444B55",
        info: "#2B57FF",
        success: "#22C997",
        warning: "#F4BE47",
        error: "#EB5757",
        bginfo: "#F2F2F2",
      },
    },
  },
  plugins: [],
}