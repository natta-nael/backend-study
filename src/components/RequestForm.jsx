import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function RequestForm() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("requests")
      .insert([{ name, subject, message }]);

    if (error) {
      console.error(error);
    } else {
      setRequests([...requests, ...data]);
      setName("");
      setSubject("");
      setMessage("");
    }
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setRequests(data);
  };

  return (
    <div>
      <h2>Request Form</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 12, maxWidth: 400 }}
      >
        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>

      <button onClick={fetchRequests} style={{ marginTop: 16 }}>
        Fetch All Requests
      </button>

      <ul style={{ marginTop: 20 }}>
        {requests.map((r) => (
          <li key={r.id}>
            <strong>{r.subject}</strong> from {r.name} - {r.message} - {"  "}
            {r.created_at}
          </li>
        ))}
      </ul>
    </div>
  );
}
