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

async function checkCourseAccess(userId: number, courseId: number, userRole: string) {
  const courseResult = await query(
    'SELECT teacher_id FROM courses WHERE id = $1',
    [courseId]
  );

  if (courseResult.rows.length === 0) {
    return { error: 'Course not found', status: 404 };
  }

  const courseTeacherId = courseResult.rows[0].teacher_id;
  
  // Проверяем права доступа (владелец курса или админ)
  if (userId !== courseTeacherId && userRole !== 'admin') {
    return { error: 'Access denied', status: 403 };
  }

  return { error: null };
}

// GET - Получить все уроки курса
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const courseId = parseInt(params.id);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли курс
    const courseResult = await query('SELECT id FROM courses WHERE id = $1', [courseId]);
    
    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Получаем уроки курса
    const result = await query(
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

    const lessons = result.rows.map(lesson => ({
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
    }));

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Создать новый урок
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Проверяем права доступа к курсу
    const accessCheck = await checkCourseAccess(user.id, courseId, user.role_name);
    if (accessCheck.error) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });
    }

    const { title, description, videoUrl, additionalInfo, order, duration } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Определяем порядок урока, если не указан
    let lessonOrder = order;
    if (!lessonOrder) {
      const maxOrderResult = await query(
        'SELECT COALESCE(MAX(lesson_order), 0) + 1 as next_order FROM lessons WHERE course_id = $1',
        [courseId]
      );
      lessonOrder = maxOrderResult.rows[0].next_order;
    }

    const result = await query(
      `INSERT INTO lessons (course_id, title, description, video_url, additional_info, lesson_order, duration) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, title, description, video_url, additional_info, lesson_order, duration, is_published, created_at, updated_at`,
      [courseId, title, description, videoUrl, additionalInfo, lessonOrder, duration]
    );

    const lesson = result.rows[0];

    return NextResponse.json({
      message: 'Lesson created successfully',
      lesson: {
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
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
