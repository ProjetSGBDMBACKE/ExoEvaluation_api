const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,    
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,  
    callbackURL: "http://localhost:3000/api/auth/google/callback",
    scope: ["profile", "email"]
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      return done(null, profile);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,  
  clientSecret: process.env.GITHUB_CLIENT_SECRET,  
  callbackURL: "http://localhost:3000/api/auth/github/callback", 
  scope: ['user:email']  
},
async (accessToken, refreshToken, profile, done) => {
  try {
    return done(null, profile);
  } catch (error) {
    return done(error, null);
  }
}
));

passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/api/auth/microsoft/callback",
  scope: ['user.read'], 
},
(accessToken, refreshToken, profile, done) => {
  try{
    return done(null,profile);
  }catch(error){
    return done(error,null);
  }
}
));


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});
