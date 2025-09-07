'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useRole } from '@/hooks/useRole';
import { Navigation } from '@/components/sections/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Plus,
  BookOpen,
  Users,
  Clock,
  Eye,
  Edit,
  Trash2,
  Settings,
  Play
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description: string;
  coverImage: string | null;
  teacherId: number;
  teacherName: string;
  isPublished: boolean;
  lessonsCount: number;
  enrolledStudents: number;
  createdAt: string;
  updatedAt: string;
}

export default function CoursesPage() {
  const { user, isLoading, isAuthenticated } = useAuthGuard();
  const { isTeacher, isAdmin } = useRole();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllCourses, setShowAllCourses] = useState(false);

  useEffect(() => {
    if (isAuthenticated && (isTeacher() || isAdmin())) {
      fetchCourses();
    }
  }, [isAuthenticated, user?.id]); // Убрали isTeacher и isAdmin из зависимостей

  // Отдельный useEffect для изменения showAllCourses
  useEffect(() => {
    if (isAuthenticated && (isTeacher() || isAdmin())) {
      fetchCourses();
    }
  }, [showAllCourses]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      // Если админ и включен режим "все курсы", не фильтруем по teacher_id
      const url = showAllCourses && isAdmin() 
        ? '/api/courses' 
        : `/api/courses?teacher_id=${user?.id}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      } else {
        const error = await response.json();
        console.error('Error fetching courses:', error);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот курс? Все уроки также будут удалены.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCourses(courses.filter(course => course.id !== courseId));
      } else {
        const error = await response.json();
        console.error('Error deleting course:', error);
        alert('Ошибка при удалении курса');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Ошибка при удалении курса');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  if (!isTeacher() && !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <BookOpen className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Доступ запрещен</h1>
            <p className="text-gray-600">Только преподаватели и администраторы могут управлять курсами.</p>
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
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BookOpen className="h-8 w-8 mr-3 text-blue-600" />
                Управление курсами
              </h1>
              <p className="text-gray-600 mt-2">
                Создавайте и управляйте своими курсами арабского языка
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {isAdmin() && (
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showAllCourses}
                    onChange={(e) => {
                      setShowAllCourses(e.target.checked);
                      // fetchCourses вызовется автоматически через useEffect
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Показать все курсы</span>
                </label>
              )}
              
              <Link href="/courses/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать курс
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Всего курсов</p>
                  <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Записанных студентов</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {courses.reduce((sum, course) => sum + course.enrolledStudents, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Play className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Всего уроков</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {courses.reduce((sum, course) => sum + course.lessonsCount, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка курсов...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Пока нет курсов</h3>
              <p className="text-gray-500 mb-6">Создайте свой первый курс арабского языка</p>
              <Link href="/courses/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать первый курс
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Cover Image */}
                  <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 relative">
                    {course.coverImage ? (
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-white opacity-80" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        course.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.isPublished ? 'Опубликован' : 'Черновик'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description || 'Описание курса не указано'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                      <div className="flex items-center">
                        <Play className="h-4 w-4 mr-1" />
                        {course.lessonsCount} уроков
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {course.enrolledStudents} студентов
                      </div>
                    </div>

                    {/* Teacher Info (только для админов при просмотре всех курсов) */}
                    {showAllCourses && isAdmin() && (
                      <p className="text-xs text-gray-500 mb-4">
                        Преподаватель: {course.teacherName}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <Link href={`/courses/${course.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Просмотр
                        </Button>
                      </Link>
                      
                      <div className="flex items-center space-x-2">
                        <Link href={`/courses/${course.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
