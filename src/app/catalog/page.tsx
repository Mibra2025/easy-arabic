'use client';

import { Navigation } from '@/components/sections/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  BookOpen,
  Search,
  Filter,
  Star,
  Play,
  Clock,
  Users,
  ChevronRight,
  GraduationCap
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

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'name'>('newest');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [courses, searchTerm, sortBy]);

  const fetchCourses = async () => {
    try {
      // Получаем только опубликованные курсы
      const response = await fetch('/api/courses?published=true');
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      } else {
        console.error('Error fetching courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCourses = () => {
    let filtered = courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
          return b.enrolledStudents - a.enrolledStudents;
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Каталог курсов арабского языка
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Изучайте арабский язык с лучшими преподавателями. От основ до продвинутого уровня.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Поиск курсов, преподавателей..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Сначала новые</option>
                  <option value="popular">По популярности</option>
                  <option value="name">По алфавиту</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-600">
              Найдено курсов: {filteredCourses.length}
            </div>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchTerm ? 'Курсы не найдены' : 'Пока нет опубликованных курсов'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Попробуйте изменить поисковый запрос' 
                  : 'Преподаватели работают над созданием курсов для вас'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  {/* Course Image */}
                  <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
                    {course.coverImage ? (
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <BookOpen className="h-12 w-12 text-white opacity-80" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <Button
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 hover:bg-gray-100"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Посмотреть
                      </Button>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description || 'Описание курса будет добавлено позже'}
                    </p>

                    {/* Teacher */}
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                        <GraduationCap className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{course.teacherName}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
                      <div className="flex items-center">
                        <Play className="h-4 w-4 mr-1" />
                        {course.lessonsCount} уроков
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {course.enrolledStudents} студентов
                      </div>
                    </div>

                    {/* Action */}
                    <Link href={`/catalog/${course.id}`} className="block">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 group">
                        Изучить курс
                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Section */}
          {filteredCourses.length > 0 && (
            <div className="mt-16 bg-white rounded-lg shadow p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {filteredCourses.length}
                  </div>
                  <div className="text-gray-600">Доступных курсов</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {filteredCourses.reduce((sum, course) => sum + course.lessonsCount, 0)}
                  </div>
                  <div className="text-gray-600">Видео уроков</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {filteredCourses.reduce((sum, course) => sum + course.enrolledStudents, 0)}
                  </div>
                  <div className="text-gray-600">Активных студентов</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {new Set(filteredCourses.map(course => course.teacherName)).size}
                  </div>
                  <div className="text-gray-600">Опытных преподавателей</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
