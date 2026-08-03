const mongoose = require('mongoose');

const jewellerySchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    image: String,
    category: String,
    material: String,
    rating: Number,
    inStock: Boolean,
    createdAt: { type: Date, default: Date.now }
});

const Jewellery = mongoose.model('Jewellery', jewellerySchema);

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        // Connect to MongoDB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        // GET all jewellery
        if (event.httpMethod === 'GET') {
            const jewellery = await Jewellery.find();
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(jewellery)
            };
        }

        // POST new jewellery (admin only)
        if (event.httpMethod === 'POST') {
            const adminPassword = event.headers['x-admin-password'];
            if (adminPassword !== process.env.ADMIN_PASSWORD) {
                return {
                    statusCode: 401,
                    body: JSON.stringify({ error: 'Unauthorized' })
                };
            }

            const { name, price, description, category, material, rating, image } = JSON.parse(event.body);
            const jewellery = new Jewellery({
                name, price, description, category, material, rating, image, inStock: true
            });
            await jewellery.save();

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ success: true, jewellery })
            };
        }

        // DELETE jewellery (admin only)
        if (event.httpMethod === 'DELETE') {
            const adminPassword = event.headers['x-admin-password'];
            if (adminPassword !== process.env.ADMIN_PASSWORD) {
                return {
                    statusCode: 401,
                    body: JSON.stringify({ error: 'Unauthorized' })
                };
            }

            const path = event.path;
            const id = path.split('/').pop();
            await Jewellery.findByIdAndDelete(id);

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ success: true })
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
