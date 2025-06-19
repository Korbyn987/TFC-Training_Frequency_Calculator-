// Add TypeScript definitions for web-specific modules
declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.gif' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// Add type definitions for Node.js global objects
declare namespace NodeJS {
  interface Global {
    // Add any global variables you need to access here
  }
}

// Add type definitions for web-specific React Native components
declare module 'react-native' {
  interface ViewProps {
    // Add any web-specific View props here
  }
  
  interface TextProps {
    // Add any web-specific Text props here
  }
  
  // Add other component props as needed
}

// Add type definitions for React Native Web
interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
  __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
}
