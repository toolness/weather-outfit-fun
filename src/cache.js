var Cache = {
  DEFAULT_MAX_AGE: 1000 * 60 * 60,
  get: function getCacheEntry(key, maxAge) {
    var val = sessionStorage[key];
    var now = Date.now();

    try {
      val = JSON.parse(val);
      if (now - val.timestamp < (maxAge || Cache.DEFAULT_MAX_AGE))
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
