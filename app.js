const express   = require('express');
const request   = require('request');
const path      = require('path');
const app       = express();
const router    = express.Router();
const Gamedig   = require('gamedig');
const PORT      = 80;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

router.get('/', function (request, response) {
  Gamedig.query({
    type: 'codmw2',
  	host: '190.213.61.82',
    port: 28960//iSnipe
  },
  function(e,state) {
  	if(e) {
      mw2_server1 = null;
    }else{
      mw2_server1 = state;
    }
    Gamedig.query({
      type: 'codmw2',
    	host: '190.213.61.82',
      port: 28961//Normal
    },
    function(e,state) {
    	if(e) {
        mw2_server2 = null;
      }else{
        mw2_server2 = state;
      }
      response.render('index', {mw2_server1, mw2_server2});
    });
  });
});

// app.use('/api/smug',express.static('public/assets/smug.json'));
router.get('/api/smug', function (req, res) {
  request(`https://smugs.safe.moe/api/v1/i/r`, function (error, response, body) {
      if (!error && response.statusCode !== 200) {
        console.log(error);
      }else {
        try {
		      body = JSON.parse(body);
          content = {url:`https://smugs.safe.moe/${body.url}`}
          res.render('smug', content);
  			} catch (e) {
          console.log(e);
  			}
      }
    });
});

app.use('/', router);

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
});
