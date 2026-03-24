import { Routes, Route, NavLink } from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Connexion";
import DashboardPage from "./pages/Dashboard";
import ProjectsPage from "./pages/Projects";
import ProjectDetailsPage from "./pages/ProjectsDetail";
import NotFoundPage from "./pages/NotFound";

export default function App() {
  return (
    <div>
      <header style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
        <nav style={{ display: "flex", gap: "1rem" }}>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/projects">Projects</NavLink>
        </nav>
      </header>

      <main style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}