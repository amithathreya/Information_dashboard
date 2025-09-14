import { getAllProducts } from '../src/services/product.service.js';

describe('Product Service', () => {
  it('should return all products', () => {
    const products = [{ id: 1, name: 'Sample Product', price: 100 }];
    const result = getAllProducts(products);
    expect(result).toEqual(products);
  });
});