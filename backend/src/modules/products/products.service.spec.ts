const axios = require('axios');
const { getProducts } = require('./products.service');

jest.mock('axios');

describe('Products Service', () => {
    it('should fetch products from my-mcp-server-e7bd967b', async () => {
        const products = [{ id: 1, name: 'Product 1' }];
        axios.get.mockResolvedValue({ data: products });

        const result = await getProducts();
        expect(result).toEqual(products);
    });
});