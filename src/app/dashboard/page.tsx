'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Navigation } from '@/components/sections/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuthGuard();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Если пользователь не авторизован, показываем спиннер (редирект уже происходит)
  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Continue your Arabic learning journey
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Lessons Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">12</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Study Time</p>
                  <p className="text-2xl font-semibold text-gray-900">5h 30m</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Streak</p>
                  <p className="text-2xl font-semibold text-gray-900">7 days</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Level</p>
                  <p className="text-2xl font-semibold text-gray-900">Beginner</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Lessons */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Continue Learning</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Arabic Alphabet</h4>
                          <p className="text-sm text-gray-500">Learn the basic letters</p>
                        </div>
                        <div className="text-sm text-blue-600 font-medium">60% Complete</div>
                      </div>
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Common Phrases</h4>
                          <p className="text-sm text-gray-500">Essential daily expressions</p>
                        </div>
                        <div className="text-sm text-green-600 font-medium">30% Complete</div>
                      </div>
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Numbers 1-10</h4>
                          <p className="text-sm text-gray-500">Count in Arabic</p>
                        </div>
                        <div className="text-sm text-purple-600 font-medium">10% Complete</div>
                      </div>
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Next Lesson */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Next AI Session</h3>
                </div>
                <div className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">Today, 3:00 PM</div>
                    <div className="text-sm text-gray-500 mb-4">Pronunciation Practice</div>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Start Session
                    </button>
                  </div>
                </div>
              </div>

              {/* Teacher Session */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Human Teacher</h3>
                </div>
                <div className="p-6">
                  <div className="text-center">
                    <div className="text-lg font-medium text-gray-900 mb-2">Next Session Available</div>
                    <div className="text-sm text-gray-500 mb-4">Schedule with native speaker</div>
                    <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                      Book Session
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">This Week</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Lessons</span>
                      <span className="text-sm font-medium text-gray-900">5/7</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Practice Time</span>
                      <span className="text-sm font-medium text-gray-900">2h 15m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Words Learned</span>
                      <span className="text-sm font-medium text-gray-900">23</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
