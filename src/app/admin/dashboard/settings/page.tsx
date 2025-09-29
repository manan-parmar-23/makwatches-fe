"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  WrenchScrewdriverIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  TruckIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

// Enhanced Color constants - luxury theme with rich black and gold
const COLORS = {
  primary: "#D4AF37", // Luxury Gold
  primaryDark: "#A67C00", // Darker Gold
  primaryLight: "#F4CD68", // Lighter Gold
  secondary: "#0F0F0F", // Rich Black
  background: "#FFFFFF", // White
  surface: "#F8F8F8", // Off-White
  surfaceLight: "#F0F0F0", // Light Gray
  text: "#0F0F0F", // Rich Black for text
  textMuted: "#6D6D6D", // Muted Gray
  error: "#B00020", // Deep Red
  success: "#006400", // Deep Green
  inputBg: "#FFFFFF", // White
  inputBorder: "#D4AF37", // Gold for borders
  inputFocus: "#A67C00", // Darker Gold for focus
};

// Interface for settings
interface ShippingMethod {
  name: string;
  description: string;
  cost: number;
  enabled: boolean;
}

interface PaymentGateway {
  name: string;
  description: string;
  enabled: boolean;
}

interface SocialMedia {
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
}

interface Settings {
  id?: string;
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  logo: string;
  currency: string;
  taxRate: number;
  shippingMethods: ShippingMethod[];
  paymentGateways: PaymentGateway[];
  socialMedia: SocialMedia;
  privacyPolicy: string;
  termsOfService: string;
  refundPolicy: string;
  enableRegistration: boolean;
  maintenanceMode: boolean;
}

// Settings tabs
const tabs = [
  { id: "general", name: "General", icon: WrenchScrewdriverIcon },
  { id: "store", name: "Store Info", icon: GlobeAltIcon },
  { id: "financial", name: "Financial", icon: CurrencyDollarIcon },
  { id: "shipping", name: "Shipping", icon: TruckIcon },
  { id: "payment", name: "Payment", icon: CreditCardIcon },
  { id: "legal", name: "Legal", icon: DocumentTextIcon },
  { id: "social", name: "Social Media", icon: UserGroupIcon },
  { id: "security", name: "Security", icon: ShieldCheckIcon },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    storeName: "Pehnaw",
    storeDescription: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    logo: "",
    currency: "INR",
    taxRate: 18,
    shippingMethods: [],
    paymentGateways: [],
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
    },
    privacyPolicy: "",
    termsOfService: "",
    refundPolicy: "",
    enableRegistration: true,
    maintenanceMode: false,
  });

  // For new shipping method
  const [newShippingMethod, setNewShippingMethod] = useState<ShippingMethod>({
    name: "",
    description: "",
    cost: 0,
    enabled: true,
  });

  // For new payment gateway
  const [newPaymentGateway, setNewPaymentGateway] = useState<PaymentGateway>({
    name: "",
    description: "",
    enabled: true,
  });

  // Fetch settings on load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // Adjust the URL path since baseURL includes '/api' already
        const response = await api.get("admin/settings");
        if (response.data.success) {
          setSettings(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await api.put("admin/settings", settings);
      if (response.data.success) {
        toast.success("Settings saved successfully");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Upload logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await api.post("admin/settings/logo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setSettings({
          ...settings,
          logo: response.data.data.logo,
        });
        toast.success("Logo uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    }
  };

  // Add new shipping method
  const addShippingMethod = () => {
    if (newShippingMethod.name && newShippingMethod.description) {
      setSettings({
        ...settings,
        shippingMethods: [...settings.shippingMethods, newShippingMethod],
      });
      setNewShippingMethod({
        name: "",
        description: "",
        cost: 0,
        enabled: true,
      });
    } else {
      toast.error("Please fill in all shipping method fields");
    }
  };

  // Remove shipping method
  const removeShippingMethod = (index: number) => {
    const updatedMethods = [...settings.shippingMethods];
    updatedMethods.splice(index, 1);
    setSettings({
      ...settings,
      shippingMethods: updatedMethods,
    });
  };

  // Add new payment gateway
  const addPaymentGateway = () => {
    if (newPaymentGateway.name && newPaymentGateway.description) {
      setSettings({
        ...settings,
        paymentGateways: [...settings.paymentGateways, newPaymentGateway],
      });
      setNewPaymentGateway({
        name: "",
        description: "",
        enabled: true,
      });
    } else {
      toast.error("Please fill in all payment gateway fields");
    }
  };

  // Remove payment gateway
  const removePaymentGateway = (index: number) => {
    const updatedGateways = [...settings.paymentGateways];
    updatedGateways.splice(index, 1);
    setSettings({
      ...settings,
      paymentGateways: updatedGateways,
    });
  };

  // Toggle shipping method enabled
  const toggleShippingMethod = (index: number) => {
    const updatedMethods = [...settings.shippingMethods];
    updatedMethods[index].enabled = !updatedMethods[index].enabled;
    setSettings({
      ...settings,
      shippingMethods: updatedMethods,
    });
  };

  // Toggle payment gateway enabled
  const togglePaymentGateway = (index: number) => {
    const updatedGateways = [...settings.paymentGateways];
    updatedGateways[index].enabled = !updatedGateways[index].enabled;
    setSettings({
      ...settings,
      paymentGateways: updatedGateways,
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center py-12">
        <div
          className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2"
          style={{ borderColor: COLORS.primary }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-18">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>
          System Settings
        </h1>
        <p className="text-sm" style={{ color: COLORS.textMuted }}>
          Configure your store settings and preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab navigation */}
        <div className="md:w-60 shrink-0">
          <div
            className="sticky top-24 p-4 rounded-lg shadow-sm"
            style={{ backgroundColor: COLORS.background }}
          >
            <nav className="flex flex-col space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id ? "shadow-sm" : ""
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === tab.id
                        ? `${COLORS.primary}15`
                        : "transparent",
                    color: activeTab === tab.id ? COLORS.primary : COLORS.text,
                  }}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <div
            className="p-6 rounded-lg shadow-sm"
            style={{ backgroundColor: COLORS.background }}
          >
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2
                  className="text-lg font-bold border-b pb-2"
                  style={{
                    color: COLORS.primary,
                    borderColor: COLORS.surfaceLight,
                  }}
                >
                  General Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      Store Logo
                    </label>
                    <div className="flex items-end gap-4">
                      {settings.logo ? (
                        <div
                          className="relative w-32 h-32 border rounded-lg overflow-hidden"
                          style={{ borderColor: COLORS.surfaceLight }}
                        >
                          <Image
                            src={
                              settings.logo.startsWith("http")
                                ? settings.logo
                                : `${process.env.NEXT_PUBLIC_API_BASE_URL}${settings.logo}`
                            }
                            alt="Store Logo"
                            fill
                            sizes="128px"
                            className="object-cover"
                          />
                          <button
                            onClick={() =>
                              setSettings({ ...settings, logo: "" })
                            }
                            className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center z-10"
                            style={{ backgroundColor: `${COLORS.error}90` }}
                          >
                            <span className="text-white text-xs">✕</span>
                          </button>
                        </div>
                      ) : (
                        <div
                          className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center"
                          style={{ borderColor: COLORS.surfaceLight }}
                        >
                          <span
                            className="text-sm text-center"
                            style={{ color: COLORS.textMuted }}
                          >
                            No logo uploaded
                          </span>
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          id="logo"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                        <label
                          htmlFor="logo"
                          className="inline-block px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
                          style={{
                            backgroundColor: `${COLORS.primary}15`,
                            color: COLORS.primary,
                          }}
                        >
                          Upload Logo
                        </label>
                        <p
                          className="mt-1 text-xs"
                          style={{ color: COLORS.textMuted }}
                        >
                          Recommended: 200x200px, PNG or JPG
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-col gap-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-1"
                          style={{ color: COLORS.text }}
                        >
                          Maintenance Mode
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={settings.maintenanceMode}
                              onChange={() =>
                                setSettings({
                                  ...settings,
                                  maintenanceMode: !settings.maintenanceMode,
                                })
                              }
                            />
                            <div
                              className={`relative w-11 h-6 rounded-full transition-colors ${
                                settings.maintenanceMode
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <div
                                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                  settings.maintenanceMode
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                }`}
                              />
                            </div>
                            <span
                              className="ml-2 text-sm"
                              style={{ color: COLORS.text }}
                            >
                              {settings.maintenanceMode
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          </label>
                        </div>
                        <p
                          className="text-xs mt-1"
                          style={{ color: COLORS.textMuted }}
                        >
                          When enabled, the store will show a maintenance page
                          to visitors
                        </p>
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-1"
                          style={{ color: COLORS.text }}
                        >
                          Allow User Registration
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={settings.enableRegistration}
                              onChange={() =>
                                setSettings({
                                  ...settings,
                                  enableRegistration:
                                    !settings.enableRegistration,
                                })
                              }
                            />
                            <div
                              className={`relative w-11 h-6 rounded-full transition-colors ${
                                settings.enableRegistration
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <div
                                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                  settings.enableRegistration
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                }`}
                              />
                            </div>
                            <span
                              className="ml-2 text-sm"
                              style={{ color: COLORS.text }}
                            >
                              {settings.enableRegistration
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          </label>
                        </div>
                        <p
                          className="text-xs mt-1"
                          style={{ color: COLORS.textMuted }}
                        >
                          When disabled, new users cannot register on the store
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Store Information */}
            {activeTab === "store" && (
              <div className="space-y-6">
                <h2
                  className="text-lg font-bold border-b pb-2"
                  style={{
                    color: COLORS.primary,
                    borderColor: COLORS.surfaceLight,
                  }}
                >
                  Store Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) =>
                        setSettings({ ...settings, storeName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-md border focus:outline-none"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: COLORS.inputBorder,
                        color: COLORS.text,
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contactEmail: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-md border focus:outline-none"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: COLORS.inputBorder,
                        color: COLORS.text,
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={settings.contactPhone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contactPhone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-md border focus:outline-none"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: COLORS.inputBorder,
                        color: COLORS.text,
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      Store Description
                    </label>
                    <textarea
                      value={settings.storeDescription}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          storeDescription: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border focus:outline-none"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: COLORS.inputBorder,
                        color: COLORS.text,
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      Store Address
                    </label>
                    <textarea
                      value={settings.address}
                      onChange={(e) =>
                        setSettings({ ...settings, address: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border focus:outline-none"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: COLORS.inputBorder,
                        color: COLORS.text,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Financial Settings */}
            {activeTab === "financial" && (
              <div className="space-y-6">
                <h2
                  className="text-lg font-bold border-b pb-2"
                  style={{
                    color: COLORS.primary,
                    borderColor: COLORS.surfaceLight,
                  }}
                >
                  Financial Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) =>
                        setSettings({ ...settings, currency: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-md border focus:outline-none"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: COLORS.inputBorder,
                        color: COLORS.text,
                      }}
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.taxRate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          taxRate: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-md border focus:outline-none"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: COLORS.inputBorder,
                        color: COLORS.text,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Settings */}
            {activeTab === "shipping" && (
              <div className="space-y-6">
                <h2
                  className="text-lg font-bold border-b pb-2"
                  style={{
                    color: COLORS.primary,
                    borderColor: COLORS.surfaceLight,
                  }}
                >
                  Shipping Methods
                </h2>

                <div className="space-y-4">
                  {/* Existing shipping methods */}
                  {settings.shippingMethods.map((method, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border"
                      style={{
                        borderColor: COLORS.surfaceLight,
                        backgroundColor: COLORS.surface,
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              className="font-medium"
                              style={{ color: COLORS.text }}
                            >
                              {method.name}
                            </h3>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                method.enabled
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-50 text-gray-500"
                              }`}
                            >
                              {method.enabled ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                          <p
                            className="text-sm"
                            style={{ color: COLORS.textMuted }}
                          >
                            {method.description}
                          </p>
                          <p
                            className="text-sm font-medium mt-1"
                            style={{ color: COLORS.primary }}
                          >
                            Cost:{" "}
                            {settings.currency === "INR"
                              ? "₹"
                              : settings.currency === "USD"
                              ? "$"
                              : settings.currency}
                            {method.cost.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleShippingMethod(index)}
                            className="p-1.5 rounded-md"
                            style={{
                              backgroundColor: method.enabled
                                ? `${COLORS.error}15`
                                : `${COLORS.primary}15`,
                              color: method.enabled
                                ? COLORS.error
                                : COLORS.primary,
                            }}
                          >
                            {method.enabled ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => removeShippingMethod(index)}
                            className="p-1.5 rounded-md text-white"
                            style={{ backgroundColor: COLORS.error }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add new shipping method */}
                  <div
                    className="mt-4 p-4 rounded-lg border"
                    style={{ borderColor: COLORS.surfaceLight }}
                  >
                    <h3
                      className="font-medium mb-4"
                      style={{ color: COLORS.primary }}
                    >
                      Add New Shipping Method
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-1"
                          style={{ color: COLORS.text }}
                        >
                          Method Name
                        </label>
                        <input
                          type="text"
                          value={newShippingMethod.name}
                          onChange={(e) =>
                            setNewShippingMethod({
                              ...newShippingMethod,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-md border focus:outline-none"
                          style={{
                            backgroundColor: COLORS.inputBg,
                            borderColor: COLORS.inputBorder,
                            color: COLORS.text,
                          }}
                          placeholder="e.g. Standard Shipping"
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-1"
                          style={{ color: COLORS.text }}
                        >
                          Cost
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newShippingMethod.cost}
                          onChange={(e) =>
                            setNewShippingMethod({
                              ...newShippingMethod,
                              cost: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 rounded-md border focus:outline-none"
                          style={{
                            backgroundColor: COLORS.inputBg,
                            borderColor: COLORS.inputBorder,
                            color: COLORS.text,
                          }}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label
                          className="block text-sm font-medium mb-1"
                          style={{ color: COLORS.text }}
                        >
                          Description
                        </label>
                        <input
                          type="text"
                          value={newShippingMethod.description}
                          onChange={(e) =>
                            setNewShippingMethod({
                              ...newShippingMethod,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-md border focus:outline-none"
                          style={{
                            backgroundColor: COLORS.inputBg,
                            borderColor: COLORS.inputBorder,
                            color: COLORS.text,
                          }}
                          placeholder="e.g. Delivery within 3-5 business days"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={addShippingMethod}
                        className="px-4 py-2 rounded-md text-white"
                        style={{ backgroundColor: COLORS.primary }}
                      >
                        Add Shipping Method
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <h2
                  className="text-lg font-bold border-b pb-2"
                  style={{
                    color: COLORS.primary,
                    borderColor: COLORS.surfaceLight,
                  }}
                >
                  Payment Gateways
                </h2>

                <div className="space-y-4">
                  {/* Existing payment gateways */}
                  {settings.paymentGateways.map((gateway, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border"
                      style={{
                        borderColor: COLORS.surfaceLight,
                        backgroundColor: COLORS.surface,
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              className="font-medium"
                              style={{ color: COLORS.text }}
                            >
                              {gateway.name}
                            </h3>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                gateway.enabled
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-50 text-gray-500"
                              }`}
                            >
                              {gateway.enabled ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                          <p
                            className="text-sm"
                            style={{ color: COLORS.textMuted }}
                          >
                            {gateway.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => togglePaymentGateway(index)}
                            className="p-1.5 rounded-md"
                            style={{
                              backgroundColor: gateway.enabled
                                ? `${COLORS.error}15`
                                : `${COLORS.primary}15`,
                              color: gateway.enabled
                                ? COLORS.error
                                : COLORS.primary,
                            }}
                          >
                            {gateway.enabled ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => removePaymentGateway(index)}
                            className="p-1.5 rounded-md text-white"
                            style={{ backgroundColor: COLORS.error }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add new payment gateway */}
                  <div
                    className="mt-4 p-4 rounded-lg border"
                    style={{ borderColor: COLORS.surfaceLight }}
                  >
                    <h3
                      className="font-medium mb-4"
                      style={{ color: COLORS.primary }}
                    >
                      Add New Payment Gateway
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-1"
                          style={{ color: COLORS.text }}
                        >
                          Gateway Name
                        </label>
                        <input
                          type="text"
                          value={newPaymentGateway.name}
                          onChange={(e) =>
                            setNewPaymentGateway({
                              ...newPaymentGateway,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-md border focus:outline-none"
                          style={{
                            backgroundColor: COLORS.inputBg,
                            borderColor: COLORS.inputBorder,
                            color: COLORS.text,
                          }}
                          placeholder="e.g. Credit Card"
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-1"
                          style={{ color: COLORS.text }}
                        >
                          Description
                        </label>
                        <input
                          type="text"
                          value={newPaymentGateway.description}
                          onChange={(e) =>
                            setNewPaymentGateway({
                              ...newPaymentGateway,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-md border focus:outline-none"
                          style={{
                            backgroundColor: COLORS.inputBg,
                            borderColor: COLORS.inputBorder,
                            color: COLORS.text,
                          }}
                          placeholder="e.g. Pay with Visa, MasterCard, etc."
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={addPaymentGateway}
                        className="px-4 py-2 rounded-md text-white"
                        style={{ backgroundColor: COLORS.primary }}
                      >
                        Add Payment Gateway
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legal Documents */}
            {activeTab === "legal" && (
              <div className="space-y-6">
                <h2
                  className="text-lg font-bold border-b pb-2"
                  style={{
                    color: COLORS.primary,
                    borderColor: COLORS.surfaceLight,
                  }}
                >
                  Legal Documents
                </h2>

                <div className="space-y-6">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      Terms of Service
                    </label>
                    <textarea
                      value={settings.termsOfService}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          termsOfService: e.target.value,
                        })
                      }
                      rows={6}
                      className="w-full px-3 py-2 rounded-md border focus:outline-none"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: COLORS.inputBorder,
                        color: COLORS.text,
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      Privacy Policy
                    </label>
                    <textarea
                      value={settings.privacyPolicy}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          privacyPolicy: e.target.value,
                        })
                      }
                      rows={6}
                      className="w-full px-3 py-2 rounded-md border focus:outline-none"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: COLORS.inputBorder,
                        color: COLORS.text,
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      Refund Policy
                    </label>
                    <textarea
                      value={settings.refundPolicy}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          refundPolicy: e.target.value,
                        })
                      }
                      rows={6}
                      className="w-full px-3 py-2 rounded-md border focus:outline-none"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: COLORS.inputBorder,
                        color: COLORS.text,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Social Media Settings */}
            {activeTab === "social" && (
              <div className="space-y-6">
                <h2
                  className="text-lg font-bold border-b pb-2"
                  style={{
                    color: COLORS.primary,
                    borderColor: COLORS.surfaceLight,
                  }}
                >
                  Social Media
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={settings.socialMedia.facebook}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialMedia: {
                            ...settings.socialMedia,
                            facebook: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-md border focus:outline-none"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: COLORS.inputBorder,
                        color: COLORS.text,
                      }}
                      placeholder="https://facebook.com/your-page"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={settings.socialMedia.instagram}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialMedia: {
                            ...settings.socialMedia,
                            instagram: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-md border focus:outline-none"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: COLORS.inputBorder,
                        color: COLORS.text,
                      }}
                      placeholder="https://instagram.com/your-handle"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      Twitter / X
                    </label>
                    <input
                      type="url"
                      value={settings.socialMedia.twitter}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialMedia: {
                            ...settings.socialMedia,
                            twitter: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-md border focus:outline-none"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: COLORS.inputBorder,
                        color: COLORS.text,
                      }}
                      placeholder="https://twitter.com/your-handle"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={settings.socialMedia.linkedin}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialMedia: {
                            ...settings.socialMedia,
                            linkedin: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-md border focus:outline-none"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: COLORS.inputBorder,
                        color: COLORS.text,
                      }}
                      placeholder="https://linkedin.com/company/your-company"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: COLORS.text }}
                    >
                      YouTube
                    </label>
                    <input
                      type="url"
                      value={settings.socialMedia.youtube}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialMedia: {
                            ...settings.socialMedia,
                            youtube: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-md border focus:outline-none"
                      style={{
                        backgroundColor: COLORS.inputBg,
                        borderColor: COLORS.inputBorder,
                        color: COLORS.text,
                      }}
                      placeholder="https://youtube.com/c/your-channel"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2
                  className="text-lg font-bold border-b pb-2"
                  style={{
                    color: COLORS.primary,
                    borderColor: COLORS.surfaceLight,
                  }}
                >
                  Security Settings
                </h2>

                <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                  <div className="flex items-start gap-3">
                    <div className="text-amber-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-amber-800">
                        Security Settings
                      </h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Security-related settings such as password policies,
                        login restrictions, and two-factor authentication can be
                        configured here. Additional security features like API
                        key management and webhook settings will be available in
                        future updates.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-4 text-center text-sm"
                  style={{ color: COLORS.textMuted }}
                >
                  Advanced security settings will be available in future
                  updates.
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-2 rounded-md text-white font-medium"
                style={{
                  backgroundColor: saving
                    ? `${COLORS.primary}80`
                    : COLORS.primary,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
