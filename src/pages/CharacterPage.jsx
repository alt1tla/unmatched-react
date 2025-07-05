import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import fighterImages from "../constants/fighterImages";

const SCRIPT_KEY = process.env.REACT_APP_GOOGLE_SCRIPT_KEY;
const API_URL = `https://script.google.com/macros/s/${SCRIPT_KEY}/exec`;

function getAttackEmoji(attackType) {
  if (!attackType) return "";
  return attackType.toLowerCase().includes("дальн") ? "🏹" : "🗡️";
}

export default function CharacterPage() {
  const { name } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFighter() {
      try {
        const res = await fetch(
          `${API_URL}?character=${encodeURIComponent(name)}`
        );
        const json = await res.json();
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
      } catch (err) {
        setError("Ошибка загрузки персонажа");
      } finally {
        setLoading(false);
      }
    }
    fetchFighter();
  }, [name]);

  if (loading) return <p>Загрузка персонажа...</p>;
  if (error) return <p className="err">{error}</p>;

  return (
    <div className="container">
      <Link to="/characters">← Назад к списку</Link>

      <h1>{data["Боец"]}</h1>

      {fighterImages[data["Боец"]] && (
        <img
          src={fighterImages[data["Боец"]]}
          alt={data["Боец"]}
          className="img"
        />
      )}

      <p>
        ❤️ <strong>Здоровье:</strong> {data["Здоровье"]}
      </p>
      <p>
        {getAttackEmoji(data["Атака"])} <strong>Атака:</strong> {data["Атака"]}
      </p>
      <p>
        👣 <strong>Перемещение:</strong> {data["Перемещение"]}
      </p>
      <p>
        ✨ <strong>Способность:</strong> {data["Способность"]}
      </p>

      {data["Помощник"] && data["Помощник"] !== "-" && (
        <div className="art">
          <h3>🤝 Помощник: {data["Помощник"]}</h3>
          <p>
            ❤️ Здоровье: {data["Здоровье Помощник"]} |{" "}
            {getAttackEmoji(data["Атака Помощник"])} Атака:{" "}
            {data["Атака Помощник"]}
          </p>
        </div>
      )}

      <p>
        📦 <strong>Набор:</strong> {data["Набор"]}
      </p>
    </div>
  );
}
