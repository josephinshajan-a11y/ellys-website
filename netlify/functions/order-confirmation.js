const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Method not allowed' })
            };
        }

        const { customerName, customerEmail, items, total } = JSON.parse(event.body);

        if (!customerName || !customerEmail || !items || !total) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Send confirmation email to customer
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: 'Order Received - Ellys by Elizabeth',
            text: `
Hi ${customerName},

Thank you for your order! 🎉

Order Summary:
${items}

Total Amount: ₹${total}

What's Next?
We will send you a WhatsApp message shortly to confirm your order details and discuss delivery options.

Order Details:
📞 WhatsApp: +44 7586 181193
📧 Email: hello@ellys.com

Best regards,
Ellys by Elizabeth Team
            `
        });

        // Send order notification to admin
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Order from ${customerName}`,
            text: `
New Order Received!

Customer Name: ${customerName}
Customer Email: ${customerEmail}

Items Ordered:
${items}

Total Amount: ₹${total}

Action Required:
Please contact the customer via WhatsApp (+44 7586 181193) to confirm delivery details.

Admin Dashboard: Check admin panel for more details.
            `
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ success: true, message: 'Order confirmation sent' })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
