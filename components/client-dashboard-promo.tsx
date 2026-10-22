import {
  BadgeCheck,
  BriefcaseBusiness,
  HeartPulse,
  Leaf,
  ShieldCheck,
  Sparkles,
  Utensils,
} from 'lucide-react'
import type { Locale } from '@/lib/i18n'

const copy = {
  fr: {
    kicker: 'L’élite du nettoyage professionnel en Suisse',
    title: 'Pourquoi choisir l’excellence de HS Quality Service ?',
    intro: 'Bien plus qu’un simple nettoyage. Nous apportons à votre patrimoine une expertise rigoureuse issue des secteurs suisses les plus exigeants en matière de sécurité, d’hygiène et de responsabilité.',
    guarantee: 'Garantie excellence & sécurité',
    insurance: 'Assurance RC professionnelle',
    parcours: 'Un parcours unique au service de votre confiance',
    expertise: [
      { title: 'Milieu hospitalier & cliniques', description: 'Maîtrise des protocoles stricts de désinfection, de décontamination microbiologique et de gestion des risques sanitaires. Une rigueur essentielle pour les cabinets médicaux et les espaces résidentiels haut de gamme.' },
      { title: 'Sapeur-pompier d’entreprise certifié', description: 'Discipline, organisation et réactivité immédiate. Nous appliquons des standards de sécurité exigeants pour protéger vos locaux professionnels et votre patrimoine.' },
      { title: 'Engagement Croix-Rouge & secourisme', description: 'Une éthique professionnelle irréprochable, une discrétion totale et une attention humaine dans chaque espace où nous intervenons.' },
      { title: 'Restauration & normes d’hygiène', description: 'Application des principes HACCP pour les surfaces de cuisson, la gestion des graisses et les zones de stockage alimentaire, dans vos cuisines professionnelles ou privées.' },
    ],
    securityTitle: 'Sécurité absolue — couverture Baloise',
    security: 'Nos interventions sont couvertes par une assurance responsabilité civile professionnelle auprès de Baloise à hauteur de CHF 5’000’000.–, pour protéger vos objets, équipements et infrastructures contre les dommages imprévus.',
    complianceTitle: 'Personnel déclaré & normes CCT',
    compliance: 'Le respect de la législation suisse est au cœur de notre activité. Notre personnel est déclaré, assuré contre les accidents (LAA) et rémunéré selon les directives de la convention collective de travail du secteur.',
    ecoTitle: 'Des produits adaptés, pour préserver vos matériaux',
    ecoCopy: 'Nous privilégions des agents écoresponsables de qualité professionnelle, biodégradables et choisis selon chaque support. Le produit et la méthode sont adaptés au matériau et à son état.',
    materials: [
      { title: 'Bois & parquets', detail: 'Cires et huiles adaptées' },
      { title: 'Inox & vitres', detail: 'Finition sans traces' },
      { title: 'Métaux', detail: 'Entretien préventif' },
      { title: 'Marbre & pierres', detail: 'Soin au pH adapté' },
    ],
    materialsLabel: 'Matériaux que nous entretenons',
  },
  es: {
    kicker: 'Limpieza profesional de excelencia en Suiza',
    title: '¿Por qué elegir la excelencia de HS Quality Service?',
    intro: 'Mucho más que una limpieza. Cuidamos tus espacios con una experiencia rigurosa, forjada en sectores suizos con altas exigencias de seguridad, higiene y responsabilidad.',
    guarantee: 'Excelencia y seguridad garantizadas',
    insurance: 'Seguro de responsabilidad civil profesional',
    parcours: 'Una trayectoria al servicio de tu confianza',
    expertise: [
      { title: 'Hospitales y clínicas', description: 'Dominio de protocolos exigentes de desinfección, descontaminación microbiológica y prevención de riesgos sanitarios. Una rigurosidad esencial para consultorios y espacios residenciales de alta gama.' },
      { title: 'Bombero de empresa certificado', description: 'Disciplina, organización y capacidad de respuesta. Aplicamos estándares de seguridad exigentes para proteger tus instalaciones comerciales y tu patrimonio.' },
      { title: 'Compromiso con Cruz Roja y primeros auxilios', description: 'Ética profesional, discreción y atención humana en cada espacio en el que trabajamos.' },
      { title: 'Restauración y normas de higiene', description: 'Aplicación de principios HACCP en superficies de cocción, gestión de grasas y zonas de almacenamiento de alimentos, en cocinas profesionales y privadas.' },
    ],
    securityTitle: 'Seguridad absoluta — cobertura Baloise',
    security: 'Nuestros servicios cuentan con un seguro de responsabilidad civil profesional de Baloise por CHF 5.000.000, para proteger tus objetos, equipos e instalaciones frente a daños imprevistos.',
    complianceTitle: 'Personal declarado y convenio colectivo',
    compliance: 'El cumplimiento de la legislación suiza es esencial para nuestra actividad. Nuestro personal está declarado, asegurado contra accidentes (LAA) y remunerado conforme a las directrices del convenio colectivo del sector.',
    ecoTitle: 'Productos adecuados para cuidar tus materiales',
    ecoCopy: 'Priorizamos productos profesionales biodegradables y responsables con el medio ambiente, elegidos según cada superficie. Adaptamos el producto y el método al material y a su estado.',
    materials: [
      { title: 'Madera y parqué', detail: 'Ceras y aceites adecuados' },
      { title: 'Acero inoxidable y cristales', detail: 'Acabado sin marcas' },
      { title: 'Metales', detail: 'Mantenimiento preventivo' },
      { title: 'Mármol y piedra', detail: 'Cuidado con pH adecuado' },
    ],
    materialsLabel: 'Materiales que cuidamos',
  },
  en: {
    kicker: 'Professional cleaning excellence in Switzerland',
    title: 'Why choose excellence from HS Quality Service?',
    intro: 'More than a cleaning service. We bring rigorous expertise shaped by Swiss sectors with demanding standards for safety, hygiene, and responsibility.',
    guarantee: 'Excellence and safety assured',
    insurance: 'Professional liability insurance',
    parcours: 'A distinctive background, earning your trust',
    expertise: [
      { title: 'Hospitals and clinics', description: 'Experienced with strict disinfection, microbiological decontamination, and health-risk prevention protocols. A rigorous approach for medical practices and high-end homes.' },
      { title: 'Certified in-house firefighter', description: 'Discipline, organization, and a prompt response. We apply demanding safety standards to help protect your commercial premises and property.' },
      { title: 'Red Cross and first-aid commitment', description: 'Professional ethics, discretion, and thoughtful care in every space where we work.' },
      { title: 'Hospitality and hygiene standards', description: 'Applying HACCP principles to cooking surfaces, grease management, and food-storage areas in professional and private kitchens.' },
    ],
    securityTitle: 'Peace of mind — Baloise coverage',
    security: 'Our work is covered by professional liability insurance with Baloise up to CHF 5,000,000, helping protect your belongings, equipment, and premises against unforeseen damage.',
    complianceTitle: 'Declared staff and collective standards',
    compliance: 'Compliance with Swiss law is central to our business. Our cleaning staff are declared, insured against accidents (LAA), and paid in line with the sector’s collective labour agreement.',
    ecoTitle: 'Suitable products to care for your materials',
    ecoCopy: 'We prioritize professional-grade, biodegradable products selected for each surface. Products and methods are matched to the material and its condition.',
    materials: [
      { title: 'Wood and parquet', detail: 'Suitable waxes and oils' },
      { title: 'Stainless steel and glass', detail: 'Streak-free finish' },
      { title: 'Metals', detail: 'Preventive care' },
      { title: 'Marble and stone', detail: 'Material-appropriate pH' },
    ],
    materialsLabel: 'Materials we care for',
  },
} satisfies Record<Locale, {
  kicker: string
  title: string
  intro: string
  guarantee: string
  insurance: string
  parcours: string
  expertise: { title: string; description: string }[]
  securityTitle: string
  security: string
  complianceTitle: string
  compliance: string
  ecoTitle: string
  ecoCopy: string
  materials: { title: string; detail: string }[]
  materialsLabel: string
}>

const expertiseIcons = [HeartPulse, ShieldCheck, BadgeCheck, Utensils]
const materialIcons = [Sparkles, Sparkles, BriefcaseBusiness, ShieldCheck]

export function ClientDashboardPromo({ locale }: { locale: Locale }) {
  const t = copy[locale]

  return (
    <section id="client-dashboard-promo" aria-labelledby="client-promo-title" className="mx-auto my-10 w-full max-w-5xl rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-8">
      <header className="mb-8 flex flex-col gap-5 border-b border-border pb-7 text-center md:flex-row md:items-start md:justify-between md:text-left">
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-primary">{t.kicker}</span>
          <h2 id="client-promo-title" className="text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">{t.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{t.intro}</p>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-2 md:items-end">
          <span className="whitespace-nowrap rounded-full bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider text-secondary-foreground">{t.guarantee}</span>
          <div className="rounded-xl bg-foreground px-4 py-3 text-center text-background md:text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">{t.insurance}</span>
            <span className="mt-1 block text-sm font-extrabold">Baloise · CHF 5’000’000.–</span>
          </div>
        </div>
      </header>

      <div className="mb-8">
        <h3 className="mb-5 flex items-center justify-center gap-2 text-center text-lg font-bold sm:justify-start sm:text-xl">
          <ShieldCheck aria-hidden="true" className="size-5 shrink-0 text-primary" />{t.parcours}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {t.expertise.map((item, index) => {
            const Icon = expertiseIcons[index]
            return (
              <article key={item.title} className="flex items-start gap-4 rounded-2xl border border-border bg-secondary/35 p-4 transition-colors hover:border-primary/30 sm:p-5">
                <Icon aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-primary" />
                <div>
                  <h4 className="text-sm font-bold text-foreground sm:text-base">{item.title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <article className="rounded-2xl border border-border bg-secondary/40 p-5 sm:p-6">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground"><ShieldCheck aria-hidden="true" className="size-5 text-primary" />{t.securityTitle}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{t.security}</p>
        </article>
        <article className="rounded-2xl border border-border bg-secondary/40 p-5 sm:p-6">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground"><BadgeCheck aria-hidden="true" className="size-5 text-primary" />{t.complianceTitle}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{t.compliance}</p>
        </article>
      </div>

      <section aria-labelledby="client-promo-materials-title" className="rounded-2xl border border-border bg-secondary/55 p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <Leaf aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h3 id="client-promo-materials-title" className="text-base font-bold text-foreground sm:text-lg">{t.ecoTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.ecoCopy}</p>
          </div>
        </div>
        <h4 className="sr-only">{t.materialsLabel}</h4>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {t.materials.map((material, index) => {
            const Icon = materialIcons[index]
            return (
              <li key={material.title} className="flex min-w-0 flex-col items-center rounded-xl border border-border bg-card p-3 text-center">
                <Icon aria-hidden="true" className="mb-2 size-5 text-primary" />
                <span className="text-xs font-semibold leading-snug text-foreground">{material.title}</span>
                <span className="mt-2 rounded-md bg-secondary px-2 py-1 text-[11px] font-medium leading-snug text-secondary-foreground">{material.detail}</span>
              </li>
            )
          })}
        </ul>
      </section>
    </section>
  )
}
