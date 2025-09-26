import { renderHook } from '@testing-library/react-hooks';
import { useNavigationHistory } from '../../hooks/useNavigationHistory';

test('hello world!', () => {
  const { result } = renderHook(() => useNavigationHistory());
  expect(result.current).toBeDefined();
});