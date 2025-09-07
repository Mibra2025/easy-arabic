import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function verifyToken(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return { error: 'Authorization token required', status: 401 };
  }

  const token = authorization.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const userResult = await query(
      'SELECT u.id, u.name, u.email, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return { error: 'User not found', status: 404 };
    }

    const user = userResult.rows[0];
    return { user, error: null };
  } catch (jwtError) {
    return { error: 'Invalid token', status: 401 };
  }
}

// GET - Получить курс по ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const courseId = parseInt(params.id);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // Получаем информацию о курсе
    const courseResult = await query(
      `SELECT 
        c.id,
        c.title,
        c.description,
        c.cover_image,
        c.teacher_id,
        c.is_published,
        c.created_at,
        c.updated_at,
        u.name as teacher_name,
        u.email as teacher_email
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.id = $1`,
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const course = courseResult.rows[0];

    // Получаем уроки курса
    const lessonsResult = await query(
      `SELECT 
        id,
        title,
        description,
        video_url,
        additional_info,
        lesson_order,
        duration,
        is_published,
        created_at,
        updated_at
      FROM lessons
      WHERE course_id = $1
      ORDER BY lesson_order ASC, created_at ASC`,
      [courseId]
    );

    // Получаем статистику
    const statsResult = await query(
      `SELECT 
        COUNT(DISTINCT e.id) as enrolled_students,
        COUNT(DISTINCT l.id) as total_lessons
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN lessons l ON c.id = l.course_id
      WHERE c.id = $1`,
      [courseId]
    );

    const stats = statsResult.rows[0];

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        coverImage: course.cover_image,
        teacherId: course.teacher_id,
        teacherName: course.teacher_name,
        teacherEmail: course.teacher_email,
        isPublished: course.is_published,
        createdAt: course.created_at,
        updatedAt: course.updated_at,
        lessons: lessonsResult.rows.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.video_url,
          additionalInfo: lesson.additional_info,
          order: lesson.lesson_order,
          duration: lesson.duration,
          isPublished: lesson.is_published,
          createdAt: lesson.created_at,
          updatedAt: lesson.updated_at,
        })),
        stats: {
          enrolledStudents: parseInt(stats.enrolled_students) || 0,
          totalLessons: parseInt(stats.total_lessons) || 0,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Обновить курс
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const user = authResult.user;
    const courseId = parseInt(params.id);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // Проверяем права доступа
    const courseResult = await query(
      'SELECT teacher_id FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const courseTeacherId = courseResult.rows[0].teacher_id;
    
    // Проверяем, что пользователь - владелец курса или админ
    if (user.id !== courseTeacherId && user.role_name !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { title, description, coverImage, isPublished } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE courses 
       SET title = $1, description = $2, cover_image = $3, is_published = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING id, title, description, cover_image, teacher_id, is_published, created_at, updated_at`,
      [title, description, coverImage, isPublished, courseId]
    );

    const course = result.rows[0];

    return NextResponse.json({
      message: 'Course updated successfully',
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        coverImage: course.cover_image,
        teacherId: course.teacher_id,
        isPublished: course.is_published,
        createdAt: course.created_at,
        updatedAt: course.updated_at,
      }
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить курс
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const user = authResult.user;
    const courseId = parseInt(params.id);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // Проверяем права доступа
    const courseResult = await query(
      'SELECT teacher_id FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const courseTeacherId = courseResult.rows[0].teacher_id;
    
    // Проверяем, что пользователь - владелец курса или админ
    if (user.id !== courseTeacherId && user.role_name !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Удаляем курс (связанные записи удалятся автоматически благодаря CASCADE)
    await query('DELETE FROM courses WHERE id = $1', [courseId]);

    return NextResponse.json({
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
