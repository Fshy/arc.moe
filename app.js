const _         = require('lodash')
const dotenv    = require('dotenv').config()
const express   = require('express')
const session   = require('express-session')
const request   = require('request')
const exec      = require('child_process').exec
const path      = require('path')
const app       = express()
const Gamedig   = require('gamedig')
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
  });
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
  res.locals.user = req.user;
  next();
});

app.get('/login', passport.authenticate('discord', { scope: scopes }))
app.get('/auth/discord/callback',
    passport.authenticate('discord', { successRedirect: '/', failureRedirect: '/' }) // auth success
);

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/', function (req, res) {
  if (req.isAuthenticated())
    req.user.guildMember = req.user.guilds.find(function (guild) {return guild.id == process.env.GUILD_ID})
  content = {
    icon:`<img src="${req.isAuthenticated() ? `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.jpg`:'img/server-icon.png'}" alt="" class="circle_img">`,
    username:`${req.isAuthenticated() ? req.user.username:'arc.moe'}`,
    verified:`${req.isAuthenticated() ? `${req.user.guildMember ? '<div class="ui green label"><i class="fa fa-check" aria-hidden="true"></i> Guild Member</div>':'<div class="ui red label"><i class="fa fa-times" aria-hidden="true"></i> Not Guild Member</div>'}`:''}`,
    login:`<a class="item" href="${req.isAuthenticated() ? '/logout':'/login'}"><i class="fa ${req.isAuthenticated() ? 'fa-sign-out':'fa-power-off'}" aria-hidden="true"></i>&nbsp;${req.isAuthenticated() ? 'Logout':'Login'}</a>`
  }
  res.render('index', content)
})

app.get('/api/smug', function (req, res) {
  execute("curl https://smugs.safe.moe/api/v1/i/r", function(data){
    try {
      data = JSON.parse(data)
      content = {url:`https://smugs.safe.moe/${data.url}`}
      res.render('smug', content)
		} catch (e) {
      console.log(e)
    }
  })
})

app.get('/api/placeholder/:width/:height', function (req, res) {
  res.render('smug', content={url:`${req.params.width}x${req.params.height}`})
});

app.listen(process.env.PORT, function () {
  request(`http://myexternalip.com/raw`, function (e, r, b){
    console.log(`\n\x1b[35m\x1b[1m${process.env.NAME} Startup //\x1b[0m Listening on *:${process.env.PORT}${!e && r.statusCode===200 ? ` (External IP: ${b.replace(/\r?\n|\r/,'')})`:``}`)
  })
})
