'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useRole } from '@/hooks/useRole';
import { Navigation } from '@/components/sections/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  BookOpen,
  ArrowLeft,
  Upload,
  Save,
  Eye
} from 'lucide-react';

export default function CreateCoursePage() {
  const { user, isLoading, isAuthenticated } = useAuthGuard();
  const { isTeacher, isAdmin } = useRole();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: ''
  });
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // В реальном проекте здесь должна быть загрузка на сервер
      // Пока используем URL.createObjectURL для превью
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setFormData(prev => ({
        ...prev,
        coverImage: imageUrl // В реальности здесь должен быть URL с сервера
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Название курса обязательно для заполнения');
      return;
    }

    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Необходимо войти в систему');
        return;
      }

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          coverImage: formData.coverImage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Если нужно опубликовать сразу
        if (publish && data.course) {
          await fetch(`/api/courses/${data.course.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...formData,
              isPublished: true,
            }),
          });
        }
        
        router.push(`/courses/${data.course.id}`);
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Произошла ошибка при создании курса');
    } finally {
      setSaving(false);
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
            <p className="text-gray-600">Только преподаватели и администраторы могут создавать курсы.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookOpen className="h-8 w-8 mr-3 text-blue-600" />
              Создать новый курс
            </h1>
            <p className="text-gray-600 mt-2">
              Заполните основную информацию о курсе. Уроки можно будет добавить после создания.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow">
            <form onSubmit={(e) => handleSubmit(e, false)} className="p-8">
              {/* Title */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Название курса *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Например: Основы арабского языка для начинающих"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Описание курса
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Подробное описание курса, что изучат студенты, какие навыки получат..."
                />
              </div>

              {/* Cover Image */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Обложка курса
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {previewImage ? (
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Превью обложки"
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData(prev => ({ ...prev, coverImage: '' }));
                        }}
                        className="absolute top-2 right-2 bg-white shadow-lg"
                      >
                        Удалить
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Загрузите обложку курса</p>
                      <p className="text-sm text-gray-500">PNG, JPG до 5MB</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="block w-full text-center py-2 px-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors mt-4"
                  >
                    {previewImage ? 'Изменить обложку' : 'Выберите файл'}
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                >
                  Отмена
                </Button>
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={saving}
                    className="flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Сохранение...' : 'Сохранить черновик'}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {saving ? 'Создание...' : 'Создать и опубликовать'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
