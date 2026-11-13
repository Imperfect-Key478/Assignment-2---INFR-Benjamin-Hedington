
var express = require('express');
var router = express.Router();

// Home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

// About Me page
router.get('/aboutme', function(req, res, next) {
  res.render('aboutme', { title: 'About Me' });
});

// Projects page
router.get('/projects', function(req, res, next) {
  res.render('projects', { title: 'Projects' });
});

// Contact Me page
router.get('/contactme', function(req, res, next) {
  res.render('contactme', { title: 'Contact Me' });
});

// Contact form submission
router.post('/contactme', async function(req, res) {
  try {
    const { name, email, subject, message } = req.body;
    const captchaToken = req.body['cf-turnstile-response'];

    if (!name || !email || !subject || !message) {
      return res.status(400).render('contactme', {
        title: 'Contact Me',
        error: 'Please complete all fields.'
      });
    }

    if (!captchaToken) {
      return res.status(400).render('contactme', {
        title: 'Contact Me',
        error: 'Please complete the CAPTCHA.'
      });
    }

    // Verify Cloudflare Turnstile
    const captchaResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: captchaToken
        })
      }
    );

    const captchaResult = await captchaResponse.json();

    if (!captchaResult.success) {
      console.log('CAPTCHA verification failed:', captchaResult);

      return res.status(400).render('contactme', {
        title: 'Contact Me',
        error: 'CAPTCHA verification failed. Please try again.'
      });
    }

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY
      },
      body: JSON.stringify({
        from: 'Portfolio Contact Form <onboarding@resend.dev>',
        to: [process.env.CONTACT_EMAIL],
        reply_to: email,
        subject: 'Portfolio Contact: ' + subject,
        text:
          'You have received a new portfolio contact form submission.\n\n' +
          'Name: ' + name + '\n' +
          'Email: ' + email + '\n' +
          'Subject: ' + subject + '\n\n' +
          'Message:\n' + message
      })
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailResult);

      throw new Error(
        emailResult.message || 'Resend could not send the email.'
      );
    }

    console.log('Contact form email sent successfully:', emailResult.id);

    res.render('contactme', {
      title: 'Contact Me',
      success: true
    });

  } catch (error) {
    console.error('Contact form error:', error.message);

    res.status(500).render('contactme', {
      title: 'Contact Me',
      error: 'Sorry, your message could not be sent. Please try again later.'
    });
  }
});

module.exports = router;
