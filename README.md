# Training Frequency Calculator (TFC)

A mobile application built with React Native/Expo that helps users calculate and track their training frequencies.

## Project Overview

The Training Frequency Calculator (TFC) is designed to help users optimize their workout routines by calculating appropriate training frequencies based on various factors. The app includes features for user authentication, password reset, and recovery guides.

## Setup Instructions

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Extract the ZIP file to your desired location
2. Open a terminal/command prompt in the project directory
3. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```
   The `--legacy-peer-deps` flag is necessary due to some dependency conflicts between React 18.3.1 and React Native 0.72.10

### Running the App

#### Mobile (Recommended)

To run the app in its primary mobile environment:

```
npm start
```

This will start the Expo development server. You can then:
- Scan the QR code with the Expo Go app on your mobile device
- Press 'a' to open in an Android emulator
- Press 'i' to open in an iOS simulator

#### Web Version

The web version has been configured but may have some rendering differences from the mobile version:

```
npm run start-web
```

## Project Structure

- `/src` - Main application code
  - `/components` - Reusable UI components
  - `/screens` - Application screens
  - `/redux` - State management
  - `/shims` - Web compatibility shims
- `/assets` - Images, fonts, and other static assets
- `/Backend` - Server-side code

## Known Issues

- The web version may have some rendering differences compared to the mobile version
- Some mobile-specific features may not work properly in the web environment

## Technical Notes

- Built with Expo/React Native
- Uses Redux for state management
- Implements React Navigation for routing
- Custom color implementation for web compatibility
