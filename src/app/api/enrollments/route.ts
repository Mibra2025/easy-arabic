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

// GET - Получить записи пользователя на курсы
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const user = authResult.user;
    
    const result = await query(
      `SELECT 
        e.id,
        e.enrolled_at,
        e.completed_at,
        e.progress,
        c.id as course_id,
        c.title as course_title,
        c.description as course_description,
        c.cover_image,
        u.name as teacher_name,
        COUNT(l.id) as total_lessons,
        COUNT(CASE WHEN lp.completed = true THEN 1 END) as completed_lessons
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.teacher_id = u.id
      LEFT JOIN lessons l ON c.id = l.course_id AND l.is_published = true
      LEFT JOIN lesson_progress lp ON e.id = lp.enrollment_id
      WHERE e.student_id = $1
      GROUP BY e.id, c.id, u.name
      ORDER BY e.enrolled_at DESC`,
      [user.id]
    );

    const enrollments = result.rows.map(row => ({
      id: row.id,
      enrolledAt: row.enrolled_at,
      completedAt: row.completed_at,
      progress: parseFloat(row.progress) || 0,
      course: {
        id: row.course_id,
        title: row.course_title,
        description: row.course_description,
        coverImage: row.cover_image,
        teacherName: row.teacher_name,
      },
      stats: {
        totalLessons: parseInt(row.total_lessons) || 0,
        completedLessons: parseInt(row.completed_lessons) || 0,
      }
    }));

    return NextResponse.json({ enrollments });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Записаться на курс
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const user = authResult.user;
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли курс и опубликован ли он
    const courseResult = await query(
      'SELECT id, title, is_published FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const course = courseResult.rows[0];

    if (!course.is_published) {
      return NextResponse.json(
        { error: 'Course is not published' },
        { status: 400 }
      );
    }

    // Проверяем, не записан ли уже пользователь на этот курс
    const existingEnrollment = await query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [user.id, courseId]
    );

    if (existingEnrollment.rows.length > 0) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Создаем запись на курс
    const enrollmentResult = await query(
      `INSERT INTO enrollments (student_id, course_id) 
       VALUES ($1, $2) 
       RETURNING id, enrolled_at, progress`,
      [user.id, courseId]
    );

    const enrollment = enrollmentResult.rows[0];

    // Создаем записи прогресса для всех опубликованных уроков
    const lessonsResult = await query(
      'SELECT id FROM lessons WHERE course_id = $1 AND is_published = true',
      [courseId]
    );

    if (lessonsResult.rows.length > 0) {
      const lessonProgressInserts = lessonsResult.rows.map(lesson => 
        `(${enrollment.id}, ${lesson.id})`
      ).join(', ');

      await query(
        `INSERT INTO lesson_progress (enrollment_id, lesson_id) 
         VALUES ${lessonProgressInserts}`
      );
    }

    return NextResponse.json({
      message: 'Successfully enrolled in course',
      enrollment: {
        id: enrollment.id,
        enrolledAt: enrollment.enrolled_at,
        progress: enrollment.progress,
        courseId: courseId,
        courseTitle: course.title
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
