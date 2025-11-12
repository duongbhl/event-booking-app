// constants/theme.ts
import { MD3LightTheme as DefaultTheme, MD3DarkTheme } from "react-native-paper";
import Colors from "./colors";

export const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary.blue,
    background: Colors.background.info,
    surface: Colors.secondary.white,
    text: Colors.text.black,
    error: Colors.state.error,
  },
};

export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary.yellow,
    background: "#121212",
    surface: "#1E1E1E",
    text: Colors.text.white,
    error: Colors.state.error,
  },
};

export type AppThemeType = typeof LightTheme;
