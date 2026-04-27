import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // ── Movies ────────────────────────────────────────────────────────────────
    const moviesPath = path.join(__dirname, '..', 'public', 'movies.json');
    if (fs.existsSync(moviesPath)) {
      const moviesData = JSON.parse(fs.readFileSync(moviesPath, 'utf8'));

      // Clear existing movies
      const { error: delMoviesErr } = await supabase.from('movies').delete().gt('created_at', '1970-01-01');
      if (delMoviesErr) console.warn('⚠️ Could not clear movies:', delMoviesErr.message);

      // Map to Supabase column names (snake_case)
      const sanitized = moviesData.map(({ id, cast, moodTags, posterUrl, backdropUrl, ...rest }) => ({
        ...rest,
        cast_members: cast        ?? [],
        mood_tags:    moodTags    ?? [],
        poster_url:   posterUrl   ?? '',
        backdrop_url: backdropUrl ?? ''
      }));

      const { error: insertMoviesErr } = await supabase.from('movies').insert(sanitized);
      if (insertMoviesErr) throw insertMoviesErr;
      console.log(`🍿 Seeded ${sanitized.length} movies!`);
    } else {
      console.log('⚠️ public/movies.json not found. Skipping movies.');
    }

    // ── Users ─────────────────────────────────────────────────────────────────
    const mockUsers = [
      { name: 'Alice Wonderland', email: 'user@demo.com',  password: 'password', role: 'user',  status: 'active', genres: ['Action', 'Sci-Fi'] },
      { name: 'Bob Builder',      email: 'bob@demo.com',   password: 'password', role: 'user',  status: 'active', genres: ['Comedy', 'Drama']  },
      { name: 'Super Admin',      email: 'admin@demo.com', password: 'password', role: 'admin', status: 'active', genres: []                    }
    ];

    for (const u of mockUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);

      const { error } = await supabase
        .from('users')
        .upsert(
          { ...u, password: hashedPassword, avatar: '', cover_photo: '', bio: '', watchlist: [] },
          { onConflict: 'email' }
        );
      if (error) console.warn(`⚠️ Could not upsert ${u.email}:`, error.message);
    }
    console.log(`👤 Seeded ${mockUsers.length} users!`);

    console.log('🎉 Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
