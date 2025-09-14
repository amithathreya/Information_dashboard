import products from '../models/product.model.js';

export const getProducts = (req, res) => {
  res.status(200).json(products);
};