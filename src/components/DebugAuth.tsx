'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function DebugAuth() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [hasCookie, setHasCookie] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
      setHasCookie(document.cookie.includes('auth-token'));
    }
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs font-mono max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>Loading: {isLoading ? 'true' : 'false'}</div>
      <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
      <div>User: {user ? user.name : 'null'}</div>
      <div>Token: {token ? 'exists' : 'null'}</div>
      <div>Cookie: {hasCookie ? 'exists' : 'none'}</div>
    </div>
  );
}
