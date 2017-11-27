const _         = require('lodash')
const dotenv    = require('dotenv').config()
const express   = require('express')
const session   = require('express-session')
const request   = require('request')
const rp        = require('request-promise')
const exec      = require('child_process').exec
const path      = require('path')
const app       = express()
const Gamedig   = require('gamedig')
const Jimp      = require("jimp")
const passport  = require('passport')
const DiscordStrategy = require('passport-discord').Strategy

function execute(command, callback){
  exec(command, function(error, stdout, stderr){ callback(stdout) })
}

passport.serializeUser(function(user, done) {
  done(null, user)
})

passport.deserializeUser(function(obj, done) {
  done(null, obj)
})

var scopes = ['identify', 'guilds'/*,'email', 'connections', 'guilds.join'*/]

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
      icon:`<img src="${req.isAuthenticated() ? `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.jpg`:'img/server-icon.png'}" alt="" class="circle_img">`,
      username:`${req.isAuthenticated() ? req.user.username:'arc.moe'}`,
      verified:`${req.isAuthenticated() ? `${req.user.guildMember ? '<div class="ui green label"><i class="fa fa-check" aria-hidden="true"></i> Guild Member</div>':'<div class="ui red label"><i class="fa fa-times" aria-hidden="true"></i> Not Guild Member</div>'}`:''}`,
      login:`<a class="item" href="${req.isAuthenticated() ? '/logout':'/login'}"><i class="fa ${req.isAuthenticated() ? 'fa-sign-out':'fa-power-off'}" aria-hidden="true"></i>&nbsp;${req.isAuthenticated() ? 'Logout':'Login'}</a>`,
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
      .print(font, Math.floor(parseInt(req.params.width)/2 - measureText(font, 'arc.moe')/2), Math.floor(parseInt(req.params.height)/2-32), 'arc.moe')
      .print(font, Math.floor(parseInt(req.params.width)/2 - measureText(font, `${req.params.width}x${req.params.height}`)/2), Math.floor(parseInt(req.params.height)/2), `${req.params.width}x${req.params.height}`)
      .getBuffer(Jimp.MIME_PNG, function (err, src) {
        res.end(src, 'image/png')
      })
  })

  function measureText(font, text) {
    var x = 0
    for (var i = 0; i < text.length; i++) {
      if (font.chars[text[i]]) {
        x += font.chars[text[i]].xoffset
          + (font.kernings[text[i]] && font.kernings[text[i]][text[i + 1]] ? font.kernings[text[i]][text[i + 1]] : 0)
          + (font.chars[text[i]].xadvance || 0)
      }
    }
    return x
  }
})

app.listen(process.env.PORT, function () {
  console.log(`\n\x1b[35m\x1b[1m${process.env.NAME} Startup //\x1b[0m Listening on *:${process.env.PORT}`)
})
