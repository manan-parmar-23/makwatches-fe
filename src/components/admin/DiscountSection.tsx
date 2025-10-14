"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TagIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const COLORS = {
  primary: "#D4AF37", // Luxury Gold
  primaryDark: "#A67C00",
  primaryLight: "#F4CD68",
  secondary: "#0F0F0F", // Rich Black
  background: "#FFFFFF",
  surface: "#F8F8F8",
  text: "#0F0F0F",
  textMuted: "#6D6D6D",
  success: "#006400",
  inputBg: "#FFFFFF",
  inputBorder: "#D4AF37",
};

interface DiscountSectionProps {
  discountType: "percentage" | "amount";
  discountPercentage?: number | null;
  discountAmount?: number | null;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  onDiscountTypeChange: (type: "percentage" | "amount") => void;
  onDiscountPercentageChange: (value: number | null) => void;
  onDiscountAmountChange: (value: number | null) => void;
  onDiscountStartDateChange: (value: string | null) => void;
  onDiscountEndDateChange: (value: string | null) => void;
  onClearDiscount: () => void;
}

export const DiscountSection: React.FC<DiscountSectionProps> = ({
  discountType,
  discountPercentage,
  discountAmount,
  discountStartDate,
  discountEndDate,
  onDiscountTypeChange,
  onDiscountPercentageChange,
  onDiscountAmountChange,
  onDiscountStartDateChange,
  onDiscountEndDateChange,
  onClearDiscount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDiscount =
    discountPercentage !== null ||
    discountAmount !== null ||
    discountStartDate !== null ||
    discountEndDate !== null;

  const formatDateForInput = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  return (
    <div
      className="rounded-lg border-2 overflow-hidden transition-all duration-300"
      style={{
        borderColor: isExpanded ? COLORS.primary : "#E5E5E5",
        backgroundColor: COLORS.surface,
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-opacity-50 transition-all duration-200"
        style={{
          backgroundColor: isExpanded
            ? COLORS.primaryLight + "20"
            : "transparent",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: COLORS.primary + "20" }}
          >
            <TagIcon className="h-5 w-5" style={{ color: COLORS.primary }} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold" style={{ color: COLORS.text }}>
                Discount Settings
              </h3>
              {hasDiscount && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: COLORS.success + "20",
                    color: COLORS.success,
                  }}
                >
                  Active
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>
              {hasDiscount
                ? "Discount configured"
                : "Optional: Add a discount to this product"}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUpIcon
            className="h-5 w-5"
            style={{ color: COLORS.textMuted }}
          />
        ) : (
          <ChevronDownIcon
            className="h-5 w-5"
            style={{ color: COLORS.textMuted }}
          />
        )}
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Discount Type Selection */}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: COLORS.text }}
                >
                  Discount Type
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onDiscountTypeChange("percentage")}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor:
                        discountType === "percentage"
                          ? COLORS.primary
                          : COLORS.surface,
                      color:
                        discountType === "percentage"
                          ? "#FFFFFF"
                          : COLORS.textMuted,
                      border: `2px solid ${
                        discountType === "percentage"
                          ? COLORS.primary
                          : "#E5E5E5"
                      }`,
                    }}
                  >
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => onDiscountTypeChange("amount")}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor:
                        discountType === "amount"
                          ? COLORS.primary
                          : COLORS.surface,
                      color:
                        discountType === "amount"
                          ? "#FFFFFF"
                          : COLORS.textMuted,
                      border: `2px solid ${
                        discountType === "amount" ? COLORS.primary : "#E5E5E5"
                      }`,
                    }}
                  >
                    Fixed Amount (₹)
                  </button>
                </div>
              </div>

              {/* Discount Value Input */}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium flex items-center gap-2"
                  style={{ color: COLORS.text }}
                >
                  <SparklesIcon
                    className="h-4 w-4"
                    style={{ color: COLORS.primary }}
                  />
                  {discountType === "percentage"
                    ? "Discount Percentage"
                    : "Discount Amount"}
                </label>
                {discountType === "percentage" ? (
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={discountPercentage ?? ""}
                      onChange={(e) =>
                        onDiscountPercentageChange(
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      placeholder="e.g., 20"
                      className="w-full px-4 py-2.5 pr-10 rounded-lg border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: "#E5E5E5",
                        color: COLORS.text,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = COLORS.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${COLORS.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#E5E5E5";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium"
                      style={{ color: COLORS.textMuted }}
                    >
                      %
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
                      style={{ color: COLORS.textMuted }}
                    >
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discountAmount ?? ""}
                      onChange={(e) =>
                        onDiscountAmountChange(
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      placeholder="e.g., 500"
                      className="w-full px-4 pl-8 py-2.5 rounded-lg border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: "#E5E5E5",
                        color: COLORS.text,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = COLORS.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${COLORS.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#E5E5E5";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium flex items-center gap-2"
                    style={{ color: COLORS.text }}
                  >
                    <CalendarIcon
                      className="h-4 w-4"
                      style={{ color: COLORS.primary }}
                    />
                    Start Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formatDateForInput(discountStartDate)}
                    onChange={(e) =>
                      onDiscountStartDateChange(
                        e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null
                      )
                    }
                    className="w-full px-4 py-2.5 rounded-lg border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: COLORS.inputBg,
                      borderColor: "#E5E5E5",
                      color: COLORS.text,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = COLORS.primary;
                      e.target.style.boxShadow = `0 0 0 3px ${COLORS.primary}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#E5E5E5";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium flex items-center gap-2"
                    style={{ color: COLORS.text }}
                  >
                    <CalendarIcon
                      className="h-4 w-4"
                      style={{ color: COLORS.primary }}
                    />
                    End Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formatDateForInput(discountEndDate)}
                    onChange={(e) =>
                      onDiscountEndDateChange(
                        e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null
                      )
                    }
                    className="w-full px-4 py-2.5 rounded-lg border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: COLORS.inputBg,
                      borderColor: "#E5E5E5",
                      color: COLORS.text,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = COLORS.primary;
                      e.target.style.boxShadow = `0 0 0 3px ${COLORS.primary}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#E5E5E5";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Clear Button */}
              {hasDiscount && (
                <button
                  type="button"
                  onClick={onClearDiscount}
                  className="w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: "#FEE",
                    color: "#B00020",
                    border: "2px solid #FCC",
                  }}
                >
                  Clear Discount
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
