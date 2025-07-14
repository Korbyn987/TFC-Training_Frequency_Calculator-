// Asset Registry shim for React Native Web

// Mock implementations of asset registry functions
export const getAssetByID = () => null;
export const registerAsset = () => 1;
export const getImageAssetPath = () => '';
export const getPathForResource = () => null;

export default {
  getAssetByID,
  registerAsset,
  getPathForResource
};
