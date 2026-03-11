export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          Politique de Cookies
        </h1>

        <div className="prose max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p className="text-gray-600">
              Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur,
              tablette, smartphone) lors de votre visite sur notre site. Les cookies nous
              permettent de reconnaître votre navigateur et de mémoriser certaines informations
              pour améliorer votre expérience de navigation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Types de cookies utilisés</h2>

            <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Cookies essentiels</h3>
            <p className="text-gray-600 mb-4">
              Ces cookies sont nécessaires au fonctionnement du site. Ils permettent d&apos;utiliser
              les principales fonctionnalités du site (connexion, panier, etc.). Sans ces cookies,
              vous ne pourrez pas utiliser normalement le site.
            </p>

            <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Cookies de performance</h3>
            <p className="text-gray-600 mb-4">
              Ces cookies nous permettent d&apos;analyser l&apos;utilisation du site afin d&apos;en améliorer
              les performances. Ils collectent des informations anonymes sur les pages visitées,
              le temps passé sur le site, etc.
            </p>

            <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Cookies de fonctionnalité</h3>
            <p className="text-gray-600 mb-4">
              Ces cookies permettent de mémoriser vos préférences (langue, région, paramètres
              d&apos;affichage) pour personnaliser votre expérience sur le site.
            </p>

            <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Cookies publicitaires</h3>
            <p className="text-gray-600">
              Ces cookies sont utilisés pour vous proposer des publicités pertinentes en fonction
              de vos centres d&apos;intérêt. Ils peuvent également limiter le nombre de fois où vous
              voyez une publicité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Liste des cookies utilisés</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nom</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Durée</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Finalité</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">session_id</td>
                    <td className="py-3 px-4">Essentiel</td>
                    <td className="py-3 px-4">Session</td>
                    <td className="py-3 px-4">Identification de session</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">auth_token</td>
                    <td className="py-3 px-4">Essentiel</td>
                    <td className="py-3 px-4">7 jours</td>
                    <td className="py-3 px-4">Authentification</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">_ga</td>
                    <td className="py-3 px-4">Performance</td>
                    <td className="py-3 px-4">2 ans</td>
                    <td className="py-3 px-4">Google Analytics</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">preferences</td>
                    <td className="py-3 px-4">Fonctionnalité</td>
                    <td className="py-3 px-4">1 an</td>
                    <td className="py-3 px-4">Préférences utilisateur</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Gestion des cookies</h2>
            <p className="text-gray-600 mb-4">
              Vous pouvez à tout moment choisir d&apos;accepter ou de refuser les cookies. Plusieurs
              possibilités s&apos;offrent à vous :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>
                <strong>Via notre bandeau de cookies :</strong> Lors de votre première visite,
                vous pouvez accepter ou refuser les cookies non essentiels.
              </li>
              <li>
                <strong>Via les paramètres de votre navigateur :</strong> Vous pouvez configurer
                votre navigateur pour bloquer ou supprimer les cookies.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Configuration du navigateur</h2>
            <p className="text-gray-600 mb-4">
              Voici comment gérer les cookies dans les principaux navigateurs :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Chrome :</strong> Paramètres &gt; Confidentialité et sécurité &gt; Cookies</li>
              <li><strong>Firefox :</strong> Options &gt; Vie privée et sécurité &gt; Cookies</li>
              <li><strong>Safari :</strong> Préférences &gt; Confidentialité &gt; Cookies</li>
              <li><strong>Edge :</strong> Paramètres &gt; Cookies et autorisations de site</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Conséquences du refus des cookies</h2>
            <p className="text-gray-600">
              Le refus des cookies essentiels peut empêcher l&apos;utilisation de certaines
              fonctionnalités du site. Le refus des cookies non essentiels n&apos;affectera pas
              votre navigation, mais pourrait limiter la personnalisation de votre expérience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Contact</h2>
            <p className="text-gray-600">
              Pour toute question concernant notre politique de cookies, contactez-nous :<br />
              Email : privacy@tomobile360.ma
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
