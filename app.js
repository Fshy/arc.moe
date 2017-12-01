const _               = require('lodash')
const dotenv          = require('dotenv').config()
const request         = require('request')
const rp              = require('request-promise')
const path            = require('path')
const Gamedig         = require('gamedig')
const Jimp            = require('jimp')
const lib             = require('./lib')

const passport        = require('passport')
const DiscordStrategy = require('passport-discord').Strategy

const express         = require('express')
const session         = require('express-session')
const app             = express()
const server          = require('http').createServer(app)
const io              = require('socket.io')(server)

var scopes = ['identify', 'guilds']

passport.serializeUser(function(user, done) {
  done(null, user)
})

passport.deserializeUser(function(obj, done) {
  done(null, obj)
})

passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: scopes
},
function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    return done(null, profile)
  })
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(function(req, res, next) {
  res.locals.user = req.user
  next()
})

app.get('/login', passport.authenticate('discord', { scope: scopes }))
app.get('/auth/discord/callback', passport.authenticate('discord', {
  failureRedirect: '/'
}), function (req, res) {
  req.user.guildMember = req.user.guilds.find(function (guild) {return guild.id == process.env.GUILD_ID})
  res.redirect('/')
})

app.get('/logout', function(req, res) {
    req.logout()
    res.redirect('/')
})

app.get('/', function (req, res) {
  const p1 = rp({uri:`https://discordapp.com/api/guilds/290982567564279809/widget.json`,json: true})
  Promise.all([p1]).then((data) => {
    content = {
      authenticated:`${req.isAuthenticated() ? true:false}`,
      guildMember:`${req.user ? true:false}`,
      loggedUser:{
        icon:`${req.isAuthenticated() ? `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.jpg`:'img/server-icon.png'}`,
        username:`${req.isAuthenticated() ? req.user.username:'arc.moe'}`,
        verified: {
          colour:`${req.isAuthenticated() ? `${req.user.guildMember ? 'green':'red'}`:''}`,
          icon: `${req.isAuthenticated() ? `${req.user.guildMember ? 'fa-check':'fa-ban'}`:''}`,
          title:`${req.isAuthenticated() ? `${req.user.guildMember ? 'Guild Member':'Not Guild Member'}`:''}`
        }
      },
      login: {
        url:`${req.isAuthenticated() ? '/logout':'/login'}`,
        icon:`${req.isAuthenticated() ? 'fa-sign-out':'fa-power-off'}`,
        title:`${req.isAuthenticated() ? 'Logout':'Login'}`
      },
      server: data[0]
    }
    res.render('index', content)
  }).catch(err => console.error(`Something happened`, err))
})

app.get('/api/placeholder/:width/:height', function (req, res) {
  if (isNaN(req.params.width) || isNaN(req.params.height))
    return res.send('Bad Format')
  Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(function (font) {
    new Jimp(parseInt(req.params.width), parseInt(req.params.height), 0x000000FF)
      .print(font, Math.floor(parseInt(req.params.width)/2 - lib.measureText(font, 'arc.moe')/2), Math.floor(parseInt(req.params.height)/2-32), 'arc.moe')
      .print(font, Math.floor(parseInt(req.params.width)/2 - lib.measureText(font, `${req.params.width}x${req.params.height}`)/2), Math.floor(parseInt(req.params.height)/2), `${req.params.width}x${req.params.height}`)
      .getBuffer(Jimp.MIME_PNG, function (err, src) {
        res.end(src, 'image/png')
      })
  })
})

app.get('/api/youtube/search/:query', function (req, res) {
  if (req.user && req.user.guildMember) {
    rp({
      uri:`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${req.params.query}&type=video&videoCategoryId=10&key=${process.env.YOUTUBE}`,
      json: true
    }).then(function (result) {
      res.json(result)
    })
  }else {
    res.status(401).send(`<h1>Unauthorized Request</h1>Guild Members Only Resource`)
    console.log(`Unauthorized Request on */api/youtube/search/${req.params.query} from ${req.connection.remoteAddress}`)
  }
})

app.get('/api/youtube/song/:videoId', function (req, res) {
  if (req.user && req.user.guildMember) {
    res.redirect('/')
  }else {
    res.status(401).send(`<h1>Unauthorized Request</h1>Guild Members Only Resource`)
    console.log(`Unauthorized Request on */api/youtube/song/${req.params.videoId} from ${req.connection.remoteAddress}`)
  }
})

io.on('connection', function(socket){

})

server.listen(process.env.PORT, function () {
  console.log(`\n\x1b[35m\x1b[1m${process.env.NAME} Startup //\x1b[0m Listening on *:${process.env.PORT}`)
})
