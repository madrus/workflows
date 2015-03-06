var $;

$ = require('jquery');

fill(function(item) {
  if (item == null) {
    item = 'The most creative minds in Art';
  }
  return $('.tagline').append("" + item);
})();

fill;
