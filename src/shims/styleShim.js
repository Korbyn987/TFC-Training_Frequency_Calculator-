/**
 * Style transformation utility for React Native Web
 * Handles conversion of React Native style objects to web-compatible formats
 */

// Mapping of React Native transform properties to CSS transform functions
const transformMapping = {
  translateX: (value) => `translateX(${typeof value === 'number' ? `${value}px` : value})`,
  translateY: (value) => `translateY(${typeof value === 'number' ? `${value}px` : value})`,
  scale: (value) => `scale(${value})`,
  scaleX: (value) => `scaleX(${value})`,
  scaleY: (value) => `scaleY(${value})`,
  rotate: (value) => `rotate(${value})`,
  rotateX: (value) => `rotateX(${value})`,
  rotateY: (value) => `rotateY(${value})`,
  rotateZ: (value) => `rotateZ(${value})`,
  skewX: (value) => `skewX(${value})`,
  skewY: (value) => `skewY(${value})`,
};

/**
 * Transforms React Native styles to web-compatible styles
 * @param {Object} styles - React Native style object
 * @returns {Object} Web-compatible style object
 */
export const transformStyles = (styles) => {
  if (!styles) return {};
  
  // Create a new object to avoid mutating the original
  const webStyles = { ...styles };
  
  // Handle transform arrays
  if (webStyles.transform && Array.isArray(webStyles.transform)) {
    const transformValues = [];
    
    webStyles.transform.forEach((transform) => {
      const property = Object.keys(transform)[0];
      const value = transform[property];
      
      if (transformMapping[property]) {
        transformValues.push(transformMapping[property](value));
      }
    });
    
    if (transformValues.length > 0) {
      webStyles.transform = transformValues.join(' ');
    } else {
      delete webStyles.transform;
    }
  }
  
  // Handle shadow properties
  if (webStyles.shadowColor || webStyles.shadowOffset || webStyles.shadowOpacity || webStyles.shadowRadius) {
    const color = webStyles.shadowColor || 'black';
    const offsetX = webStyles.shadowOffset?.width || 0;
    const offsetY = webStyles.shadowOffset?.height || 0;
    const radius = webStyles.shadowRadius || 0;
    const opacity = webStyles.shadowOpacity || 1;
    
    // Combine shadow properties into a single boxShadow property
    webStyles.boxShadow = `${offsetX}px ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})`;
    
    // Remove React Native specific shadow properties
    delete webStyles.shadowColor;
    delete webStyles.shadowOffset;
    delete webStyles.shadowOpacity;
    delete webStyles.shadowRadius;
  }
  
  // Handle text shadow properties
  if (webStyles.textShadowColor || webStyles.textShadowOffset || webStyles.textShadowRadius) {
    const color = webStyles.textShadowColor || 'black';
    const offsetX = webStyles.textShadowOffset?.width || 0;
    const offsetY = webStyles.textShadowOffset?.height || 0;
    const radius = webStyles.textShadowRadius || 0;
    
    // Combine text shadow properties into a single textShadow property
    webStyles.textShadow = `${offsetX}px ${offsetY}px ${radius}px ${color}`;
    
    // Remove React Native specific text shadow properties
    delete webStyles.textShadowColor;
    delete webStyles.textShadowOffset;
    delete webStyles.textShadowRadius;
  }
  
  return webStyles;
};

/**
 * Higher-order component to transform styles for React Native Web
 * @param {Component} Component - React component to wrap
 * @returns {Component} Wrapped component with transformed styles
 */
export const withWebStyles = (Component) => {
  return (props) => {
    const { style, ...otherProps } = props;
    const webStyle = transformStyles(style);
    
    return <Component style={webStyle} {...otherProps} />;
  };
};

export default transformStyles;
