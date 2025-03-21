const bcrypt = require('bcryptjs');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logger } = require('../utils/logger');
const axios = require('axios');

async function verifyEmailWithHunter(email) {
  const apiKey = process.env.VERIFICATION_EMAIL; 
  const url = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data.data;
    if (data.result === 'deliverable') {
      return true;  
    } else {
      return false; 
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email avec Hunter:', error);
    throw new Error('Erreur de vérification de l\'email');
  }
}


const sendConfirmationEmail = async (email, token, userEmail) => {
  try {
    const { OAuth2 } = google.auth;
    const oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const accessToken = await oauth2Client.getAccessToken();
    if (!accessToken.token) throw new Error("Impossible d'obtenir un access token OAuth2");

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: userEmail,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: `"Support" <${userEmail}>`,
      to: email,
      subject: 'Confirmation de votre inscription',
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                padding: 20px 0;
                background-color: #008CBA;
                color: #ffffff;
                border-radius: 10px 10px 0 0;
              }
              .header h2 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                padding: 20px;
                text-align: center;
              }
              .content p {
                font-size: 16px;
                color: #333333;
                line-height: 1.6;
              }
              .button {
                background-color: #008CBA;
                color: white;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 5px;
                font-size: 18px;
                margin: 15px 0;
                display: inline-block;
              }
              .footer {
                padding: 10px;
                text-align: center;
                font-size: 14px;
                color: #777777;
              }
              .footer a {
                color: #008CBA;
                text-decoration: none;
              }
              @media only screen and (max-width: 600px) {
                .container {
                  width: 100%;
                  padding: 15px;
                }
                .button {
                  width: 100%;
                  font-size: 16px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Bienvenue sur notre plateforme !</h2>
              </div>
              <div class="content">
                <p>Merci de vous être inscrit !</p>
                <p>Pour confirmer votre adresse email et finaliser votre inscription, veuillez cliquer sur le bouton ci-dessous :</p>
                <a href="${process.env.APP_URL}/confirm?token=${token}" class="button">Confirmer mon compte</a>
                <p>Ce lien expirera dans 15 minutes.</p>
              </div>
              <div class="footer">
                <p>Si vous n'avez pas demandé cette inscription, ignorez cet email. Pour toute question, contactez notre support.</p>
                <p><a href="mailto:support@votreapplication.com">support@votreapplication.com</a></p>
              </div>
            </div>
          </body>
        </html>
      `,
    };
    

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Erreur d\'envoi d\'email:', error);
    logger.error('Erreur d\'envoi de l\'email de confirmation:', error);
    throw new Error(`Erreur d'envoi de l'email : ${error.message}`);
  }
};


const register = async (req, res) => {
  try {
    const { email, password,role} = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    const isEmailValid = await verifyEmailWithHunter(email);
    if (!isEmailValid) {
      return res.status(400).json({ message: 'L\'email n\'est pas valide ou n\'existe pas.' });
    }

    const user = await User.create({
      email,
      password,
      role,
      status: 'inactif',
    });

    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    
    await sendConfirmationEmail(email, token,"isaacfeglarfiacrememiniedou@esp.sn");

    res.status(201).json({
      message: 'Inscription réussie. Un e-mail de confirmation a été envoyé.',
      user: { id: user.id, email: user.email, role: user.role, status: user.status },
    });

  } catch (error) {
    logger.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
};


const confirmEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { id: decoded.id, email: decoded.email } });

    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    if (user.status === 'actif') {
      return res.status(400).json({ message: 'L\'email a déjà été confirmé.' });
    }

    const createdAt = new Date(user.createdAt);
    const currentTime = new Date();
    const diffInMinutes = (currentTime - createdAt) / 60000;

    if (diffInMinutes > 15) {
      await user.destroy();
      return res.status(400).json({ message: 'Le lien a expiré, votre compte a été supprimé.' });
    }

    user.status = 'actif';
    await user.save();
    res.status(200).json({ message: 'Email confirmé avec succès. Vous pouvez maintenant vous connecter.' });

  } catch (error) {
    return res.status(400).json({ message: 'Le token est invalide ou a expiré.' });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'l\'email n\'existe pas' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'le mot de passe est invalide' });
    }

    if (user.status !== 'actif') {
      return res.status(403).json({ message: 'Vous devez confirmer votre e-mail avant de vous connecter.' });
    }

    await user.update({ lastLogin: new Date() });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
};

module.exports = {
  register,
  confirmEmail,
  login
};
