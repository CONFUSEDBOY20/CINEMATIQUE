export const mockUsers = [
  { id: "u1", name: "Alice Wonderland", email: "user@demo.com", role: "user", avatar: "A", joinDate: "2023-01-15", status: "active", watchlist: ["1", "3", "5"], genres: ["Action", "Sci-Fi"] },
  { id: "u2", name: "Bob Builder", email: "bob@demo.com", role: "user", avatar: "B", joinDate: "2023-05-20", status: "active", watchlist: ["2", "4"], genres: ["Comedy", "Drama"] },
  { id: "u3", name: "Charlie Chaplin", email: "charlie@demo.com", role: "user", avatar: "C", joinDate: "2024-02-10", status: "banned", watchlist: ["6", "7"], genres: ["Horror", "Thriller"] },
  { id: "u4", name: "Diana Prince", email: "diana@demo.com", role: "user", avatar: "D", joinDate: "2023-11-05", status: "active", watchlist: ["8", "9", "10"], genres: ["Romance", "Drama"] },
  { id: "u5", name: "Ethan Hunt", email: "ethan@demo.com", role: "user", avatar: "E", joinDate: "2024-03-22", status: "active", watchlist: ["11", "12"], genres: ["Action", "Thriller"] }
];

export const mockAdmins = [
  { id: "a1", name: "Admin One", email: "admin@demo.com", role: "admin", avatar: "A1", joinDate: "2022-01-01", status: "active" },
  { id: "a2", name: "Super Admin", email: "super@demo.com", role: "admin", avatar: "SA", joinDate: "2021-06-15", status: "active" },
  { id: "a3", name: "Mod Mike", email: "mod@demo.com", role: "admin", avatar: "MM", joinDate: "2023-08-30", status: "active" }
];

export const mockReviews = [
  { id: "r1", userId: "u1", movieId: "1", rating: 5, text: "An absolute masterpiece. Visuals are stunning.", date: "2024-03-10", status: "approved" },
  { id: "r2", userId: "u2", movieId: "1", rating: 4, text: "Great sequel, but a bit long.", date: "2024-03-12", status: "approved" },
  { id: "r3", userId: "u3", movieId: "5", rating: 1, text: "Didn't get the hype. Too weird.", date: "2024-02-15", status: "flagged" },
  { id: "r4", userId: "u4", movieId: "9", rating: 5, text: "Made me cry so much. Beautiful storytelling.", date: "2024-01-20", status: "pending" },
  { id: "r5", userId: "u1", movieId: "2", rating: 5, text: "A brain-bending classic.", date: "2023-11-05", status: "approved" },
];
