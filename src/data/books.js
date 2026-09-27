// Book collection data
//
// coverImage: self-hosted under public/books/. Hotlinked covers rot — three of
//   the original five (pragprog, Amazon, No Starch) were 404/403 by 2026.
//   https://covers.openlibrary.org/b/isbn/<ISBN>-L.jpg is a good source.
// genre:  free text; the bookshelf page builds its Genre filter from these.
// status: "read" | "reading" | "want-to-read"

export const books = [
  {
    shortTitle: "Pragmatic Programmer",
    shortAuthor: "Hunt/Thomas",
    fullTitle: "The Pragmatic Programmer: Your Journey to Mastery",
    fullAuthor: "Andrew Hunt & David Thomas",
    summary: "A classic guide to software craftsmanship, offering pragmatic advice for developers.",
    year: "2019 (2nd Edition)",
    link: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/",
    coverImage: "/books/pragmatic-programmer.jpg",
    genre: "Craft",
    status: "read",
  },
  {
    shortTitle: "Clean Code",
    shortAuthor: "Martin",
    fullTitle: "Clean Code: A Handbook of Agile Software Craftsmanship",
    fullAuthor: "Robert C. Martin",
    summary: "Essential principles, patterns, and practices for writing clean, maintainable code.",
    year: "2008",
    link: "https://www.oreilly.com/library/view/clean-code-a/9780136083238/",
    coverImage: "/books/clean-code.jpg",
    genre: "Craft",
    status: "read",
  },
  {
    shortTitle: "Data-Intensive Apps",
    shortAuthor: "Kleppmann",
    fullTitle: "Designing Data-Intensive Applications",
    fullAuthor: "Martin Kleppmann",
    summary: "The big ideas behind reliable, scalable, and maintainable data systems.",
    year: "2017",
    link: "https://dataintensive.net/",
    coverImage: "/books/designing-data-intensive-applications.jpg",
    genre: "Systems",
    status: "read",
  },
  {
    shortTitle: "Design Patterns",
    shortAuthor: "Gang of Four",
    fullTitle: "Design Patterns: Elements of Reusable Object-Oriented Software",
    fullAuthor: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    summary: "The foundational text on software design patterns and object-oriented programming.",
    year: "1994",
    link: "#",
    coverImage: "/books/design-patterns.jpg",
    genre: "Design",
    status: "read",
  },
  {
    shortTitle: "Rust Programming",
    shortAuthor: "Klabnik",
    fullTitle: "The Rust Programming Language",
    fullAuthor: "Steve Klabnik & Carol Nichols",
    summary: "The official book on the Rust programming language.",
    year: "2018",
    link: "#",
    coverImage: "/books/rust-programming-language.jpg",
    genre: "Languages",
    status: "read",
  },
];
