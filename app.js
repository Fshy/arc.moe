const express   = require('express');
const path      = require('path');
const app       = express();
const router    = express.Router();
const gamequery = require('gamequery');
const PORT      = 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

router.get('/', function (request, response) {
  gamequery.query({
    type: 'codmw2',
  	host: 'localhost',
    port: 28960//iSnipe
  },
  function(e,state) {
  	if(e) {
      mw2_server1 = null;
    }else{
      mw2_server1 = state;
    }
    gamequery.query({
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

app.use('/smug',express.static('public/assets/smug.json'));

app.use('/', router);

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
});
