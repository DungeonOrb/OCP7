import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const result = await apiFetch("/dashboard");
        setData(result);
      } catch (err) {
        setError(err.message);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}