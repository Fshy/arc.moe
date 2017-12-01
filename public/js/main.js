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
    apiSettings   : {
      onResponse: function(youtubeResponse) {
        var
          response = {
            results : {}
          }

        $.each(youtubeResponse.items, function(index, item) {
          console.log(item);
          var language   = `<img src="${item.snippet.thumbnails.default.url}" height="42px">`

          response.results[language] = {
            name    : `${language}`,
            results : [{
              title       : item.snippet.title,
              description : item.snippet.channelTitle,
              url         : `api/youtube/song/${item.id.videoId}`
            }]
          }
        })
        return response
      },
      url: 'api/youtube/search/{query}'
    }

  })
