"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, Clock, Search } from "lucide-react";
import Image from "next/image";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title:
      "The Art of Watchmaking: Traditional Craftsmanship Meets Modern Innovation",
    excerpt:
      "Explore how traditional watchmaking techniques blend with contemporary technology to create timepieces that honor the past while embracing the future.",
    date: "Oct 5, 2024",
    category: "Craftsmanship",
    readTime: "5 min read",
    image: "/luxury watch.png",
    featured: true,
  },
  {
    id: 2,
    title: "Choosing the Perfect Watch for Your Lifestyle",
    excerpt:
      "A comprehensive guide to selecting a timepiece that complements your daily activities, professional needs, and personal style preferences.",
    date: "Oct 1, 2024",
    category: "Lifestyle",
    readTime: "7 min read",
    image: "/header-watch.png",
  },
  {
    id: 3,
    title: "Understanding Watch Movements: Mechanical vs Quartz",
    excerpt:
      "Dive deep into the heart of timepieces and understand the fundamental differences between mechanical and quartz movements.",
    date: "Sep 28, 2024",
    category: "Education",
    readTime: "6 min read",
    image: "/hero-watch.png",
  },
  {
    id: 4,
    title: "Caring for Your Luxury Timepiece: Maintenance Tips",
    excerpt:
      "Learn essential maintenance practices to keep your watch in pristine condition and ensure its longevity for generations to come.",
    date: "Sep 25, 2024",
    category: "Care",
    readTime: "4 min read",
    image: "/watch2.png",
  },
  {
    id: 5,
    title: "Investment Grade Watches: Building Your Collection",
    excerpt:
      "Learn which timepieces hold their value and how to build a watch collection that serves as both passion and investment.",
    date: "Sep 20, 2024",
    category: "Investment",
    readTime: "8 min read",
    image: "/women-watch.png",
  },
  {
    id: 6,
    title: "The Evolution of Luxury Timepieces",
    excerpt:
      "Discover how luxury watches have revolutionized over the decades and what makes them timeless investments.",
    date: "Sep 15, 2024",
    category: "History",
    readTime: "6 min read",
    image: "/Item-card-image-1.png",
  },
];

export default function BlogPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    if (contentRef.current) observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, []);

  const categories = [
    "All",
    "Craftsmanship",
    "Lifestyle",
    "Education",
    "Care",
    "Investment",
    "History",
  ];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find((post) => post.featured);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative h-[80vh] md:h-[80vh] bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center text-white transition-all duration-1000 overflow-hidden md:mt-20"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

        <div className="relative text-center max-w-6xl mx-auto px-6 z-10">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 backdrop-blur-sm border-2 border-amber-300/30 mb-8">
              <svg
                className="w-10 h-10 md:w-12 md:h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-light mb-6 tracking-tight leading-tight">
            <span className="font-extralight text-white">MAK</span>
            <br />
            <span className="font-normal bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
              Blog
            </span>
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
          <p className="text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto">
            Stories, insights & inspiration from the world of horology
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative bg-white">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>

        <div
          ref={contentRef}
          className="py-16 md:py-24 lg:py-32 px-6 max-w-7xl mx-auto transition-all duration-1000"
        >
          {/* Search and Filter */}
          <section className="mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-6 items-center mb-8">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-amber-400 to-yellow-600 text-white shadow-lg"
                        : "bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Post */}
          {featuredPost && selectedCategory === "All" && !searchTerm && (
            <section className="mb-16 md:mb-24">
              <div className="text-xs uppercase tracking-wider text-amber-600 font-semibold mb-4">
                Featured Article
              </div>
              <div className="bg-white border-2 border-amber-200 rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="relative h-80 lg:h-full">
                    <Image
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium text-xs">
                        {featuredPost.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {featuredPost.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-light text-black mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 font-light mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <button className="inline-flex items-center text-amber-600 hover:text-amber-700 font-semibold group">
                      Read Full Article
                      <svg
                        className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Blog Posts Grid */}
          <section>
            {filteredPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-amber-300 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>

                      <h3 className="text-xl font-light text-black mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 font-light text-sm mb-4 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <button className="inline-flex items-center text-amber-600 font-semibold text-sm group-hover:text-amber-700">
                        Read More
                        <svg
                          className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-light text-black mb-4">
                  No Articles Found
                </h3>
                <p className="text-gray-500 font-light mb-6">
                  {searchTerm
                    ? `No articles match "${searchTerm}"`
                    : `No articles found in the ${selectedCategory} category`}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>

          {/* Newsletter */}
          <section className="mt-16 md:mt-24 bg-gradient-to-br from-amber-900 to-yellow-900 text-white rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-light mb-4">
              Stay Informed
            </h2>
            <p className="text-amber-100 font-light mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest insights, exclusive
              content, and updates from the world of luxury timepieces.
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder:text-gray-300 focus:outline-none focus:border-white/40"
              />
              <button className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </section>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
    </div>
  );
}
