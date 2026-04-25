import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { Movie } from './models/Movie.js';
import { User } from './models/User.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Movie.deleteMany({});
    await User.deleteMany({});
    console.log("🧹 Cleared existing collections");

    // Seed Movies from movies.json
    const moviesPath = path.join(__dirname, '..', 'public', 'movies.json');
    if (fs.existsSync(moviesPath)) {
      const moviesData = JSON.parse(fs.readFileSync(moviesPath, 'utf8'));
      // Remove local string IDs so Mongo can assign ObjectIds
      const sanitizedMovies = moviesData.map(m => {
        const { id, ...rest } = m;
        return rest;
      });
      await Movie.insertMany(sanitizedMovies);
      console.log(`🍿 Seeded ${sanitizedMovies.length} movies!`);
    } else {
      console.log("⚠️ public/movies.json not found. Skipping movies.");
    }

    // Seed Users
    const mockUsers = [
      { name: "Alice Wonderland", email: "user@demo.com", password: "password", role: "user", avatar: "A", joinDate: "2023-01-15", status: "active", genres: ["Action", "Sci-Fi"] },
      { name: "Bob Builder", email: "bob@demo.com", password: "password", role: "user", avatar: "B", joinDate: "2023-05-20", status: "active", genres: ["Comedy", "Drama"] },
      { name: "Super Admin", email: "admin@demo.com", password: "password", role: "admin", avatar: "SA", joinDate: "2021-06-15", status: "active" }
    ];
    await User.insertMany(mockUsers);
    console.log(`👤 Seeded ${mockUsers.length} users!`);

    console.log("🎉 Database seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
