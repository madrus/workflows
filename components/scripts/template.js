// no need to require jQuery library here
// because we have done it in tagline.coffee

$(function () {
  var Mustache = require('mustache'); // require Mustache library

  $.getJSON('js/data.json', function (data) {
    var template = $('#speakerstpl').html();
    var html = Mustache.to_html(template, data);
    $('#speakers').html(html);
  }); //getJSON

}); //function