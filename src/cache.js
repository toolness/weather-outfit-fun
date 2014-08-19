var Cache = {
  get: function getCacheEntry(key, maxAge) {
    var val = sessionStorage[key];
    var now = Date.now();

    try {
      val = JSON.parse(val);
      if (now - val.timestamp < maxAge)
        return val.value;
    } catch (e) {
      return;
    }
  },
  set: function setCacheEntry(key, value) {
    try {
      sessionStorage[key] = JSON.stringify({
        timestamp: Date.now(),
        value: value
      });
      console.log('Cache.set', key);
    } catch (e) {}
  }
};
