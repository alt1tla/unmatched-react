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
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h1
        style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "1rem" }}
      >
        Бойцы
      </h1>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Поиск по имени..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "0.5rem",
            width: "200px",
            fontSize: "16px",
          }}
        />

        <label style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "14px", marginBottom: "4px" }}>Атака</span>
          <select
            value={attackFilter}
            onChange={(e) => setAttackFilter(e.target.value)}
          >
            <option value="все">Любая</option>
            <option value="ближняя">Ближняя</option>
            <option value="дальняя">Дальняя</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "14px", marginBottom: "4px" }}>
            Наличие помощника
          </span>
          <select
            value={assistantFilter}
            onChange={(e) => setAssistantFilter(e.target.value)}
          >
            <option value="все">Не важно</option>
            <option value="есть">Есть помощник</option>
            <option value="нет">Без помощника</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "14px", marginBottom: "4px" }}>
            Перемещение
          </span>
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {filteredFighters.map((f, idx) => {
          const isMelee = f["Атака"]?.toLowerCase() === "ближняя";
          const attackIcon = isMelee ? "🗡️" : "🏹";
          const name = f["Боец"];
          const hasAssistant = f["Помощник"] && f["Помощник"].trim() !== "-";

          return (
            <Link
              to={`/character/${encodeURIComponent(name)}`}
              key={idx}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "1rem",
                  backgroundColor: "#fff",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {fighterImages[name] && (
                  <img
                    src={fighterImages[name]}
                    alt={name}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      objectPosition: "top",
                      borderRadius: "8px",
                      marginBottom: "0.75rem",
                    }}
                  />
                )}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {name} {hasAssistant && <span>🤝</span>}
                    </h2>
                    <span style={{ fontSize: "18px" }}>{attackIcon}</span>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        fontSize: "16px",
                      }}
                    >
                      {f["Здоровье"] && <span>❤️ {f["Здоровье"]}</span>}
                      {f["Перемещение"] && <span>👣 {f["Перемещение"]}</span>}
                    </div>
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
