const fs = require('fs');
const https = require('https');

const baseMovies = [
  // Hollywood
  { title: "Dune: Part Two", year: 2024, genres: ["Action", "Sci-Fi", "Drama"], language: "English" },
  { title: "Inception", year: 2010, genres: ["Action", "Sci-Fi", "Thriller"], language: "English" },
  { title: "The Dark Knight", year: 2008, genres: ["Action", "Drama", "Thriller"], language: "English" },
  { title: "Interstellar", year: 2014, genres: ["Sci-Fi", "Drama", "Action"], language: "English" },
  { title: "Avatar", year: 2009, genres: ["Sci-Fi", "Action", "Adventure"], language: "English" },
  { title: "The Matrix", year: 1999, genres: ["Action", "Sci-Fi"], language: "English" },
  { title: "Gladiator", year: 2000, genres: ["Action", "Drama"], language: "English" },
  { title: "Pulp Fiction", year: 1994, genres: ["Crime", "Drama"], language: "English" },
  { title: "Forrest Gump", year: 1994, genres: ["Drama", "Romance"], language: "English" },
  { title: "The Godfather", year: 1972, genres: ["Crime", "Drama"], language: "English" },
  { title: "Oppenheimer", year: 2023, genres: ["Drama", "Thriller"], language: "English", searchTitle: "Oppenheimer (film)" },
  { title: "Barbie", year: 2023, genres: ["Comedy", "Romance"], language: "English", searchTitle: "Barbie (film)" },
  { title: "Spider-Man: Across the Spider-Verse", year: 2023, genres: ["Animation", "Action"], language: "English" },
  { title: "Parasite", year: 2019, genres: ["Thriller", "Drama"], language: "Korean", searchTitle: "Parasite (2019 film)" },
  { title: "Mad Max: Fury Road", year: 2015, genres: ["Action", "Sci-Fi"], language: "English" },
  
  // Bollywood & Indian Cinema
  { title: "Dangal", year: 2016, genres: ["Biography", "Drama", "Action"], language: "Hindi", searchTitle: "Dangal (film)" },
  { title: "3 Idiots", year: 2009, genres: ["Comedy", "Drama"], language: "Hindi" },
  { title: "PK", year: 2014, genres: ["Comedy", "Drama", "Sci-Fi"], language: "Hindi", searchTitle: "PK (film)" },
  { title: "Sholay", year: 1975, genres: ["Action", "Adventure"], language: "Hindi" },
  { title: "Lagaan", year: 2001, genres: ["Drama", "Musical", "Sport"], language: "Hindi" },
  { title: "Bajrangi Bhaijaan", year: 2015, genres: ["Action", "Comedy", "Drama"], language: "Hindi" },
  { title: "Zindagi Na Milegi Dobara", year: 2011, genres: ["Comedy", "Drama"], language: "Hindi" },
  { title: "Kabhi Khushi Kabhie Gham", year: 2001, genres: ["Drama", "Romance"], language: "Hindi", searchTitle: "Kabhi Khushi Kabhie Gham..." },
  { title: "Gangs of Wasseypur", year: 2012, genres: ["Action", "Crime", "Drama"], language: "Hindi" },
  { title: "RRR", year: 2022, genres: ["Action", "Drama"], language: "Telugu", searchTitle: "RRR (film)" },
  { title: "Baahubali: The Beginning", year: 2015, genres: ["Action", "Drama"], language: "Telugu" },
  { title: "Jawan", year: 2023, genres: ["Action", "Thriller"], language: "Hindi", searchTitle: "Jawan (film)" },
  { title: "Pathaan", year: 2023, genres: ["Action", "Thriller"], language: "Hindi" },
  { title: "Kahaani", year: 2012, genres: ["Mystery", "Thriller"], language: "Hindi", searchTitle: "Kahaani" },
  { title: "Swades", year: 2004, genres: ["Drama"], language: "Hindi" },
];

async function getImageUrl(movie) {
  const title = encodeURIComponent(movie.searchTitle || movie.title);
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${title}`;
  
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId !== "-1" && pages[pageId].original) {
      return pages[pageId].original.source;
    }
  } catch (e) {
    console.error("Error fetching", movie.title, e);
  }
  return null;
}

async function run() {
  const updatedMovies = [];
  for (const movie of baseMovies) {
    const img = await getImageUrl(movie);
    const m = { ...movie };
    delete m.searchTitle;
    if (img) {
      m.posterUrl = img;
    }
    updatedMovies.push(m);
    console.log(`Fetched ${movie.title}: ${img ? 'SUCCESS' : 'FAILED'}`);
  }
  fs.writeFileSync('updated_movies.json', JSON.stringify(updatedMovies, null, 2));
}

run();
