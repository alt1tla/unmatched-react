import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const RANGE = "Игры!A:M";

export default function GamesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterPlayer, setFilterPlayer] = useState("");

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

        setData(rowsData.reverse()); // Сначала последние
      } catch (e) {
        setError("Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    }

    fetchSheet();
  }, []);

  if (loading) return <p>Загрузка данных...</p>;
  if (error) return <p className="err">{error}</p>;
  if (data.length === 0) return <p>Нет данных для отображения</p>;

  const headers = Object.keys(data[0]);
  const dateField =
    headers.find((h) => h.toLowerCase().includes("дата")) || headers[0];

  const importantFields = headers.filter(
    (h) =>
      h !== dateField &&
      (h.toLowerCase().includes("игрок") ||
        h.toLowerCase().includes("победитель") ||
        h.toLowerCase().includes("боец") ||
        h.toLowerCase().includes("герой") ||
        h.toLowerCase().includes("персонаж"))
  );

  // Фильтрация данных только по игроку
  const filteredData = data.filter((row) => {
    if (!filterPlayer) return true;

    const playerFields = headers.filter(
      (h) =>
        h.toLowerCase().includes("игрок") ||
        h.toLowerCase().includes("победитель")
    );

    return playerFields.some((field) =>
      row[field]?.toLowerCase().includes(filterPlayer.toLowerCase())
    );
  });

  return (
    <div className="container">
      <h1>Все партии настольных игр</h1>

      {/* Фильтр */}
      <div className="filters">
        <label>
          Фильтр по игроку:{" "}
          <input
            type="text"
            placeholder="Введите имя игрока"
            value={filterPlayer}
            onChange={(e) => setFilterPlayer(e.target.value)}
          />
        </label>
      </div>

      {/* Таблица для десктопа */}
      <table border="1" cellPadding="8" className="desktop-table table-common">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={headers.length}>
                Нет данных, соответствующих фильтру
              </td>
            </tr>
          ) : (
            filteredData.map((row, idx) => (
              <tr key={idx}>
                {headers.map((key) => {
                  const val = row[key];
                  const isWinner = key.toLowerCase().includes("победитель");
                  const isPlayerName =
                    key.toLowerCase().includes("игрок") ||
                    key.toLowerCase().includes("победитель");
                  const isCharacterName =
                    key.toLowerCase().includes("боец") ||
                    key.toLowerCase().includes("персонаж");

                  const cellContent =
                    isPlayerName && val && val !== "-" ? (
                      <Link
                        className="none"
                        to={`/rating?q=${encodeURIComponent(val)}`}
                      >
                        {val}
                      </Link>
                    ) : isCharacterName && val && val !== "-" ? (
                      <Link
                        className="none"
                        to={`/character/${encodeURIComponent(val)}`}
                      >
                        {val}
                      </Link>
                    ) : (
                      val
                    );

                  return (
                    <td
                      className={
                        `${isPlayerName ? "cell-player" : ""} ` +
                        `${isCharacterName ? "cell-character" : ""} ` +
                        `${isWinner ? "cell-winner" : ""}`
                      }
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Карточки для мобильных */}
      <div className="mobile-cards">
        {filteredData.length === 0 ? (
          <p>Нет данных, соответствующих фильтру</p>
        ) : (
          filteredData.map((row, idx) => {
            const date = row[dateField];
            return (
              <div className="card" key={idx}>
                <div className="card-date">{date}</div>
                {importantFields.map((key) => {
                  const val = row[key];
                  if (!val || val === "-") return null;

                  const isWinner = key.toLowerCase().includes("победитель");
                  const isPlayerName =
                    key.toLowerCase().includes("игрок") ||
                    key.toLowerCase().includes("победитель");
                  const isCharacterName =
                    key.toLowerCase().includes("боец") ||
                    key.toLowerCase().includes("персонаж");
                  const content = isPlayerName ? (
                    <Link
                      className="player-link"
                      to={`/rating?q=${encodeURIComponent(val)}`}
                    >
                      {val}
                    </Link>
                  ) : isCharacterName ? (
                    <Link
                      className="character-link"
                      to={`/character/${encodeURIComponent(val)}`}
                    >
                      {val}
                    </Link>
                  ) : (
                    val
                  );
                  return (
                    <div
                      className="card-row"
                      key={key}
                      style={{
                        fontWeight: isWinner ? "700" : "normal",
                        color: isWinner ? "#2a9d8f" : "inherit",
                      }}
                    >
                      <span className="card-label">{key.replace(":", "")}</span>{" "}
                      {content}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
