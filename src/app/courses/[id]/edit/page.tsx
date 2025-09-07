'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useRole } from '@/hooks/useRole';
import { Navigation } from '@/components/sections/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen,
  ArrowLeft,
  Upload,
  Save,
  Eye,
  Plus,
  Edit,
  Trash2,
  Play,
  Clock,
  FileText
} from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  description: string;
  videoUrl: string | null;
  additionalInfo: string | null;
  order: number;
  duration: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  coverImage: string | null;
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
  stats: {
    enrolledStudents: number;
    totalLessons: number;
  };
}

interface LessonFormData {
  title: string;
  description: string;
  videoUrl: string;
  additionalInfo: string;
  duration: number | null;
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading, isAuthenticated } = useAuthGuard();
  const { isTeacher, isAdmin } = useRole();
  const router = useRouter();
  const resolvedParams = use(params);
  const courseId = parseInt(resolvedParams.id);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  
  // Course form data
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    isPublished: false
  });
  
  // Lesson form data
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonFormData, setLessonFormData] = useState<LessonFormData>({
    title: '',
    description: '',
    videoUrl: '',
    additionalInfo: '',
    duration: null
  });

  useEffect(() => {
    if (isAuthenticated && (isTeacher() || isAdmin()) && courseId && !isNaN(courseId) && !hasFetched) {
      fetchCourse();
    }
  }, [isAuthenticated, courseId, hasFetched]);

  const fetchCourse = async () => {
    if (hasFetched) return; // Предотвращаем повторные запросы
    
    try {
      setLoading(true);
      setError(null);
      setHasFetched(true);
      
      const response = await fetch(`/api/courses/${courseId}`);
      
      if (response.ok) {
        const data = await response.json();
        setCourse(data.course);
        setCourseFormData({
          title: data.course.title,
          description: data.course.description || '',
          coverImage: data.course.coverImage || '',
          isPublished: data.course.isPublished
        });
      } else if (response.status === 404) {
        setError('Курс не найден');
      } else {
        setError('Ошибка загрузки курса');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseFormData.title.trim()) {
      alert('Название курса обязательно');
      return;
    }

    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(courseFormData),
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(prev => prev ? { ...prev, ...data.course } : null);
        alert('Курс обновлен успешно');
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Произошла ошибка при обновлении курса');
    } finally {
      setSaving(false);
    }
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lessonFormData.title.trim()) {
      alert('Название урока обязательно');
      return;
    }

    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingLesson 
        ? `/api/lessons/${editingLesson.id}`
        : `/api/courses/${courseId}/lessons`;
      const method = editingLesson ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(lessonFormData),
      });

      if (response.ok) {
        await fetchCourse(); // Обновляем список уроков
        resetLessonForm();
        alert(editingLesson ? 'Урок обновлен' : 'Урок создан');
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Произошла ошибка при сохранении урока');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот урок?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchCourse();
        alert('Урок удален');
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Ошибка при удалении урока');
    }
  };

  const resetLessonForm = () => {
    setLessonFormData({
      title: '',
      description: '',
      videoUrl: '',
      additionalInfo: '',
      duration: null
    });
    setEditingLesson(null);
    setShowLessonForm(false);
  };

  const startEditLesson = (lesson: Lesson) => {
    setLessonFormData({
      title: lesson.title,
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      additionalInfo: lesson.additionalInfo || '',
      duration: lesson.duration
    });
    setEditingLesson(lesson);
    setShowLessonForm(true);
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
            <p className="text-gray-600">Только преподаватели и администраторы могут редактировать курсы.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!course && !loading)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <BookOpen className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {error || 'Курс не найден'}
            </h1>
            <div className="space-y-3">
              <Link href="/courses">
                <Button>Вернуться к курсам</Button>
              </Link>
              {error && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setError(null);
                    setHasFetched(false);
                    fetchCourse();
                  }}
                  className="ml-3"
                >
                  Повторить
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Курс не найден</h1>
            <Link href="/courses">
              <Button>Вернуться к курсам</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/courses">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                К курсам
              </Button>
            </Link>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BookOpen className="h-8 w-8 mr-3 text-blue-600" />
                  Редактировать курс
                </h1>
                <p className="text-gray-600 mt-2">
                  Управление курсом и уроками
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Link href={`/courses/${courseId}`}>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Просмотр
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Информация о курсе</h2>
                
                <form onSubmit={handleCourseSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Название *
                      </label>
                      <input
                        type="text"
                        value={courseFormData.title}
                        onChange={(e) => setCourseFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Описание
                      </label>
                      <textarea
                        value={courseFormData.description}
                        onChange={(e) => setCourseFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={courseFormData.isPublished}
                          onChange={(e) => setCourseFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">Опубликовать курс</span>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      disabled={saving}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Сохранение...' : 'Сохранить курс'}
                    </Button>
                  </div>
                </form>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Уроков:</span>
                      <span className="font-medium">{course?.stats?.totalLessons || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Студентов:</span>
                      <span className="font-medium">{course?.stats?.enrolledStudents || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lessons */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Уроки курса</h2>
                    <Button
                      onClick={() => setShowLessonForm(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить урок
                    </Button>
                  </div>
                </div>

                {/* Lesson Form */}
                {showLessonForm && (
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium mb-4">
                      {editingLesson ? 'Редактировать урок' : 'Новый урок'}
                    </h3>
                    
                    <form onSubmit={handleLessonSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Название урока *
                        </label>
                        <input
                          type="text"
                          value={lessonFormData.title}
                          onChange={(e) => setLessonFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Описание урока
                        </label>
                        <textarea
                          value={lessonFormData.description}
                          onChange={(e) => setLessonFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL видео
                        </label>
                        <input
                          type="url"
                          value={lessonFormData.videoUrl}
                          onChange={(e) => setLessonFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/video.mp4"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Дополнительная информация
                        </label>
                        <textarea
                          value={lessonFormData.additionalInfo}
                          onChange={(e) => setLessonFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Домашние задания, полезные ссылки, заметки..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Длительность (минуты)
                        </label>
                        <input
                          type="number"
                          value={lessonFormData.duration || ''}
                          onChange={(e) => setLessonFormData(prev => ({ ...prev, duration: e.target.value ? parseInt(e.target.value) * 60 : null }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="15"
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={resetLessonForm}
                        >
                          Отмена
                        </Button>
                        <Button
                          type="submit"
                          disabled={saving}
                        >
                          {saving ? 'Сохранение...' : (editingLesson ? 'Обновить урок' : 'Создать урок')}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Lessons List */}
                <div className="p-6">
                  {(!course?.lessons || course.lessons.length === 0) ? (
                    <div className="text-center py-12">
                      <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Пока нет уроков</h3>
                      <p className="text-gray-500 mb-4">Создайте первый урок для вашего курса</p>
                      <Button
                        onClick={() => setShowLessonForm(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить урок
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {course?.lessons?.map((lesson, index) => (
                        <div key={lesson.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-sm font-medium text-gray-500">
                                  Урок {index + 1}
                                </span>
                                {lesson.isPublished ? (
                                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                    Опубликован
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                    Черновик
                                  </span>
                                )}
                              </div>
                              
                              <h4 className="font-medium text-gray-900 mb-1">
                                {lesson.title}
                              </h4>
                              
                              {lesson.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {lesson.description}
                                </p>
                              )}
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                {lesson.videoUrl && (
                                  <div className="flex items-center">
                                    <Play className="h-4 w-4 mr-1" />
                                    Видео
                                  </div>
                                )}
                                {lesson.duration && (
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {Math.ceil(lesson.duration / 60)} мин
                                  </div>
                                )}
                                {lesson.additionalInfo && (
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-1" />
                                    Доп. материалы
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditLesson(lesson)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
