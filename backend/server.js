const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ===== EMAIL CONFIGURATION =====
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Test email connection
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email service ready');
    }
});

// ===== EMAIL ENDPOINTS =====

// Send email (generic endpoint)
app.post('/api/send-email', async (req, res) => {
    try {
        const { to, subject, html } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: to, subject, html' 
            });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: html
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            message: 'Email sent successfully!'
        });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Contact form email endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ 
                message: 'Missing required fields' 
            });
        }

        // Send to client
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Contact from ${name}: ${subject || 'No subject'}`,
            html: `
                <h2>🎨 New Message from Ellys Contact Form</h2>
                <p><strong>Customer Name:</strong> ${name}</p>
                <p><strong>Customer Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
                <hr>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        });

        // Send confirmation to customer
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: '✅ We received your message - Ellys by Elizabeth',
            html: `
                <h2>Thank you, ${name}! 💌</h2>
                <p>We received your message and will get back to you as soon as possible.</p>
                <hr>
                <p><strong>Your Message Summary:</strong></p>
                <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p>Best regards,<br><strong>Ellys by Elizabeth</strong></p>
                <p>📞 Phone: +44 7586 181193</p>
                <p>📧 Email: hello@ellys.com</p>
                <p>🌐 Website: https://josephinshajan-a11y.github.io/ellys-website</p>
            `
        });

        res.json({ 
            success: true, 
            message: 'Contact message sent successfully!' 
        });
    } catch (error) {
        console.error('Contact email error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Order confirmation email endpoint
app.post('/api/send-order-confirmation', async (req, res) => {
    try {
        const { email, customerName, items, total } = req.body;

        if (!email || !customerName || !items || !total) {
            return res.status(400).json({ 
                message: 'Missing required fields' 
            });
        }

        // Build product table
        let productRows = '';
        items.forEach((item, index) => {
            const type = item.type === 'saree' ? '👗 Saree' : '💎 Jewellery';
            productRows += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">${index + 1}</td>
                    <td style="padding: 8px;">${type}: ${item.name}</td>
                    <td style="padding: 8px;">₹${item.price.toLocaleString()}</td>
                </tr>
            `;
        });

        const emailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #8b1538; border-bottom: 3px solid #8b1538; padding-bottom: 10px;">
                    ✅ Order Received - Ellys by Elizabeth
                </h1>
                
                <p>Dear <strong>${customerName}</strong>,</p>
                <p>Thank you for your order! 🎉 We're excited to help you get these beautiful pieces.</p>
                
                <h3 style="color: #8b1538; margin-top: 20px;">Order Summary:</h3>
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                    <tr style="background-color: #8b1538; color: #fffaf0;">
                        <th style="padding: 10px; text-align: left;">#</th>
                        <th style="padding: 10px; text-align: left;">Product</th>
                        <th style="padding: 10px; text-align: left;">Price</th>
                    </tr>
                    ${productRows}
                    <tr style="background-color: #f5f5f5; font-weight: bold; border-top: 2px solid #8b1538;">
                        <td colspan="2" style="padding: 10px;">TOTAL</td>
                        <td style="padding: 10px;">₹${total.toLocaleString()}</td>
                    </tr>
                </table>
                
                <h3 style="color: #8b1538; margin-top: 20px;">What Happens Next?</h3>
                <ol>
                    <li>Our team will contact you via WhatsApp at the number you provided</li>
                    <li>We'll confirm your order and payment details</li>
                    <li>Your items will be prepared and shipped promptly</li>
                </ol>
                
                <p style="background-color: #f5efe7; padding: 15px; border-left: 4px solid #8b1538; margin: 20px 0;">
                    <strong>📞 WhatsApp:</strong> +44 7586 181193<br>
                    <strong>📧 Email:</strong> hello@ellys.com<br>
                    <strong>🕒 Hours:</strong> Mon-Fri 9am-6pm, Sat 10am-4pm (UK Time)
                </p>
                
                <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666;">
                    Thank you for shopping with us!<br>
                    <strong>Ellys by Elizabeth</strong><br>
                    Threads of Tradition, Shades of Tomorrow 🎨
                </p>
            </div>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: '✅ Order Received - Ellys by Elizabeth',
            html: emailHTML
        });

        // Also send to admin
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `🛍️ New Order from ${customerName}`,
            html: `
                <h2>New Order Received!</h2>
                <p><strong>Customer Name:</strong> ${customerName}</p>
                <p><strong>Customer Email:</strong> ${email}</p>
                <p><strong>Total Amount:</strong> ₹${total.toLocaleString()}</p>
                ${emailHTML}
            `
        });

        res.json({ 
            success: true, 
            message: 'Order confirmation sent!' 
        });
    } catch (error) {
        console.error('Order email error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: '✅ Backend is running', 
        timestamp: new Date(),
        email: 'configured' 
    });
});

// Routes
app.use('/api/sarees', require('./routes/sarees'));
app.use('/api/jewellery', require('./routes/jewellery'));
app.use('/api/admin', require('./routes/admin'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}/api`);
    console.log(`📧 Email service: ${process.env.EMAIL_USER}`);
});
