import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Import environment variables explicitly
import env from './env.js';

console.log('Loading passport configuration...');
console.log('In passport.js - Google Client ID exists:', !!env.GOOGLE_CLIENT_ID);
console.log('In passport.js - GitHub Client ID exists:', !!env.GITHUB_CLIENT_ID);

// Test strategy using ES Module imports instead of require
passport.use('test-strategy', new LocalStrategy(
  (username, password, done) => {
    return done(null, { id: '1', username: 'test' });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy - Only create if credentials exist
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  console.log('Configuring Google strategy with ID:', env.GOOGLE_CLIENT_ID.substring(0, 5) + '...');
  
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });
          
          if (user) {
            return done(null, user);
          }
          
          // Check if user exists with the same email
          user = await User.findOne({ email: profile.emails[0].value });
          
          if (user) {
            // Update existing user with Google ID
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }
          
          // Create new user
          const newUser = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            password: jwt.sign({ random: Math.random() }, env.JWT_SECRET) // Generate a random password
          });
          
          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn('Google OAuth credentials missing. Google login will not be available.');
}

// GitHub Strategy - Only create if credentials exist
if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  console.log('Configuring GitHub strategy with ID:', env.GITHUB_CLIENT_ID.substring(0, 5) + '...');
  
  passport.use(
    'github',
    new GitHubStrategy(
      {
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: "/api/auth/github/callback",
        scope: ['user:email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ githubId: profile.id });
          
          if (user) {
            return done(null, user);
          }
          
          // Check if user exists with the same email
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          
          if (email) {
            user = await User.findOne({ email });
            
            if (user) {
              // Update existing user with GitHub ID
              user.githubId = profile.id;
              await user.save();
              return done(null, user);
            }
          }
          
          // Create new user
          const newUser = new User({
            username: profile.username || profile.displayName,
            email: email || `github_${profile.id}@placeholder.com`,
            githubId: profile.id,
            password: jwt.sign({ random: Math.random() }, env.JWT_SECRET)
          });
          
          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn('GitHub OAuth credentials missing. GitHub login will not be available.');
}

console.log('Passport configuration loaded');
export default passport;