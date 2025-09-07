'use client';

import { Navigation } from '@/components/sections/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen,
  ArrowLeft,
  Play,
  Clock,
  FileText,
  Users,
  GraduationCap,
  CheckCircle,
  Lock,
  Star,
  Calendar,
  Award
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

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const resolvedParams = use(params);
  const courseId = parseInt(resolvedParams.id);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && !isNaN(courseId)) {
      fetchCourse();
      if (isAuthenticated) {
        checkEnrollment();
      }
    }
  }, [courseId, isAuthenticated]);

  const fetchCourse = async () => {
    try {
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

  const checkEnrollment = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/enrollments/check?course_id=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsEnrolled(data.isEnrolled);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    setEnrolling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        setIsEnrolled(true);
        // Обновляем количество студентов
        if (course) {
          setCourse({
            ...course,
            stats: {
              ...course.stats,
              enrolledStudents: course.stats.enrolledStudents + 1
            }
          });
        }
      } else {
        const error = await response.json();
        alert(`Ошибка записи: ${error.error}`);
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Произошла ошибка при записи на курс');
    } finally {
      setEnrolling(false);
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
            <Link href="/catalog">
              <Button>Вернуться к каталогу</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const publishedLessons = course?.lessons?.filter(lesson => lesson.isPublished) || [];
  const totalDuration = publishedLessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link href="/catalog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              К каталогу
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
            </div>

            {/* Course Info */}
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {course.title}
                  </h1>
                  
                  {/* Teacher Info */}
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{course.teacherName}</p>
                      <p className="text-gray-600 text-sm">Преподаватель арабского языка</p>
                    </div>
                  </div>
                  
                  {/* Course Description */}
                  {course.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">О курсе</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  )}

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Play className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{publishedLessons.length}</p>
                      <p className="text-sm text-gray-600">уроков</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {Math.ceil(totalDuration / 60)}
                      </p>
                      <p className="text-sm text-gray-600">минут</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{course?.stats?.enrolledStudents || 0}</p>
                      <p className="text-sm text-gray-600">студентов</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Calendar className="h-5 w-5 text-orange-600" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">создан</p>
                    </div>
                  </div>
                </div>

                {/* Enrollment Card */}
                <div className="w-full lg:w-80 bg-gray-50 rounded-lg p-6">
                  <div className="text-center mb-6">
                    {isEnrolled ? (
                      <div className="mb-4">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Вы записаны на курс!
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Теперь у вас есть доступ ко всем урокам курса
                        </p>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <Award className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Начните изучение
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Получите доступ ко всем урокам и материалам
                        </p>
                      </div>
                    )}
                  </div>

                  {isEnrolled ? (
                    <div className="space-y-3">
                      <Link href={`/learn/${courseId}`}>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Play className="h-4 w-4 mr-2" />
                          Продолжить обучение
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Мой прогресс
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {enrolling ? 'Записываемся...' : 'Записаться бесплатно'}
                      </Button>
                      {publishedLessons.length > 0 && (
                        <Button variant="outline" className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Бесплатный урок
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Course Details */}
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Доступ:</span>
                      <span className="font-medium">Бессрочно</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Сертификат:</span>
                      <span className="font-medium">Да</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Язык:</span>
                      <span className="font-medium">Русский</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">Программа курса</h2>
              <p className="text-gray-600 mt-2">
                {publishedLessons.length} {publishedLessons.length === 1 ? 'урок' : 'уроков'} • 
                {Math.ceil(totalDuration / 60)} минут
              </p>
            </div>
            
            <div className="p-6">
              {publishedLessons.length === 0 ? (
                <div className="text-center py-12">
                  <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Уроки готовятся</h3>
                  <p className="text-gray-500">Преподаватель работает над содержанием курса</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {publishedLessons.map((lesson, index) => (
                    <div key={lesson.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="flex-shrink-0">
                              {isEnrolled ? (
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Play className="h-5 w-5 text-blue-600" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-sm font-medium text-gray-500">
                                  Урок {index + 1}
                                </span>
                                {lesson.duration && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {Math.ceil(lesson.duration / 60)} мин
                                  </div>
                                )}
                              </div>
                              
                              <h4 className="text-lg font-medium text-gray-900 mb-2">
                                {lesson.title}
                              </h4>
                              
                              {lesson.description && (
                                <p className="text-gray-600 text-sm">
                                  {lesson.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {isEnrolled && (
                            <Button size="sm" variant="ghost" className="ml-4">
                              <Play className="h-4 w-4" />
                            </Button>
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
      </div>
    </div>
  );
}
