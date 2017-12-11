$(function () {
  var socket = io()
  socket.on('song', function(song){
    $('#song_title').text(song.title)
    $('#song_channel').text(song.channel)
    $('#song_thumbnail').attr("src", song.thumbnail)
  });

  // Cryptocurrency Websocket
  var currentPrice = {}
  var crypto = io.connect('wss://streamer.cryptocompare.com')
  var subscription = ['5~CCCAGG~BTC~USD', '5~CCCAGG~ETH~USD']
	crypto.emit('SubAdd', { subs: subscription })
	crypto.on("m", function(message) {
		var messageType = message.substring(0, message.indexOf("~"));
    var res = {};
		if (messageType == CCC.STATIC.TYPE.CURRENTAGG) {
			res = CCC.CURRENT.unpack(message)
			dataUnpack(res)
		}
	})

  var dataUnpack = function(data) {
		var from = data['FROMSYMBOL']
		var to = data['TOSYMBOL']
		var fsym = CCC.STATIC.CURRENCY.getSymbol(from)
		var tsym = CCC.STATIC.CURRENCY.getSymbol(to)
		var pair = from + to

		if (!currentPrice.hasOwnProperty(pair)) {
			currentPrice[pair] = {}
		}

		for (var key in data) {
			currentPrice[pair][key] = data[key]
		}

		if (currentPrice[pair]['LASTTRADEID']) {
			currentPrice[pair]['LASTTRADEID'] = parseInt(currentPrice[pair]['LASTTRADEID']).toFixed(0)
		}
		currentPrice[pair]['CHANGE24HOUR'] = CCC.convertValueToDisplay(tsym, (currentPrice[pair]['PRICE'] - currentPrice[pair]['OPEN24HOUR']))
		currentPrice[pair]['CHANGE24HOURPCT'] = ((currentPrice[pair]['PRICE'] - currentPrice[pair]['OPEN24HOUR']) / currentPrice[pair]['OPEN24HOUR'] * 100).toFixed(2) + "%"
		displayData(currentPrice[pair], from, tsym, fsym)
	}

  var displayData = function(current, from, tsym, fsym) {
    if (current.FROMSYMBOL === "BTC"){
      $('#btc').html(`$${current.PRICE.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}`)
      $('#btc').removeClass("loader")
      if (current.FLAGS & 1) {//BTC Up
        $('#btc').animate({
          color: "#4cff42"
        }, 250, function () {
          $(this).animate({
            color: "white"
          }, 750)
        })
  		}
  		else if (current.FLAGS & 2) {//BTC Down
        $('#btc').animate({
          color: "#ff4242"
        }, 250, function () {
          $(this).animate({
            color: "white"
          }, 750)
        })
  		}
    }else {
      if (current.FROMSYMBOL === "ETH"){
        $('#eth').html(`$${current.PRICE.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}`)
        $('#eth').removeClass("loader")
        if (current.FLAGS & 1) {//ETH Up
          $('#eth').animate({
            color: "#4cff42"
          }, 250, function () {
            $(this).animate({
              color: "white"
            }, 750)
          })
    		}
    		else if (current.FLAGS & 2) {//ETH Down
          $('#eth').animate({
            color: "#ff4242"
          }, 250, function () {
            $(this).animate({
              color: "white"
            }, 750)
          })
    		}
      }
    }
	};
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
