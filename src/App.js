import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RecentlyGamesPage from "./pages/RecentlyGamesPage";
import GamesPage from "./pages/GamesPage";
import RatingsPage from "./pages/RatingsPage";
import CharactersPage from "./pages/CharactersPage";

function App() {
  return (
    <Router>
      <div style={{ padding: "1rem" }}>
        <nav>
          <Link to="/">Последние матчи</Link>
          <Link to="/games" style={{ marginLeft: "1rem" }}>Все матчи</Link>
          <Link to="/rating" style={{ marginLeft: "1rem" }}>
            Рейтинг игроков
          </Link>
          <Link to="/characters" style={{ marginLeft: "1rem" }}>Бойцы</Link>
        </nav>

        <Routes>
          <Route path="/" element={<RecentlyGamesPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/rating" element={<RatingsPage />} />
          <Route path="/characters" element={<CharactersPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
