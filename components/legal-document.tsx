import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, FileText, ShieldCheck } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import type { Locale } from '@/lib/i18n'

type LegalSection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

type LegalCopy = {
  brandSubtitle: string
  home: string
  eyebrow: string
  title: string
  intro: string
  termsLink: string
  privacyLink: string
  contents: string
  noteTitle: string
  note: string
  updated: string
  back: string
  sections: LegalSection[]
}

const legalCopy: Record<'terms' | 'privacy', Record<Locale, LegalCopy>> = {
  terms: {
    es: {
      brandSubtitle: 'Quality Service · Suiza', home: 'Volver al inicio', eyebrow: 'INFORMACIÓN LEGAL',
      title: 'Términos y condiciones', intro: 'Estas condiciones describen el uso del portal HS Cleaning y las reglas generales para solicitar servicios de limpieza de H&S Quality Service.',
      termsLink: 'Términos y condiciones', privacyLink: 'Política de privacidad', contents: 'Documentos legales',
      noteTitle: 'Sobre las solicitudes', note: 'Enviar una solicitud o consultar una estimación no confirma por sí solo una reserva. El servicio se acuerda cuando H&S Quality Service confirma sus condiciones y disponibilidad.',
      updated: 'Última revisión: 3 de octubre de 2026', back: 'Volver al inicio',
      sections: [
        { heading: '1. Ámbito de aplicación', paragraphs: ['Estos términos se aplican al portal hs-cleaning.ch y a las solicitudes de limpieza gestionadas por H&S Service Sàrl bajo las marcas HS Cleaning y H&S Quality Service. La sociedad está inscrita en el Registro Mercantil de Ginebra con el IDE CHE-259.228.541. Al crear una cuenta o enviar una solicitud, aceptas estas condiciones. La prestación concreta también puede estar sujeta a las condiciones indicadas en el presupuesto o en la confirmación del servicio.'] },
        { heading: '2. Cuenta y uso del portal', paragraphs: ['Proporciona información exacta y actualízala cuando cambie. Eres responsable de proteger tus credenciales y de las acciones realizadas desde tu cuenta. Si creas una cuenta en nombre de una empresa, confirmas que estás autorizado para representarla.', 'Utiliza el portal de forma lícita y no intentes acceder sin autorización a cuentas, sistemas o datos de otras personas. Podemos limitar el acceso cuando sea necesario para proteger el portal, sus usuarios o el cumplimiento de estas condiciones.'] },
        { heading: '3. Solicitudes, estimaciones y confirmación', paragraphs: ['La estimación mostrada en el portal es orientativa y se calcula a partir de la información facilitada. No constituye por sí sola una oferta final ni garantiza la disponibilidad de una fecha. El precio, alcance y duración pueden variar si las condiciones reales del inmueble o del servicio difieren de lo indicado.', 'Una solicitud no equivale a una reserva confirmada. H&S Quality Service revisará los detalles y comunicará la disponibilidad y las condiciones aplicables. El servicio queda acordado cuando ambas partes confirman la propuesta, el precio y la fecha por escrito.'] },
        { heading: '4. Preparación y acceso al inmueble', paragraphs: ['Facilita una dirección correcta y describe las características relevantes del lugar, el acceso, el estacionamiento y las tareas solicitadas. Informa antes del servicio sobre superficies delicadas, objetos frágiles, riesgos o instrucciones de acceso. Las llaves solo se entregarán o recibirán mediante el procedimiento acordado para ese servicio.'] },
        { heading: '5. Cambios, cancelaciones y pago', paragraphs: ['Si necesitas modificar o cancelar un servicio, ponte en contacto con H&S Quality Service tan pronto como sea posible. Los plazos, cargos y condiciones aplicables serán los que figuren en la propuesta o confirmación aceptada, sin perjuicio de los derechos obligatorios que establezca la ley.', 'El pago y la facturación se rigen por las condiciones indicadas en el presupuesto confirmado o en la factura correspondiente. No se aplicará en esta página una tarifa de cancelación o un método de pago que no se haya comunicado en dichas condiciones.'] },
        { heading: '6. Responsabilidad y disponibilidad', paragraphs: ['H&S Quality Service procura que el portal esté disponible y que la información sea clara, pero puede realizar tareas de mantenimiento o afrontar interrupciones técnicas. Nada en estos términos excluye una responsabilidad que no pueda excluirse conforme a la legislación aplicable. Los derechos imperativos de consumidores permanecen intactos.'] },
        { heading: '7. Propiedad intelectual', paragraphs: ['El contenido, la identidad visual y los materiales del portal pertenecen a H&S Quality Service o se utilizan con autorización. No los copies, publiques ni reutilices con fines comerciales sin permiso, salvo cuando la ley lo permita.'] },
        { heading: '8. Ley aplicable y contacto', paragraphs: ['Estas condiciones se interpretan conforme al derecho suizo, sin limitar las normas imperativas de protección al consumidor que resulten aplicables. El operador del portal es H&S Service Sàrl (IDE CHE-259.228.541), con domicilio social en Avenue du Simplon 9, c/o Natividad Abrego Saavedra, 1225 Chêne-Bourg, Suiza. Para consultas sobre una solicitud, también puedes utilizar los datos de contacto facilitados en tu presupuesto o en las comunicaciones del servicio.'] },
      ],
    },
    fr: {
      brandSubtitle: 'Quality Service · Suisse', home: 'Retour à l\'accueil', eyebrow: 'INFORMATIONS JURIDIQUES',
      title: 'Conditions générales', intro: 'Ces conditions décrivent l\'utilisation du portail HS Cleaning et les règles générales applicables aux demandes de nettoyage auprès de H&S Quality Service.',
      termsLink: 'Conditions générales', privacyLink: 'Politique de confidentialité', contents: 'Documents juridiques',
      noteTitle: 'À propos des demandes', note: 'L\'envoi d\'une demande ou la consultation d\'une estimation ne confirme pas à lui seul une réservation. La prestation est convenue lorsque H&S Quality Service confirme ses conditions et sa disponibilité.',
      updated: 'Dernière mise à jour : 3 octobre 2026', back: 'Retour à l\'accueil',
      sections: [
        { heading: '1. Champ d\'application', paragraphs: ['Les présentes conditions s\'appliquent au portail hs-cleaning.ch et aux demandes de nettoyage gérées par H&S Service Sàrl sous les marques HS Cleaning et H&S Quality Service. La société est inscrite au registre du commerce de Genève sous l’IDE CHE-259.228.541. En créant un compte ou en envoyant une demande, vous acceptez ces conditions. La prestation concernée peut également être soumise aux conditions indiquées dans le devis ou la confirmation de service.'] },
        { heading: '2. Compte et utilisation du portail', paragraphs: ['Veuillez fournir des informations exactes et les mettre à jour en cas de changement. Vous êtes responsable de la protection de vos identifiants et des actions effectuées depuis votre compte. Si vous créez un compte pour une entreprise, vous confirmez être autorisé à la représenter.', 'Utilisez le portail de manière licite et ne tentez pas d\'accéder sans autorisation aux comptes, systèmes ou données d\'autrui. Nous pouvons limiter l\'accès lorsque cela est nécessaire pour protéger le portail, ses utilisateurs ou le respect des présentes conditions.'] },
        { heading: '3. Demandes, estimations et confirmation', paragraphs: ['L\'estimation affichée sur le portail est indicative et calculée à partir des informations fournies. Elle ne constitue pas, à elle seule, une offre définitive et ne garantit pas la disponibilité d\'une date. Le prix, l\'étendue et la durée peuvent varier si les conditions réelles du bien ou de la prestation diffèrent des informations communiquées.', 'Une demande ne vaut pas réservation confirmée. H&S Quality Service examine les détails et communique les disponibilités et conditions applicables. La prestation est convenue lorsque les deux parties confirment par écrit la proposition, le prix et la date.'] },
        { heading: '4. Préparation et accès au bien', paragraphs: ['Veuillez indiquer une adresse exacte et décrire les caractéristiques pertinentes des lieux, l\'accès, le stationnement et les tâches souhaitées. Avant la prestation, signalez les surfaces délicates, les objets fragiles, les risques ou les consignes d\'accès. Les clés ne sont remises ou reçues que selon la procédure convenue pour la prestation concernée.'] },
        { heading: '5. Modifications, annulations et paiement', paragraphs: ['Si vous devez modifier ou annuler une prestation, veuillez contacter H&S Quality Service dès que possible. Les délais, frais et conditions applicables sont ceux indiqués dans la proposition ou la confirmation acceptée, sous réserve des droits impératifs prévus par la loi.', 'Le paiement et la facturation sont régis par les conditions indiquées dans le devis confirmé ou la facture correspondante. Aucun frais d\'annulation ni moyen de paiement non communiqué dans ces documents n\'est créé par la présente page.'] },
        { heading: '6. Responsabilité et disponibilité', paragraphs: ['H&S Quality Service s\'efforce de maintenir le portail disponible et de fournir des informations claires, mais des maintenances ou interruptions techniques peuvent survenir. Aucune disposition des présentes conditions n\'exclut une responsabilité qui ne peut l\'être selon le droit applicable. Les droits impératifs des consommateurs demeurent réservés.'] },
        { heading: '7. Propriété intellectuelle', paragraphs: ['Le contenu, l\'identité visuelle et les éléments du portail appartiennent à H&S Quality Service ou sont utilisés avec autorisation. Ils ne peuvent être copiés, publiés ou réutilisés à des fins commerciales sans autorisation, sauf lorsque la loi le permet.'] },
        { heading: '8. Droit applicable et contact', paragraphs: ['Les présentes conditions sont interprétées conformément au droit suisse, sans préjudice des règles impératives de protection des consommateurs applicables. L’exploitant du portail est H&S Service Sàrl (IDE CHE-259.228.541), dont le siège est situé Avenue du Simplon 9, c/o Natividad Abrego Saavedra, 1225 Chêne-Bourg, Suisse. Pour toute question concernant une demande, vous pouvez également utiliser les coordonnées communiquées dans votre devis ou les échanges relatifs à la prestation.'] },
      ],
    },
    en: {
      brandSubtitle: 'Quality Service · Switzerland', home: 'Back to home', eyebrow: 'LEGAL INFORMATION',
      title: 'Terms and conditions', intro: 'These terms describe your use of the HS Cleaning portal and the general rules for requesting cleaning services from H&S Quality Service.',
      termsLink: 'Terms and conditions', privacyLink: 'Privacy policy', contents: 'Legal documents',
      noteTitle: 'About service requests', note: 'Submitting a request or viewing an estimate does not by itself confirm a booking. A service is agreed when H&S Quality Service confirms its terms and availability.',
      updated: 'Last updated: 3 October 2026', back: 'Back to home',
      sections: [
        { heading: '1. Scope', paragraphs: ['These terms apply to hs-cleaning.ch and cleaning requests managed by H&S Service Sàrl under the HS Cleaning and H&S Quality Service brands. The company is registered in the Geneva Commercial Register under IDE CHE-259.228.541. By creating an account or submitting a request, you agree to these terms. The specific service may also be subject to the conditions in its quote or service confirmation.'] },
        { heading: '2. Account and portal use', paragraphs: ['Provide accurate information and update it when it changes. You are responsible for protecting your sign-in credentials and for activity carried out through your account. If you create an account for a business, you confirm that you are authorised to represent it.', 'Use the portal lawfully and do not attempt to access another person\'s account, systems or data without permission. We may restrict access when necessary to protect the portal, its users or compliance with these terms.'] },
        { heading: '3. Requests, estimates and confirmation', paragraphs: ['The estimate shown in the portal is indicative and is calculated from the information you provide. It is not, by itself, a final offer and does not guarantee a date. Price, scope and duration may change if the actual property or service conditions differ from what was described.', 'A request is not a confirmed booking. H&S Quality Service will review the details and communicate availability and applicable conditions. The service is agreed when both parties confirm the proposal, price and date in writing.'] },
        { heading: '4. Preparation and property access', paragraphs: ['Provide an accurate address and describe relevant details about the property, access, parking and requested tasks. Before the service, disclose delicate surfaces, fragile items, hazards or access instructions. Keys will only be handed over or received using the procedure agreed for that service.'] },
        { heading: '5. Changes, cancellations and payment', paragraphs: ['If you need to change or cancel a service, contact H&S Quality Service as soon as possible. Applicable notice periods, fees and conditions are those stated in the accepted proposal or confirmation, subject to mandatory rights under applicable law.', 'Payment and invoicing follow the conditions stated in the confirmed quote or relevant invoice. This page does not introduce a cancellation fee or payment method that has not been communicated in those terms.'] },
        { heading: '6. Liability and availability', paragraphs: ['H&S Quality Service aims to keep the portal available and its information clear, but maintenance or technical interruptions may occur. Nothing in these terms excludes liability that cannot be excluded under applicable law. Mandatory consumer rights remain unaffected.'] },
        { heading: '7. Intellectual property', paragraphs: ['The portal\'s content, visual identity and materials belong to H&S Quality Service or are used with permission. Do not copy, publish or reuse them for commercial purposes without permission, except where the law allows.'] },
        { heading: '8. Governing law and contact', paragraphs: ['These terms are governed by Swiss law, without limiting any mandatory consumer-protection rules that apply. The portal is operated by H&S Service Sàrl (IDE CHE-259.228.541), with registered office at Avenue du Simplon 9, c/o Natividad Abrego Saavedra, 1225 Chêne-Bourg, Switzerland. For questions about a request, you may also use the contact details provided in your quote or service correspondence.'] },
      ],
    },
  },
  privacy: {
    es: {
      brandSubtitle: 'Quality Service · Suiza', home: 'Volver al inicio', eyebrow: 'DATOS Y PRIVACIDAD',
      title: 'Política de privacidad', intro: 'Esta política explica qué datos trata HS Cleaning cuando utilizas el portal, solicitas un servicio o te pones en contacto con H&S Quality Service.',
      termsLink: 'Términos y condiciones', privacyLink: 'Política de privacidad', contents: 'Documentos legales',
      noteTitle: 'Responsable del tratamiento', note: 'H&S Service Sàrl · IDE CHE-259.228.541 · Avenue du Simplon 9, c/o Natividad Abrego Saavedra, 1225 Chêne-Bourg, Suiza. También puedes solicitar información mediante los datos de contacto de tu presupuesto o de las comunicaciones del servicio.',
      updated: 'Última revisión: 3 de octubre de 2026', back: 'Volver al inicio',
      sections: [
        { heading: '1. Datos que podemos tratar', paragraphs: ['Según cómo utilices el portal, podemos tratar:'], bullets: ['Datos de cuenta y contacto: nombre, correo electrónico, teléfono, dirección y tipo de cuenta; para empresas, nombre e identificador empresarial cuando se faciliten.', 'Datos de solicitudes de limpieza: dirección del servicio, tipo de inmueble, superficies y espacios, tareas adicionales, fecha preferida y mensajes que nos envíes.', 'Datos del personal: nacionalidad, tipo y caducidad del permiso de residencia, experiencia profesional y documentos aportados para solicitar o mantener el acceso al área de personal, como fotografías, permisos de residencia y certificados profesionales.', 'Datos técnicos de seguridad y sesión, incluidos la dirección IP y el navegador o dispositivo; la preferencia de idioma guardada en el navegador; y la fecha y hora de aceptación de estas condiciones al enviar una solicitud.'] },
        { heading: '2. Finalidades y base del tratamiento', paragraphs: ['Tratamos los datos para crear y proteger cuentas, responder a solicitudes, preparar estimaciones, organizar y prestar servicios, comunicarnos contigo y gestionar solicitudes del equipo. También podemos tratarlos para mantener la seguridad, atender obligaciones legales y hacer valer o defender derechos.', 'Cuando el tratamiento sea necesario para responder a una solicitud o prestar un servicio, se basa en esas medidas precontractuales o en la relación contractual. Otros tratamientos se basan, según corresponda, en obligaciones legales, intereses legítimos de seguridad y gestión, o en tu consentimiento cuando la normativa lo requiera.'] },
        { heading: '3. Destinatarios y proveedores', paragraphs: ['El personal autorizado de H&S Quality Service puede acceder a los datos necesarios para gestionar tu cuenta, revisar una solicitud o prestar el servicio. También utilizamos proveedores técnicos para alojar y operar el portal, la base de datos, el almacenamiento de documentos, la autenticación, el correo electrónico y la medición técnica del uso del sitio. Estos proveedores tratan los datos según sus funciones y las instrucciones aplicables.', 'No vendemos tus datos personales. Podemos comunicarlos cuando sea necesario para cumplir una obligación legal o responder a una autoridad competente.'] },
        { heading: '4. Transferencias internacionales', paragraphs: ['Algunos proveedores técnicos pueden tratar datos desde países distintos de Suiza. Cuando se produzcan transferencias internacionales, se aplicarán las garantías exigidas por la legislación de protección de datos pertinente. Puedes solicitar información adicional sobre dichas garantías mediante los datos de contacto indicados en esta política.'] },
        { heading: '5. Conservación y seguridad', paragraphs: ['Conservamos los datos durante el tiempo necesario para los fines descritos, mientras la cuenta o la relación de servicio permanezca activa y, después, durante los plazos necesarios para cumplir obligaciones legales o gestionar reclamaciones. El plazo concreto depende del tipo de dato y de la situación.', 'Aplicamos medidas técnicas y organizativas destinadas a proteger los datos contra accesos, pérdidas o usos no autorizados. Ningún servicio en internet puede garantizar seguridad absoluta.'] },
        { heading: '6. Cookies y medición del sitio', paragraphs: ['El portal utiliza tecnologías necesarias para mantener la sesión segura y recordar la preferencia de idioma. En producción también se carga Vercel Analytics para obtener mediciones de uso del sitio. La configuración del navegador puede ofrecer controles adicionales; bloquear tecnologías necesarias puede impedir que algunas funciones del portal trabajen correctamente.'] },
        { heading: '7. Tus derechos', paragraphs: ['En los límites previstos por la legislación aplicable, puedes solicitar acceso a tus datos, su rectificación o eliminación y, cuando corresponda, ejercer otros derechos reconocidos por la Ley federal suiza de protección de datos y por el RGPD si este resulta aplicable. La eliminación puede estar sujeta a obligaciones de conservación o a la necesidad de atender reclamaciones.', 'Puedes solicitar la eliminación de tu cuenta desde tu área de cliente. La solicitud se revisa antes de ejecutarse para comprobar si existen servicios pendientes. También puedes contactar con H&S Quality Service mediante los datos de tu presupuesto o de las comunicaciones del servicio.'] },
        { heading: '8. Cambios y contacto', paragraphs: ['Podemos actualizar esta política para reflejar cambios en el portal, en los servicios o en la normativa. La versión publicada en esta página es la que se aplica al uso actual del portal. El responsable del tratamiento es H&S Service Sàrl (IDE CHE-259.228.541), Avenue du Simplon 9, c/o Natividad Abrego Saavedra, 1225 Chêne-Bourg, Suiza. Para ejercer tus derechos, puedes escribir a este domicilio o utilizar los datos de contacto de tu presupuesto o de las comunicaciones del servicio.'] },
      ],
    },
    fr: {
      brandSubtitle: 'Quality Service · Suisse', home: 'Retour à l\'accueil', eyebrow: 'DONNÉES ET CONFIDENTIALITÉ',
      title: 'Politique de confidentialité', intro: 'Cette politique explique quelles données HS Cleaning traite lorsque vous utilisez le portail, demandez une prestation ou contactez H&S Quality Service.',
      termsLink: 'Conditions générales', privacyLink: 'Politique de confidentialité', contents: 'Documents juridiques',
      noteTitle: 'Responsable du traitement', note: 'H&S Service Sàrl · IDE CHE-259.228.541 · Avenue du Simplon 9, c/o Natividad Abrego Saavedra, 1225 Chêne-Bourg, Suisse. Vous pouvez également utiliser les coordonnées figurant sur votre devis ou dans les échanges relatifs à la prestation.',
      updated: 'Dernière mise à jour : 3 octobre 2026', back: 'Retour à l\'accueil',
      sections: [
        { heading: '1. Données susceptibles d\'être traitées', paragraphs: ['Selon votre utilisation du portail, nous pouvons traiter :'], bullets: ['Données de compte et de contact : nom, adresse e-mail, téléphone, adresse et type de compte ; pour les entreprises, nom et identifiant professionnel lorsqu\'ils sont fournis.', 'Données des demandes de nettoyage : adresse de la prestation, type de bien, surfaces et pièces, tâches supplémentaires, date souhaitée et messages que vous nous transmettez.', 'Données du personnel : nationalité, type et expiration du permis de séjour, expérience professionnelle et documents transmis pour demander ou conserver l\'accès à l\'espace du personnel, tels que photos, permis de séjour et certificats professionnels.', 'Données techniques de sécurité et de session, y compris l’adresse IP et le navigateur ou l’appareil ; préférence linguistique enregistrée dans le navigateur ; date et heure d’acceptation des présentes conditions lors de l’envoi d’une demande.'] },
        { heading: '2. Finalités et fondement du traitement', paragraphs: ['Nous traitons les données afin de créer et sécuriser les comptes, répondre aux demandes, préparer des estimations, organiser et fournir les prestations, communiquer avec vous et gérer les demandes du personnel. Nous pouvons également les traiter pour assurer la sécurité, respecter des obligations légales et faire valoir ou défendre des droits.', 'Lorsque le traitement est nécessaire pour répondre à une demande ou fournir une prestation, il repose sur ces mesures précontractuelles ou sur la relation contractuelle. D\'autres traitements reposent, selon le cas, sur des obligations légales, des intérêts légitimes de sécurité et de gestion, ou votre consentement lorsque la loi l\'exige.'] },
        { heading: '3. Destinataires et prestataires', paragraphs: ['Le personnel autorisé de H&S Quality Service peut accéder aux données nécessaires à la gestion de votre compte, à l\'examen d\'une demande ou à la réalisation d\'une prestation. Nous utilisons également des prestataires techniques pour héberger et exploiter le portail, la base de données, le stockage de documents, l\'authentification, les e-mails et la mesure technique de l\'utilisation du site. Ces prestataires traitent les données dans le cadre de leurs fonctions et des instructions applicables.', 'Nous ne vendons pas vos données personnelles. Nous pouvons les communiquer lorsque cela est nécessaire pour respecter une obligation légale ou répondre à une autorité compétente.'] },
        { heading: '4. Transferts internationaux', paragraphs: ['Certains prestataires techniques peuvent traiter des données depuis des pays autres que la Suisse. En cas de transfert international, les garanties requises par la législation applicable en matière de protection des données sont mises en place. Vous pouvez demander des informations complémentaires sur ces garanties aux coordonnées indiquées dans cette politique.'] },
        { heading: '5. Conservation et sécurité', paragraphs: ['Nous conservons les données pendant la durée nécessaire aux finalités décrites, tant que le compte ou la relation de service est actif, puis pendant les délais nécessaires au respect d\'obligations légales ou au traitement de réclamations. La durée concrète dépend du type de données et de la situation.', 'Nous appliquons des mesures techniques et organisationnelles destinées à protéger les données contre les accès, pertes ou utilisations non autorisés. Aucun service en ligne ne peut garantir une sécurité absolue.'] },
        { heading: '6. Cookies et mesure du site', paragraphs: ['Le portail utilise des technologies nécessaires au maintien d\'une session sécurisée et à la mémorisation de la préférence linguistique. En production, Vercel Analytics est également chargé pour mesurer l\'utilisation du site. Les paramètres de votre navigateur peuvent offrir des contrôles supplémentaires ; le blocage des technologies nécessaires peut empêcher certaines fonctions du portail de fonctionner correctement.'] },
        { heading: '7. Vos droits', paragraphs: ['Dans les limites prévues par le droit applicable, vous pouvez demander l\'accès à vos données, leur rectification ou leur suppression et, le cas échéant, exercer les autres droits prévus par la loi fédérale suisse sur la protection des données et par le RGPD si celui-ci s\'applique. La suppression peut être limitée par des obligations de conservation ou la nécessité de traiter des réclamations.', 'Vous pouvez demander la suppression de votre compte depuis votre espace client. La demande est examinée avant son exécution afin de vérifier l\'existence de prestations en cours. Vous pouvez également contacter H&S Quality Service aux coordonnées figurant sur votre devis ou dans les échanges relatifs à la prestation.'] },
        { heading: '8. Modifications et contact', paragraphs: ['Nous pouvons mettre à jour cette politique pour refléter les évolutions du portail, des prestations ou de la législation. La version publiée sur cette page s\'applique à l\'utilisation actuelle du portail. Le responsable du traitement est H&S Service Sàrl (IDE CHE-259.228.541), Avenue du Simplon 9, c/o Natividad Abrego Saavedra, 1225 Chêne-Bourg, Suisse. Pour exercer vos droits, vous pouvez écrire à cette adresse ou utiliser les coordonnées indiquées sur votre devis ou dans les échanges relatifs à la prestation.'] },
      ],
    },
    en: {
      brandSubtitle: 'Quality Service · Switzerland', home: 'Back to home', eyebrow: 'DATA AND PRIVACY',
      title: 'Privacy policy', intro: 'This policy explains what data HS Cleaning processes when you use the portal, request a service or contact H&S Quality Service.',
      termsLink: 'Terms and conditions', privacyLink: 'Privacy policy', contents: 'Legal documents',
      noteTitle: 'Data controller', note: 'H&S Service Sàrl · IDE CHE-259.228.541 · Avenue du Simplon 9, c/o Natividad Abrego Saavedra, 1225 Chêne-Bourg, Switzerland. You may also use the contact details on your quote or in your service correspondence.',
      updated: 'Last updated: 3 October 2026', back: 'Back to home',
      sections: [
        { heading: '1. Data we may process', paragraphs: ['Depending on how you use the portal, we may process:'], bullets: ['Account and contact details: name, email address, telephone number, address and account type; for businesses, company name and business identifier when provided.', 'Cleaning request details: service address, property type, areas and rooms, additional tasks, preferred date and messages you send us.', 'Staff data: nationality, residence-permit type and expiry, work experience and documents submitted to request or maintain access to the staff area, such as photographs, residence permits and professional certificates.', 'Technical security and session data, including IP address and browser or device details; the language preference stored in your browser; and the date and time you accepted these terms when submitting a request.'] },
        { heading: '2. Purposes and legal grounds', paragraphs: ['We process data to create and secure accounts, respond to requests, prepare estimates, organise and provide services, communicate with you and manage staff applications. We may also process data to maintain security, meet legal obligations, and establish or defend legal claims.', 'Where processing is necessary to respond to a request or provide a service, it is based on those pre-contractual steps or the contractual relationship. Other processing is based, as applicable, on legal obligations, legitimate security and operational interests, or your consent where required by law.'] },
        { heading: '3. Recipients and service providers', paragraphs: ['Authorised H&S Quality Service staff may access data needed to manage your account, review a request or provide a service. We also use technical service providers to host and operate the portal, database, document storage, authentication, email and technical site-usage measurement. These providers process data according to their roles and applicable instructions.', 'We do not sell your personal data. We may disclose it when necessary to meet a legal obligation or respond to a competent authority.'] },
        { heading: '4. International transfers', paragraphs: ['Some technical providers may process data from countries outside Switzerland. Where international transfers occur, safeguards required by relevant data-protection law will apply. You may request further information about those safeguards using the contact details in this policy.'] },
        { heading: '5. Retention and security', paragraphs: ['We keep data for as long as necessary for the purposes described, while your account or service relationship remains active and afterwards for periods needed to meet legal obligations or handle claims. The specific period depends on the type of data and circumstances.', 'We apply technical and organisational measures intended to protect data against unauthorised access, loss or use. No online service can guarantee absolute security.'] },
        { heading: '6. Cookies and site measurement', paragraphs: ['The portal uses technologies necessary to maintain a secure session and remember your language preference. In production, Vercel Analytics is also loaded to measure site usage. Your browser settings may provide additional controls; blocking necessary technologies may prevent some portal features from working correctly.'] },
        { heading: '7. Your rights', paragraphs: ['Subject to applicable law, you may request access to, correction of or deletion of your data and, where relevant, exercise other rights under the Swiss Federal Act on Data Protection and the GDPR if it applies. Deletion may be limited by retention obligations or the need to handle claims.', 'You can request account deletion from your client area. The request is reviewed before it is carried out to check for ongoing services. You can also contact H&S Quality Service using the details on your quote or in your service correspondence.'] },
        { heading: '8. Changes and contact', paragraphs: ['We may update this policy to reflect changes to the portal, services or law. The version published on this page applies to current portal use. The data controller is H&S Service Sàrl (IDE CHE-259.228.541), Avenue du Simplon 9, c/o Natividad Abrego Saavedra, 1225 Chêne-Bourg, Switzerland. To exercise your rights, you may write to this address or use the contact details on your quote or in your service correspondence.'] },
      ],
    },
  },
}

export function LegalDocument({ kind, locale }: { kind: 'terms' | 'privacy'; locale: Locale }) {
  const copy = legalCopy[kind][locale]
  const Icon = kind === 'terms' ? FileText : ShieldCheck
  const otherHref = kind === 'terms' ? '/privacy' : '/terms'
  const otherLabel = kind === 'terms' ? copy.privacyLink : copy.termsLink

  return (
    <main className="legal-page font-sans">
      <header className="legal-header">
        <Link href="/" className="legal-brand" aria-label={`HS Cleaning — ${copy.home}`}>
          <Image src="/hs-quality-service.png" alt="" width={42} height={42} priority />
          <span><strong>HS Cleaning</strong><small>{copy.brandSubtitle}</small></span>
        </Link>
        <div className="legal-header-actions">
          <LanguageSwitcher compact />
          <Link href="/" className="legal-home-link"><ArrowLeft aria-hidden="true" />{copy.home}</Link>
        </div>
      </header>

      <div className="legal-layout">
        <div className="legal-document-heading">
          <p className="legal-eyebrow"><Icon aria-hidden="true" />{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="legal-intro">{copy.intro}</p>
        </div>

        <aside className="legal-sidebar" aria-label={copy.contents}>
          <p className="legal-sidebar-label">{copy.contents}</p>
          <Link className={kind === 'terms' ? 'legal-sidebar-link is-current' : 'legal-sidebar-link'} href="/terms" aria-current={kind === 'terms' ? 'page' : undefined}>
            <FileText aria-hidden="true" />{copy.termsLink}{kind === 'terms' && <span className="sr-only">(current)</span>}
          </Link>
          <Link className={kind === 'privacy' ? 'legal-sidebar-link is-current' : 'legal-sidebar-link'} href="/privacy" aria-current={kind === 'privacy' ? 'page' : undefined}>
            <ShieldCheck aria-hidden="true" />{copy.privacyLink}{kind === 'privacy' && <span className="sr-only">(current)</span>}
          </Link>
          <div className="legal-sidebar-note">
            <ShieldCheck aria-hidden="true" />
            <div><strong>{copy.noteTitle}</strong><p>{copy.note}</p></div>
          </div>
        </aside>

        <article className="legal-article">
          <p className="legal-effective"><span />{copy.updated}</p>
          {copy.sections.map((section, index) => (
            <section className="legal-section" id={`section-${index + 1}`} key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
            </section>
          ))}
        </article>
      </div>

      <footer className="legal-footer">
        <span>HS Quality Service <span aria-hidden="true">·</span> hs-cleaning.ch</span>
        <Link href={otherHref}>{otherLabel}<ArrowUpRight aria-hidden="true" /></Link>
      </footer>
    </main>
  )
}

export const legalMetadata = {
  terms: {
    es: { title: 'Términos y condiciones | HS Cleaning', description: 'Condiciones de uso del portal HS Cleaning y solicitudes de servicios de H&S Quality Service.' },
    fr: { title: 'Conditions générales | HS Cleaning', description: 'Conditions d\'utilisation du portail HS Cleaning et de demande de prestations auprès de H&S Quality Service.' },
    en: { title: 'Terms and conditions | HS Cleaning', description: 'Terms for using the HS Cleaning portal and requesting services from H&S Quality Service.' },
  },
  privacy: {
    es: { title: 'Política de privacidad | HS Cleaning', description: 'Información sobre el tratamiento de datos personales en el portal HS Cleaning.' },
    fr: { title: 'Politique de confidentialité | HS Cleaning', description: 'Informations sur le traitement des données personnelles sur le portail HS Cleaning.' },
    en: { title: 'Privacy policy | HS Cleaning', description: 'Information about personal data processing on the HS Cleaning portal.' },
  },
} satisfies Record<'terms' | 'privacy', Record<Locale, { title: string; description: string }>>

export type LegalDocumentKind = 'terms' | 'privacy'

export function getLegalMetadata(kind: LegalDocumentKind, locale: Locale) {
  return legalMetadata[kind][locale]
}

export function LegalDocumentPage({ kind, locale }: { kind: LegalDocumentKind; locale: Locale }) {
  return <LegalDocument kind={kind} locale={locale} />
}

export type { LegalCopy }

export { legalCopy }

export function getLegalLocaleCopy(kind: LegalDocumentKind, locale: Locale) {
  return legalCopy[kind][locale]
}

export type { LegalSection }
