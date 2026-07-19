import { business, SITE_URL, whatsappUrl } from "@/lib/site";
import { asLocale, type LocalizedString } from "@/lib/i18n-locale";
import { localizeField } from "@/lib/fleet";
import type { Locale } from "@/i18n/routing";
import { ALL_CAR_PICKUPS } from "@/lib/pickup";
import {
  buildWhatsAppDeskFollowUpText,
  buildWhatsAppEnquiryText,
  phoneToWhatsAppDigits,
} from "@/lib/whatsapp-enquiry";

export type EnquiryEmailData = {
  name: string;
  email: string;
  phone: string;
  vehicle?: string;
  pickup: string;
  returnDate: string;
  pickupLocation?: (typeof ALL_CAR_PICKUPS)[number];
  returnLocation?: (typeof ALL_CAR_PICKUPS)[number];
  childSeat?: boolean;
  arrivalInfo?: string;
  partySize?: number;
  estimatedTotal?: number;
  message?: string;
  locale?: string;
};

const locationLabel: Record<(typeof ALL_CAR_PICKUPS)[number], LocalizedString> = {
  apollonia: {
    en: "Apollonia",
    el: "Απολλωνία",
    it: "Apollonia",
    fr: "Apollonia",
    de: "Apollonia",
    sv: "Apollonia",
    nl: "Apollonia",
  },
  kamares: {
    en: "Kamares port",
    el: "Λιμάνι Καμαρών",
    it: "Porto di Kamares",
    fr: "Port de Kamares",
    de: "Hafen Kamares",
    sv: "Kamares hamn",
    nl: "Haven Kamares",
  },
  heliport: {
    en: "Heliport",
    el: "Ελικοδρόμιο",
    it: "Eliporto",
    fr: "Héliport",
    de: "Heliport",
    sv: "Helikopterflygplats",
    nl: "Heliport",
  },
  artemonas: {
    en: "Artemonas",
    el: "Αρτεμώνας",
    it: "Artemonas",
    fr: "Artemonas",
    de: "Artemonas",
    sv: "Artemonas",
    nl: "Artemonas",
  },
  kastro: {
    en: "Kastro",
    el: "Κάστρο",
    it: "Kastro",
    fr: "Kastro",
    de: "Kastro",
    sv: "Kastro",
    nl: "Kastro",
  },
  vathi: {
    en: "Vathi (on request)",
    el: "Βαθύ (κατόπιν αιτήματος)",
    it: "Vathi (su richiesta)",
    fr: "Vathi (sur demande)",
    de: "Vathi (auf Anfrage)",
    sv: "Vathi (på begäran)",
    nl: "Vathi (op aanvraag)",
  },
  "platys-gialos": {
    en: "Platys Gialos (on request)",
    el: "Πλατύς Γιαλός (κατόπιν αιτήματος)",
    it: "Platys Gialos (su richiesta)",
    fr: "Platys Gialos (sur demande)",
    de: "Platys Gialos (auf Anfrage)",
    sv: "Platys Gialos (på begäran)",
    nl: "Platys Gialos (op aanvraag)",
  },
  faros: {
    en: "Faros (on request)",
    el: "Φάρος (κατόπιν αιτήματος)",
    it: "Faros (su richiesta)",
    fr: "Faros (sur demande)",
    de: "Faros (auf Anfrage)",
    sv: "Faros (på begäran)",
    nl: "Faros (op aanvraag)",
  },
  chrysopigi: {
    en: "Chrysopigi (on request)",
    el: "Χρυσοπηγή (κατόπιν αιτήματος)",
    it: "Chrysopigi (su richiesta)",
    fr: "Chrysopigi (sur demande)",
    de: "Chrysopigi (auf Anfrage)",
    sv: "Chrysopigi (på begäran)",
    nl: "Chrysopigi (op aanvraag)",
  },
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function labelFor(
  location: (typeof ALL_CAR_PICKUPS)[number] | undefined,
  locale: Locale,
) {
  if (!location) return localizeField(locationLabel.apollonia, locale);
  return localizeField(locationLabel[location], locale);
}

function formatDisplayDate(iso: string, locale: Locale) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const tag =
    locale === "el"
      ? "el-GR"
      : locale === "it"
        ? "it-IT"
        : locale === "fr"
          ? "fr-FR"
          : locale === "de"
            ? "de-DE"
            : locale === "sv"
              ? "sv-SE"
              : locale === "nl"
                ? "nl-NL"
                : "en-GB";
  return d.toLocaleDateString(tag, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isScooterVehicle(vehicle?: string) {
  if (!vehicle) return false;
  return /scooter|symphony|vespa|moto|μηχαν/i.test(vehicle);
}

type Copy = {
  guestSubject: string;
  deskSubject: (name: string, pickup: string) => string;
  eyebrow: string;
  hello: (name: string) => string;
  thanks: string;
  tripTitle: string;
  vehicle: string;
  pickup: string;
  return: string;
  pickupLoc: string;
  returnLoc: string;
  childSeat: string;
  party: string;
  estimate: string;
  vehicleFallback: string;
  notes: string;
  nextTitle: string;
  nextBody: string;
  ctaWhatsApp: string;
  ctaCall: string;
  footerNote: string;
  deskEyebrow: string;
  deskHello: string;
  deskIntro: string;
  guest: string;
  phone: string;
  email: string;
  source: string;
  replyHint: string;
};

const copyByLocale: Record<Locale, Copy> = {
  en: {
    guestSubject: "Confirmation: we received your enquiry · Artemis Rental",
    deskSubject: (name, pickup) => `Request: ${name} · ${pickup}`,
    eyebrow: "Confirmation",
    hello: (name) => `Hi ${name},`,
    thanks:
      "Thanks for writing to Artemis Rental in Apollonia. We have your trip details and will confirm availability shortly.",
    tripTitle: "Your trip",
    vehicle: "Vehicle",
    pickup: "Pick-up",
    return: "Return",
    pickupLoc: "Pick-up point",
    returnLoc: "Return point",
    childSeat: "Child seat",
    party: "People",
    estimate: "Estimated total",
    vehicleFallback: "We will suggest the best fit",
    notes: "Notes",
    nextTitle: "What happens next",
    nextBody:
      "Our desk checks the dates against the fleet, then replies by email or WhatsApp. No prepayment is required to enquire.",
    ctaWhatsApp: "WhatsApp Artemis",
    ctaCall: "Call the office",
    footerNote: `Family rental desk in Apollonia since ${business.since}.`,
    deskEyebrow: "Booking request",
    deskHello: "New rental request",
    deskIntro: "A guest submitted a booking request from the website or Touristas chat.",
    guest: "Guest",
    phone: "Phone",
    email: "Email",
    source: "Source note",
    replyHint: "Reply directly to this email to reach the guest.",
  },
  el: {
    guestSubject: "Επιβεβαίωση: λάβαμε το αίτημά σας · Artemis Rental",
    deskSubject: (name, pickup) => `Αίτημα: ${name} · ${pickup}`,
    eyebrow: "Επιβεβαίωση",
    hello: (name) => `Γεια σας ${name},`,
    thanks:
      "Ευχαριστούμε που επικοινωνήσατε με την Artemis Rental στην Απολλωνία. Έχουμε τα στοιχεία του ταξιδιού σας και θα επιβεβαιώσουμε διαθεσιμότητα σύντομα.",
    tripTitle: "Το ταξίδι σας",
    vehicle: "Όχημα",
    pickup: "Παραλαβή",
    return: "Επιστροφή",
    pickupLoc: "Σημείο παραλαβής",
    returnLoc: "Σημείο επιστροφής",
    childSeat: "Παιδικό κάθισμα",
    party: "Άτομα",
    estimate: "Ενδεικτικό σύνολο",
    vehicleFallback: "Θα προτείνουμε την καλύτερη επιλογή",
    notes: "Σημειώσεις",
    nextTitle: "Τι ακολουθεί",
    nextBody:
      "Το γραφείο ελέγχει τις ημερομηνίες στον στόλο και απαντά με email ή WhatsApp. Δεν απαιτείται προκαταβολή για το αίτημα.",
    ctaWhatsApp: "WhatsApp Artemis",
    ctaCall: "Καλέστε το γραφείο",
    footerNote: `Οικογενειακό γραφείο ενοικιάσεων στην Απολλωνία από το ${business.since}.`,
    deskEyebrow: "Αίτημα κράτησης",
    deskHello: "Νέο αίτημα ενοικίασης",
    deskIntro: "Ένας επισκέπτης υπέβαλε αίτημα κράτησης από τον ιστότοπο ή το Touristas chat.",
    guest: "Επισκέπτης",
    phone: "Τηλέφωνο",
    email: "Email",
    source: "Σημείωση πηγής",
    replyHint: "Απαντήστε απευθείας σε αυτό το email για να επικοινωνήσετε με τον επισκέπτη.",
  },
  it: {
    guestSubject: "Conferma: abbiamo ricevuto la tua richiesta · Artemis Rental",
    deskSubject: (name, pickup) => `Richiesta: ${name} · ${pickup}`,
    eyebrow: "Conferma",
    hello: (name) => `Ciao ${name},`,
    thanks:
      "Grazie per aver scritto ad Artemis Rental ad Apollonia. Abbiamo i dettagli del viaggio e confermeremo la disponibilità a breve.",
    tripTitle: "Il tuo viaggio",
    vehicle: "Veicolo",
    pickup: "Ritiro",
    return: "Riconsegna",
    pickupLoc: "Punto di ritiro",
    returnLoc: "Punto di riconsegna",
    childSeat: "Seggiolino",
    party: "Persone",
    estimate: "Totale indicativo",
    vehicleFallback: "Ti proporremo l'opzione migliore",
    notes: "Note",
    nextTitle: "Cosa succede dopo",
    nextBody:
      "Lo sportello controlla le date sulla flotta e risponde via email o WhatsApp. Nessun anticipo richiesto per la richiesta.",
    ctaWhatsApp: "WhatsApp Artemis",
    ctaCall: "Chiama l'ufficio",
    footerNote: `Sportello familiare ad Apollonia dal ${business.since}.`,
    deskEyebrow: "Richiesta di prenotazione",
    deskHello: "Nuova richiesta di noleggio",
    deskIntro: "Un ospite ha inviato una richiesta di prenotazione dal sito o dalla chat Touristas.",
    guest: "Ospite",
    phone: "Telefono",
    email: "Email",
    source: "Nota sulla fonte",
    replyHint: "Rispondi direttamente a questa email per contattare l'ospite.",
  },
  fr: {
    guestSubject: "Confirmation : nous avons reçu votre demande · Artemis Rental",
    deskSubject: (name, pickup) => `Demande : ${name} · ${pickup}`,
    eyebrow: "Confirmation",
    hello: (name) => `Bonjour ${name},`,
    thanks:
      "Merci d'avoir écrit à Artemis Rental à Apollonia. Nous avons les détails de votre voyage et confirmerons bientôt la disponibilité.",
    tripTitle: "Votre voyage",
    vehicle: "Véhicule",
    pickup: "Prise en charge",
    return: "Retour",
    pickupLoc: "Point de prise en charge",
    returnLoc: "Point de retour",
    childSeat: "Siège enfant",
    party: "Personnes",
    estimate: "Total indicatif",
    vehicleFallback: "Nous vous proposerons le meilleur choix",
    notes: "Notes",
    nextTitle: "Et ensuite",
    nextBody:
      "Le bureau vérifie les dates sur la flotte, puis répond par e-mail ou WhatsApp. Aucun acompte n'est requis pour la demande.",
    ctaWhatsApp: "WhatsApp Artemis",
    ctaCall: "Appeler le bureau",
    footerNote: `Bureau familial à Apollonia depuis ${business.since}.`,
    deskEyebrow: "Demande de réservation",
    deskHello: "Nouvelle demande de location",
    deskIntro: "Un client a envoyé une demande de réservation depuis le site ou le chat Touristas.",
    guest: "Client",
    phone: "Téléphone",
    email: "E-mail",
    source: "Note source",
    replyHint: "Répondez directement à cet e-mail pour joindre le client.",
  },
  de: {
    guestSubject: "Bestätigung: wir haben Ihre Anfrage erhalten · Artemis Rental",
    deskSubject: (name, pickup) => `Anfrage: ${name} · ${pickup}`,
    eyebrow: "Bestätigung",
    hello: (name) => `Hallo ${name},`,
    thanks:
      "Danke, dass Sie Artemis Rental in Apollonia geschrieben haben. Wir haben Ihre Reisedaten und bestätigen die Verfügbarkeit in Kürze.",
    tripTitle: "Ihre Reise",
    vehicle: "Fahrzeug",
    pickup: "Abholung",
    return: "Rückgabe",
    pickupLoc: "Abholort",
    returnLoc: "Rückgabeort",
    childSeat: "Kindersitz",
    party: "Personen",
    estimate: "Geschätzter Gesamtbetrag",
    vehicleFallback: "Wir schlagen die beste Option vor",
    notes: "Notizen",
    nextTitle: "Was als Nächstes passiert",
    nextBody:
      "Unser Schalter prüft die Daten in der Flotte und antwortet per E-Mail oder WhatsApp. Für die Anfrage ist keine Vorauszahlung nötig.",
    ctaWhatsApp: "WhatsApp Artemis",
    ctaCall: "Büro anrufen",
    footerNote: `Familienschalter in Apollonia seit ${business.since}.`,
    deskEyebrow: "Buchungsanfrage",
    deskHello: "Neue Mietanfrage",
    deskIntro: "Ein Gast hat eine Buchungsanfrage über die Website oder den Touristas-Chat gesendet.",
    guest: "Gast",
    phone: "Telefon",
    email: "E-Mail",
    source: "Quellenhinweis",
    replyHint: "Antworten Sie direkt auf diese E-Mail, um den Gast zu erreichen.",
  },
  sv: {
    guestSubject: "Bekräftelse: vi har tagit emot din förfrågan · Artemis Rental",
    deskSubject: (name, pickup) => `Förfrågan: ${name} · ${pickup}`,
    eyebrow: "Bekräftelse",
    hello: (name) => `Hej ${name},`,
    thanks:
      "Tack för att du skrev till Artemis Rental i Apollonia. Vi har dina reseuppgifter och bekräftar tillgänglighet snart.",
    tripTitle: "Din resa",
    vehicle: "Fordon",
    pickup: "Upphämtning",
    return: "Återlämning",
    pickupLoc: "Upphämtningsplats",
    returnLoc: "Återlämningsplats",
    childSeat: "Barnstol",
    party: "Personer",
    estimate: "Uppskattad totalsumma",
    vehicleFallback: "Vi föreslår det bästa alternativet",
    notes: "Anteckningar",
    nextTitle: "Vad händer nu",
    nextBody:
      "Vår disk kontrollerar datumen mot flottan och svarar via e-post eller WhatsApp. Ingen förskottsbetalning krävs för förfrågan.",
    ctaWhatsApp: "WhatsApp Artemis",
    ctaCall: "Ring kontoret",
    footerNote: `Familjedisk i Apollonia sedan ${business.since}.`,
    deskEyebrow: "Bokningsförfrågan",
    deskHello: "Ny hyresförfrågan",
    deskIntro: "En gäst skickade en bokningsförfrågan från webbplatsen eller Touristas-chatten.",
    guest: "Gäst",
    phone: "Telefon",
    email: "E-post",
    source: "Källanteckning",
    replyHint: "Svara direkt på detta mejl för att nå gästen.",
  },
  nl: {
    guestSubject: "Bevestiging: we hebben je aanvraag ontvangen · Artemis Rental",
    deskSubject: (name, pickup) => `Aanvraag: ${name} · ${pickup}`,
    eyebrow: "Bevestiging",
    hello: (name) => `Hoi ${name},`,
    thanks:
      "Bedankt dat je Artemis Rental in Apollonia schreef. We hebben je reisgegevens en bevestigen binnenkort de beschikbaarheid.",
    tripTitle: "Jouw reis",
    vehicle: "Voertuig",
    pickup: "Ophalen",
    return: "Terugbrengen",
    pickupLoc: "Ophaalpunt",
    returnLoc: "Terugbrengpunt",
    childSeat: "Kinderzitje",
    party: "Personen",
    estimate: "Geschat totaal",
    vehicleFallback: "Wij stellen de beste optie voor",
    notes: "Notities",
    nextTitle: "Wat er nu gebeurt",
    nextBody:
      "Onze balie controleert de data op de vloot en antwoordt via e-mail of WhatsApp. Geen vooruitbetaling nodig voor de aanvraag.",
    ctaWhatsApp: "WhatsApp Artemis",
    ctaCall: "Bel het kantoor",
    footerNote: `Familiebalie in Apollonia sinds ${business.since}.`,
    deskEyebrow: "Boekingsaanvraag",
    deskHello: "Nieuwe verhuuraanvraag",
    deskIntro: "Een gast stuurde een boekingsaanvraag via de website of Touristas-chat.",
    guest: "Gast",
    phone: "Telefoon",
    email: "E-mail",
    source: "Bronnotitie",
    replyHint: "Beantwoord deze e-mail rechtstreeks om de gast te bereiken.",
  },
};

const FONT =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e8e2d8;width:38%;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#6b7280;font-family:${FONT};font-weight:600;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #e8e2d8;font-size:15px;color:#0b2a3c;font-family:${FONT};font-weight:600;">
        ${escapeHtml(value)}
      </td>
    </tr>`;
}

function shell(opts: {
  locale: Locale;
  eyebrow: string;
  title: string;
  introHtml: string;
  bodyHtml: string;
  footerNote: string;
  preheader: string;
  whatsappHref: string;
  whatsappLabel?: string;
  phoneHref?: string;
  phoneLabel?: string;
}) {
  const logoUrl = `${SITE_URL}/images/brand/artemis-auto-rental-white.png`;
  const whatsapp = opts.whatsappHref;
  const whatsappLabel = opts.whatsappLabel ?? "WhatsApp";
  const phone = opts.phoneLabel ?? business.phones[0].display;
  const phoneHref = opts.phoneHref ?? `tel:${business.phones[0].e164}`;
  const officePhone = business.phones[0].display;

  return `<!DOCTYPE html>
<html lang="${opts.locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(opts.title)}</title>
  <!--[if !mso]><!-->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <!--<![endif]-->
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body, table, td, a, p, h1, h2, div { font-family: ${FONT} !important; }
  </style>
</head>
<body style="margin:0;padding:0;background:#efe9df;-webkit-text-size-adjust:100%;font-family:${FONT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(opts.preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efe9df;padding:28px 12px;font-family:${FONT};">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#f7f4ef;border-radius:20px;overflow:hidden;box-shadow:0 18px 50px rgba(11,42,60,0.12);font-family:${FONT};">
          <tr>
            <td style="background:linear-gradient(145deg,#0b2a3c 0%,#123a52 55%,#1a4d6b 100%);padding:32px 28px 28px;text-align:center;">
              <a href="${SITE_URL}" style="display:inline-block;text-decoration:none;">
                <img src="${logoUrl}" width="180" height="80" alt="Artemis Rental" style="display:block;margin:0 auto;width:180px;height:auto;max-width:72%;border:0;" />
              </a>
              <div style="margin-top:10px;font-family:${FONT};font-size:12px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.65);">
                Apollonia, Sifnos
              </div>
              <div style="margin-top:22px;font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#c9833a;">
                ${escapeHtml(opts.eyebrow)}
              </div>
              <h1 style="margin:10px 0 0;font-family:${FONT};font-size:26px;line-height:1.3;font-weight:600;color:#ffffff;">
                ${escapeHtml(opts.title)}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;font-family:${FONT};font-size:16px;line-height:1.55;color:#0b2a3c;">
              ${opts.introHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 8px;font-family:${FONT};">
              ${opts.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;font-family:${FONT};">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td align="left" style="padding-top:8px;">
                    <a href="${escapeHtml(whatsapp)}" style="display:inline-block;background:#c9833a;color:#0b2a3c;text-decoration:none;font-family:${FONT};font-size:13px;font-weight:700;padding:12px 18px;border-radius:999px;margin:0 8px 8px 0;">
                      ${escapeHtml(whatsappLabel)}
                    </a>
                    <a href="${escapeHtml(phoneHref)}" style="display:inline-block;background:#0b2a3c;color:#ffffff;text-decoration:none;font-family:${FONT};font-size:13px;font-weight:700;padding:12px 18px;border-radius:999px;margin:0 0 8px 0;">
                      ${escapeHtml(phone)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#ebe4d8;padding:20px 28px;font-family:${FONT};font-size:12px;line-height:1.5;color:#5b6470;">
              ${escapeHtml(opts.footerNote)}<br />
              <a href="${SITE_URL}" style="color:#0b2a3c;text-decoration:none;font-family:${FONT};">rentacarsifnos.com</a>
              · ${escapeHtml(business.email)}
              · ${escapeHtml(officePhone)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function tripCard(htmlRows: string, title: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e4ddd2;border-radius:16px;padding:4px 20px;">
      <tr>
        <td style="padding:18px 0 6px;font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#c9833a;">
          ${escapeHtml(title)}
        </td>
      </tr>
      <tr>
        <td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${htmlRows}
          </table>
        </td>
      </tr>
    </table>`;
}

function nextStepsCard(title: string, body: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:linear-gradient(180deg,#fffaf3 0%,#f7f4ef 100%);border:1px solid #edd9c0;border-radius:16px;">
      <tr>
        <td style="padding:18px 20px;">
          <div style="font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#c9833a;margin-bottom:6px;">
            ${escapeHtml(title)}
          </div>
          <div style="font-family:${FONT};font-size:15px;line-height:1.5;color:#0b2a3c;">
            ${escapeHtml(body)}
          </div>
        </td>
      </tr>
    </table>`;
}

export function buildGuestEnquiryEmail(data: EnquiryEmailData) {
  const locale = asLocale(data.locale);
  const t = copyByLocale[locale];
  const pickupLabel = labelFor(data.pickupLocation, locale);
  const returnLabel = labelFor(data.returnLocation ?? data.pickupLocation, locale);
  const vehicle = data.vehicle?.trim() || t.vehicleFallback;
  const scooter = isScooterVehicle(vehicle);
  const pickupDisplay = formatDisplayDate(data.pickup, locale);
  const returnDisplay = formatDisplayDate(data.returnDate, locale);
  const heroTitle =
    locale === "en"
      ? scooter
        ? "Your scooter enquiry"
        : "Your rental enquiry"
      : t.tripTitle;

  const rows = [
    row(t.vehicle, vehicle),
    row(t.pickup, pickupDisplay),
    row(t.return, returnDisplay),
    row(t.pickupLoc, pickupLabel),
    row(t.returnLoc, returnLabel),
    data.partySize ? row(t.party, String(data.partySize)) : "",
    data.childSeat ? row(t.childSeat, locale === "en" ? "Yes" : "✓") : "",
    data.estimatedTotal != null ? row(t.estimate, `~€${data.estimatedTotal}`) : "",
    data.message?.trim() ? row(t.notes, data.message.trim()) : "",
  ].join("");

  const guestWhatsAppText = buildWhatsAppEnquiryText({
    locale,
    name: data.name,
    vehicleName: vehicle,
    from: pickupDisplay,
    to: returnDisplay,
    partySize: data.partySize,
  });

  const html = shell({
    locale,
    eyebrow: t.eyebrow,
    title: heroTitle,
    introHtml: `<p style="margin:0 0 10px;">${escapeHtml(t.hello(data.name))}</p><p style="margin:0;">${escapeHtml(t.thanks)}</p>`,
    bodyHtml: `${tripCard(rows, t.tripTitle)}${nextStepsCard(t.nextTitle, t.nextBody)}`,
    footerNote: t.footerNote,
    preheader: `${t.thanks} ${vehicle} · ${pickupDisplay} to ${returnDisplay}`,
    whatsappHref: whatsappUrl(guestWhatsAppText),
    whatsappLabel: t.ctaWhatsApp,
  });

  const text = [
    t.hello(data.name),
    "",
    t.thanks,
    "",
    `${t.vehicle}: ${vehicle}`,
    `${t.pickup}: ${pickupDisplay}`,
    `${t.return}: ${returnDisplay}`,
    `${t.pickupLoc}: ${pickupLabel}`,
    `${t.returnLoc}: ${returnLabel}`,
    data.partySize ? `${t.party}: ${data.partySize}` : null,
    data.childSeat ? t.childSeat : null,
    data.estimatedTotal != null ? `${t.estimate}: ~€${data.estimatedTotal}` : null,
    data.message?.trim() ? `${t.notes}: ${data.message.trim()}` : null,
    "",
    t.nextBody,
    "",
    "Artemis Rental",
    business.phones[0].display,
    business.email,
    SITE_URL,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: t.guestSubject,
    html,
    text,
  };
}

export function buildDeskEnquiryEmail(data: EnquiryEmailData) {
  const locale = asLocale(data.locale);
  const en = copyByLocale.en;
  // Desk mail stays primarily English for the office.
  const pickupLabel = labelFor(data.pickupLocation, "en");
  const returnLabel = labelFor(data.returnLocation ?? data.pickupLocation, "en");
  const vehicle = data.vehicle?.trim() || "Any / suggest best fit";
  const pickupDisplay = formatDisplayDate(data.pickup, "en");
  const returnDisplay = formatDisplayDate(data.returnDate, "en");
  const kind = isScooterVehicle(vehicle) ? "Scooter" : /car|auto|ignis|fabia|panda|suzuki|skoda|fiat/i.test(vehicle) ? "Car" : "Vehicle";

  const rows = [
    row(en.guest, data.name),
    row(en.email, data.email),
    row(en.phone, data.phone),
    row(en.vehicle, `${kind}: ${vehicle}`),
    row(en.pickup, pickupDisplay),
    row(en.return, returnDisplay),
    row(en.pickupLoc, pickupLabel),
    row(en.returnLoc, returnLabel),
    data.partySize ? row(en.party, String(data.partySize)) : "",
    data.childSeat ? row(en.childSeat, "Yes") : "",
    data.arrivalInfo?.trim() ? row("Arrival", data.arrivalInfo.trim()) : "",
    data.estimatedTotal != null ? row(en.estimate, `~€${data.estimatedTotal}`) : "",
    data.message?.trim() ? row(en.source, data.message.trim()) : "",
    row("Locale", locale),
  ].join("");

  const deskFollowUp = buildWhatsAppDeskFollowUpText({
    locale,
    name: data.name,
    vehicleName: vehicle,
    from: pickupDisplay,
    to: returnDisplay,
    partySize: data.partySize,
  });
  const guestDigits = phoneToWhatsAppDigits(data.phone);
  const deskWhatsAppHref = guestDigits
    ? `https://wa.me/${guestDigits}?text=${encodeURIComponent(deskFollowUp)}`
    : whatsappUrl(deskFollowUp);

  const html = shell({
    locale: "en",
    eyebrow: en.deskEyebrow,
    title: en.deskHello,
    introHtml: `<p style="margin:0 0 10px;">${escapeHtml(en.deskIntro)}</p><p style="margin:0;color:#5b6470;font-size:14px;">${escapeHtml(en.replyHint)}</p>`,
    bodyHtml: tripCard(rows, "Enquiry details"),
    footerNote: en.footerNote,
    preheader: `${data.name} · ${vehicle} · ${pickupDisplay} to ${returnDisplay}`,
    whatsappHref: deskWhatsAppHref,
    whatsappLabel: guestDigits ? "WhatsApp guest" : en.ctaWhatsApp,
    phoneHref: `tel:${data.phone.replace(/\s/g, "")}`,
    phoneLabel: data.phone,
  });

  const text = [
    "New Artemis booking enquiry",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Vehicle: ${vehicle}`,
    `Pickup date: ${data.pickup}`,
    `Return date: ${data.returnDate}`,
    `Pickup location: ${data.pickupLocation ?? "apollonia"}`,
    `Return location: ${data.returnLocation ?? data.pickupLocation ?? "apollonia"}`,
    `Child seat: ${data.childSeat ? "yes" : "no"}`,
    `People: ${data.partySize ?? "-"}`,
    `Arrival info: ${data.arrivalInfo || "-"}`,
    `Estimated total: ${data.estimatedTotal != null ? `€${data.estimatedTotal}` : "-"}`,
    `Locale: ${locale}`,
    `Message: ${data.message || "-"}`,
  ].join("\n");

  return {
    subject: en.deskSubject(data.name, data.pickup),
    html,
    text,
  };
}
