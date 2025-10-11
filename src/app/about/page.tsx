"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-light mb-6 tracking-tight leading-tight">
            <span className="font-extralight text-white">About</span>
            <br />
            <span className="font-normal bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
              MAK Watches
            </span>
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
          <p className="text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto">
            Timeless elegance meets modern craftsmanship
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
          {/* Our Story */}
          <section className="mb-16 md:mb-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white font-semibold text-lg">1</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                    Our Story
                  </h2>
                </div>
                <div className="pl-16">
                  <p className="text-gray-700 leading-relaxed text-lg font-light mb-6">
                    <span className="text-black font-semibold">
                      MAK WATCHES
                    </span>{" "}
                    was founded with a singular vision: to create timepieces
                    that transcend mere functionality and become treasured
                    companions through life&apos;s most precious moments.
                  </p>
                  <p className="text-gray-600 leading-relaxed font-light mb-4">
                    Since our inception, we have been dedicated to the art of
                    watchmaking, combining traditional craftsmanship with modern
                    innovation. Each timepiece in our collection tells a story
                    of precision, elegance, and unwavering commitment to
                    quality.
                  </p>
                  <p className="text-gray-600 leading-relaxed font-light">
                    Our master craftsmen pour their expertise into every detail,
                    ensuring that each MAK watch meets our exacting standards
                    and exceeds your expectations.
                  </p>
                </div>
              </div>

              <div className="relative h-96 rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/luxury watch.png"
                  alt="Luxury MAK Watch"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="mb-16 md:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black mb-4">
                Our Values
              </h2>
              <p className="text-gray-600 font-light max-w-2xl mx-auto">
                Three pillars that define everything we create
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white border-2 border-amber-200 rounded-lg p-8 hover:border-amber-500 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mb-6 shadow-lg mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3 text-center">
                  Craftsmanship
                </h3>
                <p className="text-gray-600 font-light text-center">
                  Every MAK watch is meticulously crafted by skilled artisans
                  who bring decades of experience to each timepiece.
                </p>
              </div>

              <div className="bg-white border-2 border-amber-200 rounded-lg p-8 hover:border-amber-500 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mb-6 shadow-lg mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3 text-center">
                  Innovation
                </h3>
                <p className="text-gray-600 font-light text-center">
                  We constantly push the boundaries of watchmaking technology
                  while respecting traditional techniques.
                </p>
              </div>

              <div className="bg-white border-2 border-amber-200 rounded-lg p-8 hover:border-amber-500 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mb-6 shadow-lg mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3 text-center">
                  Excellence
                </h3>
                <p className="text-gray-600 font-light text-center">
                  Our commitment to excellence drives us to create watches that
                  exceed expectations in every detail.
                </p>
              </div>
            </div>
          </section>

          {/* Heritage */}
          <section className="mb-16 md:mb-24 bg-gradient-to-br from-gray-50 to-stone-50 rounded-2xl p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-96 rounded-xl overflow-hidden shadow-xl order-2 lg:order-1">
                <Image
                  src="/header-watch.png"
                  alt="MAK Watch Heritage"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <div className="order-1 lg:order-2">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black mb-6">
                  Heritage & Innovation
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg font-light mb-4">
                  Our timepieces are born from a rich heritage of watchmaking
                  excellence, enhanced with contemporary design sensibilities.
                </p>
                <p className="text-gray-600 leading-relaxed font-light mb-4">
                  Each watch in our collection represents years of research,
                  development, and refinement. From the initial sketch to the
                  final quality check, every step in our process is guided by an
                  unwavering commitment to perfection.
                </p>
                <p className="text-gray-600 leading-relaxed font-light">
                  We source only the finest materials, ensuring that every MAK
                  timepiece is built to last generations.
                </p>
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="mb-16 md:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black mb-4">
                MAK by Numbers
              </h2>
              <p className="text-gray-600 font-light">
                Trusted by watch enthusiasts worldwide
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                {
                  number: "5K+",
                  label: "Satisfied Customers",
                },
                {
                  number: "10+",
                  label: "Years of Excellence",
                },
                {
                  number: "50+",
                  label: "Expert Craftsmen",
                },
                {
                  number: "100+",
                  label: "Unique Designs",
                },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-amber-900 to-yellow-900 text-white rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-light mb-4">
              Experience MAK Excellence
            </h2>
            <p className="text-amber-100 font-light mb-8 max-w-2xl mx-auto">
              Discover our latest collection and find the perfect timepiece that
              speaks to your style and personality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Explore Collection
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </section>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
    </div>
  );
}
