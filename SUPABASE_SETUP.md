# Supabase Setup Guide

This guide will help you set up the Supabase database for facilitator management.

## Step 1: Create the `facilitators` table

1. Go to https://app.supabase.com and open your project
2. Click on "SQL Editor" in the left sidebar
3. Click "New query" and paste the following SQL:

```sql
CREATE TABLE facilitators (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT DEFAULT '',
  rating DECIMAL(3,1) DEFAULT 4.9,
  sessions TEXT[] DEFAULT ARRAY['Индивидуальные', 'Групповые'],
  format TEXT[] DEFAULT ARRAY['Онлайн', 'Оффлайн'],
  cost TEXT DEFAULT 'от 5000 рублей',
  photo TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  contacts JSONB DEFAULT '{}'::jsonb,
  reviews JSONB[] DEFAULT '[]'::jsonb[],
  schedule JSONB[] DEFAULT '[]'::jsonb[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX facilitators_email_idx ON facilitators(email);
```

4. Click "Run" to execute the query

## Step 2: Add Initial Facilitator Data

You can insert the facilitators using the following SQL:

```sql
INSERT INTO facilitators (id, email, password_hash, name, city, tagline, description, photo, contacts, schedule, reviews)
VALUES
  (
    '1',
    'alina@example.com',
    'placeholder_hash_1',
    'Алина Соколова',
    'Москва',
    'Помогаю раскрыть сердце через практику кундалини',
    'Опытный фасилитатор с многолетним стажем в проведении сессий активации кундалини.',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
    '{"telegram": "https://t.me/", "whatsapp": "https://wa.me/79990000001", "email": "mailto:alina@example.com"}'::jsonb,
    '[]'::jsonb[],
    '[
      {"id": "1", "name": "Мария", "text": "Тёплая поддержка и чуткость.", "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop"},
      {"id": "2", "name": "Дмитрий", "text": "Сессии помогли обрести спокойствие.", "photo": "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=300&auto=format&fit=crop"},
      {"id": "3", "name": "Ольга", "text": "Рекомендую для мягкого старта!", "photo": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300&auto=format&fit=crop"}
    ]'::jsonb[]
  ),
  (
    '2',
    'mark@example.com',
    'placeholder_hash_2',
    'Марк Иванов',
    'Санкт-Петербург',
    'Мягкая проводимость энергии и поддержка трансформации',
    'Специалист по мягким практикам кундалини с индивидуальным подходом.',
    'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?q=80&w=1200&auto=format&fit=crop',
    '{"telegram": "https://t.me/", "whatsapp": "https://wa.me/79990000002", "email": "mailto:mark@example.com"}'::jsonb,
    '[]'::jsonb[],
    '[
      {"id": "1", "name": "Мария", "text": "Тёплая поддержка и чуткость.", "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop"}
    ]'::jsonb[]
  ),
  (
    '3',
    'elena@example.com',
    'placeholder_hash_3',
    'Елена Мирная',
    'Казань',
    'Путь к ясности через дыхание и кундалини',
    'Практик, направленный на раскрытие потенциала через дыхательные техники.',
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200&auto=format&fit=crop',
    '{"telegram": "https://t.me/", "whatsapp": "https://wa.me/79990000003", "email": "mailto:elena@example.com"}'::jsonb,
    '[]'::jsonb[],
    '[
      {"id": "1", "name": "Дмитрий", "text": "Сессии помогли обрести спокойствие.", "photo": "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=300&auto=format&fit=crop"}
    ]'::jsonb[]
  ),
  (
    '4',
    'roman@example.com',
    'placeholder_hash_4',
    'Роман Север',
    'Новосибирск',
    'Осознанность тела, тишина ума, пробуждение энергии',
    'Фасилитатор, помогающий достичь глубокого состояния осознанности.',
    'https://images.unsplash.com/photo-1508830524289-0adcbe822b40?q=80&w=1200&auto=format&fit=crop',
    '{"telegram": "https://t.me/", "whatsapp": "https://wa.me/79990000004", "email": "mailto:roman@example.com"}'::jsonb,
    '[]'::jsonb[],
    '[
      {"id": "1", "name": "Ольга", "text": "Рекомендую для мягкого старта!", "photo": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300&auto=format&fit=crop"}
    ]'::jsonb[]
  );
```

5. Click "Run" to insert the facilitators

## Step 3: Update Password Hashes

For production, you need to properly hash passwords. Use bcrypt or a similar library. Update the password_hash values:

```sql
-- For testing, you can use simple hashes
-- In production, implement proper password hashing
UPDATE facilitators SET password_hash = '$2a$10$...' WHERE id = '1';
```

## Step 4: Enable RLS (Row Level Security)

While in development, you can keep RLS disabled. For production, enable it:

1. Click on "Authentication" > "Policies"
2. Create policies for the facilitators table to ensure each facilitator can only access their own data

## Access Links

Once set up, facilitators can access their personal accounts at:
- **Login URL**: `https://your-domain/login`
- **Personal Account**: `https://your-domain/personal-account`

Default login credentials (after you've added them to the database):
- **Alina**: alina@example.com
- **Mark**: mark@example.com
- **Elena**: elena@example.com
- **Roman**: roman@example.com

Note: Set proper passwords in production.
