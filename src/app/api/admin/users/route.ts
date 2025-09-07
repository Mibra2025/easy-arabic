import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function verifyAdminAccess(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return { error: 'Authorization token required', status: 401 };
  }

  const token = authorization.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Проверяем роль пользователя
    const userResult = await query(
      'SELECT u.id, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return { error: 'User not found', status: 404 };
    }

    const user = userResult.rows[0];
    if (user.role_name !== 'admin') {
      return { error: 'Access denied. Admin role required', status: 403 };
    }

    return { user, error: null };
  } catch (jwtError) {
    return { error: 'Invalid token', status: 401 };
  }
}

// GET - Получить всех пользователей
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const result = await query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.is_active,
        u.last_login,
        u.created_at,
        r.id as role_id,
        r.name as role_name,
        r.description as role_description
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      ORDER BY u.created_at DESC
    `);

    const users = result.rows.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.is_active,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      role: user.role_id ? {
        id: user.role_id,
        name: user.role_name,
        description: user.role_description
      } : null
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Обновить роль пользователя
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { userId, roleId } = await request.json();

    if (!userId || !roleId) {
      return NextResponse.json(
        { error: 'User ID and Role ID are required' },
        { status: 400 }
      );
    }

    // Проверяем, что роль существует
    const roleCheck = await query('SELECT id FROM roles WHERE id = $1', [roleId]);
    if (roleCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Обновляем роль пользователя
    const result = await query(
      'UPDATE users SET role_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [roleId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
