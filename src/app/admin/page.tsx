'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useRole } from '@/hooks/useRole';
import { Navigation } from '@/components/sections/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Shield, 
  Eye, 
  Edit, 
  Save,
  X,
  Crown,
  GraduationCap,
  BookOpen
} from 'lucide-react';

interface Role {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  role: Role | null;
}

export default function AdminPage() {
  const { user, isLoading, isAuthenticated } = useAuthGuard();
  const { isAdmin } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      fetchUsers();
      fetchRoles();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        const error = await response.json();
        console.error('Error fetching users:', error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleEditRole = (userId: number, currentRoleId: number) => {
    setEditingUser(userId);
    setSelectedRole(currentRoleId);
  };

  const handleSaveRole = async () => {
    if (!editingUser || !selectedRole) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: editingUser,
          roleId: selectedRole,
        }),
      });

      if (response.ok) {
        // Обновляем локальное состояние
        setUsers(users.map(user => 
          user.id === editingUser 
            ? { ...user, role: roles.find(role => role.id === selectedRole) || null }
            : user
        ));
        setEditingUser(null);
        setSelectedRole(null);
      } else {
        const error = await response.json();
        console.error('Error updating user role:', error);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setSelectedRole(null);
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'teacher':
        return <GraduationCap className="h-4 w-4 text-blue-600" />;
      case 'student':
        return <BookOpen className="h-4 w-4 text-green-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Доступ запрещен</h1>
            <p className="text-gray-600">У вас нет прав для доступа к админ панели.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-blue-600" />
              Админ панель
            </h1>
            <p className="text-gray-600 mt-2">
              Управление пользователями и их ролями
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Всего пользователей</p>
                  <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Преподавателей</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.role?.name === 'teacher').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Учеников</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.role?.name === 'student').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Пользователи</h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Пользователь
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Роль
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Последний вход
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{u.name}</div>
                            <div className="text-sm text-gray-500">{u.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === u.id ? (
                            <select
                              value={selectedRole || ''}
                              onChange={(e) => setSelectedRole(Number(e.target.value))}
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                              {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                  {role.name === 'admin' ? 'Администратор' : 
                                   role.name === 'teacher' ? 'Преподаватель' : 'Ученик'}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              getRoleBadgeColor(u.role?.name || '')
                            }`}>
                              {getRoleIcon(u.role?.name || '')}
                              <span className="ml-1">
                                {u.role?.name === 'admin' ? 'Администратор' : 
                                 u.role?.name === 'teacher' ? 'Преподаватель' : 'Ученик'}
                              </span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {u.isActive ? 'Активен' : 'Неактивен'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Никогда'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingUser === u.id ? (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={handleSaveRole}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditRole(u.id, u.role?.id || 3)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
