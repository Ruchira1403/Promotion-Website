import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/send-email', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Validate inputs
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please provide name, email, and message' });
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // You can change this to any admin email
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    
    // Log successful email sending
    console.log(`Email sent successfully from ${email}`);
    
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email', 
      error: error.message 
    });
  }
});

export default router;