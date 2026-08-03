const mongoose = require('mongoose');

const sareeSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    image: String,
    category: String,
    rating: Number,
    inStock: Boolean,
    createdAt: { type: Date, default: Date.now }
});

const Saree = mongoose.model('Saree', sareeSchema);

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        // Connect to MongoDB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        // GET all sarees
        if (event.httpMethod === 'GET') {
            const sarees = await Saree.find();
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(sarees)
            };
        }

        // POST new saree (admin only)
        if (event.httpMethod === 'POST') {
            const adminPassword = event.headers['x-admin-password'];
            if (adminPassword !== process.env.ADMIN_PASSWORD) {
                return {
                    statusCode: 401,
                    body: JSON.stringify({ error: 'Unauthorized' })
                };
            }

            const { name, price, description, category, rating, image } = JSON.parse(event.body);
            const saree = new Saree({
                name, price, description, category, rating, image, inStock: true
            });
            await saree.save();

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ success: true, saree })
            };
        }

        // DELETE saree (admin only)
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
            await Saree.findByIdAndDelete(id);

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
