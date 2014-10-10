var Webmaker = (function() {
  var Webmaker = {};
  var getBaseURL = function(w) {
    w = w || window;
    return w.location.protocol + '//' + w.location.host + w.location.pathname;
  };
  var areWeInAMakesDotOrgWrapper = function() {
    try {
      return areWeOnMakesDotOrg() &&
             (getBaseURL(window.parent) == removeOurFinalUnderscore());
    } catch (e) {
      // This is likely a security exception telling us we can't inspect
      // our parent's location, which means we're not in a makes.org wrapper.
      return false;
    }
  };
  var removeOurFinalUnderscore = function() {
    return getBaseURL().slice(0, -1);
  };
  var areWeOnMakesDotOrg = function() {
    // makes.org is comprised of subdomains of the form <username>.makes.org.
    // According to https://webmaker.org/en-US/search, <username> must be
    // between 1-20 characters, and only include "-" and alphanumeric
    // characters.
    //
    // The content of Thimble makes is also always stored at a URL that
    // ends with an underscore; the non-underscored version is actually
    // a wrapper with an iframe pointing to the content.

    return /^https:\/\/[A-Za-z0-9\-]+\.makes\.org\/.+_$/.test(getBaseURL());
  };

  Webmaker.getRemixURL = function() {
    if (!areWeOnMakesDotOrg()) return;

    return removeOurFinalUnderscore() + '/remix';
  };

  if (areWeInAMakesDotOrgWrapper()) {
    window.parent.location = getBaseURL() + window.parent.location.search +
                             window.parent.location.hash;
  }

  return Webmaker;
})();
