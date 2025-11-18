export const CreditsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎳 Crédits</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="credit-section">
            <h3>Développement</h3>
            <p>
              Template de base :{" "}
              <a
                href="https://github.com/DamsSifma/r3f-vite-template"
                target="_blank"
                rel="noopener noreferrer"
                className="credit-link"
              >
                r3f-vite-template
              </a>
            </p>
          </div>

          <div className="credit-section">
            <h3>Technologies</h3>
            <p>React Three Fiber, Three.js, Rapier Physics</p>
            <p>Leva pour le debug</p>
            <p>React Spring pour quelques animations</p>
            <p></p>
          </div>

          <div className="credit-section">
            <h3>Modèles 3D</h3>
            <p>
              Quille de bowling par Poly by Google{" "}
              <a
                href="https://creativecommons.org/licenses/by/3.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="credit-link"
              >
                [CC-BY]
              </a>{" "}
              via{" "}
              <a
                href="https://poly.pizza/m/92eI1h_UJpU"
                target="_blank"
                rel="noopener noreferrer"
                className="credit-link"
              >
                Poly Pizza
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
