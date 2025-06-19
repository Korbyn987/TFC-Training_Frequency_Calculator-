/**
 * Shim for react-native-web/dist/assets-registry/registry
 * This provides the minimal functionality needed for the AssetRegistry
 */

const emptyObject = {};
const registry = {};

const registerAsset = (asset) => {
  if (asset && asset.fileSystemLocation && asset.httpServerLocation && asset.name) {
    const assetId = getAssetByID(asset);
    registry[assetId] = asset;
    return assetId;
  }
  return -1;
};

const getAssetByID = (asset) => {
  if (typeof asset === 'number') {
    return asset;
  }
  return asset.id || asset.fileSystemLocation + '/' + asset.name;
};

const getAssetByFilename = (filename) => {
  const id = Object.keys(registry).find(
    key => registry[key] && registry[key].name === filename
  );
  return id ? registry[id] : undefined;
};

const getPathForAsset = (asset) => {
  const assetId = getAssetByID(asset);
  const rec = registry[assetId] || emptyObject;
  const httpServerLocation = rec.httpServerLocation || '';
  return httpServerLocation + '/' + rec.name;
};

export { registerAsset, getAssetByID, getAssetByFilename, getPathForAsset };
