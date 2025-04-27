export const theme = {
  colors: {
    primary: "#6b46c1", // Main purple
    primaryLight: "#805ad5", // Lighter purple
    primaryDark: "#553c9a", // Darker purple
    background: "#171923", // Dark background
    backgroundLight: "rgba(30, 32, 42, 0.9)", // Lighter background
    text: "#ffffff",
    textSecondary: "rgba(255, 255, 255, 0.8)",
    border: "rgba(107, 70, 193, 0.2)",
    error: "#c53030",
    success: "#38a169",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: "bold",
      letterSpacing: 2,
    },
    h2: {
      fontSize: 24,
      fontWeight: "bold",
      letterSpacing: 1,
    },
    body: {
      fontSize: 16,
      letterSpacing: 0.5,
    },
  },
  shadows: {
    small: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
};
