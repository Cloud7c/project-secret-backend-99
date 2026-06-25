// 1. Import our fake database
import productsDatabase from '../database.js';

// 2. Create the logic to get a single product
export const getProductById = (req, res) => {
    // req.params.id is the ID they asked for in the URL (like 'hilux' or 'tractor')
    const productId = req.params.id;
    
    // Check if that product exists in our database
    if (productsDatabase[productId]) {
        // If it exists, send it back with a 200 OK success message!
        res.status(200).json({
            success: true,
            data: productsDatabase[productId]
        });
    } else {
        // If it doesn't exist, send a 404 Error
        res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }
};