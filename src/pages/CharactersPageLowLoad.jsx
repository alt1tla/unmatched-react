import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

const SCRIPT_KEY = process.env.REACT_APP_GOOGLE_SCRIPT_KEY;
const API_URL = `https://script.google.com/macros/s/${SCRIPT_KEY}/exec?listNames=true`;

export default function CharactersPage() {
  const [fighterNames, setFighterNames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNames() {
      try {
        const res = await fetch(API_URL);
        const json = await res.json();
        if (json.names) {
          setFighterNames(json.names);
        } else {
          setError("Ошибка: имена не найдены");
        }
      } catch (e) {
        setError("Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    }
    fetchNames();
  }, []);

  const filteredNames = fighterNames.filter((name) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Загрузка бойцов...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h1
        style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "1rem" }}
      >
        Бойцы
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
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "1.5rem",
        }}
      >
        {filteredNames.length === 0 && <p>Персонажи не найдены</p>}
        {filteredNames.map((name, idx) => (
          <Link
            key={idx}
            to={`/character/${encodeURIComponent(name)}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "1rem",
              backgroundColor: "#fff",
              boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.02)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
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
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                textAlign: "center",
              }}
            >
              {name}
            </h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
