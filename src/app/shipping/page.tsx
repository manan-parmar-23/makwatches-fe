"use client";

import { useEffect, useRef } from "react";

export default function ShippingPage() {
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
        className="relative h-[80vh] md:mt-20 md:h-[80vh] bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center text-white transition-all duration-1000 overflow-hidden"
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-light mb-6 tracking-tight leading-tight">
            <span className="font-extralight text-white">Shipping</span>
            <br />
            <span className="font-normal bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
          <p className="text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto">
            Reliable delivery, worldwide reach
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
            {/* Overview */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">1</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  Shipping Overview
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-700 leading-relaxed text-lg md:text-xl font-light mb-6">
                  <span className="text-black font-semibold">MAK WATCHES</span>{" "}
                  ensures safe and timely delivery of your orders through
                  trusted shipping partners.
                </p>
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-sm">
                  <p className="text-gray-700 font-light m-0">
                    We work with registered courier companies and postal
                    services to deliver your precious timepieces safely to your
                    doorstep.
                  </p>
                </div>
              </div>
            </section>

            {/* Shipping Methods */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">2</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  Shipping Methods
                </h2>
              </div>
              <div className="pl-16">
                {/* International Shipping
                <div className="mb-12">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-4 shadow">
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
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl md:text-2xl font-medium text-black m-0">
                      International Shipping
                    </h3>
                  </div>
                  <div className="pl-14">
                    <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300 mb-4">
                      <p className="text-gray-700 font-light">
                        For international buyers, orders are shipped and
                        delivered through{" "}
                        <strong className="text-black font-semibold">
                          registered international courier companies
                        </strong>{" "}
                        and/or{" "}
                        <strong className="text-black font-semibold">
                          International speed post
                        </strong>{" "}
                        only.
                      </p>
                    </div>
                  </div>
                </div> */}

                {/* Domestic Shipping */}
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mr-4 shadow">
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
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl md:text-2xl font-medium text-black m-0">
                      Domestic Shipping
                    </h3>
                  </div>
                  <div className="pl-14">
                    <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                      <p className="text-gray-700 font-light">
                        For domestic buyers, orders are shipped through{" "}
                        <strong className="text-black font-semibold">
                          registered domestic courier companies
                        </strong>{" "}
                        and/or{" "}
                        <strong className="text-black font-semibold">
                          speed post
                        </strong>{" "}
                        only.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Processing & Delivery Time */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">3</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  Processing & Delivery Time
                </h2>
              </div>
              <div className="pl-16">
                <div className="bg-gradient-to-br from-amber-900 to-yellow-900 text-white rounded-xl p-8 mb-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="text-amber-200 text-5xl font-light mb-2">
                      6-8
                    </div>
                    <div className="text-white text-xl font-light mb-2">
                      Business Days
                    </div>
                    <p className="text-amber-100 text-sm font-light">
                      Standard shipping timeframe
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
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
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-black font-semibold text-lg mb-2">
                          Standard Shipping Timeline
                        </h4>
                        <p className="text-gray-700 font-light">
                          Orders are shipped within{" "}
                          <strong className="font-semibold">6-8 days</strong> or
                          as per the delivery date agreed at the time of order
                          confirmation.
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
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-black font-semibold text-lg mb-2">
                          Delivery Subject to Courier Norms
                        </h4>
                        <p className="text-gray-700 font-light">
                          Actual delivery of the shipment is subject to courier
                          company / post office norms and operational schedules.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Delivery Guarantee */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">4</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  Our Guarantee
                </h2>
              </div>
              <div className="pl-16">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 mb-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4 flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-green-900 font-semibold text-lg mb-3">
                        MAK WATCHES Guarantee
                      </h4>
                      <p className="text-green-800 font-light">
                        MAK WATCHES guarantees to hand over the consignment to
                        the courier company or postal authorities within{" "}
                        <strong className="font-semibold">6-8 days</strong> from
                        the date of the order and payment or as per the delivery
                        date agreed at the time of order confirmation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                  <p className="text-gray-700 font-light">
                    <strong className="text-black font-semibold">
                      Important Notice:
                    </strong>{" "}
                    MAK WATCHES is not liable for any delay in delivery by the
                    courier company / postal authorities once the shipment has
                    been handed over to them.
                  </p>
                </div>
              </div>
            </section>

            {/* Delivery Address */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">5</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  Delivery Address
                </h2>
              </div>
              <div className="pl-16">
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
                        <h4 className="text-black font-semibold text-lg mb-2">
                          Physical Delivery
                        </h4>
                        <p className="text-gray-700 font-light">
                          Delivery of all orders will be made to the address
                          provided by the buyer during checkout.
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
                        <h4 className="text-black font-semibold text-lg mb-2">
                          Service Confirmation
                        </h4>
                        <p className="text-gray-700 font-light">
                          Delivery of our services will be confirmed on your
                          mail ID as specified during registration.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-8">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-blue-900 font-semibold text-lg mb-2">
                        Verify Your Address
                      </h4>
                      <p className="text-blue-800 font-light">
                        Please ensure that the delivery address provided is
                        accurate and complete. We cannot be held responsible for
                        deliveries made to incorrect addresses provided by the
                        buyer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact & Support */}
            <section className="mb-16">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">6</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  Need Help?
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-600 leading-relaxed font-light mb-8">
                  For any issues in utilizing our services or tracking your
                  shipment, you may contact our helpdesk:
                </p>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-8 md:p-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        Phone Support
                      </h4>
                      <a
                        href="tel:9974959693"
                        className="text-amber-600 hover:text-amber-700 font-medium text-lg"
                      >
                        +91 9974959693
                      </a>
                      <p className="text-gray-600 text-sm mt-2 font-light">
                        Available for shipping inquiries
                      </p>
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
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-black font-semibold text-lg mb-2">
                        Email Support
                      </h4>
                      <a
                        href="mailto:makwatches2303@gmail.com"
                        className="text-amber-600 hover:text-amber-700 font-medium break-all"
                      >
                        makwatches2303@gmail.com
                      </a>
                      <p className="text-gray-600 text-sm mt-2 font-light">
                        Send us your shipping queries
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-amber-200">
                    <div className="text-center">
                      <h4 className="text-black font-semibold text-lg mb-4">
                        Store Location
                      </h4>
                      <p className="text-gray-700 font-medium">
                        Shree Ganesh Watch
                        <br />
                        Matwa Street, Near Balaji Cineplex
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
