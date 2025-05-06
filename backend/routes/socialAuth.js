import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper function to handle authentication response
const handleAuthResponse = (req, res) => {
  // Generate JWT token for the authenticated user
  const token = jwt.sign(
    { userId: req.user._id }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
  
  // Redirect to frontend with token and user info
  res.redirect(
    `${process.env.FRONTEND_URL}/social-auth-callback?token=${token}&user=${encodeURIComponent(
      JSON.stringify({
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role || 'user'
      })
    )}`
  );
};

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  handleAuthResponse
);

// GitHub Auth Routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  handleAuthResponse
);

export default router;