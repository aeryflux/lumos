import { Link } from 'react-router-dom';
import './Docs.css';

export function Cgv() {
  return (
    <div className="legal">
      <div className="legal-container">
        <Link to="/docs" className="legal-back">← Docs</Link>

        <div className="legal-header">
          <span className="docs-tag">Légal</span>
          <h1 className="legal-title">Conditions Générales de Vente</h1>
          <p className="legal-updated">Dernière mise à jour : {new Date().getFullYear()}</p>
        </div>

        <div className="legal-section">
          <h2>1. Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) s'appliquent à toute
            souscription ou achat de services premium proposés par Aeryflux.
          </p>
        </div>

        <div className="legal-section">
          <h2>2. Services payants</h2>
          <p>
            Certaines fonctionnalités avancées d'Atlas et de l'API Pythagoras peuvent
            être soumises à facturation. Le détail des offres et tarifs est disponible
            sur demande.
          </p>
        </div>

        <div className="legal-section">
          <h2>3. Paiement</h2>
          <p>
            Les paiements sont sécurisés et traités par des prestataires certifiés PCI-DSS.
            Aeryflux ne stocke aucune donnée bancaire.
          </p>
        </div>

        <div className="legal-section">
          <h2>4. Rétractation</h2>
          <p>
            Conformément à la législation en vigueur, vous disposez d'un délai de 14 jours
            à compter de la souscription pour exercer votre droit de rétractation,
            sauf si le service a déjà été pleinement exécuté.
          </p>
        </div>

        <div className="legal-section">
          <h2>5. Résiliation</h2>
          <p>
            Vous pouvez résilier un abonnement à tout moment. La résiliation prend effet
            à la fin de la période en cours.
          </p>
        </div>

        <div className="legal-section">
          <h2>6. Responsabilité</h2>
          <p>
            Aeryflux ne saurait être tenu responsable des interruptions de service
            imputables à des tiers ou à des causes de force majeure.
          </p>
        </div>

        <div className="legal-section">
          <h2>7. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGV : martinbaud.git@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}

export default Cgv;
