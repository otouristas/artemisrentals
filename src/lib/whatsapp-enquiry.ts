import type { Locale } from "@/i18n/routing";

/** Client-safe WhatsApp enquiry copy (no Node/fs imports). */
export function buildWhatsAppEnquiryText({
  locale,
  vehicleName,
  from,
  to,
  partySize,
  name,
}: {
  locale: Locale;
  vehicleName?: string;
  from?: string;
  to?: string;
  partySize?: number;
  name?: string;
}) {
  const templates: Record<
    Locale,
    {
      intro: string;
      followUpIntro: string;
      name: string;
      vehicle: string;
      pickup: string;
      return: string;
      people: string;
      outro: string;
      sentBy: string;
    }
  > = {
    en: {
      intro: "Hello Artemis Rental, I would like to enquire about a rental.",
      followUpIntro:
        "Hello Artemis Rental, I am following up on my rental enquiry.",
      name: "Name",
      vehicle: "Vehicle",
      pickup: "Pick-up",
      return: "Return",
      people: "People",
      outro: "Please confirm availability.",
      sentBy: "Sent by Rentacarsifnos.com",
    },
    el: {
      intro: "Γεια σας Artemis Rental, θα ήθελα πληροφορίες για ενοικίαση.",
      followUpIntro:
        "Γεια σας Artemis Rental, συνεχίζω για το αίτημα ενοικίασής μου.",
      name: "Όνομα",
      vehicle: "Όχημα",
      pickup: "Παραλαβή",
      return: "Επιστροφή",
      people: "Άτομα",
      outro: "Παρακαλώ επιβεβαιώστε διαθεσιμότητα.",
      sentBy: "Sent by Rentacarsifnos.com",
    },
    it: {
      intro: "Ciao Artemis Rental, vorrei informazioni su un noleggio.",
      followUpIntro:
        "Ciao Artemis Rental, continuo sulla mia richiesta di noleggio.",
      name: "Nome",
      vehicle: "Veicolo",
      pickup: "Ritiro",
      return: "Riconsegna",
      people: "Persone",
      outro: "Per favore confermate la disponibilità.",
      sentBy: "Sent by Rentacarsifnos.com",
    },
    fr: {
      intro: "Bonjour Artemis Rental, je souhaite me renseigner sur une location.",
      followUpIntro:
        "Bonjour Artemis Rental, je fais suite à ma demande de location.",
      name: "Nom",
      vehicle: "Véhicule",
      pickup: "Prise en charge",
      return: "Retour",
      people: "Personnes",
      outro: "Veuillez confirmer la disponibilité.",
      sentBy: "Sent by Rentacarsifnos.com",
    },
    de: {
      intro:
        "Hallo Artemis Rental, ich möchte mich nach einer Mietmöglichkeit erkundigen.",
      followUpIntro:
        "Hallo Artemis Rental, ich melde mich zu meiner Mietanfrage.",
      name: "Name",
      vehicle: "Fahrzeug",
      pickup: "Abholung",
      return: "Rückgabe",
      people: "Personen",
      outro: "Bitte bestätigen Sie die Verfügbarkeit.",
      sentBy: "Sent by Rentacarsifnos.com",
    },
    sv: {
      intro: "Hej Artemis Rental, jag skulle vilja fråga om en uthyrning.",
      followUpIntro:
        "Hej Artemis Rental, jag följer upp min hyresförfrågan.",
      name: "Namn",
      vehicle: "Fordon",
      pickup: "Upphämtning",
      return: "Återlämning",
      people: "Personer",
      outro: "Vänligen bekräfta tillgänglighet.",
      sentBy: "Sent by Rentacarsifnos.com",
    },
    nl: {
      intro: "Hallo Artemis Rental, ik wil graag informeren over een verhuur.",
      followUpIntro:
        "Hallo Artemis Rental, ik volg mijn verhuuraanvraag op.",
      name: "Naam",
      vehicle: "Voertuig",
      pickup: "Ophalen",
      return: "Retour",
      people: "Personen",
      outro: "Bevestig alstublieft de beschikbaarheid.",
      sentBy: "Sent by Rentacarsifnos.com",
    },
  };

  const t = templates[locale] ?? templates.en;
  const lines = [name ? t.followUpIntro : t.intro];
  if (name) lines.push(`${t.name}: ${name}`);
  if (vehicleName) lines.push(`${t.vehicle}: ${vehicleName}`);
  if (from) lines.push(`${t.pickup}: ${from}`);
  if (to) lines.push(`${t.return}: ${to}`);
  if (partySize && partySize > 1) lines.push(`${t.people}: ${partySize}`);
  lines.push(t.outro);
  lines.push("");
  lines.push(t.sentBy);
  return lines.join("\n");
}

/** Desk → guest follow-up message for WhatsApp from the enquiry email. */
export function buildWhatsAppDeskFollowUpText({
  locale,
  name,
  vehicleName,
  from,
  to,
  partySize,
}: {
  locale: Locale;
  name: string;
  vehicleName?: string;
  from?: string;
  to?: string;
  partySize?: number;
}) {
  const vehicle = vehicleName?.trim() || "a vehicle";
  const dates =
    from && to ? `${from} to ${to}` : from ? from : to ? to : "your travel dates";
  const party =
    partySize && partySize > 1 ? ` for ${partySize} people` : "";

  const templates: Record<Locale, string> = {
    en: `Dear ${name}, regarding your request for ${vehicle}${party}, for ${dates}.\n\nWe are checking availability and will confirm shortly.\nArtemis Rental, Apollonia`,
    el: `Αγαπητέ/ή ${name}, σχετικά με το αίτημά σας για ${vehicle}${partySize && partySize > 1 ? ` για ${partySize} άτομα` : ""}, για ${dates}.\n\nΕλέγχουμε τη διαθεσιμότητα και θα επιβεβαιώσουμε σύντομα.\nArtemis Rental, Απολλωνία`,
    it: `Gentile ${name}, riguardo alla sua richiesta per ${vehicle}${partySize && partySize > 1 ? ` per ${partySize} persone` : ""}, per ${dates}.\n\nStiamo verificando la disponibilità e le confermeremo a breve.\nArtemis Rental, Apollonia`,
    fr: `Cher/Chère ${name}, concernant votre demande pour ${vehicle}${partySize && partySize > 1 ? ` pour ${partySize} personnes` : ""}, pour ${dates}.\n\nNous vérifions la disponibilité et confirmerons bientôt.\nArtemis Rental, Apollonia`,
    de: `Liebe/r ${name}, bezüglich Ihrer Anfrage für ${vehicle}${partySize && partySize > 1 ? ` für ${partySize} Personen` : ""}, für ${dates}.\n\nWir prüfen die Verfügbarkeit und melden uns in Kürze.\nArtemis Rental, Apollonia`,
    sv: `Hej ${name}, angående din förfrågan om ${vehicle}${partySize && partySize > 1 ? ` för ${partySize} personer` : ""}, för ${dates}.\n\nVi kontrollerar tillgängligheten och återkommer snart.\nArtemis Rental, Apollonia`,
    nl: `Beste ${name}, betreffende uw aanvraag voor ${vehicle}${partySize && partySize > 1 ? ` voor ${partySize} personen` : ""}, voor ${dates}.\n\nWe controleren de beschikbaarheid en bevestigen binnenkort.\nArtemis Rental, Apollonia`,
  };

  return templates[locale] ?? templates.en;
}

/** Normalize a guest phone for wa.me (digits only, with GR country code when needed). */
export function phoneToWhatsAppDigits(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length >= 10) {
    digits = `30${digits.slice(1)}`;
  } else if (digits.startsWith("69") && digits.length === 10) {
    digits = `30${digits}`;
  }
  return digits;
}
