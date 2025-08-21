// This script must run before any React Native code
(function() {
  // Set up BatchedBridge configuration globally
  window.__fbBatchedBridgeConfig = {
    remoteModuleConfig: {}
  };
  
  // Set up mock NativeModules
  window.__fbBatchedBridge = {
    callFunctionReturnFlushedQueue: function() { return []; },
    invokeCallbackAndReturnFlushedQueue: function() { return []; },
    flushedQueue: function() { return []; },
    callFunctionReturnResultAndFlushedQueue: function() { return [null, []]; }
  };

  console.log('React Native Web patches loaded!');
})();
