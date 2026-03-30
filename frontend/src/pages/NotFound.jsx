
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound">
      <div className="notfound__card">
        <h1 className="notfound__code">Erreur 404</h1>

        <p className="notfound__text">Page non trouvée</p>

        <button
          className="notfound__btn"
          onClick={() => navigate("/dashboard")}
        >
          Retour
        </button>
      </div>
    </div>
  );
}