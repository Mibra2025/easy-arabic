'use client';

import { useAuth } from '@/contexts/AuthContext';

export function useRole() {
  const { user } = useAuth();

  const hasRole = (roleName: string | string[]): boolean => {
    if (!user?.role) return false;
    
    if (Array.isArray(roleName)) {
      return roleName.includes(user.role.name);
    }
    
    return user.role.name === roleName;
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isTeacher = (): boolean => hasRole('teacher');
  const isStudent = (): boolean => hasRole('student');
  const isTeacherOrAdmin = (): boolean => hasRole(['teacher', 'admin']);

  const getRoleName = (): string => {
    const roleNames: Record<string, string> = {
      'admin': 'Администратор',
      'teacher': 'Преподаватель', 
      'student': 'Ученик'
    };
    
    return user?.role?.name ? roleNames[user.role.name] || user.role.name : 'Не определена';
  };

  return {
    user,
    role: user?.role,
    hasRole,
    isAdmin,
    isTeacher,
    isStudent,
    isTeacherOrAdmin,
    getRoleName,
  };
}
