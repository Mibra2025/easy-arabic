'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';

export default function TestAuthPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isAdmin } = useRole();
  const [testResults, setTestResults] = useState<any>({});
  
  const testRolesAPI = async () => {
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        rolesAPI: { success: true, data }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        rolesAPI: { success: false, error: error.message }
      }));
    }
  };

  const testAdminAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTestResults(prev => ({
          ...prev,
          adminAPI: { success: false, error: 'No token in localStorage' }
        }));
        return;
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResults(prev => ({
          ...prev,
          adminAPI: { success: true, data }
        }));
      } else {
        const error = await response.json();
        setTestResults(prev => ({
          ...prev,
          adminAPI: { success: false, error }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        adminAPI: { success: false, error: error.message }
      }));
    }
  };

  const testProfileAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTestResults(prev => ({
          ...prev,
          profileAPI: { success: false, error: 'No token in localStorage' }
        }));
        return;
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResults(prev => ({
          ...prev,
          profileAPI: { success: true, data }
        }));
      } else {
        const error = await response.json();
        setTestResults(prev => ({
          ...prev,
          profileAPI: { success: false, error }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        profileAPI: { success: false, error: error.message }
      }));
    }
  };

  if (isLoading) {
    return <div className="p-8">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Тест Аутентификации</h1>
        
        {/* Auth Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Статус аутентификации</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Аутентифицирован:</strong> {isAuthenticated ? 'Да' : 'Нет'}
            </div>
            <div>
              <strong>Админ:</strong> {isAdmin() ? 'Да' : 'Нет'}
            </div>
            <div>
              <strong>Пользователь:</strong> {user ? user.name : 'Не найден'}
            </div>
            <div>
              <strong>Email:</strong> {user ? user.email : 'Не найден'}
            </div>
            <div>
              <strong>Роль:</strong> {user?.role ? user.role.name : 'Не найдена'}
            </div>
            <div>
              <strong>Токен в localStorage:</strong> {localStorage.getItem('token') ? 'Есть' : 'Нет'}
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Тесты API</h2>
          <div className="flex gap-4 mb-4">
            <button 
              onClick={testRolesAPI}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Тест /api/roles
            </button>
            <button 
              onClick={testProfileAPI}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Тест /api/auth/profile
            </button>
            <button 
              onClick={testAdminAPI}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Тест /api/admin/users
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Результаты тестов</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
