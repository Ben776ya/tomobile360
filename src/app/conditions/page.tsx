import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Consultez les conditions générales d'utilisation de la plateforme Tomobile 360.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: 'https://www.tomobile360.ma/conditions',
  },
}

export default function ConditionsPage() {
  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-8">
          Conditions Générales d&apos;Utilisation
        </h1>

        <div className="prose max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">1. Objet</h2>
            <p className="text-gray-600">
              Les présentes Conditions Générales d&apos;Utilisation (CGU) ont pour objet de définir les
              modalités et conditions d&apos;utilisation du site Tomobile360.ma, ainsi que les droits
              et obligations des utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">2. Acceptation des CGU</h2>
            <p className="text-gray-600">
              L&apos;utilisation du site implique l&apos;acceptation pleine et entière des présentes CGU.
              Tomobile 360 se réserve le droit de modifier ces conditions à tout moment. Les
              utilisateurs seront informés de toute modification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">3. Services proposés</h2>
            <p className="text-gray-600 mb-4">
              Tomobile360.ma propose les services suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Consultation de fiches techniques et de prix de véhicules neufs au Maroc</li>
              <li>Référencement d&apos;annonces de véhicules d&apos;occasion proposées par notre partenaire M-OCCAZ</li>
              <li>Comparateurs, essais et actualités automobiles</li>
              <li>Mise en relation avec nos partenaires services (crédit auto SOFAC, assurance AtlantaSanad, entretien, contrôle technique)</li>
              <li>Inscription à la newsletter et au compte utilisateur (favoris, alertes)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">4. Inscription et compte utilisateur</h2>
            <p className="text-gray-600">
              L&apos;accès à certains services nécessite la création d&apos;un compte utilisateur.
              L&apos;utilisateur s&apos;engage à fournir des informations exactes et à maintenir la
              confidentialité de ses identifiants de connexion. Il est responsable de toutes
              les activités effectuées sous son compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">5. Annonces de véhicules d&apos;occasion</h2>
            <p className="text-gray-600 mb-3">
              Tomobile 360 n&apos;héberge pas directement d&apos;annonces de vente de
              véhicules d&apos;occasion. Les annonces affichées sur la rubrique{' '}
              <em>/occasion</em> proviennent de notre partenaire M-OCCAZ
              (m-occaz.ma), qui assure la vérification, l&apos;hébergement et le
              suivi commercial de chaque annonce.
            </p>
            <p className="text-gray-600">
              Pour publier une annonce, vendre ou estimer votre véhicule, les
              utilisateurs sont redirigés vers M-OCCAZ et soumis à ses propres
              conditions d&apos;utilisation. Tomobile 360 ne perçoit aucune
              commission de vente et n&apos;intervient pas dans les transactions
              entre vendeurs et acheteurs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">6. Obligations de Tomobile 360</h2>
            <p className="text-gray-600">
              Tomobile 360 s&apos;engage à mettre tout en œuvre pour assurer la disponibilité et
              le bon fonctionnement du site. Toutefois, la société ne peut garantir une
              disponibilité permanente et décline toute responsabilité en cas d&apos;interruption
              de service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">7. Propriété intellectuelle</h2>
            <p className="text-gray-600">
              Tous les contenus du site (textes, images, logos, etc.) sont protégés par le
              droit de la propriété intellectuelle. Toute reproduction non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">8. Limitation de responsabilité</h2>
            <p className="text-gray-600">
              Tomobile 360 agit en tant qu&apos;intermédiaire et ne peut être tenu responsable des
              transactions entre utilisateurs. La société ne garantit pas l&apos;exactitude des
              informations publiées par les utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">9. Sanctions</h2>
            <p className="text-gray-600">
              En cas de non-respect des présentes CGU, Tomobile 360 se réserve le droit de
              suspendre ou supprimer tout compte utilisateur, sans préavis ni indemnité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">10. Droit applicable</h2>
            <p className="text-gray-600">
              Les présentes CGU sont régies par le droit marocain. Tout litige sera soumis
              à la compétence exclusive des tribunaux marocains.
            </p>
          </section>

          <p className="text-sm text-gray-600 mt-12 pt-8 border-t border-gray-200">
            Dernière mise à jour : Mai 2026
          </p>
        </div>
      </div>
    </div>
  )
}
