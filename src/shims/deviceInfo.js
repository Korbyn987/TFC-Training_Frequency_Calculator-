/**
 * DeviceInfo shim for React Native Web
 */

const Dimensions = {
  get: () => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 375,
    height: typeof window !== 'undefined' ? window.innerHeight : 667,
    scale: 1,
    fontScale: 1
  })
};

const NativeDeviceInfo = {
  Dimensions,
  getConstants: () => ({
    Dimensions: {
      window: Dimensions.get('window'),
      screen: Dimensions.get('screen')
    },
    isIPhoneX_deprecated: false,
    isTablet: false,
    reactNativeVersion: { major: 0, minor: 72, patch: 10 }
  })
};

export default NativeDeviceInfo;
