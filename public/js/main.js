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
    onSelect: function(result, response) {
      $('#songreq').val('')
      $.post(`api/youtube/song/${result.actionURL}`, function(data) {
        //
      })
    },
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
              actionURL   : item.id.videoId
            }]
          }
        })
        return response
      },
      url: 'api/youtube/search/{query}'
    }
  })
