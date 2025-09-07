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

async function checkLessonAccess(userId: number, lessonId: number, userRole: string) {
  const lessonResult = await query(
    `SELECT l.id, c.teacher_id
     FROM lessons l
     JOIN courses c ON l.course_id = c.id
     WHERE l.id = $1`,
    [lessonId]
  );

  if (lessonResult.rows.length === 0) {
    return { error: 'Lesson not found', status: 404 };
  }

  const courseTeacherId = lessonResult.rows[0].teacher_id;
  
  // Проверяем права доступа (владелец курса или админ)
  if (userId !== courseTeacherId && userRole !== 'admin') {
    return { error: 'Access denied', status: 403 };
  }

  return { error: null };
}

// GET - Получить урок по ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lessonId = parseInt(params.id);
    
    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: 'Invalid lesson ID' },
        { status: 400 }
      );
    }

    // Получаем информацию об уроке
    const result = await query(
      `SELECT 
        l.id,
        l.course_id,
        l.title,
        l.description,
        l.video_url,
        l.additional_info,
        l.lesson_order,
        l.duration,
        l.is_published,
        l.created_at,
        l.updated_at,
        c.title as course_title,
        c.teacher_id,
        u.name as teacher_name
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE l.id = $1`,
      [lessonId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    const lesson = result.rows[0];

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        courseId: lesson.course_id,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.video_url,
        additionalInfo: lesson.additional_info,
        order: lesson.lesson_order,
        duration: lesson.duration,
        isPublished: lesson.is_published,
        createdAt: lesson.created_at,
        updatedAt: lesson.updated_at,
        course: {
          title: lesson.course_title,
          teacherId: lesson.teacher_id,
          teacherName: lesson.teacher_name,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Обновить урок
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const user = authResult.user;
    const lessonId = parseInt(params.id);
    
    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: 'Invalid lesson ID' },
        { status: 400 }
      );
    }

    // Проверяем права доступа к уроку
    const accessCheck = await checkLessonAccess(user.id, lessonId, user.role_name);
    if (accessCheck.error) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });
    }

    const { title, description, videoUrl, additionalInfo, order, duration, isPublished } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE lessons 
       SET title = $1, description = $2, video_url = $3, additional_info = $4, 
           lesson_order = $5, duration = $6, is_published = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 
       RETURNING id, course_id, title, description, video_url, additional_info, 
                 lesson_order, duration, is_published, created_at, updated_at`,
      [title, description, videoUrl, additionalInfo, order, duration, isPublished, lessonId]
    );

    const lesson = result.rows[0];

    return NextResponse.json({
      message: 'Lesson updated successfully',
      lesson: {
        id: lesson.id,
        courseId: lesson.course_id,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.video_url,
        additionalInfo: lesson.additional_info,
        order: lesson.lesson_order,
        duration: lesson.duration,
        isPublished: lesson.is_published,
        createdAt: lesson.created_at,
        updatedAt: lesson.updated_at,
      }
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить урок
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const user = authResult.user;
    const lessonId = parseInt(params.id);
    
    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: 'Invalid lesson ID' },
        { status: 400 }
      );
    }

    // Проверяем права доступа к уроку
    const accessCheck = await checkLessonAccess(user.id, lessonId, user.role_name);
    if (accessCheck.error) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });
    }

    // Удаляем урок
    await query('DELETE FROM lessons WHERE id = $1', [lessonId]);

    return NextResponse.json({
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
