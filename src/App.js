import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RecentlyGamesPage from "./pages/RecentlyGamesPage";
import GamesPage from "./pages/GamesPage";
import RatingsPage from "./pages/RatingsPage";

function App() {
  return (
    <Router>
      <div style={{ padding: "1rem" }}>
        <nav>
          <Link to="/">Последние игры</Link>
          <Link to="/games" style={{ marginLeft: "1rem" }}>Все игры</Link>
          <Link to="/rating" style={{ marginLeft: "1rem" }}>
            Рейтинг игроков
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<RecentlyGamesPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/rating" element={<RatingsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
