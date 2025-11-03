export const MainMenu = ({ onStartGame }) => {
  return (
    <div className="main-menu">
      <h1 className="main-menu-title">🎳 Three Bowling</h1>
      <div className="buttons">
        <button onClick={() => onStartGame()} className="button button-primary">
          JOUER
        </button>
        <button onClick={() => {}} className="button button-secondary">
          CRÉDITS
        </button>
      </div>

      <p className="subtitle">
        Projet de POK1 pour le cours de Do-IT de Centrale Méditerranée
      </p>

      <div className="footer">
        <p className="author">
          Créé par <strong>Damien Massif</strong>
        </p>
        <a
          href="https://github.com/DamsSifma/three-bowling"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
        >
          📦 Code source sur GitHub
        </a>
      </div>
    </div>
  );
};
