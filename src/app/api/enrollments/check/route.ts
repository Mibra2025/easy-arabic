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

// GET - Проверить, записан ли пользователь на курс
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const user = authResult.user;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT 
        e.id,
        e.enrolled_at,
        e.progress,
        COUNT(CASE WHEN lp.completed = true THEN 1 END) as completed_lessons,
        COUNT(l.id) as total_lessons
      FROM enrollments e
      LEFT JOIN lesson_progress lp ON e.id = lp.enrollment_id
      LEFT JOIN lessons l ON e.course_id = l.course_id AND l.is_published = true
      WHERE e.student_id = $1 AND e.course_id = $2
      GROUP BY e.id`,
      [user.id, courseId]
    );

    const isEnrolled = result.rows.length > 0;
    let enrollmentData = null;

    if (isEnrolled) {
      const enrollment = result.rows[0];
      enrollmentData = {
        id: enrollment.id,
        enrolledAt: enrollment.enrolled_at,
        progress: parseFloat(enrollment.progress) || 0,
        completedLessons: parseInt(enrollment.completed_lessons) || 0,
        totalLessons: parseInt(enrollment.total_lessons) || 0,
      };
    }

    return NextResponse.json({
      isEnrolled,
      enrollment: enrollmentData
    });

  } catch (error) {
    console.error('Error checking enrollment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
