import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function RequestForm() {
  // Create form state
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Data + UI state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editSubject, setEditSubject] = useState("");
  const [editMessage, setEditMessage] = useState("");

  // Read
  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Create
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !message.trim()) return;

    const { data, error } = await supabase
      .from("requests")
      .insert([
        { name: name.trim(), subject: subject.trim(), message: message.trim() },
      ])
      .select();

    if (error) {
      console.error(error);
      return;
    }

    // append new row(s) to UI
    setRequests((prev) => [...prev, ...(data || [])]);
    setName("");
    setSubject("");
    setMessage("");
  };

  // Delete
  const deleteRequest = async (id) => {
    const prev = requests;
    setRequests((list) => list.filter((r) => r.id !== id)); // optimistic UI
    const { error } = await supabase.from("requests").delete().eq("id", id);
    if (error) {
      console.error(error);
      setRequests(prev); // revert if failed
    }
  };

  // Begin Edit
  const startEdit = (r) => {
    setEditingId(r.id);
    setEditSubject(r.subject ?? "");
    setEditMessage(r.message ?? "");
  };

  // Cancel Edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditSubject("");
    setEditMessage("");
  };

  // Save Edit (Update)
  const saveEdit = async (id) => {
    const updates = {
      subject: editSubject.trim(),
      message: editMessage.trim(),
    };

    // Optimistic update
    const prev = requests;
    setRequests((list) =>
      list.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );

    const { error } = await supabase
      .from("requests")
      .update(updates)
      .eq("id", id);
    if (error) {
      console.error(error);
      setRequests(prev); // revert if failed
      return;
    }

    cancelEdit();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-8 shadow-md">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Simple Supabase Request Form
          </h1>
          <p className="mt-2 text-lg text-indigo-100">
            Create, read, update, and delete requests - powered by Supabase +
            React.
          </p>
        </header>

        {/* Card - Create */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white shadow-lg transition-shadow hover:shadow-xl">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-xl font-semibold">Create a new request</h2>
          </div>
          <form
            onSubmit={handleSubmit}
            className="divide-y divide-gray-200 p-6"
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Your name
                </label>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  placeholder="e.g. Nathaniel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  placeholder="What is this about?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  className="min-h-[90px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  placeholder="Write your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                Submit
              </button>

              <button
                type="button"
                onClick={fetchRequests}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                Refresh list
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-semibold">All requests</h3>
            {loading ? (
              <span className="text-xs text-gray-500">Loading…</span>
            ) : (
              <span className="text-xs text-gray-500">
                {requests.length} total
              </span>
            )}
          </div>

          <ul className="grid gap-4">
            {requests.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-md transition-colors hover:bg-indigo-50 cursor-pointer"
              >
                {/* View state */}
                {editingId !== r.id ? (
                  <div className="grid gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                        {r.name}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {r.subject}
                      </span>
                      <span className="ml-auto text-xs text-gray-500">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString()
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{r.message}</p>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={() => startEdit(r)}
                        className="inline-flex items-center rounded-md border border-indigo-600 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700 shadow-sm transition-colors hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteRequest(r.id)}
                        className="inline-flex items-center rounded-md border border-red-400 bg-red-50 px-4 py-1.5 text-xs font-medium text-red-700 shadow-sm transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  // Edit state
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                        {r.name}
                      </span>
                      <input
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        placeholder="Subject"
                      />
                    </div>
                    <textarea
                      className="min-h-[90px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      placeholder="Message"
                    />
                    <div className="mt-1 flex items-center gap-3">
                      <button
                        onClick={() => saveEdit(r.id)}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {requests.length === 0 && !loading && (
            <div className="mt-6 text-center text-sm text-gray-500">
              No requests yet. Create your first one above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
