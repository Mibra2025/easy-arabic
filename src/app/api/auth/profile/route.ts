import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authorization.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      const result = await query(
        'SELECT u.id, u.name, u.email, u.created_at, r.id as role_id, r.name as role_name, r.description as role_description FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const user = result.rows[0];

      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at,
          role: user.role_id ? {
            id: user.role_id,
            name: user.role_name,
            description: user.role_description
          } : null,
        },
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authorization.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const { name, email } = await request.json();

      if (!name || !email) {
        return NextResponse.json(
          { error: 'Name and email are required' },
          { status: 400 }
        );
      }

      // Проверяем, не занят ли email другим пользователем
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, decoded.userId]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 400 }
        );
      }
      
      const result = await query(
        'UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, email, created_at',
        [name, email, decoded.userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const user = result.rows[0];

      return NextResponse.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at,
        },
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
