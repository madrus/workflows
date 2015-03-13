$ = require 'jquery' # require jQuery library

do fill = (item = 'The most creative minds in Art') ->
  $('.tagline').append "#{item}"
fill