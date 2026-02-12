import { useEffect, useState } from "react";
import { api } from "../../../services/apiClient.js";

export function useListResource({ url, params }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(url, { params });
      const payload = res.data;

      // supports {data: [...]} or {data: {data:[...]}}
      const list = payload?.data?.data || payload?.data || [];
      setData(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load data.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, JSON.stringify(params || {})]);

  return { loading, error, data, reload: load };
}
