import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const RANGE = "Рейтинг!A:F";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function RatingPage() {
  const query = useQuery();
  const defaultSearch = query.get("q") || "";
  const [search, setSearch] = useState(defaultSearch);
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
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
        const rowsData = rows
          .slice(1)
          .map((row) =>
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
        return { key: null, direction: null };
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
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortConfig.direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [filteredData, sortConfig]);

  if (loading) return <p>Загрузка рейтинга...</p>;
  if (error) return <p className="err">{error}</p>;

  return (
    <div className="container">
      <h1>Рейтинг игроков</h1>

      <div className="filters">
        <label>
          Поиск игрока:{" "}
          <input
            type="text"
            placeholder="Введите имя..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {/* Таблица для десктопа */}
      <table border="1" cellPadding="8" className="table-common desktop-table">
        <thead>
          <tr>
            {Object.keys(data[0]).map((header) => {
              let tooltip = "";
              if (header.toLowerCase().includes("проц")) {
                tooltip =
                  "Победы / Кол-во игр — показывает, как часто игрок выигрывает. Чем выше, тем лучше.";
              } else if (header.toLowerCase().includes("коэф")) {
                tooltip =
                  "Кол-во игр / Победы — показывает, сколько игр в среднем нужно для одной победы. Чем ниже, тем лучше.";
              }

              return (
                <th
                  key={header}
                  onClick={() => handleSort(header)}
                  title={tooltip}
                  className="table-th"
                  style={{
                    color: header === sortConfig.key ? "#0077cc" : "inherit",
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
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr key={idx}>
              {Object.entries(row).map(([key, val], i) => (
                <td
                  key={i}
                  className={[
                    key.toLowerCase() === "игрок" ? "plr" : "",
                    key.toLowerCase() === "проц. побед" ? "wins" : "",
                    key.toLowerCase() === "коэф. эффективности" ? "eff" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Карточки для мобилок */}
      <div className="mobile-cards">
        {sortedData.map((row, idx) => (
          <div className="card" key={idx}>
            {Object.entries(row).map(([key, val]) =>
              val && val !== "-" ? (
                <div key={key} className="card-row">
                  <span className="card-label">{key}</span>:{" "}
                  <span
                    className={[
                      key.toLowerCase() === "игрок" ? "cell-plr" : "",
                      key.toLowerCase() === "проц. побед" ? "cell-wins" : "",
                      key.toLowerCase() === "коэф. эффективности"
                        ? "cell-eff"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {val}
                  </span>
                </div>
              ) : null
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
