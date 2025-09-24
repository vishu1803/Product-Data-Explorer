'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface NavigationState {
  path: string;
  searchParams: string;
  timestamp: number;
  title: string;
}

export function useNavigationHistory() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigationHistory, setNavigationHistory] = useState<NavigationState[]>([]);

  const saveNavigationToBackend = useCallback(async (state: NavigationState) => {
    try {
      await fetch('http://localhost:3001/api/user-navigation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: getUserId(), // Simple user ID
          path: state.path,
          searchParams: state.searchParams,
          timestamp: state.timestamp,
          title: state.title,
        }),
      });
    } catch (error) {
      console.warn('Failed to save navigation to backend:', error);
    }
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Save current navigation state
    const currentState: NavigationState = {
      path: pathname,
      searchParams: searchParams.toString(),
      timestamp: Date.now(),
      title: document.title || 'Product Explorer',
    };

    // Get existing history from localStorage
    const savedHistory = localStorage.getItem('navigationHistory');
    const existingHistory: NavigationState[] = savedHistory ? JSON.parse(savedHistory) : [];

    // Add current state (avoid duplicates)
    const isDuplicate = existingHistory.some(
      state => state.path === currentState.path && state.searchParams === currentState.searchParams
    );

    if (!isDuplicate) {
      const updatedHistory = [currentState, ...existingHistory].slice(0, 10); // Keep last 10 entries
      setNavigationHistory(updatedHistory);
      localStorage.setItem('navigationHistory', JSON.stringify(updatedHistory));
    } else {
      setNavigationHistory(existingHistory);
    }

    // Send to backend for persistence
    saveNavigationToBackend(currentState);
  }, [pathname, searchParams, saveNavigationToBackend]);

  const getUserId = () => {
    // ✅ Check if running on client side
    if (typeof window === 'undefined') return 'ssr-user';
    
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }
    return userId;
  };

  const clearHistory = () => {
    // ✅ Check if running on client side
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('navigationHistory');
    setNavigationHistory([]);
  };

  // ✅ Fix the getLastVisited method with client-side check
  const getLastVisited = (path: string): NavigationState | null => {
    // ✅ Return null if running on server side
    if (typeof window === 'undefined') return null;
    
    const savedHistory = localStorage.getItem('navigationHistory');
    const existingHistory: NavigationState[] = savedHistory ? JSON.parse(savedHistory) : [];
    
    // Find the most recent visit to this path (excluding current visit)
    const pathVisits = existingHistory.filter(state => state.path === path);
    return pathVisits.length > 1 ? pathVisits[1] : (pathVisits.length === 1 ? pathVisits[0] : null);
  };

  // ✅ Add helper method to check if path was visited before
  const hasVisited = (path: string): boolean => {
    const lastVisit = getLastVisited(path);
    return lastVisit !== null;
  };

  // ✅ Add method to get visit timestamp
  const getLastVisitTime = (path: string): Date | null => {
    const lastVisit = getLastVisited(path);
    return lastVisit ? new Date(lastVisit.timestamp) : null;
  };

  return {
    navigationHistory,
    clearHistory,
    getLastVisited, // ✅ Now safe for SSR
    hasVisited,     // ✅ Bonus method
    getLastVisitTime, // ✅ Bonus method
  };
}
