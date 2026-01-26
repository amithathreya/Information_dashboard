import products from '../models/product.model.js';

// Convert to async pattern for consistency and future database integration
export const getProducts = async (req, res) => {
  try {
    // Using async/await pattern for future database migration
    // Currently returns static data but structured for easy DB integration
    const productData = await Promise.resolve(products);
    res.status(200).json(productData);
  } catch (err) {
    const message = process.env.NODE_ENV === 'production' 
      ? 'Error fetching products' 
      : err.message;
    res.status(500).json({ message });
  }
};