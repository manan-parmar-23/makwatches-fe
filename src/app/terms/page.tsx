"use client";

import { useEffect, useRef } from "react";

export default function TermsPage() {
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
        className="relative h-[80vh] md:h-[80vh] bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center text-white transition-all duration-1000 md:mt-20"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

        <div className="relative text-center max-w-5xl mx-auto px-6 z-10">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 backdrop-blur-sm border-2 border-amber-300/30 mb-8">
              <svg
                className="w-10 h-10 md:w-12 md:h-12 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-light mb-6 tracking-tight leading-tight">
            <span className="font-extralight text-white">Terms &</span>
            <br />
            <span className="font-normal bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
              Conditions
            </span>
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
          <p className="text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto">
            Your agreement to excellence and transparency
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
          {/* Introduction */}
          <section className="mb-16 md:mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-semibold text-lg">1</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                Definitions
              </h2>
            </div>
            <div className="pl-16">
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl font-light mb-6">
                For the purpose of these Terms and Conditions:
              </p>
              <div className="space-y-4">
                <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                  <p className="text-gray-700 font-light">
                    The terms{" "}
                    <strong className="text-black font-semibold">
                      &quot;we&quot;
                    </strong>
                    ,{" "}
                    <strong className="text-black font-semibold">
                      &quot;us&quot;
                    </strong>
                    ,{" "}
                    <strong className="text-black font-semibold">
                      &quot;our&quot;
                    </strong>{" "}
                    refer to{" "}
                    <span className="text-black font-semibold">
                      MAK WATCHES
                    </span>
                    , whose registered/operational office is at Shree Ganesh
                    Watch, Matwa Street, near Balaji Cineplex, Jetpur, Rajkot,
                    Gujarat - 360370.
                  </p>
                </div>
                <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                  <p className="text-gray-700 font-light">
                    The terms{" "}
                    <strong className="text-black font-semibold">
                      &quot;you&quot;
                    </strong>
                    ,{" "}
                    <strong className="text-black font-semibold">
                      &quot;your&quot;
                    </strong>
                    ,{" "}
                    <strong className="text-black font-semibold">
                      &quot;user&quot;
                    </strong>
                    ,{" "}
                    <strong className="text-black font-semibold">
                      &quot;visitor&quot;
                    </strong>{" "}
                    shall mean any natural or legal person who is visiting our
                    website and/or agreed to purchase from us.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Governing Terms */}
          <section className="mb-16 md:mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-semibold text-lg">2</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                Acceptance of Terms
              </h2>
            </div>
            <div className="pl-16">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-sm mb-6">
                <p className="text-gray-700 font-light m-0">
                  Your use of the website and/or purchase from us are governed
                  by the following Terms and Conditions. By accessing our
                  website or making a purchase, you acknowledge that you have
                  read, understood, and agree to be bound by these terms.
                </p>
              </div>
            </div>
          </section>

          {/* Website Content */}
          <section className="mb-16 md:mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-semibold text-lg">3</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                Website Content
              </h2>
            </div>
            <div className="pl-16">
              <p className="text-gray-600 leading-relaxed font-light mb-6">
                The content of the pages of this website is subject to change
                without notice.
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
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Warranty
                      </h3>
                      <p className="text-gray-600 text-sm font-light">
                        While we strive to ensure that all information and
                        materials on our website are accurate, up-to-date, and
                        reliable, occasional variations or updates may occur. We
                        recommend reviewing product details carefully to ensure
                        they meet your personal preferences and requirements.
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Acknowledgment
                      </h3>
                      <p className="text-gray-600 text-sm font-light">
                        You acknowledge that such information and materials may
                        contain inaccuracies or errors and we expressly exclude
                        liability for any such inaccuracies or errors to the
                        fullest extent permitted by law.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Use at Your Own Risk */}
          <section className="mb-16 md:mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-semibold text-lg">4</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                Use at Your Own Risk
              </h2>
            </div>
            <div className="pl-16">
              <div className="bg-gradient-to-br from-gray-50 to-stone-50 border-2 border-gray-200 rounded-xl p-8">
                <p className="text-gray-700 font-light mb-4">
                  Your use of any information or materials on our website and/or
                  product pages is entirely at your own risk, for which we shall
                  not be liable.
                </p>
                <p className="text-gray-600 font-light text-sm">
                  It shall be your own responsibility to ensure that any
                  products, services or information available through our
                  website and/or product pages meet your specific requirements.
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-16 md:mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-semibold text-lg">5</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                Intellectual Property
              </h2>
            </div>
            <div className="pl-16">
              <p className="text-gray-600 leading-relaxed font-light mb-6">
                Our website contains material which is owned by or licensed to
                us. This material includes, but is not limited to:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border-2 border-amber-200 rounded-lg p-4 text-center hover:border-amber-500 transition-all">
                  <p className="text-gray-700 font-medium">Design</p>
                </div>
                <div className="bg-white border-2 border-amber-200 rounded-lg p-4 text-center hover:border-amber-500 transition-all">
                  <p className="text-gray-700 font-medium">Layout</p>
                </div>
                <div className="bg-white border-2 border-amber-200 rounded-lg p-4 text-center hover:border-amber-500 transition-all">
                  <p className="text-gray-700 font-medium">Appearance</p>
                </div>
                <div className="bg-white border-2 border-amber-200 rounded-lg p-4 text-center hover:border-amber-500 transition-all">
                  <p className="text-gray-700 font-medium">Graphics</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                <p className="text-gray-700 font-light m-0">
                  <strong className="text-black font-semibold">
                    Important:
                  </strong>{" "}
                  Reproduction is prohibited other than in accordance with the
                  copyright notice, which forms part of these terms and
                  conditions. All trademarks reproduced in our website which are
                  not the property of, or licensed to, the operator are
                  acknowledged on the website.
                </p>
              </div>
            </div>
          </section>

          {/* Unauthorized Use */}
          <section className="mb-16 md:mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-semibold text-lg">6</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                Unauthorized Use
              </h2>
            </div>
            <div className="pl-16">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
                <div className="flex items-start">
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-red-900 font-semibold text-lg mb-3">
                      Legal Consequences
                    </h4>
                    <p className="text-red-800 font-light">
                      Unauthorized use of information provided by us shall give
                      rise to a claim for damages and/or be a criminal offense.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Links */}
          <section className="mb-16 md:mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-semibold text-lg">7</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                External Links
              </h2>
            </div>
            <div className="pl-16">
              <div className="space-y-6">
                <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                  <p className="text-gray-700 font-light">
                    From time to time our website may include links to other
                    websites. These links are provided for your convenience to
                    provide further information.
                  </p>
                </div>
                <div className="bg-white border-2 border-amber-200 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                  <p className="text-gray-700 font-light">
                    <strong className="text-black font-semibold">
                      Linking Policy:
                    </strong>{" "}
                    You may not create a link to our website from another
                    website or document without MAK WATCHES&apos;s prior written
                    consent.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section className="mb-16 md:mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-semibold text-lg">8</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                Governing Law & Disputes
              </h2>
            </div>
            <div className="pl-16">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-8">
                <p className="text-gray-700 font-light text-lg">
                  Any dispute arising out of use of our website and/or purchase
                  with us and/or any engagement with us is subject to the{" "}
                  <strong className="text-black font-semibold">
                    laws of India
                  </strong>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Transaction Authorization */}
          <section className="mb-16 md:mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-semibold text-lg">9</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                Payments, Security & Transaction Limits
              </h2>
            </div>
            <div className="pl-16">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Accepted Payment Methods
                  </h3>
                  <p className="text-gray-700 font-light leading-relaxed">
                    We accept payments through secure third‑party gateways such
                    as
                    <strong className="font-semibold"> Razorpay</strong>.
                    Supported methods may include UPI, major credit/debit cards,
                    netbanking, and popular wallets (availability may vary by
                    issuer and location).
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                  <p className="text-gray-700 font-light m-0">
                    Payments are processed by the payment provider on their
                    secure infrastructure.{" "}
                    <strong className="text-black font-semibold">
                      MAK WATCHES
                    </strong>
                    does not collect or store your full card details. Your use
                    of a third‑party payment method is also governed by that
                    provider’s terms and privacy policy.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Order Confirmation
                  </h3>
                  <p className="text-gray-700 font-light leading-relaxed">
                    Your order is confirmed only after we receive payment
                    authorization/confirmation from the gateway. In case a
                    payment is debited but not captured, it is usually reversed
                    automatically by your issuing bank/gateway in line with
                    their timelines.
                  </p>
                </div>

                <div className="bg-white border-2 border-amber-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Transaction Limits & Declines
                  </h3>
                  <p className="text-gray-700 font-light leading-relaxed">
                    We shall be under no liability whatsoever in respect of any
                    loss or damage arising directly or indirectly out of the
                    decline of authorization for any transaction, including
                    where the cardholder has exceeded preset limits set by the
                    bank or gateway or where risk checks fail.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-16">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-semibold text-lg">10</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-black m-0">
                Contact Information
              </h2>
            </div>
            <div className="pl-16">
              <p className="text-gray-600 leading-relaxed font-light mb-8">
                If you have any questions about these Terms & Conditions, please
                contact us:
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

      <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
    </div>
  );
}
