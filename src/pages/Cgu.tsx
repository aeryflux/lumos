import { Link } from 'react-router-dom';
import './Docs.css';

export function Cgu() {
  return (
    <div className="legal">
      <div className="legal-container">
        <Link to="/docs" className="legal-back">← Docs</Link>

        <div className="legal-header">
          <span className="docs-tag">Légal</span>
          <h1 className="legal-title">Conditions Générales d'Utilisation</h1>
          <p className="legal-updated">Dernière mise à jour : {new Date().getFullYear()}</p>
        </div>

        <div className="legal-section">
          <h2>1. Objet</h2>
          <p>
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et
            l'utilisation des services proposés par Aeryflux, accessible à l'adresse
            aeryflux.com et ses sous-domaines associés.
          </p>
        </div>

        <div className="legal-section">
          <h2>2. Acceptation</h2>
          <p>
            L'utilisation des services implique l'acceptation pleine et entière des
            présentes CGU. Si vous n'acceptez pas ces conditions, veuillez cesser
            d'utiliser les services.
          </p>
        </div>

        <div className="legal-section">
          <h2>3. Services</h2>
          <p>
            Aeryflux propose des outils de visualisation géographique, d'apprentissage
            et d'exploration de données mondiales. Certains composants sont disponibles
            en open source sous licence MIT.
          </p>
        </div>

        <div className="legal-section">
          <h2>4. Propriété intellectuelle</h2>
          <p>
            Les packages open source (@aeryflux/globe, @aeryflux/design,
            @aeryflux/xenova-bridge) sont distribués sous licence MIT.
            Le reste du contenu et des produits propriétaires reste la propriété
            exclusive d'Aeryflux.
          </p>
        </div>

        <div className="legal-section">
          <h2>5. Données personnelles</h2>
          <p>
            Aeryflux ne collecte pas de données personnelles sans consentement explicite.
            L'inférence NLP s'exécute localement dans le navigateur, sans transfert
            vers nos serveurs.
          </p>
        </div>

        <div className="legal-section">
          <h2>6. Modification</h2>
          <p>
            Aeryflux se réserve le droit de modifier les présentes CGU à tout moment.
            Les utilisateurs seront informés des changements significatifs.
          </p>
        </div>

        <div className="legal-section">
          <h2>7. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGU : contact@aeryflux.com
          </p>
        </div>
      </div>
    </div>
  );
}

export default Cgu;
