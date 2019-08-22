var script = document.createElement('script');
script.src = "https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js"
// document.getElementsByTagName('head')[0].appendChild(script)




(function() {
  function wrap(fn) {
    return function wrapper() {
      var res = fn.apply(this, arguments);
      window.ReactNativeWebView.postMessage(window.location.href);
      return res;
    }
  }

  history.pushState = wrap(history.pushState);
  history.replaceState = wrap(history.replaceState);
  window.addEventListener('popstate', function() {
    // window.ReactNativeWebView.postMessage($.toString());
    // window.ReactNativeWebView.postMessage(window.location.href);
    // document.getElementById('movie_player').click();
  });
})();

true;



function main() {
   document.getElementById('movie_player').click();
}

window.onload = main;
