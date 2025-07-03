import { useEffect, useState } from "react";

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
  Рапторы: "https://example.com/sinbad.jpg",
  "Роберт Малдун": "https://example.com/sinbad.jpg",
  Дракула: "https://example.com/sinbad.jpg",
  Невидимка: "https://example.com/sinbad.jpg",
  "Доктор Джекил": "https://example.com/sinbad.jpg",
  "Шерлок Холмс": "https://example.com/sinbad.jpg",
  Ахиллес: "https://example.com/sinbad.jpg",
  "Кровавая Мэри": "https://example.com/sinbad.jpg",
  "Сунь Укун": "https://example.com/sinbad.jpg",
  Йенненга: "https://example.com/sinbad.jpg",
  "Т-Рекс": "https://example.com/sinbad.jpg",
  "Д-р Элли Сэттлер": "https://example.com/sinbad.jpg",
  "Человек-паук": "https://example.com/sinbad.jpg",
  "Она-Халк": "https://example.com/sinbad.jpg",
  "Доктор Стрендж": "https://example.com/sinbad.jpg",
  "Ода Нобунага": "https://example.com/sinbad.jpg",
  "Томое Годзен": "https://example.com/sinbad.jpg",
  Шекспир: "https://example.com/sinbad.jpg",
  "Своенравные сестры": "https://example.com/sinbad.jpg",
  Гамлет: "https://example.com/sinbad.jpg",
  Титания: "https://example.com/sinbad.jpg",
};

export default function CharactersPage() {
  const [fighters, setFighters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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
      } catch (e) {
        console.error("Ошибка при загрузке:", e);
        setError("Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    }

    fetchSheet();
  }, []);

  const filteredFighters = fighters.filter((f) =>
    f["Боец"]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Загрузка бойцов...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h1
        style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "1rem" }}
      >
        Бойцы Unmatched
      </h1>

      <input
        type="text"
        placeholder="Поиск по имени..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem",
          width: "100%",
          maxWidth: "400px",
          fontSize: "16px",
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
        }}
      >
        {filteredFighters.map((f, idx) => {
          const isMelee = f["Атака"]?.toLowerCase() === "ближняя";
          const attackIcon = isMelee ? "🗡️" : "🏹";

          const assistantAttackIcon =
            f["Атака Помощник"]?.toLowerCase() === "ближняя" ? "🗡️" : "🏹";

          return (
            <div
              key={idx}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "1rem",
                backgroundColor: "#fff",
                boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {fighterImages[f["Боец"]] && (
                <img
                  src={fighterImages[f["Боец"]]}
                  alt={f["Боец"]}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "0.75rem",
                  }}
                />
              )}

              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                {f["Боец"]}
              </h2>

              {/* Блок персонажа */}
              <div>
                <p
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginInlineEnd: "1.5rem",
                  }}
                >
                  <span>
                    ❤️ <strong>Здоровье:</strong> {f["Здоровье"]}
                  </span>
                  <span>
                    {attackIcon} <strong>Атака:</strong> {f["Атака"]}
                  </span>
                </p>
                <p>
                  👣 <strong>Перемещение:</strong> {f["Перемещение"]}
                </p>
                <p>
                  ✨ <strong>Способность:</strong>
                  <br /> {f["Способность"]}
                </p>
              </div>

              {/* Блок помощника, если есть */}
              {f["Помощник"] && f["Помощник"] !== "-" && (
                <div
                  style={{
                    padding: "0.5rem",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                  }}
                >
                  <p>
                    🤝 <strong>Помощник:</strong> {f["Помощник"]}
                  </p>
                  <p
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginInlineEnd: "1.5rem",
                    }}
                  >
                    <span>
                      💞 <strong>Здоровье:</strong> {f["Здоровье Помощник"]}
                    </span>
                    <span>
                      {assistantAttackIcon} <strong>Атака:</strong>{" "}
                      {f["Атака Помощник"]}
                    </span>
                  </p>
                </div>
              )}

              <p>
                📦 <strong>Набор:</strong> {f["Набор"]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
