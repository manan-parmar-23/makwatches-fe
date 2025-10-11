"use client";

import { useEffect, useRef } from "react";

export default function PrivacyPage() {
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-light mb-6 tracking-tight leading-tight">
            <span className="font-extralight text-white">Privacy</span>
            <br />
            <span className="font-normal bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
          <p className="text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto">
            Your trust is our most precious asset
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
          <div className="prose prose-lg prose-slate max-w-none">
            {/* Introduction */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">1</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  Introduction
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-700 leading-relaxed text-lg md:text-xl font-light mb-6">
                  This privacy policy sets out how{" "}
                  <span className="text-black font-semibold">MAK WATCHES</span>{" "}
                  uses and protects any information that you give us when you
                  visit our website and/or agree to purchase from us.
                </p>
                <p className="text-gray-600 leading-relaxed font-light mb-4">
                  MAK WATCHES is committed to ensuring that your privacy is
                  protected. Should we ask you to provide certain information by
                  which you can be identified when using this website, you can
                  be assured that it will only be used in accordance with this
                  privacy statement.
                </p>
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-sm">
                  <p className="text-gray-700 font-light m-0">
                    <strong className="text-black font-semibold">
                      Please Note:
                    </strong>{" "}
                    MAK WATCHES may change this policy from time to time by
                    updating this page. You should check this page from time to
                    time to ensure that you adhere to these changes.
                  </p>
                </div>
              </div>
            </section>

            {/* Information We Collect */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">2</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  Information We Collect
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-600 leading-relaxed font-light mb-8">
                  We may collect the following information:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-2">
                          Name
                        </h3>
                        <p className="text-gray-600 text-sm font-light">
                          Your full name for identification and personalization
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-2">
                          Contact Information
                        </h3>
                        <p className="text-gray-600 text-sm font-light">
                          Email address and other contact details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-2">
                          Demographic Information
                        </h3>
                        <p className="text-gray-600 text-sm font-light">
                          Postcode, preferences and interests, if required
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-2">
                          Survey Information
                        </h3>
                        <p className="text-gray-600 text-sm font-light">
                          Information relevant to customer surveys and offers
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">3</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  What We Do With Your Information
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-600 leading-relaxed font-light mb-8">
                  We require this information to understand your needs and
                  provide you with a better service, and in particular for the
                  following reasons:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 font-light">
                          Internal record keeping
                        </p>
                      </div>
                    </div>
                    <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 font-light">
                          Improving our products and services
                        </p>
                      </div>
                    </div>
                    <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 font-light">
                          Sending promotional emails about new products, special
                          offers or other information
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 font-light">
                          Contacting you for market research purposes via email,
                          phone, fax or mail
                        </p>
                      </div>
                    </div>
                    <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 font-light">
                          Customizing the website according to your interests
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">4</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  Security
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-700 leading-relaxed text-lg font-light mb-6">
                  We are committed to ensuring that your information is secure.
                  In order to prevent unauthorised access or disclosure, we have
                  put in place suitable physical, electronic and managerial
                  procedures to safeguard and secure the information we collect
                  online.
                </p>
                <div className="bg-white border-2 border-amber-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Payments & Card Data
                  </h3>
                  <p className="text-gray-700 font-light">
                    Online payments are processed by secure third‑party payment
                    gateways such as{" "}
                    <strong className="font-semibold">Razorpay</strong>. We do
                    not store your full card details on our systems. Your
                    payment information is handled by the payment provider in
                    accordance with their security standards and privacy policy.
                  </p>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">5</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  How We Use Cookies
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-600 leading-relaxed font-light mb-6">
                  A cookie is a small file which asks permission to be placed on
                  your computer&apos;s hard drive. Once you agree, the file is
                  added and the cookie helps analyze web traffic or lets you
                  know when you visit a particular site.
                </p>
                <p className="text-gray-600 leading-relaxed font-light mb-6">
                  Cookies allow web applications to respond to you as an
                  individual. The web application can tailor its operations to
                  your needs, likes and dislikes by gathering and remembering
                  information about your preferences.
                </p>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-8 mb-6">
                  <h4 className="text-black font-semibold text-lg mb-4">
                    Traffic Log Cookies
                  </h4>
                  <p className="text-gray-700 font-light mb-4">
                    We use traffic log cookies to identify which pages are being
                    used. This helps us analyze data about webpage traffic and
                    improve our website in order to tailor it to customer needs.
                    We only use this information for statistical analysis
                    purposes and then the data is removed from the system.
                  </p>
                  <p className="text-gray-600 font-light text-sm">
                    Overall, cookies help us provide you with a better website,
                    by enabling us to monitor which pages you find useful and
                    which you do not. A cookie in no way gives us access to your
                    computer or any information about you, other than the data
                    you choose to share with us.
                  </p>
                </div>

                <div className="bg-white border-2 border-amber-300 rounded-lg p-6">
                  <p className="text-gray-700 font-light">
                    <strong className="text-black font-semibold">
                      Your Choice:
                    </strong>{" "}
                    You can choose to accept or decline cookies. Most web
                    browsers automatically accept cookies, but you can usually
                    modify your browser setting to decline cookies if you
                    prefer. This may prevent you from taking full advantage of
                    the website.
                  </p>
                </div>
              </div>
            </section>

            {/* Controlling Personal Information */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">6</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  Controlling Your Personal Information
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-600 leading-relaxed font-light mb-8">
                  You may choose to restrict the collection or use of your
                  personal information in the following ways:
                </p>

                <div className="space-y-6 mb-8">
                  <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start">
                      <p className="text-gray-700 font-light">
                        Whenever you are asked to fill in a form on the website,
                        look for the box that you can click to indicate that you
                        do not want the information to be used by anybody for
                        direct marketing purposes
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start">
                      <p className="text-gray-700 font-light">
                        If you have previously agreed to us using your personal
                        information for direct marketing purposes, you may
                        change your mind at any time by writing to or emailing
                        us at{" "}
                        <a
                          href="mailto:makwatches2303@gmail.com"
                          className="text-amber-600 hover:text-amber-700 font-medium underline"
                        >
                          makwatches2303@gmail.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-stone-50 border-2 border-gray-200 rounded-xl p-8 mb-6">
                  <h4 className="text-black font-semibold text-lg mb-4">
                    Third Party Information
                  </h4>
                  <p className="text-gray-700 font-light mb-4">
                    We will not sell, distribute or lease your personal
                    information to third parties unless we have your permission
                    or are required by law to do so.
                  </p>
                  <p className="text-gray-600 font-light text-sm">
                    We may use your personal information to send you promotional
                    information about third parties which we think you may find
                    interesting if you tell us that you wish this to happen.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                  <p className="text-gray-700 font-light">
                    <strong className="text-black font-semibold">
                      Corrections:
                    </strong>{" "}
                    If you believe that any information we are holding on you is
                    incorrect or incomplete, please contact us as soon as
                    possible. We will promptly correct any information found to
                    be incorrect.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-16">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">7</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  Contact Us
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-600 leading-relaxed font-light mb-8">
                  If you have any questions about this Privacy Policy or wish to
                  exercise your rights, please contact us:
                </p>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-8 md:p-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center md:text-left">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4 shadow-lg">
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
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-black font-semibold text-lg mb-2">
                        Email
                      </h4>
                      <a
                        href="mailto:makwatches2303@gmail.com"
                        className="text-amber-600 hover:text-amber-700 font-medium break-all"
                      >
                        makwatches2303@gmail.com
                      </a>
                    </div>

                    <div className="text-center md:text-left">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4 shadow-lg">
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-black font-semibold text-lg mb-2">
                        Phone
                      </h4>
                      <a
                        href="tel:9974959693"
                        className="text-amber-600 hover:text-amber-700 font-medium"
                      >
                        +91 9974959693
                      </a>
                    </div>

                    <div className="text-center md:text-left md:col-span-3 lg:col-span-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4 shadow-lg">
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-black font-semibold text-lg mb-2">
                        Address
                      </h4>
                      <p className="text-gray-700 font-medium">
                        Shree Ganesh Watch
                        <br />
                        Matwa Street
                        <br />
                        Near Balaji Cineplex
                        <br />
                        Jetpur, Rajkot
                        <br />
                        Gujarat - 360370
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
    </div>
  );
}
