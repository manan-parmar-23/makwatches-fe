"use client";

import { useEffect, useRef } from "react";

export default function RefundPage() {
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-light mb-6 tracking-tight leading-tight">
            <span className="font-extralight text-white">Cancellation</span>
            <br />
            <span className="font-normal bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
              & Refund
            </span>
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
          <p className="text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto">
            Your satisfaction is our commitment
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
                  Our Commitment
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-700 leading-relaxed text-lg md:text-xl font-light mb-6">
                  <span className="text-black font-semibold">MAK WATCHES</span>{" "}
                  believes in helping its customers as far as possible, and has
                  therefore a liberal cancellation policy.
                </p>
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-sm">
                  <p className="text-gray-700 font-light m-0">
                    We strive to provide maximum flexibility while ensuring fair
                    business practices. Your satisfaction is our top priority.
                  </p>
                </div>
              </div>
            </section>

            {/* Cancellation Policy */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">2</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  Cancellation Policy
                </h2>
              </div>
              <div className="pl-16">
                {/* Timeframe */}
                <div className="mb-10">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-green-900 font-semibold text-xl mb-1">
                          3-5 Days Window
                        </h4>
                        <p className="text-green-700 font-light text-sm">
                          Cancellation timeframe from order placement
                        </p>
                      </div>
                    </div>
                    <p className="text-green-800 font-light">
                      Cancellations will be considered only if the request is
                      made within{" "}
                      <strong className="font-semibold">3-5 days</strong> of
                      placing the order.
                    </p>
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
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-black font-semibold text-lg mb-2">
                          Important Notice
                        </h4>
                        <p className="text-gray-700 font-light">
                          The cancellation request may not be entertained if the
                          orders have been communicated to the vendors/merchants
                          and they have initiated the process of shipping them.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Non-Cancellable Items
                <div className="mb-8">
                  <h3 className="text-xl md:text-2xl font-medium text-black mb-6">
                    Non-Cancellable Items
                  </h3>
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
                    <div className="flex items-start mb-6">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4 flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-red-900 font-semibold text-lg mb-3">
                          Cancellation Not Accepted
                        </h4>
                        <p className="text-red-800 font-light mb-4">
                          MAK WATCHES does not accept cancellation requests for
                          perishable items such as:
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-16">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                        <span className="text-red-800 font-light">Flowers</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                        <span className="text-red-800 font-light">
                          Eatables
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                        <span className="text-red-800 font-light">
                          Perishable goods
                        </span>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </section>

            {/* Refund/Replacement Policy */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">3</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  Refund & Replacement
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-600 leading-relaxed font-light mb-8">
                  We ensure quality products, but in certain circumstances,
                  refunds or replacements may be provided.
                </p>

                {/* Quality Issues */}
                <div className="mb-10">
                  <h3 className="text-xl md:text-2xl font-medium text-black mb-6">
                    Quality-Related Refunds
                  </h3>
                  <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300 mb-4">
                    <p className="text-gray-700 font-light">
                      Refund/replacement can be made if the customer establishes
                      that the quality of product delivered is not good.
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                    <p className="text-gray-700 font-light">
                      <strong className="text-black font-semibold">
                        Note:
                      </strong>{" "}
                      This applies even to perishable items where quality
                      standards are not met.
                    </p>
                  </div>
                </div>

                {/* Damaged or Defective */}
                <div className="mb-10">
                  <h3 className="text-xl md:text-2xl font-medium text-black mb-6">
                    Damaged or Defective Items
                  </h3>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-8 mb-6">
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-blue-900 font-semibold text-lg mb-2">
                          Report Within 3-5 Days
                        </h4>
                        <p className="text-blue-800 font-light mb-3">
                          In case of received of damaged or defective items,
                          please report the same to our Customer Service team.
                        </p>
                        <p className="text-blue-700 font-light text-sm">
                          This should be reported within{" "}
                          <strong className="font-semibold">3-5 days</strong> of
                          received of the products.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                          <span className="text-white text-sm font-semibold">
                            1
                          </span>
                        </div>
                        <p className="text-gray-700 font-light">
                          Contact our Customer Service team immediately upon
                          discovering the issue
                        </p>
                      </div>
                    </div>
                    <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                          <span className="text-white text-sm font-semibold">
                            2
                          </span>
                        </div>
                        <p className="text-gray-700 font-light">
                          The merchant will check and determine the issue at
                          their end before processing the request
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Not as Expected */}
                <div className="mb-8">
                  <h3 className="text-xl md:text-2xl font-medium text-black mb-6">
                    Product Not as Expected
                  </h3>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8">
                    <p className="text-purple-900 font-light mb-4">
                      In case you feel that the product received is not as shown
                      on the site or as per your expectations, you must bring it
                      to the notice of our customer service within{" "}
                      <strong className="font-semibold">3-5 days</strong> of
                      receiving the product.
                    </p>
                    <div className="bg-white/70 rounded-lg p-4 border border-purple-200">
                      <p className="text-purple-800 font-light text-sm">
                        The Customer Service Team after looking into your
                        complaint will take an appropriate decision.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Warranty Items */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">4</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  Manufacturer Warranty
                </h2>
              </div>
              <div className="pl-16">
                <div className="bg-gradient-to-br from-gray-50 to-stone-50 border-2 border-gray-200 rounded-xl p-8">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4 flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-gray-600"
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
                      <h4 className="text-gray-900 font-semibold text-lg mb-3">
                        Products with Manufacturer Warranty
                      </h4>
                      <p className="text-gray-700 font-light">
                        In case of complaints regarding products that come with
                        a warranty from manufacturers, please refer the issue to
                        them directly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Refund Processing */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">5</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  Refund Processing Time
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-600 leading-relaxed font-light mb-8">
                  Once your refund is approved by MAK WATCHES, we process it as
                  quickly as possible.
                </p>

                <div className="bg-gradient-to-br from-amber-900 to-yellow-900 text-white rounded-xl p-8 mb-6">
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
                      For refund to be processed to the end customer
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-6 rounded-r-lg space-y-4">
                  <p className="text-gray-700 font-light">
                    <strong className="text-black font-semibold">
                      Please Note:
                    </strong>
                    In case of any refunds approved by MAK WATCHES, it will take
                    <strong className="font-semibold"> 6-8 days</strong> for the
                    refund to be processed to the end customer. The actual
                    credit to your account may take additional time depending on
                    your bank or payment provider.
                  </p>
                  <p className="text-gray-700 font-light">
                    If you paid using a third‑party payment gateway such as
                    <strong className="font-semibold"> Razorpay</strong>, the
                    refund will be routed back via the same method, subject to
                    the gateway/bank’s policies and timelines. We do not issue
                    cash refunds for online payments.
                  </p>
                </div>
              </div>
            </section>

            {/* How to Request */}
            <section className="mb-16 md:mb-20">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-semibold text-lg">6</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                  How to Request Cancellation or Refund
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
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-black font-semibold text-lg mb-2">
                          Email Us
                        </h4>
                        <p className="text-gray-600 text-sm font-light mb-2">
                          Send your request with order details
                        </p>
                        <a
                          href="mailto:makwatches2303@gmail.com"
                          className="text-amber-600 hover:text-amber-700 font-medium text-sm break-all underline"
                        >
                          makwatches2303@gmail.com
                        </a>
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-black font-semibold text-lg mb-2">
                          Call Us
                        </h4>
                        <p className="text-gray-600 text-sm font-light mb-2">
                          Speak directly with our team
                        </p>
                        <a
                          href="tel:9974959693"
                          className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                        >
                          +91 9974959693
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-white border-2 border-amber-200 rounded-lg p-6">
                  <h4 className="text-black font-semibold text-lg mb-4">
                    Information to Include
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                      <span className="text-gray-700 font-light">
                        Order number and date
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                      <span className="text-gray-700 font-light">
                        Product details
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                      <span className="text-gray-700 font-light">
                        Reason for cancellation or refund
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                      <span className="text-gray-700 font-light">
                        Photos (if applicable for damaged items)
                      </span>
                    </div>
                  </div>
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
                  Contact Customer Service
                </h2>
              </div>
              <div className="pl-16">
                <p className="text-gray-600 leading-relaxed font-light mb-8">
                  Our customer service team is here to assist you with any
                  cancellation or refund requests.
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
