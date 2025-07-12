import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFighterImage } from "../constants/fighterImages";

// Подставь свои значения в .env
const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const RANGE = "Бойцы!A:O";

export default function CharactersPage() {
  const [fighters, setFighters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [attackFilter, setAttackFilter] = useState("все");
  const [assistantFilter, setAssistantFilter] = useState("все");
  const [movementFilter, setMovementFilter] = useState("все");
  const [ratingFilter, setRatingFilter] = useState("все");
  const [availableMovements, setAvailableMovements] = useState([]);
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
            Object.fromEntries(headers.map((h, i) => [h.trim(), row[i] || ""]))
          );
        setFighters(rowsData);

        const moves = [
          ...new Set(
            rowsData
              .map((f) => parseInt(f["Перемещение"]))
              .filter((n) => !isNaN(n))
          ),
        ];
        moves.sort((a, b) => a - b);
        setAvailableMovements(moves);
      } catch (e) {
        console.error("Ошибка при загрузке:", e);
        setError("Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    }

    fetchSheet();
  }, []);

  const filteredFighters = fighters.filter((f) => {
    const nameMatch = f["Боец"]
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const attackMatch =
      attackFilter === "все" ||
      f["Атака"]?.toLowerCase() === attackFilter.toLowerCase();

    const assistantPresent = f["Помощник"] && f["Помощник"].trim() !== "-";
    const assistantMatch =
      assistantFilter === "все" ||
      (assistantFilter === "есть" && assistantPresent) ||
      (assistantFilter === "нет" && !assistantPresent);

    const moveMatch =
      movementFilter === "все" || f["Перемещение"] === movementFilter;

    const ratingMatch =
      ratingFilter === "все" ||
      (ratingFilter === "5" && parseFloat(f["Оценка"]) === 5) ||
      (ratingFilter === "4" &&
        parseFloat(f["Оценка"]) >= 4 &&
        parseFloat(f["Оценка"]) < 5) ||
      (ratingFilter === "3" &&
        parseFloat(f["Оценка"]) >= 3 &&
        parseFloat(f["Оценка"]) < 4) ||
      (ratingFilter === "2" &&
        parseFloat(f["Оценка"]) >= 2 &&
        parseFloat(f["Оценка"]) < 3) ||
      (ratingFilter === "1" &&
        parseFloat(f["Оценка"]) >= 1 &&
        parseFloat(f["Оценка"]) < 2) ||
      (ratingFilter === "нет" && parseFloat(f["Оценка"]) === 0) ||
      (ratingFilter === "есть" && parseFloat(f["Оценка"]) >= 0);

    return (
      nameMatch && attackMatch && assistantMatch && moveMatch && ratingMatch
    );
  });

  if (loading) return <p>Загрузка бойцов...</p>;
  if (error) return <p className="err">{error}</p>;

  return (
    <div className="container">
      <h1>Бойцы</h1>

      <div className="filters">
        <div className="filters">
          <label>
            Поиск бойца:{" "}
            <input
              type="text"
              placeholder="Введите имя..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
        </div>

        <label className="filters label">
          <span>Атака:</span>
          <select
            value={attackFilter}
            onChange={(e) => setAttackFilter(e.target.value)}
          >
            <option value="все">Любая</option>
            <option value="ближняя">Ближняя</option>
            <option value="дальняя">Дальняя</option>
          </select>
        </label>

        <label className="filters label">
          <span>Помощник:</span>
          <select
            value={assistantFilter}
            onChange={(e) => setAssistantFilter(e.target.value)}
          >
            <option value="все">Не важно</option>
            <option value="есть">Есть</option>
            <option value="нет">Нет</option>
          </select>
        </label>

        <label className="filters label">
          <span>Перемещение:</span>
          <select
            value={movementFilter}
            onChange={(e) => setMovementFilter(e.target.value)}
          >
            <option value="все">Не важно</option>
            {availableMovements.map((m) => (
              <option key={m} value={String(m)}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="filters label">
          <span>Оценка:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="все">Любая</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
            <option value="нет">Нет</option>
            <option value="есть">Есть</option>
          </select>
        </label>
      </div>
      <div className="cards-short">
        {filteredFighters.map((f, idx) => {
          const isMelee = f["Атака"]?.toLowerCase() === "ближняя";
          const attackIcon = isMelee ? "🗡️" : "🏹";
          const name = f["Боец"];
          const hasAssistant = f["Помощник"] && f["Помощник"].trim() !== "-";

          return (
            <Link
              to={`/character/${encodeURIComponent(name)}`}
              key={idx}
              className="none"
            >
              <div
                className="card-short"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <img
                  src={getFighterImage(name)}
                  alt={name}
                  loading="lazy"
                  decoding="async"
                  className="img-short"
                />
                <div className="desc-short">
                  <h2 className="name-short">
                    {name}
                    <span>{attackIcon}</span>
                    {hasAssistant && <span>🤝</span>}
                  </h2>
                  <div className="art-short">
                    {f["Здоровье"] && <span>❤️ {f["Здоровье"]}</span>}
                    {f["Перемещение"] && <span>👣 {f["Перемещение"]}</span>}
                    {f["Оценка"] && <span>⭐ {f["Оценка"]}</span>}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
