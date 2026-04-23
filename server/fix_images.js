const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env', override: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String },
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function fixImage() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const badImageUrl = "https://m.media-amazon.com/images/I/71+Z+J+R+L._AC_SL1500_.jpg";
        
        const result = await Product.updateMany(
            { image: badImageUrl },
            { $set: { image: "/logo.png" } }
        );

        console.log(`Updated ${result.modifiedCount} products with bad image URLs.`);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from DB');
    }
}

fixImage();
