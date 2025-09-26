import React from 'react';
import { render } from '@testing-library/react';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

test('renders LoadingSkeleton correctly', () => {
  const { container } = render(<LoadingSkeleton />);
  expect(container.firstChild).toBeInTheDocument();
});