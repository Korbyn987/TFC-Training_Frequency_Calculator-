/**
 * Web-specific implementation of CircularProgress for the RecoveryGuideScreen
 * This component is designed to be fully compatible with the web DOM
 */

import React from 'react';
import { View, Text } from 'react-native-web';

// A simple web-compatible circular progress component
const CircularProgressWeb = ({
  value = 0,
  radius = 40,
  duration = 1000,
  progressValueColor = '#000',
  activeStrokeColor = '#2465FD',
  inActiveStrokeColor = '#EEEEEE',
  maxValue = 100,
  title = '',
  titleStyle = {},
  titleFontSize = 14,
  progressValueFontSize = 16,
  progressValueStyle = {},
  ...props
}) => {
  // Calculate dimensions
  const size = radius * 2;
  const circumference = 2 * Math.PI * (radius - 10);
  const strokeDashoffset = circumference - (value / maxValue) * circumference;
  
  // Base container style
  const containerStyle = {
    width: size,
    height: size,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  };
  
  // Circle base styles
  const circleBaseStyle = {
    fill: 'none',
    stroke: inActiveStrokeColor,
    strokeWidth: 10,
  };
  
  // Circle progress style
  const circleProgressStyle = {
    fill: 'none',
    stroke: activeStrokeColor,
    strokeWidth: 10,
    strokeDasharray: circumference,
    strokeDashoffset: strokeDashoffset,
    strokeLinecap: 'round',
    transition: `stroke-dashoffset ${duration}ms ease-in-out`,
    transform: 'rotate(-90deg)',
    transformOrigin: 'center',
  };
  
  // Text styles
  const valueTextStyle = {
    position: 'absolute',
    fontSize: progressValueFontSize,
    fontWeight: 'bold',
    color: progressValueColor,
    marginTop: -20, // Move value text up more significantly
    ...progressValueStyle,
  };
  
  const titleTextStyle = {
    position: 'absolute',
    fontSize: titleFontSize,
    color: titleStyle.color || '#333',
    marginTop: 12, // Position title below the value but higher than before
    textAlign: 'center',
    width: '100%', // Ensure text is centered
    ...titleStyle,
  };
  
  return (
    <View style={containerStyle}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={radius}
          cy={radius}
          r={radius - 10}
          style={circleBaseStyle}
        />
        <circle
          cx={radius}
          cy={radius}
          r={radius - 10}
          style={circleProgressStyle}
        />
      </svg>
      <Text style={valueTextStyle}>{value}%</Text>
      {title ? <Text style={titleTextStyle}>{title}</Text> : null}
    </View>
  );
};

export default CircularProgressWeb;
