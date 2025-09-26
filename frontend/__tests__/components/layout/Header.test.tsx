import React from 'react';
import { render } from '@testing-library/react';
import Header from '../../../components/layout/Header';

test('renders Header component', () => {
  const { getByText } = render(<Header />);
  const linkElement = getByText(/Product Data Explorer/i);
  expect(linkElement).toBeInTheDocument();
});