import type { Metadata } from 'next'
import { BUSINESS_INFO } from '@/lib/business-info'
import { CONSENT_STORAGE_KEY } from '@/lib/analytics/consent'
import { ConsentChoice } from './ConsentChoice'

export const metadata: Metadata = {
  title: 'Politique de Cookies',
  description: "Politique d'utilisation des cookies sur la plateforme Tomobile 360.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: 'https://www.tomobile360.ma/cookies',
  },
}

function TH({ children }: { children: React.ReactNode }) {
  return <th className="text-left py-3 px-4 font-semibold text-gray-700">{children}</th>
}

function TD({ children }: { children: React.ReactNode }) {
  return <td className="py-3 px-4 align-top">{children}</td>
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-8">
          Politique de Cookies
        </h1>

        <div className="prose max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p className="text-gray-600">
              Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur,
              tablette, smartphone) lors de votre visite sur un site. Le stockage local de votre
              navigateur fonctionne de façon comparable. Cette page liste tout ce que
              tomobile360.ma dépose ou charge sur votre appareil. Le site n&apos;utilise aucun
              cookie publicitaire.
            </p>
          </section>

          <section id="gerer" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-700 mb-4">2. Gérer vos choix</h2>
            <p className="text-gray-600 mb-4">
              Votre choix porte sur Google Analytics et sur les reels Instagram de la page
              d&apos;accueil (section 4). Vous pouvez le modifier à tout moment :
            </p>
            <ConsentChoice />
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">3. Ce qui est utilisé sans votre consentement</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <TH>Nom</TH>
                    <TH>Émetteur</TH>
                    <TH>Durée</TH>
                    <TH>Finalité</TH>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-200">
                    <TD>{CONSENT_STORAGE_KEY} (stockage local)</TD>
                    <TD>Tomobile 360</TD>
                    <TD>Jusqu&apos;à ce que vous changiez d&apos;avis ou effaciez les données du site</TD>
                    <TD>Mémoriser votre choix (accepter ou refuser)</TD>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <TD>sb-…-auth-token (cookie)</TD>
                    <TD>Tomobile 360, via Supabase</TD>
                    <TD>400 jours, supprimé à la déconnexion</TD>
                    <TD>
                      Connexion à l&apos;espace réservé à l&apos;équipe Tomobile 360. Il n&apos;est pas
                      déposé chez les visiteurs.
                    </TD>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 mt-4">
              Sans cookie, notre hébergeur Vercel mesure la fréquentation des pages et leurs
              performances d&apos;affichage (Vercel Web Analytics et Speed Insights), et les erreurs
              techniques sont transmises à Sentry pour être corrigées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">4. Services utilisés uniquement avec votre accord</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <TH>Nom</TH>
                    <TH>Émetteur</TH>
                    <TH>Durée</TH>
                    <TH>Finalité</TH>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-200">
                    <TD>_ga, _ga_&lt;identifiant&gt; (cookies)</TD>
                    <TD>Google (Google Analytics)</TD>
                    <TD>2 ans</TD>
                    <TD>Mesure d&apos;audience : pages consultées, durée et provenance des visites</TD>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <TD>Cookies Instagram</TD>
                    <TD>Meta (instagram.com)</TD>
                    <TD>Fixée par Meta</TD>
                    <TD>
                      Lecture des reels Instagram intégrés à la page d&apos;accueil. Ils sont aussi
                      chargés si vous cliquez sur « Charger les reels ».
                    </TD>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 mt-4">
              Si vous refusez, le site reste entièrement utilisable : Google Analytics n&apos;est pas
              chargé et les reels de la page d&apos;accueil sont remplacés par un bouton « Charger les
              reels » et un lien vers Instagram. Si vous retirez votre accord, Google Analytics
              s&apos;arrête et ses cookies _ga sont supprimés ; les cookies déjà déposés par
              Instagram relèvent de Meta et se suppriment depuis votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">5. Vidéos et contenus intégrés</h2>
            <p className="text-gray-600">
              Certaines pages intègrent des lecteurs tiers : vidéos YouTube sur les pages vidéo et
              les fiches modèles, et, dans certains articles, des contenus YouTube, Vimeo,
              Dailymotion, Facebook, Instagram ou TikTok. Ces services peuvent déposer leurs propres
              cookies lorsque leur lecteur est chargé, à l&apos;ouverture de la page ou au clic sur
              la vidéo selon les pages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">6. Configuration du navigateur</h2>
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
            <h2 className="text-xl font-bold text-slate-700 mb-4">7. Contact</h2>
            <p className="text-gray-600">
              Pour toute question concernant notre politique de cookies, contactez-nous :<br />
              Email : {BUSINESS_INFO.EMAIL_PRIVACY}
            </p>
          </section>

          <p className="text-sm text-gray-600 mt-12 pt-8 border-t border-gray-200">
            Dernière mise à jour : Octobre 2026
          </p>
        </div>
      </div>
    </div>
  )
}
