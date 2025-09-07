import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT id, name, description FROM roles ORDER BY name');
    
    const roles = result.rows.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description
    }));

    return NextResponse.json({ roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
