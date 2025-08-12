"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Account {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch all accounts
  const fetchAccounts = async () => {
    try {
      const res = await api.get("/admin/accounts");
      // Normalize id to string if it's an object
      type MongoId = { $oid: string };
      const normalized = res.data.map(
        (acc: Account & { id: string | MongoId }) => ({
          ...acc,
          id:
            typeof acc.id === "object" && (acc.id as MongoId).$oid
              ? (acc.id as MongoId).$oid
              : acc.id,
        })
      );
      setAccounts(normalized);
    } catch (error) {
      console.error("Error fetching accounts", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete Account
  const handleDelete = async (id?: string) => {
    if (!id) {
      alert("Invalid account ID.");
      return;
    }
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/admin/accounts/${id}`);
      setAccounts(accounts.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting account", error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (loading) return <p className="p-4">Loading accounts...</p>;

  // Filter accounts by search
  const filteredAccounts = accounts.filter(
    (account) =>
      account.name.toLowerCase().includes(search.toLowerCase()) ||
      account.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#531A1A]">Search Account</h1>

      {/* Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-[#531A1A]"
        />
      </div>

      {/* Account List */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full border">
          <thead className="bg-[#531A1A] text-white">
            <tr>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Role</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account) => (
              <tr
                key={account.id ?? account.email}
                className="text-center border-b"
              >
                <td className="p-3 border">{account.name}</td>
                <td className="p-3 border">{account.email}</td>
                <td className="p-3 border capitalize">{account.role}</td>
                <td className="p-3 border flex justify-center gap-2">
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                  {!account.id && (
                    <span className="text-xs text-red-700 ml-2">No ID</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredAccounts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-gray-500">
                  No accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
