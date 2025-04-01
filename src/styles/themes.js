export const theme = {
  colors: {
    // Primary colors
    primary: "#6b46c1", // Deep purple
    primaryDark: "#553c9a", // Darker purple
    primaryLight: "#805ad5", // Lighter purple

    // Background colors
    backgroundDark: "rgb(23, 25, 35)", // Dark background
    backgroundLight: "rgb(30, 32, 42)", // Lighter background

    // Text colors
    textPrimary: "#ffffff", // White text
    textSecondary: "rgba(255, 255, 255, 0.8)", // Semi-transparent white

    // Status colors
    error: "#e53e3e", // Red error
    success: "#38a169", // Green success
    ready: "#38a169", // Green ready
    caution: "#e53e3e", // Red caution
    notReady: "#9b2c2c", // Darker red not ready

    // Accent colors
    accent: "#680fbf", // Purple accent

    // Interactive elements
    hover: "#3B5998", // Rich indigo
    active: "#1E3A8A", // Deep space blue
    disabled: "#64748B", // Gray disabled state
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
    xLarge: 32,
  },
  fonts: {
    regular: "Arial",
    bold: "Arial-Bold",
  },
  animations: {
    buttonPress: {
      duration: 150,
      easing: "ease-in-out",
    },
    modalAppear: {
      duration: 200,
      easing: "ease-out",
    },
  },
};
