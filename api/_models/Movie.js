import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  year:       { type: Number },
  genres:     [{ type: String }],
  rating:     { type: Number },
  synopsis:   { type: String },
  cast:       [{ type: String }],
  runtime:    { type: String },
  language:   { type: String },
  moodTags:   [{ type: String }],
  posterUrl:  { type: String },
  backdropUrl:{ type: String }
}, { timestamps: true });

export const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);
