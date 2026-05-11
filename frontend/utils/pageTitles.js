export function getPageTitle(pathname) {
  if (pathname === "/connexion") return "Connexion - Abricot";
  if (pathname === "/inscription") return "Inscription - Abricot";
  if (pathname === "/dashboard") return "Tableau de bord - Abricot";
  if (pathname === "/projects") return "Projets - Abricot";
  if (pathname.startsWith("/projects/")) return "Détail du projet - Abricot";
  if (pathname === "/profile") return "Mon compte - Abricot";

  return "Abricot";
}