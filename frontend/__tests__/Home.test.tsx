import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../Home';

test('renders Home component', () => {
    render(<Home />);
    const linkElement = screen.getByText(/welcome to the product data explorer/i);
    expect(linkElement).toBeInTheDocument();
});