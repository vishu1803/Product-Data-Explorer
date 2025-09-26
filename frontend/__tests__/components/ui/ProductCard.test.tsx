import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductCard from '../../../components/ui/ProductCard';

test('renders product information', () => {
  const product = { name: 'Test Product', price: '$10', description: 'This is a test product.' };
  render(<ProductCard product={product} />);
  
  expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
  expect(screen.getByText(/\$10/i)).toBeInTheDocument();
  expect(screen.getByText(/This is a test product./i)).toBeInTheDocument();
});