import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions Légales | Tomobile 360',
  description: 'Mentions légales de la plateforme Tomobile 360, marketplace automobile au Maroc.',
  robots: { index: false, follow: true },
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-8">
          Mentions Légales
        </h1>

        <div className="prose max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">1. Éditeur du site</h2>
            <p className="text-gray-600">
              Le site Tomobile360.ma est édité par :<br />
              <strong>Tomobile 360 SARL</strong><br />
              Adresse : Casablanca, Maroc<br />
              Téléphone : +212 522-123456<br />
              Email : contact@tomobile360.ma<br />
              Directeur de la publication : [Nom du directeur]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">2. Hébergement</h2>
            <p className="text-gray-600">
              Le site est hébergé par :<br />
              <strong>Vercel Inc.</strong><br />
              440 N Barranca Ave #4133<br />
              Covina, CA 91723<br />
              États-Unis
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">3. Propriété intellectuelle</h2>
            <p className="text-gray-600">
              L&apos;ensemble du contenu du site Tomobile360.ma (textes, images, vidéos, logos, graphismes, etc.)
              est protégé par les lois relatives à la propriété intellectuelle. Toute reproduction,
              représentation, modification ou exploitation non autorisée du contenu est interdite et
              constitue une contrefaçon sanctionnée par le Code de la propriété intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">4. Responsabilité</h2>
            <p className="text-gray-600">
              Tomobile 360 s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées
              sur ce site. Toutefois, elle ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité
              des informations mises à disposition. En conséquence, Tomobile 360 décline toute
              responsabilité pour toute imprécision, inexactitude ou omission portant sur des
              informations disponibles sur ce site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">5. Liens hypertextes</h2>
            <p className="text-gray-600">
              Le site peut contenir des liens vers d&apos;autres sites web. Tomobile 360 n&apos;exerce aucun
              contrôle sur ces sites et décline toute responsabilité quant à leur contenu et aux
              dommages pouvant résulter de leur utilisation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">6. Droit applicable</h2>
            <p className="text-gray-600">
              Les présentes mentions légales sont régies par le droit marocain. En cas de litige,
              les tribunaux marocains seront seuls compétents.
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
