import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const RANGE = "Игры!A:M";

export default function RecentlyGamesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSheet() {
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
        if (!rows || rows.length === 0) {
          setError("Данные не найдены");
          setLoading(false);
          return;
        }

        const headers = rows[0];
        const rowsData = rows
          .slice(1)
          .map((row) =>
            Object.fromEntries(headers.map((h, i) => [h, row[i] || ""]))
          );

        const last10Games = rowsData.slice(-10);

        setData(last10Games);
      } catch (e) {
        setError("Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    }

    fetchSheet();
  }, []);

  if (loading) return <p>Загрузка данных...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Последние 10 партий</h1>
      <table
        border="1"
        cellPadding="8"
        style={{
          borderCollapse: "collapse",
          width: "100%",
          textAlign: "center",
        }}
      >
        <thead style={{ backgroundColor: "#f0f0f0" }}>
          <tr>
            {Object.keys(data[0]).map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {Object.entries(row).map(([key, val]) => {
                const isWinner = key.toLowerCase().includes("победитель");
                const isPlayerName =
                  key.toLowerCase().includes("игрок") ||
                  key.toLowerCase().includes("победитель");
                const isCharacterName =
                  key.toLowerCase().includes("боец") ||
                  key.toLowerCase().includes("герой") ||
                  key.toLowerCase().includes("персонаж");

                const cellContent =
                  isPlayerName && val && val !== "-" ? (
                    <Link
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        cursor: "pointer",
                      }}
                      to={`/rating?q=${encodeURIComponent(val)}`}
                    >
                      {val}
                    </Link>
                  ) : isCharacterName && val && val !== "-" ? (
                    <Link
                      style={{
                        textDecoration: "none",
                        color: "#007acc",
                        cursor: "pointer",
                      }}
                      to={`/character/${encodeURIComponent(val)}`}
                    >
                      {val}
                    </Link>
                  ) : (
                    val
                  );

                return (
                  <td
                    key={key}
                    style={{
                      fontWeight:
                        isWinner && val !== "-" && val !== ""
                          ? "bold"
                          : "normal",
                      color:
                        isWinner && val !== "-" && val !== ""
                          ? "green"
                          : "inherit",
                    }}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
