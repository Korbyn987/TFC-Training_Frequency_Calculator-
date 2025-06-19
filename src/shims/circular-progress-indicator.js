/**
 * Shim for react-native-circular-progress-indicator for web
 * This provides a web-compatible version that works with SVG
 */

import React from 'react';
import CircularProgressWeb from './CircularProgressWeb';

// Web-compatible implementation of CircularProgressIndicator using SVG
const CircularProgressIndicator = ({
  value = 0,
  radius = 60,
  maxValue = 100,
  title = '',
  titleColor = '#333',
  titleStyle = {},
  activeStrokeColor = '#2465FD',
  inActiveStrokeColor = '#EEEEEE',
  valueSuffix = '%',
  valuePrefix = '',
  textColor = '#333',
  textStyle = {},
  delay = 0,
  duration = 500,
  progressValueFontSize,
  titleFontSize,
  progressValueColor,
  progressValueStyle,
  ...props
}) => {
  // Calculate percentage completion
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  // Set default values if not provided
  const finalProgressValueColor = progressValueColor || textColor;
  const finalProgressValueStyle = progressValueStyle || textStyle || {};
  const finalTitleFontSize = titleFontSize || Math.max(10, radius / 4);
  const finalProgressValueFontSize = progressValueFontSize || Math.max(14, radius / 3);
  
  // Compose the title with prefix and suffix if not already included in the title prop
  const displayValue = title || `${valuePrefix}${Math.round(percentage)}${valueSuffix}`;
  
  // Enhanced titleStyle with color
  const enhancedTitleStyle = {
    ...titleStyle,
    color: titleColor,
  };
  
  return (
    <CircularProgressWeb
      value={percentage}
      radius={radius}
      duration={duration}
      activeStrokeColor={activeStrokeColor}
      inActiveStrokeColor={inActiveStrokeColor}
      maxValue={100}
      title={displayValue}
      titleStyle={enhancedTitleStyle}
      titleFontSize={finalTitleFontSize}
      progressValueColor={finalProgressValueColor}
      progressValueFontSize={finalProgressValueFontSize}
      progressValueStyle={finalProgressValueStyle}
      {...props}
    />
  );
};

// Export other components that might be used
const CircularProgressWithChild = ({children, ...props}) => {
  return (
    <CircularProgressIndicator {...props}>
      {children}
    </CircularProgressIndicator>
  );
};

export { CircularProgressWithChild };
export default CircularProgressIndicator;
