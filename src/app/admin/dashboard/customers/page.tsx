"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Account {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  // Remove form state for Add Account
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Fetch all accounts
  const fetchAccounts = async () => {
    try {
      const res = await api.get("/admin/accounts"); // updated endpoint
      setAccounts(res.data);
    } catch (error) {
      console.error("Error fetching accounts", error);
    } finally {
      setLoading(false);
    }
  };

  // Only keep update logic (edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    try {
      await api.put(`/admin/accounts/${editId}`, {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      });
      setEditId(null);
      fetchAccounts();
    } catch (error) {
      console.error("Error updating account", error);
    }
  };

  // Delete Account
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/admin/accounts/${id}`); // updated endpoint
      setAccounts(accounts.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Error deleting account", error);
    }
  };

  // Edit Account
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "customer",
  });
  const handleEdit = (account: Account) => {
    setEditForm({
      name: account.name,
      email: account.email,
      role: account.role,
    });
    setEditId(account._id);
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

      {/* Edit Account Form (only shown when editing) */}
      {editId && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-white shadow-md p-4 rounded-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="border p-2 rounded"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              className="border p-2 rounded"
              required
            />
            <select
              value={editForm.role}
              onChange={(e) =>
                setEditForm({ ...editForm, role: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-4 bg-[#531A1A] text-white px-4 py-2 rounded hover:bg-red-900 transition"
          >
            Update Account
          </button>
          <button
            type="button"
            className="mt-4 ml-2 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
            onClick={() => setEditId(null)}
          >
            Cancel
          </button>
        </form>
      )}

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
              <tr key={account._id} className="text-center border-b">
                <td className="p-3 border">{account.name}</td>
                <td className="p-3 border">{account.email}</td>
                <td className="p-3 border capitalize">{account.role}</td>
                <td className="p-3 border flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(account)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(account._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
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
