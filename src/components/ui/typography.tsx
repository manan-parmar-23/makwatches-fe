import React from "react";
import { motion } from "framer-motion";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function Heading1({
  children,
  className = "",
  animate = false,
}: TypographyProps) {
  const Component = animate ? motion.h1 : "h1";
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
      }
    : {};

  return (
    <Component
      className={`text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 tracking-tight ${className}`}
      {...animationProps}
    >
      {children}
    </Component>
  );
}

export function Heading2({
  children,
  className = "",
  animate = false,
}: TypographyProps) {
  const Component = animate ? motion.h2 : "h2";
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.1 },
      }
    : {};

  return (
    <Component
      className={`text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 tracking-tight ${className}`}
      {...animationProps}
    >
      {children}
    </Component>
  );
}

export function Heading3({
  children,
  className = "",
  animate = false,
}: TypographyProps) {
  const Component = animate ? motion.h3 : "h3";
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.2 },
      }
    : {};

  return (
    <Component
      className={`text-2xl md:text-3xl font-bold text-primary mb-4 ${className}`}
      {...animationProps}
    >
      {children}
    </Component>
  );
}

export function Heading4({
  children,
  className = "",
  animate = false,
}: TypographyProps) {
  const Component = animate ? motion.h4 : "h4";
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.3 },
      }
    : {};

  return (
    <Component
      className={`text-xl md:text-2xl font-semibold text-primary mb-3 ${className}`}
      {...animationProps}
    >
      {children}
    </Component>
  );
}

export function BodyLarge({
  children,
  className = "",
  animate = false,
}: TypographyProps) {
  const Component = animate ? motion.p : "p";
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.4 },
      }
    : {};

  return (
    <Component
      className={`text-lg md:text-xl text-gray-600 leading-relaxed mb-4 ${className}`}
      {...animationProps}
    >
      {children}
    </Component>
  );
}

export function BodyText({
  children,
  className = "",
  animate = false,
}: TypographyProps) {
  const Component = animate ? motion.p : "p";
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.5 },
      }
    : {};

  return (
    <Component
      className={`text-base text-gray-700 leading-relaxed mb-4 ${className}`}
      {...animationProps}
    >
      {children}
    </Component>
  );
}

export function SmallText({
  children,
  className = "",
  animate = false,
}: TypographyProps) {
  const Component = animate ? motion.p : "p";
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.6 },
      }
    : {};

  return (
    <Component
      className={`text-sm text-gray-500 ${className}`}
      {...animationProps}
    >
      {children}
    </Component>
  );
}

export function GoldText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`text-accent font-medium ${className}`}>{children}</span>
  );
}

export function GradientText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
}
