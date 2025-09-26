const request = require('supertest');
const app = require('../../app');

describe('Products Controller', () => {
	test('GET /api/products should return a list of products', async () => {
		const response = await request(app).get('/api/products');
		expect(response.status).toBe(200);
		expect(Array.isArray(response.body)).toBe(true);
	});

	test('GET /api/products/:id should return a single product', async () => {
		const response = await request(app).get('/api/products/1');
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('id', 1);
	});

	test('POST /api/products should create a new product', async () => {
		const newProduct = { name: 'Test Product', price: 100 };
		const response = await request(app).post('/api/products').send(newProduct);
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('id');
		expect(response.body).toHaveProperty('name', newProduct.name);
	});

	test('PUT /api/products/:id should update an existing product', async () => {
		const updatedProduct = { name: 'Updated Product', price: 150 };
		const response = await request(app).put('/api/products/1').send(updatedProduct);
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('name', updatedProduct.name);
	});

	test('DELETE /api/products/:id should delete a product', async () => {
		const response = await request(app).delete('/api/products/1');
		expect(response.status).toBe(204);
	});
});