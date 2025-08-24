"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

// Professional footer columns with relevant links
const columns = [
  {
    title: "Home",
    links: [
      { label: "Shop All", href: "/" },
      { label: "Best Sellers", href: "/best-sellers" },
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Collections", href: "/collections" },
      { label: "Gift Cards", href: "/gift-cards" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Reviews", href: "/reviews" },
    ],
  },
  {
    title: "Service",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping Info", href: "/shipping" },
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "Order Tracking", href: "/order-tracking" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  {
    title: "Blogs",
    links: [
      { label: "Fashion Tips", href: "/blog/fashion-tips" },
      { label: "Style Guides", href: "/blog/style-guides" },
      { label: "Behind the Scenes", href: "/blog/behind-the-scenes" },
      { label: "Lookbook", href: "/blog/lookbook" },
      { label: "News", href: "/blog/news" },
    ],
  },
  {
    title: "Projects",
    links: [
      { label: "Collaborations", href: "/projects/collaborations" },
      { label: "Community", href: "/projects/community" },
      { label: "Events", href: "/projects/events" },
      { label: "Charity", href: "/projects/charity" },
      { label: "Innovation", href: "/projects/innovation" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Email Us", href: "mailto:info@pehnaw.com" },
      { label: "Instagram", href: "https://instagram.com/pehnaw" },
      { label: "Facebook", href: "https://facebook.com/pehnaw" },
      { label: "Twitter", href: "https://twitter.com/pehnaw" },
      { label: "Support", href: "/support" },
    ],
  },
];

// Link styles
const linkClass =
  "transition-colors duration-200 hover:text-primary hover:underline underline-offset-4 hover:scale-105";

// Desktop Footer
function FooterDesktop() {
  return (
    <div className="relative w-full flex justify-center items-center px-4 md:px-12 pb-6 pt-106 mb-8">
      {/* Background Image */}
      <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-[98%] h-full rounded-[2.5rem] overflow-hidden">
        <Image
          src="/footer-bg.png"
          alt="Footer Background"
          fill
          className="object-cover w-full h-full"
          priority
        />
      </div>
      {/* Footer Content */}
      <div className="relative w-full mx-auto">
        <div className="bg-white rounded-[2rem] shadow-lg px-4 md:px-10 py-16 flex flex-col items-center">
          <div className="w-full flex flex-row justify-between items-start gap-8">
            {/* First 3 columns */}
            <div className="flex flex-1 flex-row justify-start gap-10">
              {columns.slice(0, 3).map((col) => (
                <div
                  key={col.title}
                  className="flex flex-col items-start min-w-[120px]"
                >
                  <span className="font-bold text-lg text-[#531A1A] mb-2">
                    {col.title}
                  </span>
                  <ul className="space-y-1 text-[14px] text-[#531A1A] font-normal">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className={linkClass}
                          target={
                            link.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            link.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {/* Center Brand */}
            <div className="flex flex-col items-center justify-center flex-none min-w-[160px]">
              <span className="font-serif tracking-[0.2em] text-[#531A1A] font-semibold text-2xl select-none">
                PEHNAW
              </span>
            </div>
            {/* Last 3 columns */}
            <div className="flex flex-1 flex-row justify-end gap-10">
              {columns.slice(3).map((col) => (
                <div
                  key={col.title}
                  className="flex flex-col items-start min-w-[120px]"
                >
                  <span className="font-bold text-lg text-[#531A1A] mb-2">
                    {col.title}
                  </span>
                  <ul className="space-y-1 text-[14px] text-[#531A1A] font-normal">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className={linkClass}
                          target={
                            link.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            link.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          {/* Subscribe Button */}
          <div className="flex justify-center mt-8">
            <button className="border-2 border-[#531A1A] rounded-full px-10 py-2 text-[#531A1A] font-bold text-lg hover:bg-[#531A1A] hover:text-white transition-all duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Footer
function FooterMobile() {
  return (
    <div className="relative w-full flex justify-center items-center px-2 pb-6 mb-4 pt-10">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden">
        <Image
          src="/footer-bg.png"
          alt="Footer Background"
          fill
          className="object-cover w-full h-full"
          priority
        />
      </div>
      {/* Footer Content */}
      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg px-4 py-10 flex flex-col items-center">
          {/* Center Brand at Top */}
          <div className="mb-8 w-full flex justify-center">
            <span className="font-serif tracking-[0.4em] text-[#531A1A] font-semibold text-2xl select-none">
              PEHNAW
            </span>
          </div>
          {/* Modern Grid Columns */}
          <div className="w-full grid grid-cols-1 gap-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-8">
              {columns.map((col) => (
                <div key={col.title} className="flex flex-col items-start">
                  <span className="font-bold text-base text-[#531A1A] mb-2">
                    {col.title}
                  </span>
                  <ul className="space-y-1 text-[13px] text-[#531A1A] font-normal">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className={linkClass}
                          target={
                            link.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            link.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          {/* Subscribe Button */}
          <div className="flex justify-center mt-8 w-full">
            <button className="w-full border-2 border-[#531A1A] rounded-full px-8 py-2 text-[#531A1A] font-bold text-base hover:bg-[#531A1A] hover:text-white transition-all duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Footer = () => {
  const pathname = usePathname();

  // Check if current route is admin
  const isAdminRoute = pathname?.startsWith("/admin");

  // Don't render footer for admin routes
  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <div className="hidden md:block">
        <FooterDesktop />
      </div>
      <div className="block md:hidden">
        <FooterMobile />
      </div>
    </>
  );
};

export default Footer;
