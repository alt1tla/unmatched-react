import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RecentlyGamesPage from "./pages/RecentlyGamesPage";
import GamesPage from "./pages/GamesPage";
import RatingsPage from "./pages/RatingsPage";
import CharactersPage from "./pages/CharactersPage";
import CharacterPage from "./pages/CharacterPage";

function App() {
  return (
    <Router>
      <div style={{ padding: "1rem" }}>
        <nav>
          <Link className="link-nav" to="/">Недавние</Link>
          <Link className="link-nav" to="/games" style={{ marginLeft: "1rem" }}>Матчи</Link>
          <Link className="link-nav" to="/rating" style={{ marginLeft: "1rem" }}>
            Игроки
          </Link>
          <Link className="link-nav" to="/characters" style={{ marginLeft: "1rem" }}>Бойцы</Link>
          <Link className="link-nav" to="https://docs.google.com/forms/d/e/1FAIpQLSfdCJc-TGtNaQ0Hi_DPXpNgipQjbBcUngbO9qT0Yz7f4wj5yg/viewform?usp=header" style={{ marginLeft: "1rem" }}>Оценить бойца</Link>
        </nav>

        <Routes>
          <Route path="/" element={<RecentlyGamesPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/rating" element={<RatingsPage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/character/:name" element={<CharacterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
