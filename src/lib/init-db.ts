import { query } from './db';

export async function initDatabase() {
  try {
    // Создаём таблицу ролей
    await query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Вставляем стандартные роли
    await query(`
      INSERT INTO roles (name, description) 
      VALUES 
        ('admin', 'Администратор системы с полным доступом'),
        ('teacher', 'Преподаватель арабского языка'),
        ('student', 'Ученик изучающий арабский язык')
      ON CONFLICT (name) DO NOTHING
    `);

    // Создаём таблицу пользователей
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(500),
        language_level VARCHAR(50) DEFAULT 'beginner',
        role_id INTEGER REFERENCES roles(id) DEFAULT 3,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создаём таблицу сессий пользователей (опционально, для отслеживания активных сессий)
    await query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создаём таблицу курсов
    await query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image VARCHAR(500),
        teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создаём таблицу уроков
    await query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url VARCHAR(500),
        additional_info TEXT,
        lesson_order INTEGER DEFAULT 0,
        duration INTEGER, -- длительность в секундах
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создаём таблицу записей студентов на курсы
    await query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        progress DECIMAL(5,2) DEFAULT 0.00, -- процент прохождения
        UNIQUE(student_id, course_id)
      )
    `);

    // Создаём таблицу прогресса по урокам
    await query(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id SERIAL PRIMARY KEY,
        enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT false,
        watched_duration INTEGER DEFAULT 0, -- время просмотра в секундах
        completed_at TIMESTAMP,
        UNIQUE(enrollment_id, lesson_id)
      )
    `);

    // Создаём индексы для производительности
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
      CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
      CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
      CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(lesson_order);
      CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
      CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
