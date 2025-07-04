import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Подставь свои значения в .env
const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const RANGE = "Бойцы!A:Z";

// Карта изображений по имени бойца
const fighterImages = {
  Медуза: "/images/medusa.webp",
  "Король Артур": "/images/arthur.jpg",
  Алиса: "/images/alice.webp",
  Синдбад: "/images/sindbad.webp",
  // Остальные...
};

export default function CharactersPage() {
  const [fighters, setFighters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [attackFilter, setAttackFilter] = useState("все");
  const [assistantFilter, setAssistantFilter] = useState("все");
  const [movementFilter, setMovementFilter] = useState("все");
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

    return nameMatch && attackMatch && assistantMatch && moveMatch;
  });

  if (loading) return <p>Загрузка бойцов...</p>;
  if (error) return <p className="err">{error}</p>;

  return (
    <div className="container">
      <h1>Бойцы</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по имени..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filters input"
        />

        <label className="filters label">
          <span>Атака</span>
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
          <span>Наличие помощника</span>
          <select
            value={assistantFilter}
            onChange={(e) => setAssistantFilter(e.target.value)}
          >
            <option value="все">Не важно</option>
            <option value="есть">Есть помощник</option>
            <option value="нет">Без помощника</option>
          </select>
        </label>

        <label className="filters label">
          <span>Перемещение</span>
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
                {fighterImages[name] && (
                  <img src={fighterImages[name]} alt={name} className="img" />
                )}
                <div className="desc-short">
                  <h2 className="name-short">
                    {name}
                    <span>{attackIcon}</span>
                    {hasAssistant && <span>🤝</span>}
                  </h2>
                  <div className="art-short">
                    {f["Здоровье"] && <span>❤️ {f["Здоровье"]}</span>}
                    {f["Перемещение"] && <span>👣 {f["Перемещение"]}</span>}
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
