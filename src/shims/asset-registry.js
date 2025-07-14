/**
 * Asset Registry shim for React Native Web
 * Provides implementations for asset registry and path support
 */

const assets = {};

// Registry functions
const registerAsset = (asset) => {
  const { __packager_asset, fileSystemLocation, httpServerLocation, width, height, scales, hash, name, type } = asset;
  const key = `${fileSystemLocation}/${name}.${type}`;
  assets[key] = asset;
  return asset;
};

const getAssetByID = (assetId) => {
  return null;
};

// Path support functions
const getBasePath = (asset) => {
  return '';
};

const getScaledAssetPath = (asset) => {
  if (asset && asset.httpServerLocation && asset.name && asset.type) {
    return asset.httpServerLocation + '/' + asset.name + '.' + asset.type;
  }
  return '';
};

// Source resolver
const resolveAssetSource = (source) => {
  if (typeof source === 'object' && source && source.uri) {
    return source;
  }
  
  if (typeof source === 'number') {
    return {
      uri: '',
      width: 0,
      height: 0,
      scale: 1
    };
  }
  
  return null;
};

// Export registry object
const registry = {
  registerAsset,
  getAssetByID
};

// Export path support object
const pathSupport = {
  getBasePath,
  getScaledAssetPath
};

// Exports
export {
  registerAsset,
  getAssetByID,
  getBasePath,
  getScaledAssetPath,
  resolveAssetSource,
  registry,
  pathSupport
};

export default {
  registerAsset,
  getAssetByID,
  registry,
  pathSupport,
  resolveAssetSource
};
