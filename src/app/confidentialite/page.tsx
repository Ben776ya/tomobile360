export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-8">
          Politique de Confidentialité
        </h1>

        <div className="prose max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">1. Introduction</h2>
            <p className="text-gray-600">
              Tomobile 360 s&apos;engage à protéger la vie privée de ses utilisateurs. Cette politique
              de confidentialité explique comment nous collectons, utilisons et protégeons vos
              données personnelles lorsque vous utilisez notre site web et nos services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">2. Données collectées</h2>
            <p className="text-gray-600 mb-4">
              Nous collectons les types de données suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Informations d&apos;identification (nom, prénom, email, téléphone)</li>
              <li>Informations de connexion (adresse IP, type de navigateur)</li>
              <li>Données relatives aux véhicules (annonces publiées)</li>
              <li>Préférences de recherche et historique de navigation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">3. Utilisation des données</h2>
            <p className="text-gray-600 mb-4">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Fournir et améliorer nos services</li>
              <li>Gérer votre compte utilisateur</li>
              <li>Vous envoyer des communications relatives à nos services</li>
              <li>Personnaliser votre expérience sur le site</li>
              <li>Assurer la sécurité de notre plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">4. Partage des données</h2>
            <p className="text-gray-600">
              Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations
              avec des tiers uniquement dans les cas suivants : prestataires de services essentiels,
              obligations légales, ou avec votre consentement explicite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">5. Sécurité des données</h2>
            <p className="text-gray-600">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles
              appropriées pour protéger vos données contre tout accès non autorisé, modification,
              divulgation ou destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">6. Vos droits</h2>
            <p className="text-gray-600 mb-4">
              Conformément à la loi, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Droit d&apos;accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l&apos;effacement</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d&apos;opposition</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Pour exercer ces droits, contactez-nous à : privacy@tomobile360.ma
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">7. Conservation des données</h2>
            <p className="text-gray-600">
              Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles
              elles ont été collectées, puis archivées conformément aux obligations légales en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">8. Contact</h2>
            <p className="text-gray-600">
              Pour toute question concernant cette politique de confidentialité, contactez-nous :<br />
              Email : privacy@tomobile360.ma<br />
              Adresse : Casablanca, Maroc
            </p>
          </section>

          <p className="text-sm text-gray-600 mt-12 pt-8 border-t border-gray-200">
            Dernière mise à jour : Janvier 2024
          </p>
        </div>
      </div>
    </div>
  )
}
