// config/passport.js
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User');

module.exports = (passport) => {
  // JWT Strategy
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    })
  );

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if email already exists
          user = await User.findOne({ email: profile.emails[0].value });
          
          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            if (!user.avatar || user.avatar.includes('ui-avatars.com')) {
              user.avatar = profile.photos[0]?.value;
            }
            await user.save();
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now(),
            avatar: profile.photos[0]?.value
          });

          done(null, user);
        } catch (error) {
          done(error, false);
        }
      }
    )
  );

  // Discord OAuth Strategy
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: process.env.DISCORD_CALLBACK_URL,
        scope: ['identify', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await User.findOne({ discordId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if email already exists
          user = await User.findOne({ email: profile.email });
          
          if (user) {
            // Link Discord account to existing user
            user.discordId = profile.id;
            if (!user.avatar || user.avatar.includes('ui-avatars.com')) {
              user.avatar = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            }
            await user.save();
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            discordId: profile.id,
            email: profile.email,
            username: profile.username + '_' + Date.now(),
            avatar: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          });

          done(null, user);
        } catch (error) {
          done(error, false);
        }
      }
    )
  );

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  });
};