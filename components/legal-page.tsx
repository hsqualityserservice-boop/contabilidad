import Link from 'next/link'
import { LanguageSwitcher } from '@/components/language-switcher'
import type { Locale } from '@/lib/i18n'

type LegalSection = { heading: string; paragraphs?: string[]; items?: string[] }
type DocumentCopy = {
  eyebrow: string
  title: string
  introduction: string
  updated: string
  sections: LegalSection[]
  contactTitle: string
  contact: string
  termsLabel: string
  privacyLabel: string
  homeLabel: string
  footer: string
}
type LegalDocument = 'terms' | 'privacy'

const company = {
  name: 'H&S Service Sàrl',
  address: 'Avenue du Simplon 9, c/o Natividad Abrego Saavedra, 1225 Chêne-Bourg, Suisse',
  uid: 'CHE-259.228.541',
}

const documents: Record<Locale, Record<LegalDocument, DocumentCopy>> = {
  fr: {
    terms: {
      eyebrow: 'INFORMATIONS JURIDIQUES',
      title: 'Conditions générales',
      introduction: 'Les présentes conditions décrivent les règles applicables à l\'utilisation du site hs-cleaning.ch et aux demandes de prestations adressées à H&S Quality Service.',
      updated: 'Version d\'octobre 2026',
      contactTitle: 'Éditeur du site et prestataire',
      contact: `${company.name} · IDE ${company.uid} · Siège à Chêne-Bourg, Suisse · ${company.address}`,
      termsLabel: 'Conditions générales', privacyLabel: 'Politique de confidentialité', homeLabel: 'Retour à l\'accueil',
      footer: 'Les présentes conditions ne remplacent pas une offre ou un accord particulier accepté par les deux parties.',
      sections: [
        { heading: '1. Champ d\'application', paragraphs: ['Les présentes conditions s\'appliquent à la consultation du site et aux demandes de nettoyage soumises par l\'intermédiaire du portail. Elles s\'adressent aux clients particuliers comme aux clients professionnels. En envoyant une demande, vous confirmez en avoir pris connaissance.', 'Les conditions particulières d\'une offre, d\'une confirmation écrite ou d\'un contrat conclu avec le client prévalent pour la prestation concernée en cas de divergence.'] },
        { heading: '2. Prestations et demandes', paragraphs: ['Le site permet de décrire un logement ou un local et de demander une estimation pour les prestations proposées, notamment le nettoyage d\'entretien, de fin de bail, après travaux, de bureaux, de cabinets, de conciergerie ou de logements de courte durée.', 'Une demande envoyée depuis le portail est une demande de renseignements ou de prestation ; elle ne constitue pas, à elle seule, une réservation ferme. La prestation et sa date ne sont confirmées qu\'après accord écrit de H&S Service Sàrl, par exemple dans le portail ou par courriel.'] },
        { heading: '3. Estimations et prix', paragraphs: ['Toute estimation affichée en ligne est indicative et se fonde sur les informations fournies. Le prix définitif peut dépendre de l\'état et de la configuration des lieux, de l\'accès, des tâches effectivement demandées et des éléments constatés avant ou pendant la prestation.', 'Le prix applicable, le périmètre de la prestation et les éventuels frais supplémentaires sont communiqués au client avant leur acceptation. Aucune prestation supplémentaire n\'est réputée acceptée du seul fait qu\'elle est mentionnée dans une estimation.'] },
        { heading: '4. Informations et accès aux lieux', paragraphs: ['Le client s\'engage à fournir des renseignements exacts et à signaler à l\'avance les contraintes d\'accès, les instructions utiles, les fragilités particulières ainsi que toute situation présentant un risque pour les personnes ou les biens.', 'Le client veille à ce que les locaux soient accessibles à la date convenue et à ce que les consignes relatives aux clés, au stationnement et à la présence sur place soient définies à l\'avance. Toute remise de clés ou modalité d\'accès doit être convenue avec H&S Service Sàrl.'] },
        { heading: '5. Modification ou annulation', paragraphs: ['Pour modifier ou annuler une prestation, le client est invité à contacter H&S Service Sàrl dès que possible en utilisant le portail ou les coordonnées communiquées lors de la confirmation.', 'Les éventuelles conséquences financières d\'une modification tardive ou d\'une annulation sont celles qui ont été communiquées au client et acceptées dans l\'offre ou la confirmation propre à la prestation. Les présentes conditions ne créent pas de frais d\'annulation forfaitaires.'] },
        { heading: '6. Exécution et paiement', paragraphs: ['La prestation est réalisée selon le périmètre et les modalités confirmés avec le client. Les modalités de paiement et l\'échéance figurent sur l\'offre, la confirmation ou la facture correspondante.', 'Le client est invité à signaler sans délai toute question concernant une prestation afin que les parties puissent examiner la situation et convenir d\'une réponse appropriée.'] },
        { heading: '7. Responsabilité et disponibilité du site', paragraphs: ['H&S Service Sàrl met en œuvre des efforts raisonnables pour fournir les prestations convenues et maintenir le portail disponible. Des interruptions temporaires peuvent toutefois survenir pour des raisons de maintenance, de sécurité ou indépendantes de sa volonté.', 'La responsabilité est régie par le droit applicable. Aucune disposition des présentes conditions n\'exclut ni ne limite une responsabilité qui ne peut légalement l\'être, notamment en cas de faute intentionnelle ou de négligence grave.'] },
        { heading: '8. Propriété intellectuelle et liens externes', paragraphs: ['Les contenus du site sont protégés par les règles applicables en matière de propriété intellectuelle. Leur reproduction ou réutilisation au-delà des usages autorisés nécessite l\'accord du titulaire des droits.', 'Les liens vers des sites tiers sont fournis pour faciliter la navigation. H&S Service Sàrl ne contrôle pas leur contenu et n\'en assume pas la responsabilité.'] },
        { heading: '9. Droit applicable et contact', paragraphs: ['Les présentes conditions sont régies par le droit suisse, sous réserve des dispositions impératives applicables. Les autorités et tribunaux compétents sont déterminés conformément aux règles légales applicables, notamment celles relatives au domicile du consommateur.', 'Pour toute question concernant ces conditions ou une prestation, veuillez contacter H&S Service Sàrl à l\'adresse indiquée ci-dessous ou utiliser le portail client.'] },
      ],
    },
    privacy: {
      eyebrow: 'INFORMATIONS JURIDIQUES',
      title: 'Politique de confidentialité',
      introduction: 'Cette politique explique comment H&S Service Sàrl traite les données personnelles lorsque vous consultez hs-cleaning.ch, créez un compte ou demandez une prestation.',
      updated: 'Version d\'octobre 2026',
      contactTitle: 'Responsable du traitement',
      contact: `${company.name} · IDE ${company.uid} · ${company.address}`,
      termsLabel: 'Conditions générales', privacyLabel: 'Politique de confidentialité', homeLabel: 'Retour à l\'accueil',
      footer: 'N\'envoyez pas de données sensibles dans les champs libres du portail si elles ne sont pas nécessaires à votre demande.',
      sections: [
        { heading: '1. Responsable et champ d\'application', paragraphs: ['Le responsable du traitement des données décrit dans cette politique est H&S Service Sàrl, Avenue du Simplon 9, c/o Natividad Abrego Saavedra, 1225 Chêne-Bourg, Suisse (IDE CHE-259.228.541). L\'entreprise exploite le site hs-cleaning.ch sous la marque H&S Quality Service.', 'Cette politique couvre le site et le portail client. Elle s\'applique aux données traitées dans le cadre de demandes de nettoyage et de la gestion des comptes.'] },
        { heading: '2. Données traitées', paragraphs: ['Selon votre utilisation du portail, nous pouvons traiter les catégories de données suivantes :'], items: ['Données de compte et de contact : nom, adresse e-mail, téléphone et, selon le profil, adresse, raison sociale et identifiant IDE/UID.', 'Données relatives aux demandes : type de prestation, code postal, caractéristiques et surfaces des locaux, date souhaitée et informations que vous choisissez d\'ajouter.', 'Données nécessaires au fonctionnement et à la sécurité du compte : identifiants techniques, état de vérification de l\'adresse e-mail et données de session.', 'Données que vous transmettez lorsque vous communiquez avec nous au sujet d\'une demande ou d\'un compte.'] },
        { heading: '3. Finalités et bases du traitement', paragraphs: ['Nous utilisons ces données pour créer et sécuriser votre compte, répondre à vos demandes, préparer une estimation, organiser les prestations, communiquer avec vous, assurer le support et satisfaire aux obligations légales applicables.', 'Dans la mesure prévue par la loi suisse sur la protection des données (LPD) et, lorsque son champ d\'application est rempli, par le RGPD, les traitements s\'appuient notamment sur les démarches demandées avant la conclusion d\'un contrat, l\'exécution d\'un contrat, le respect d\'obligations légales et les intérêts privés prépondérants compatibles avec vos droits. Lorsqu\'un consentement est requis, il est demandé séparément.'] },
        { heading: '4. Accès et prestataires', paragraphs: ['Les données de compte et de demande sont accessibles aux personnes autorisées qui en ont besoin pour traiter votre demande, fournir le service ou assurer la gestion et la sécurité du portail.', 'Le site peut recourir à des prestataires techniques pour l\'hébergement, la base de données, l\'envoi de courriels, le stockage sécurisé de fichiers et, en production, la mesure d\'audience. Ces prestataires ne reçoivent que les données nécessaires à leurs fonctions et sont soumis aux garanties contractuelles et légales applicables. Nous ne vendons pas vos données personnelles.'] },
        { heading: '5. Transferts et lieu de traitement', paragraphs: ['Les données sont traitées dans le cadre de l\'exploitation du service en Suisse et, selon l\'emplacement des infrastructures de nos prestataires, peuvent également être traitées dans d\'autres pays. Lorsque la loi l\'exige, les transferts internationaux sont assortis de garanties appropriées conformément à la LPD et, le cas échéant, au RGPD.'] },
        { heading: '6. Conservation et sécurité', paragraphs: ['Les données sont conservées pendant la durée nécessaire aux finalités décrites, puis supprimées ou rendues anonymes lorsqu\'elles ne sont plus nécessaires, sous réserve des délais de conservation prévus par la loi et de la nécessité de documenter ou de défendre des droits.', 'Nous appliquons des mesures techniques et organisationnelles raisonnables pour protéger les comptes et les données contre l\'accès non autorisé, la perte ou l\'altération. L\'accès est limité aux personnes autorisées. Aucun système de transmission ou de stockage ne peut néanmoins être garanti absolument sûr.'] },
        { heading: '7. Cookies et données techniques', paragraphs: ['Le portail utilise des éléments techniques nécessaires à la connexion sécurisée et à la mémorisation de préférences, comme la langue choisie. En production, des outils de mesure d\'audience peuvent également traiter des informations techniques relatives à la consultation du site.', 'Les réglages de votre navigateur peuvent limiter certains cookies, mais le blocage des éléments indispensables peut empêcher la connexion ou certaines fonctions du portail.'] },
        { heading: '8. Vos droits et suppression du compte', paragraphs: ['Sous réserve des conditions et exceptions prévues par la loi applicable, vous pouvez demander l\'accès à vos données, leur rectification ou leur suppression, vous opposer à certains traitements ou demander la remise de données dans un format portable lorsque ce droit s\'applique.', 'Vous pouvez demander la suppression de votre compte depuis l\'espace client. Les demandes de service encore en cours sont examinées avant la suppression ; certaines informations peuvent devoir être conservées pour respecter une obligation légale ou établir, exercer ou défendre un droit.', 'Pour exercer un droit ou poser une question, utilisez l\'espace client ou écrivez au responsable à l\'adresse postale figurant dans cette politique. Vous pouvez également vous adresser au Préposé fédéral à la protection des données et à la transparence (PFPDT), sous réserve des règles applicables.'] },
        { heading: '9. Modifications de cette politique', paragraphs: ['Cette politique peut être mise à jour si les pratiques ou les exigences légales évoluent. La version publiée sur cette page indique la date de sa dernière mise à jour.'] },
      ],
    },
  },
  es: {
    terms: {
      eyebrow: 'INFORMACIÓN LEGAL',
      title: 'Términos y condiciones',
      introduction: 'Estos términos describen las reglas aplicables al uso de hs-cleaning.ch y a las solicitudes de servicios dirigidas a H&S Quality Service.',
      updated: 'Versión de octubre de 2026',
      contactTitle: 'Titular del sitio y proveedor',
      contact: `${company.name} · IDE ${company.uid} · Domicilio en Chêne-Bourg, Suiza · ${company.address}`,
      termsLabel: 'Términos y condiciones', privacyLabel: 'Política de privacidad', homeLabel: 'Volver al inicio',
      footer: 'Estos términos no sustituyen una oferta o acuerdo particular aceptado por ambas partes.',
      sections: [
        { heading: '1. Ámbito de aplicación', paragraphs: ['Estos términos se aplican a la consulta del sitio y a las solicitudes de limpieza enviadas a través del portal. Se dirigen tanto a clientes particulares como profesionales. Al enviar una solicitud, confirmas que has leído estos términos.', 'Si una oferta, confirmación escrita o contrato celebrado con el cliente establece condiciones particulares distintas, estas prevalecerán para el servicio correspondiente.'] },
        { heading: '2. Servicios y solicitudes', paragraphs: ['El sitio permite describir una vivienda o local y solicitar una estimación de los servicios disponibles, como limpieza de mantenimiento, fin de contrato, después de obras, oficinas, consultorios, conserjería o alquileres de corta estancia.', 'Enviar una solicitud desde el portal es una petición de información o de servicio; por sí solo no constituye una reserva confirmada. El servicio y su fecha solo quedan confirmados cuando H&S Service Sàrl lo acepta por escrito, por ejemplo, a través del portal o por correo electrónico.'] },
        { heading: '3. Estimaciones y precios', paragraphs: ['Las estimaciones mostradas en línea son orientativas y se calculan a partir de la información facilitada. El precio definitivo puede depender del estado y la configuración del espacio, el acceso, las tareas solicitadas y las condiciones que se comprueben antes o durante el servicio.', 'El precio aplicable, el alcance del servicio y cualquier coste adicional se comunicarán antes de que el cliente los acepte. La inclusión de un servicio opcional en una estimación no significa que se haya aceptado.'] },
        { heading: '4. Información y acceso al espacio', paragraphs: ['El cliente se compromete a proporcionar información correcta y a comunicar con antelación las restricciones de acceso, las instrucciones necesarias, las superficies especialmente delicadas y cualquier circunstancia que pueda suponer un riesgo para las personas o los bienes.', 'El cliente debe facilitar el acceso al espacio en la fecha acordada y definir de antemano las instrucciones sobre llaves, estacionamiento y presencia en el lugar. La entrega de llaves o cualquier modalidad de acceso debe acordarse con H&S Service Sàrl.'] },
        { heading: '5. Cambios y cancelaciones', paragraphs: ['Para modificar o cancelar un servicio, se recomienda contactar con H&S Service Sàrl lo antes posible mediante el portal o los datos de contacto facilitados al confirmar el servicio.', 'Las posibles consecuencias económicas de un cambio tardío o una cancelación serán las comunicadas y aceptadas por el cliente en la oferta o confirmación específica. Estos términos no establecen una tarifa fija de cancelación.'] },
        { heading: '6. Prestación y pago', paragraphs: ['El servicio se realizará según el alcance y las condiciones confirmados con el cliente. Las condiciones y el plazo de pago se indicarán en la oferta, confirmación o factura correspondiente.', 'Si tienes alguna duda sobre el servicio realizado, te invitamos a comunicárnosla cuanto antes para que podamos revisar lo ocurrido y acordar una respuesta adecuada.'] },
        { heading: '7. Responsabilidad y disponibilidad del sitio', paragraphs: ['H&S Service Sàrl realiza esfuerzos razonables para prestar los servicios acordados y mantener el portal disponible. No obstante, pueden producirse interrupciones temporales por mantenimiento, seguridad o circunstancias ajenas a su control.', 'La responsabilidad se rige por la legislación aplicable. Ninguna disposición de estos términos excluye o limita una responsabilidad que legalmente no pueda excluirse o limitarse, en particular por dolo o negligencia grave.'] },
        { heading: '8. Propiedad intelectual y enlaces externos', paragraphs: ['Los contenidos del sitio están protegidos por la normativa aplicable en materia de propiedad intelectual. Su reproducción o reutilización más allá de los usos permitidos requiere la autorización del titular de los derechos.', 'Los enlaces a sitios de terceros se ofrecen para facilitar la navegación. H&S Service Sàrl no controla sus contenidos ni se responsabiliza de ellos.'] },
        { heading: '9. Legislación aplicable y contacto', paragraphs: ['Estos términos se rigen por la legislación suiza, sin perjuicio de las disposiciones imperativas aplicables. Las autoridades y tribunales competentes se determinarán conforme a las normas legales aplicables, incluidas las relativas al domicilio del consumidor.', 'Si tienes preguntas sobre estos términos o un servicio, puedes contactar con H&S Service Sàrl en la dirección indicada a continuación o utilizar el portal de cliente.'] },
      ],
    },
    privacy: {
      eyebrow: 'INFORMACIÓN LEGAL',
      title: 'Política de privacidad',
      introduction: 'Esta política explica cómo H&S Service Sàrl trata los datos personales cuando visitas hs-cleaning.ch, creas una cuenta o solicitas un servicio.',
      updated: 'Versión de octubre de 2026',
      contactTitle: 'Responsable del tratamiento',
      contact: `${company.name} · IDE ${company.uid} · ${company.address}`,
      termsLabel: 'Términos y condiciones', privacyLabel: 'Política de privacidad', homeLabel: 'Volver al inicio',
      footer: 'No incluyas datos sensibles en los campos libres del portal salvo que sean necesarios para tu solicitud.',
      sections: [
        { heading: '1. Responsable y ámbito', paragraphs: ['El responsable del tratamiento descrito en esta política es H&S Service Sàrl, Avenue du Simplon 9, c/o Natividad Abrego Saavedra, 1225 Chêne-Bourg, Suiza (IDE CHE-259.228.541). La empresa opera el sitio hs-cleaning.ch bajo la marca H&S Quality Service.', 'Esta política cubre el sitio y el portal de clientes, incluidos los datos tratados al gestionar cuentas y solicitudes de limpieza.'] },
        { heading: '2. Datos que tratamos', paragraphs: ['Según cómo utilices el portal, podemos tratar las siguientes categorías de datos:'], items: ['Datos de cuenta y contacto: nombre, correo electrónico, teléfono y, según el perfil, domicilio, razón social e identificador IDE/UID.', 'Datos de la solicitud: tipo de servicio, código postal, características y superficies del espacio, fecha deseada y la información que decidas añadir.', 'Datos necesarios para el funcionamiento y la seguridad de la cuenta: identificadores técnicos, estado de verificación del correo electrónico e información de sesión.', 'Datos que nos facilites al comunicarte con nosotros sobre una solicitud o una cuenta.'] },
        { heading: '3. Finalidades y bases del tratamiento', paragraphs: ['Utilizamos estos datos para crear y proteger tu cuenta, responder solicitudes, preparar estimaciones, organizar servicios, comunicarnos contigo, ofrecer soporte y cumplir las obligaciones legales aplicables.', 'En la medida prevista por la Ley federal suiza de protección de datos (LPD) y, cuando corresponda, por el RGPD, el tratamiento se basa, entre otros motivos, en las gestiones solicitadas antes de un contrato, la ejecución de un contrato, el cumplimiento de obligaciones legales y los intereses legítimos compatibles con tus derechos. Cuando la ley requiere consentimiento, lo solicitamos por separado.'] },
        { heading: '4. Acceso y proveedores', paragraphs: ['Los datos de cuenta y de solicitudes son accesibles para las personas autorizadas que los necesitan para atender tu solicitud, prestar el servicio o mantener y proteger el portal.', 'El sitio puede utilizar proveedores técnicos para alojamiento, base de datos, envío de correos, almacenamiento seguro de archivos y, en producción, medición de audiencia. Solo reciben los datos necesarios para sus funciones y están sujetos a las garantías contractuales y legales aplicables. No vendemos tus datos personales.'] },
        { heading: '5. Transferencias y ubicación del tratamiento', paragraphs: ['Los datos se tratan en el marco de la prestación del servicio en Suiza y, según la ubicación de la infraestructura de nuestros proveedores, también pueden tratarse en otros países. Cuando la ley lo exige, las transferencias internacionales cuentan con garantías adecuadas conforme a la LPD y, cuando corresponda, al RGPD.'] },
        { heading: '6. Conservación y seguridad', paragraphs: ['Conservamos los datos durante el tiempo necesario para las finalidades descritas y después los eliminamos o anonimizamos cuando dejan de ser necesarios, salvo los plazos legales de conservación y la necesidad de documentar o defender derechos.', 'Aplicamos medidas técnicas y organizativas razonables para proteger las cuentas y los datos frente al acceso no autorizado, la pérdida o la alteración. El acceso se limita a las personas autorizadas. Ningún sistema de transmisión o almacenamiento puede garantizar una seguridad absoluta.'] },
        { heading: '7. Cookies y datos técnicos', paragraphs: ['El portal utiliza elementos técnicos necesarios para iniciar sesión de forma segura y recordar preferencias, como el idioma elegido. En producción también pueden utilizarse herramientas de medición de audiencia que tratan información técnica sobre el uso del sitio.', 'La configuración del navegador puede limitar algunas cookies, pero bloquear elementos esenciales puede impedir el inicio de sesión o el funcionamiento de algunas funciones del portal.'] },
        { heading: '8. Tus derechos y eliminación de la cuenta', paragraphs: ['Sujeto a los requisitos y excepciones de la legislación aplicable, puedes solicitar acceso a tus datos, su rectificación o eliminación, oponerte a determinados tratamientos o pedir que se te entreguen en un formato portable cuando ese derecho resulte aplicable.', 'Puedes solicitar la eliminación de tu cuenta desde el espacio de cliente. Antes de eliminarla se revisan las solicitudes de servicio pendientes; algunos datos podrían conservarse para cumplir una obligación legal o para establecer, ejercer o defender derechos.', 'Para ejercer tus derechos o resolver dudas, utiliza el espacio de cliente o escribe al responsable a la dirección postal indicada en esta política. También puedes dirigirte al Comisionado Federal de Protección de Datos y Transparencia (PFPDT), conforme a las normas aplicables.'] },
        { heading: '9. Cambios en esta política', paragraphs: ['Esta política puede actualizarse si cambian las prácticas o los requisitos legales. La versión publicada en esta página indica el mes de su última actualización.'] },
      ],
    },
  },
  en: {
    terms: {
      eyebrow: 'LEGAL INFORMATION',
      title: 'Terms and conditions',
      introduction: 'These terms explain the rules for using hs-cleaning.ch and submitting service requests to H&S Quality Service.',
      updated: 'October 2026 edition',
      contactTitle: 'Website operator and service provider',
      contact: `${company.name} · UID ${company.uid} · Registered office in Chêne-Bourg, Switzerland · ${company.address}`,
      termsLabel: 'Terms and conditions', privacyLabel: 'Privacy policy', homeLabel: 'Back to home',
      footer: 'These terms do not replace a specific offer or agreement accepted by both parties.',
      sections: [
        { heading: '1. Scope', paragraphs: ['These terms apply to browsing the website and submitting cleaning requests through the portal. They apply to both individual and business customers. By submitting a request, you confirm that you have read these terms.', 'If a specific offer, written confirmation, or agreement with the customer contains different terms, those terms apply to the relevant service.'] },
        { heading: '2. Services and requests', paragraphs: ['The website lets you describe a home or business premises and request an estimate for available services, including regular, end-of-tenancy, post-construction, office, clinic, concierge, and short-term rental cleaning.', 'Submitting a request through the portal is a request for information or service; it is not, by itself, a confirmed booking. A service and its date are confirmed only after H&S Service Sàrl accepts them in writing, for example through the portal or by email.'] },
        { heading: '3. Estimates and prices', paragraphs: ['Online estimates are indicative and based on the information you provide. The final price may depend on the condition and layout of the premises, access, the tasks requested, and circumstances identified before or during the service.', 'The applicable price, scope of work, and any additional charges will be communicated before the customer accepts them. An optional service appearing in an estimate is not accepted unless the customer agrees to it.'] },
        { heading: '4. Information and access to the premises', paragraphs: ['Customers agree to provide accurate information and to disclose in advance any access restrictions, useful instructions, delicate surfaces, or circumstances that could pose a risk to people or property.', 'Customers must make the premises accessible at the agreed time and agree in advance on arrangements for keys, parking, and attendance. Any key handover or access arrangement must be agreed with H&S Service Sàrl.'] },
        { heading: '5. Changes and cancellations', paragraphs: ['To change or cancel a service, please contact H&S Service Sàrl as soon as possible through the portal or using the contact details provided with the confirmation.', 'Any financial consequences of a late change or cancellation are those disclosed to and accepted by the customer in the specific offer or confirmation. These terms do not introduce a fixed cancellation fee.'] },
        { heading: '6. Service delivery and payment', paragraphs: ['Services are delivered according to the scope and arrangements confirmed with the customer. Payment terms and due dates are set out in the relevant offer, confirmation, or invoice.', 'If you have a concern about a completed service, please let us know promptly so the matter can be reviewed and an appropriate response agreed.'] },
        { heading: '7. Liability and website availability', paragraphs: ['H&S Service Sàrl makes reasonable efforts to provide agreed services and keep the portal available. Temporary interruptions may nevertheless occur for maintenance, security, or reasons beyond its control.', 'Liability is governed by applicable law. Nothing in these terms excludes or limits liability that cannot legally be excluded or limited, including liability for wilful misconduct or gross negligence.'] },
        { heading: '8. Intellectual property and external links', paragraphs: ['Website content is protected by applicable intellectual property laws. Reproduction or reuse beyond permitted uses requires permission from the rights holder.', 'Links to third-party websites are provided for convenience. H&S Service Sàrl does not control or accept responsibility for their content.'] },
        { heading: '9. Governing law and contact', paragraphs: ['These terms are governed by Swiss law, subject to any mandatory legal provisions. The competent authorities and courts are determined under applicable legal rules, including those concerning a consumer\'s place of residence.', 'For questions about these terms or a service, contact H&S Service Sàrl at the address below or use the customer portal.'] },
      ],
    },
    privacy: {
      eyebrow: 'LEGAL INFORMATION',
      title: 'Privacy policy',
      introduction: 'This policy explains how H&S Service Sàrl processes personal data when you visit hs-cleaning.ch, create an account, or request a service.',
      updated: 'October 2026 edition',
      contactTitle: 'Data controller',
      contact: `${company.name} · UID ${company.uid} · ${company.address}`,
      termsLabel: 'Terms and conditions', privacyLabel: 'Privacy policy', homeLabel: 'Back to home',
      footer: 'Please do not include sensitive personal information in portal free-text fields unless it is necessary for your request.',
      sections: [
        { heading: '1. Controller and scope', paragraphs: ['The controller for the processing described in this policy is H&S Service Sàrl, Avenue du Simplon 9, c/o Natividad Abrego Saavedra, 1225 Chêne-Bourg, Switzerland (UID CHE-259.228.541). The company operates hs-cleaning.ch under the H&S Quality Service brand.', 'This policy covers the website and customer portal, including data processed to manage accounts and cleaning requests.'] },
        { heading: '2. Data we process', paragraphs: ['Depending on how you use the portal, we may process the following categories of personal data:'], items: ['Account and contact details: name, email address, telephone number and, depending on your account, address, company name, and UID/IDE.', 'Request details: service type, postal code, premises characteristics and areas, requested date, and information you choose to provide.', 'Information needed to operate and secure your account: technical identifiers, email verification status, and session data.', 'Information you provide when contacting us about a request or account.'] },
        { heading: '3. Purposes and legal grounds', paragraphs: ['We use this information to create and secure your account, respond to requests, prepare estimates, arrange services, communicate with you, provide support, and meet applicable legal obligations.', 'To the extent provided for by the Swiss Federal Act on Data Protection (FADP) and, where applicable, the GDPR, processing is based in particular on steps requested before entering a contract, performance of a contract, compliance with legal obligations, and legitimate interests compatible with your rights. Where consent is required, it is requested separately.'] },
        { heading: '4. Access and service providers', paragraphs: ['Account and request data are accessible to authorised people who need them to handle your request, provide the service, or operate and secure the portal.', 'The website may use technical providers for hosting, database services, email delivery, secure file storage, and, in production, audience measurement. Providers receive only information needed for their functions and are subject to applicable contractual and legal safeguards. We do not sell personal data.'] },
        { heading: '5. Transfers and processing locations', paragraphs: ['Data are processed as part of providing the service in Switzerland and may also be processed in other countries depending on where our providers\' infrastructure is located. Where required by law, international transfers are subject to appropriate safeguards under the FADP and, where applicable, the GDPR.'] },
        { heading: '6. Retention and security', paragraphs: ['We retain data for as long as needed for the purposes described, then delete or anonymise it when it is no longer needed, subject to statutory retention periods and the need to document or defend legal rights.', 'We use reasonable technical and organisational measures to protect accounts and data against unauthorised access, loss, or alteration. Access is restricted to authorised people. No transmission or storage system can be guaranteed to be completely secure.'] },
        { heading: '7. Cookies and technical information', paragraphs: ['The portal uses technical elements needed for secure sign-in and to remember preferences such as your selected language. In production, audience measurement tools may also process technical information about visits to the website.', 'You can restrict some cookies in your browser settings, but blocking essential elements may prevent sign-in or affect portal features.'] },
        { heading: '8. Your rights and account deletion', paragraphs: ['Subject to the requirements and exceptions of applicable law, you may request access to, correction, or deletion of your data; object to certain processing; or request a portable copy where that right applies.', 'You can request account deletion from the customer area. Open service requests are reviewed before deletion; some information may need to be retained to meet legal obligations or establish, exercise, or defend a legal claim.', 'To exercise a right or ask a question, use the customer area or write to the controller at the postal address in this policy. You may also contact the Swiss Federal Data Protection and Information Commissioner (FDPIC), subject to applicable rules.'] },
        { heading: '9. Changes to this policy', paragraphs: ['This policy may be updated if our practices or legal requirements change. The version published on this page states the month of its latest update.'] },
      ],
    },
  },
}

export function LegalPage({ document, locale }: { document: LegalDocument; locale: Locale }) {
  const content = documents[locale][document]

  return (
    <main className="legal-page">
      <header className="legal-header">
        <Link className="legal-brand" href="/" aria-label="H&S Quality Service — accueil">
          <span className="legal-brand-mark" aria-hidden="true">H&amp;S</span>
          <span className="legal-brand-copy"><strong>HS Cleaning</strong><span>Quality Service · Suisse</span></span>
        </Link>
        <LanguageSwitcher compact />
      </header>

      <article className="legal-document">
        <div className="legal-document-heading">
          <p className="legal-eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className="legal-introduction">{content.introduction}</p>
          <p className="legal-updated">{content.updated}</p>
        </div>

        <section className="legal-company" aria-labelledby="legal-company-title">
          <h2 id="legal-company-title">{content.contactTitle}</h2>
          <p><strong>{company.name}</strong></p>
          <p>{content.contact}</p>
        </section>

        <div className="legal-sections">
          {content.sections.map((section) => (
            <section className="legal-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
            </section>
          ))}
        </div>

        <nav className="legal-related" aria-label={content.eyebrow}>
          <Link href="/terms">{content.termsLabel}</Link>
          <Link href="/privacy">{content.privacyLabel}</Link>
          <Link className="legal-home-link" href="/">{content.homeLabel}</Link>
        </nav>
      </article>

      <footer className="legal-footer"><p>{content.footer}</p><span>© {new Date().getFullYear()} H&amp;S Service Sàrl</span></footer>
    </main>
  )
}

export async function getLegalPageMetadata(document: LegalDocument) {
  const { getLocale } = await import('@/lib/locale-server')
  const locale = await getLocale()
  const content = documents[locale][document]
  return { title: `${content.title} | HS Cleaning`, description: content.introduction }
}

export type { LegalDocument }

export function getLegalLocaleCopy(locale: Locale, document: LegalDocument) {
  return documents[locale][document]
}

export function getLegalPageDocumentType(document: LegalDocument) {
  return document
}

export function getLegalLocale(locale: Locale) {
  return locale
}

export function getLegalMetadataTitle(locale: Locale, document: LegalDocument) {
  return `${documents[locale][document].title} | HS Cleaning`
}

export function getLegalMetadataDescription(locale: Locale, document: LegalDocument) {
  return documents[locale][document].introduction
}

export function getLegalDocumentContent(locale: Locale, document: LegalDocument) {
  return documents[locale][document]
}

export function getLegalCompanyDetails() {
  return company
}
