$(function () {
  var socket = io()
  socket.on('msg', function(msg){
    $('#messages').html(msg)
  })
})

$('.ui.search')
  .search({
    type          : 'category',
    minCharacters : 3,
    transition    : 'slide',
    apiSettings   : {
      onResponse: function(youtubeResponse) {
        var
          response = {
            results : {}
          }

        $.each(youtubeResponse.items, function(index, item) {
          var language   = `<img src="${item.snippet.thumbnails.default.url}" height="42px">`

          response.results[language] = {
            name    : `${language}`,
            results : [{
              title       : item.snippet.title,
              description : item.snippet.channelTitle,
              url         : `#${item.id.videoId}`
            }]
          }
        })
        return response
      },
      url: 'api/youtube/search/{query}'
    }
  })

  window.onhashchange = function(){
    var hash = location.hash.slice(1)
    if (hash.length>0) {
      $.post(`api/youtube/song/${hash}`, function(data) {
        //
      }).then(
        window.location.hash=''
      )
    }
  }
