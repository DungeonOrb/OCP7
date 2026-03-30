import { Routes, Route, Navigate } from "react-router-dom";
import Connexion from "./pages/Connexion";
import Dashboard from "./pages/Dashboard";
import HomePage from "./pages/HomePage";
import Projects from "./pages/Projects";
import ProjectsDetail from "./pages/ProjectsDetail";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Connexion" replace />} />
      <Route path="/Connexion" element={<Connexion />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/HomePage" element={<HomePage />} />
      <Route path="/Projects" element={<Projects />} />
      <Route path="/Projects/:id" element={<ProjectsDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;