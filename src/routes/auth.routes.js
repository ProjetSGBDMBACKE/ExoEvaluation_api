const express = require('express');
const { register,confirmEmail,login } = require('../controllers/auth.controller');
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('../config/passport');

const router = express.Router();

router.use(passport.initialize());
router.use(passport.session());

router.post('/register', register);

router.post('/login', login);

router.get('/confirm',confirmEmail);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/microsoft', passport.authenticate('microsoft'));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    try {
      const user = req.user; 
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: "etudiant"
        },
        process.env.JWT_SECRET, 
        { expiresIn: '24h' }  
      );

      res.status(200).json({
        message: 'étudiant authentifié avec succès',
        user: {
          email: user.email,
          fullName: `${user.name.givenName} ${user.name.familyName}`,
          firstName: user.name.givenName, 
          lastName: user.name.familyName 
        },
        token 
      });

    } catch (error) {
      console.error('Erreur lors de l\'authentification Google:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);


router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/' }), async (req, res) => {
  try {
    const user = req.user; 
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: "etudiant"
      },
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }  
    );

    res.status(200).json({
      message: 'étudiant authentifié avec succès',
      user:{
          id: user.id,
          username: user.username,
          email: user.emails ? profile.emails[0].value : null,
          avatar: user.photos[0].value
      },
      token 
    });
  } catch (error) {
    console.error('Erreur lors de la redirection après l\'authentification GitHub:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/microsoft/callback', passport.authenticate('microsoft', { failureRedirect: '/' }), async (req, res) => {
  try {
    const user = req.user;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: "etudiant" },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'étudiant authentifié avec succès',
      user: {
        id: user.id,
        email: user.emails && user.emails[0] ? user.emails[0].value : null,
        name: user.displayName
      },
      token 
    });
  } catch (error) {
    console.error('Erreur lors de la redirection après l\'authentification Microsoft:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
