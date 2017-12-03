$(function () {
  var socket = io()
  socket.on('song', function(song){
    $('#song_title').text(song.title)
    $('#song_channel').text(song.channel)
    $('#song_thumbnail').attr("src", song.thumbnail)
  });
})

$('.ui.search')
  .search({
    type          : 'category',
    minCharacters : 3,
    transition    : 'slide',
    onSelect: function(result, response) {
      $.post(`api/youtube/song/${result.actionURL}`).then(data => {
        document.getElementById("song_req").value = ""
      })
    },
    apiSettings   : {
      onResponse: function(youtubeResponse) {
        var response = {results : {}}
        $.each(youtubeResponse.items, function(index, item) {
          var thumb   = `<img src="${item.snippet.thumbnails.default.url}" height="42px">`
          response.results[thumb] = {
            name    : `${thumb}`,
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
