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

// GET - Получить все курсы
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacher_id');
    const published = searchParams.get('published');
    
    let queryText = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.cover_image,
        c.teacher_id,
        c.is_published,
        c.created_at,
        c.updated_at,
        u.name as teacher_name,
        COUNT(l.id) as lessons_count,
        COUNT(e.id) as enrolled_students
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN lessons l ON c.id = l.course_id
      LEFT JOIN enrollments e ON c.id = e.course_id
    `;
    
    const params = [];
    const conditions = [];
    
    if (teacherId) {
      conditions.push(`c.teacher_id = $${params.length + 1}`);
      params.push(parseInt(teacherId));
    }
    
    if (published !== null && published !== undefined) {
      conditions.push(`c.is_published = $${params.length + 1}`);
      params.push(published === 'true');
    }
    
    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    queryText += `
      GROUP BY c.id, u.name
      ORDER BY c.created_at DESC
    `;

    const result = await query(queryText, params);

    const courses = result.rows.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      coverImage: course.cover_image,
      teacherId: course.teacher_id,
      teacherName: course.teacher_name,
      isPublished: course.is_published,
      lessonsCount: parseInt(course.lessons_count) || 0,
      enrolledStudents: parseInt(course.enrolled_students) || 0,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
    }));

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Создать новый курс
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const user = authResult.user;
    
    // Проверяем, что пользователь - преподаватель или админ
    if (user.role_name !== 'teacher' && user.role_name !== 'admin') {
      return NextResponse.json(
        { error: 'Only teachers and admins can create courses' },
        { status: 403 }
      );
    }

    const { title, description, coverImage } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO courses (title, description, cover_image, teacher_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, title, description, cover_image, teacher_id, is_published, created_at, updated_at`,
      [title, description, coverImage, user.id]
    );

    const course = result.rows[0];

    return NextResponse.json({
      message: 'Course created successfully',
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
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
