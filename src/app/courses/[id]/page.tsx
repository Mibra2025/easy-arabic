'use client';

import { Navigation } from '@/components/sections/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen,
  ArrowLeft,
  Play,
  Clock,
  FileText,
  Users,
  Edit
} from 'lucide-react';
import { useRole } from '@/hooks/useRole';

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

export default function CourseViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const courseId = parseInt(resolvedParams.id);
  const { isTeacher, isAdmin } = useRole();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (courseId && !isNaN(courseId) && !hasFetched) {
      fetchCourse();
    }
  }, [courseId, hasFetched]);

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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !course) {
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

  const publishedLessons = course?.lessons?.filter(lesson => lesson.isPublished) || [];
  const totalDuration = publishedLessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

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
          {/* Back button */}
          <Link href="/courses">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              К курсам
            </Button>
          </Link>

          {/* Course Header */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
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
                  <BookOpen className="h-24 w-24 text-white opacity-80" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-6 right-6">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  course.isPublished 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {course.isPublished ? 'Опубликован' : 'Черновик'}
                </span>
              </div>
            </div>

            {/* Course Info */}
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {course.title}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">
                    Преподаватель: <span className="font-medium text-gray-900">{course.teacherName}</span>
                  </p>
                  
                  {course.description && (
                    <p className="text-gray-700 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                </div>
                
                {/* Edit button for teachers/admins */}
                {(isTeacher() || isAdmin()) && (
                  <Link href={`/courses/${courseId}/edit`}>
                    <Button>
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                  </Link>
                )}
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Play className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{publishedLessons.length}</p>
                  <p className="text-sm text-gray-600">уроков</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Math.ceil(totalDuration / 60)}
                  </p>
                  <p className="text-sm text-gray-600">минут</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{course?.stats?.enrolledStudents || 0}</p>
                  <p className="text-sm text-gray-600">студентов</p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Программа курса</h2>
                </div>
                
                <div className="p-6">
                  {publishedLessons.length === 0 ? (
                    <div className="text-center py-12">
                      <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Пока нет опубликованных уроков</h3>
                      <p className="text-gray-500">Уроки появятся после их публикации преподавателем</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {publishedLessons.map((lesson, index) => (
                        <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-medium text-gray-900 mb-2">
                                {lesson.title}
                              </h4>
                              
                              {lesson.description && (
                                <p className="text-gray-600 mb-3">
                                  {lesson.description}
                                </p>
                              )}
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                {lesson.videoUrl && (
                                  <div className="flex items-center">
                                    <Play className="h-4 w-4 mr-1" />
                                    Видеоурок
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
                              
                              {/* Additional Info Preview */}
                              {lesson.additionalInfo && (
                                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {lesson.additionalInfo.length > 200 
                                      ? `${lesson.additionalInfo.substring(0, 200)}...`
                                      : lesson.additionalInfo
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">О преподавателе</h3>
                
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {course.teacherName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{course.teacherName}</p>
                    <p className="text-sm text-gray-600">Преподаватель арабского языка</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-600 border-t border-gray-200 pt-4">
                  <p><strong>Курс создан:</strong> {new Date(course.createdAt).toLocaleDateString()}</p>
                  <p><strong>Последнее обновление:</strong> {new Date(course.updatedAt).toLocaleDateString()}</p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-3">
                    Записаться на курс
                  </Button>
                  <Button variant="outline" className="w-full">
                    Начать бесплатный урок
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
