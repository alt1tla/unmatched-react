import React, { useEffect, useState } from "react";

const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const RANGE = "Рейтинг!A:F";

export default function RatingPage() {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRating() {
      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
        );
        const json = await res.json();

        if (json.error) {
          setError(json.error.message);
          setLoading(false);
          return;
        }

        const rows = json.values;
        if (!rows || rows.length < 2) {
          setError("Недостаточно данных");
          setLoading(false);
          return;
        }

        const headers = rows[0];
        const rowsData = rows.slice(1).map((row) =>
          Object.fromEntries(headers.map((h, i) => [h, row[i] || ""]))
        );

        setData(rowsData);
      } catch (e) {
        setError("Ошибка загрузки рейтинга");
      } finally {
        setLoading(false);
      }
    }

    fetchRating();
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: "asc" };
      } else if (prev.direction === "asc") {
        return { key, direction: "desc" };
      } else if (prev.direction === "desc") {
        return { key: null, direction: null }; // сброс сортировки
      } else {
        return { key, direction: "asc" };
      }
    });
  };

  const filteredData = React.useMemo(() => {
    return data.filter((row) =>
      row["Игрок"]?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === "% побед") {
        aVal = parseFloat(aVal.replace(",", ".").replace("%", "")) || 0;
        bVal = parseFloat(bVal.replace(",", ".").replace("%", "")) || 0;
      }

      if (!isNaN(aVal) && !isNaN(bVal)) {
        return sortConfig.direction === "asc"
          ? aVal - bVal
          : bVal - aVal;
      }

      return sortConfig.direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [filteredData, sortConfig]);

  if (loading) return <p>Загрузка рейтинга...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Рейтинг игроков</h1>

      <input
        type="text"
        placeholder="Поиск по имени игрока..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem",
          width: "300px",
          fontSize: "1rem",
        }}
      />

      <table
        border="1"
        cellPadding="8"
        style={{
          borderCollapse: "collapse",
          width: "100%",
          textAlign: "center",
        }}
      >
        <thead style={{ backgroundColor: "#f0f0f0", cursor: "pointer" }}>
          <tr>
            {Object.keys(data[0]).map((header) => (
              <th
                key={header}
                onClick={() => handleSort(header)}
                style={{
                  color:
                    header === sortConfig.key ? "#0077cc" : "inherit",
                }}
              >
                {header}
                {sortConfig.key === header &&
                  (sortConfig.direction === "asc"
                    ? " ▲"
                    : sortConfig.direction === "desc"
                    ? " ▼"
                    : "")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr key={idx}>
              {Object.values(row).map((val, i) => (
                <td key={i}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
