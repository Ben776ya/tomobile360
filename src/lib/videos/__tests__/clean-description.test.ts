import { describe, it, expect } from 'vitest'
import { cleanVideoDescription } from '../clean-description'

// Fixtures are real `videos.description` values from production (2026-10-22).

/** Channel footer present on 74 of the 75 published videos. */
const FOOTER = [
  'Abonne-toi et active la cloche, cher spectateur 😉',
  '',
  'Tomobile360 sur les réseaux:',
  'https://www.instagram.com/tomobile360.ma',
  '',
  'Amine sur les réseaux:',
  'https://www.instagram.com/amine.tomobile360',
  '',
  "Si tu as aimé cette vidéo, n'oublie pas le petit pouce bleu et surtout, passe une bonne journée! #PouceBleu #AbonneToi #Tomobile360 #Auto",
  '',
  'Suivez-nous sur:',
  'https://www.facebook.com/tomobilemaroc',
].join('\n')

describe('cleanVideoDescription', () => {
  it('returns an empty string for null, undefined and empty input', () => {
    expect(cleanVideoDescription(null)).toBe('')
    expect(cleanVideoDescription(undefined)).toBe('')
    expect(cleanVideoDescription('')).toBe('')
  })

  it('reduces a footer-only description to nothing', () => {
    // "Great Wall Motor : un géant en marche", "Renault Clio 6 : Prix au Maroc", …
    expect(cleanVideoDescription(FOOTER)).toBe('')
  })

  it('keeps the summary and drops the hashtag line and the footer', () => {
    const summary =
      'Denza, la marque haut de gamme du groupe BYD, fait son entrée officielle au Maroc avec quatre modèles alliant technologie, performances et confort. Parmi les points forts, une recharge ultra-rapide, des équipements de dernière génération et une autonomie pensée pour répondre aux attentes d’une clientèle premium. Une arrivée qui confirme l’accélération de la mobilité électrifiée au Royaume.'
    const description = `${summary}\n\n#challengemaquiagem  #Denza #BYD #Automobile #VoitureElectrique #MobilitéÉlectrique #EV #RechargeRapide #Innovation #AutomobileMaroc #Maroc #Premium #TransitionÉnergétique #BusinessMaroc #futuremobility \n\n${FOOTER}`
    expect(cleanVideoDescription(description)).toBe(summary)
  })

  it('drops comma-separated hashtag lines and keeps the paragraphs', () => {
    const body = [
      'Un nouveau rallye automobile relie le Maroc au Sénégal, avec une particularité : une flotte entièrement hybride et une vocation sociale affirmée.',
      '',
      'Porté par Ismail Lahlou et Albert Strauss, ce rallye s’inspire de l’esprit du mythique Paris-Dakar, mais l’adapte aux enjeux contemporains : mobilité durable, inclusion et partage.',
    ].join('\n')
    const description = `${body.replace('affirmée.', 'affirmée. ')}\n\n\n#QuestDakar, #RallyeAutomobile, #Maroc, #Casablanca, #Dakar, #Mauritanie, #RallyeHybride, #MobilitéDurable, #InclusionSociale, #TibuAfrica, #JeunesseAfricaine, #SportsAutomobiles, #Dakhla, #CôteAtlantique, #FlotteHybride, #Solidarité, #DiplomatieSportive, #Afrique, #Link&CoMaroc,\n\n${FOOTER}`
    expect(cleanVideoDescription(description)).toBe(body)
  })

  it('drops a tag block even when a stray word slipped into it', () => {
    const tags =
      '#MarcheVerte #rallyeautomobile #caravanehistorique #RoyalAutomobileClubMarocain #FédérationMarocaineDesVéhiculesAnciens #Saharamarocain #ONU #reconnaissanceinternationale #souveraineténationale #unitéd Royaume #Laâyoune #Tarfaya #Tah #Casablanca #Agadir'
    expect(cleanVideoDescription(`Le rallye de la Marche Verte.\n\n${tags}`)).toBe('Le rallye de la Marche Verte.')
  })

  it('drops a leading subscribe call but keeps related-video links and every language', () => {
    const description = `Abonne-toi et active la cloche, cher spectateur 😉\n\nprésentation de la clio 6 : https://www.youtube.com/watch?v=_XA-RESjp1c&t=319s\n\ntest drive de la clio 6 techno : https://www.youtube.com/watch?v=X75EEBBNqh4&t=252s\n\n\nCette semaine sur Tomobile 360, Amine prend le volant de la Clio 6 que vous pourrez réellement acheter au Maroc.\n\nهاد الأسبوع على Tomobile 360، أمين كيجرّب كليو 6 اللي غادي تقدر تشريها فعلاً فالمغرب.\n\n${FOOTER.split('\n').slice(2).join('\n')}`
    expect(cleanVideoDescription(description)).toBe(
      [
        'présentation de la clio 6 : https://www.youtube.com/watch?v=_XA-RESjp1c&t=319s',
        '',
        'test drive de la clio 6 techno : https://www.youtube.com/watch?v=X75EEBBNqh4&t=252s',
        '',
        'Cette semaine sur Tomobile 360, Amine prend le volant de la Clio 6 que vous pourrez réellement acheter au Maroc.',
        '',
        'هاد الأسبوع على Tomobile 360، أمين كيجرّب كليو 6 اللي غادي تقدر تشريها فعلاً فالمغرب.',
      ].join('\n'),
    )
  })

  it('keeps a bare link to another video', () => {
    const description = 'Abonne-toi et active la cloche, cher spectateur 😉\n\nDUSTER ET BIGSTER EN DETAILS\nhttps://youtu.be/Y3hzPIJ4ONA\n\nCette semaine sur Tomobile360, Amine conduit le tout nouveau Dacia Bigster hybride.'
    expect(cleanVideoDescription(description)).toBe(
      'DUSTER ET BIGSTER EN DETAILS\nhttps://youtu.be/Y3hzPIJ4ONA\n\nCette semaine sur Tomobile360, Amine conduit le tout nouveau Dacia Bigster hybride.',
    )
  })

  it('treats whitespace-only lines as blank and drops any social profile link', () => {
    const description = `Cette semaine sur Tomobile360, Amine prend le volant de la Kardian fabriquée au Maroc. Voici ce qu’il en pense.\n \nThis week on Tomobile360, Amine gets his hands on the Moroccan-made Kardian.\n\n\nAmine sur les réseaux:\nhttps://www.instagram.com/amineoncars`
    expect(cleanVideoDescription(description)).toBe(
      'Cette semaine sur Tomobile360, Amine prend le volant de la Kardian fabriquée au Maroc. Voici ce qu’il en pense.\n\nThis week on Tomobile360, Amine gets his hands on the Moroccan-made Kardian.',
    )
  })

  it('keeps emoji bullet lists from the summary', () => {
    const description = `📍2025, une année historique pour Škoda au Maroc !  \nDans cette interview, découvrez :  \n✅ Les nouveautés de la gamme Škoda  \n✅ Le succès du Kodiaq au Maroc  \n#Skoda #SkodaMaroc #Kodiaq #Kodiaq2026 #SUV #Automobile #Maroc\n\n\n${FOOTER}`
    expect(cleanVideoDescription(description)).toBe(
      '📍2025, une année historique pour Škoda au Maroc !\nDans cette interview, découvrez :\n✅ Les nouveautés de la gamme Škoda\n✅ Le succès du Kodiaq au Maroc',
    )
  })

  it('strips hashtags trailing a sentence but keeps the sentence', () => {
    expect(cleanVideoDescription('Essai complet du Kia Tasman au Maroc. #Kia #Tasman')).toBe(
      'Essai complet du Kia Tasman au Maroc.',
    )
    expect(cleanVideoDescription('Essai #Kia')).toBe('Essai')
  })

  it('drops generic subscribe / like / follow calls', () => {
    const description = [
      'Notre essai du nouveau Duster.',
      'Abonnez-vous à la chaîne !',
      'Subscribe for more car reviews',
      'Like et partage si la vidéo t’a plu',
      'Suivez-nous sur Instagram',
      'https://www.tiktok.com/@tomobile360',
      'https://www.youtube.com/@tomobile360',
    ].join('\n')
    expect(cleanVideoDescription(description)).toBe('Notre essai du nouveau Duster.')
  })

  it('keeps sentences that merely mention subscribers or social networks', () => {
    const description = 'Une vidéo vue par nos abonnés. Le constructeur est très actif sur les réseaux sociaux.'
    expect(cleanVideoDescription(description)).toBe(description)
  })
})
