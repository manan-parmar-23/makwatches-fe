import React from "react";
import { motion } from "framer-motion";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({
  children,
  className = "",
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-white text-primary ${className}`}>
      {children}
    </div>
  );
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

export function PageHero({
  title,
  subtitle,
  description,
  className = "",
}: PageHeroProps) {
  return (
    <section
      className={`relative py-20 md:py-32 bg-gradient-to-br from-gray-50 to-white ${className}`}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 tracking-tight"
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl md:text-2xl text-accent font-medium mb-6"
            >
              {subtitle}
            </motion.h2>
          )}

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto"
            >
              {description}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/2 left-4 w-1 h-16 bg-accent/20 rounded-full" />
      <div className="absolute top-1/2 right-4 w-1 h-16 bg-accent/20 rounded-full" />
    </section>
  );
}

interface ContentSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentSection({
  children,
  className = "",
}: ContentSectionProps) {
  return (
    <section className={`py-16 md:py-24 ${className}`}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">{children}</div>
    </section>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-white border border-gray-200 rounded-xl p-6 md:p-8
        ${
          hover
            ? "hover:shadow-lg hover:border-accent/30 transition-all duration-300"
            : ""
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary/50",
    secondary: "bg-accent text-white hover:bg-accent-dark focus:ring-accent/50",
    outline:
      "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/50",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
