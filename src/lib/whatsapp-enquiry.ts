import type { Locale } from "@/i18n/routing";

/** Client-safe WhatsApp enquiry copy (no Node/fs imports). */
export function buildWhatsAppEnquiryText({
  locale,
  vehicleName,
  from,
  to,
  partySize,
}: {
  locale: Locale;
  vehicleName?: string;
  from?: string;
  to?: string;
  partySize?: number;
}) {
  const templates: Record<
    Locale,
    {
      intro: string;
      vehicle: string;
      pickup: string;
      return: string;
      people: string;
      outro: string;
    }
  > = {
    en: {
      intro: "Hello Artemis, I would like to enquire about a rental.",
      vehicle: "Vehicle",
      pickup: "Pick-up",
      return: "Return",
      people: "People",
      outro: "Please confirm availability.",
    },
    el: {
      intro: "Γεια σας Artemis, θα ήθελα πληροφορίες για ενοικίαση.",
      vehicle: "Όχημα",
      pickup: "Παραλαβή",
      return: "Επιστροφή",
      people: "Άτομα",
      outro: "Παρακαλώ επιβεβαιώστε διαθεσιμότητα.",
    },
    it: {
      intro: "Ciao Artemis, vorrei informazioni su un noleggio.",
      vehicle: "Veicolo",
      pickup: "Ritiro",
      return: "Riconsegna",
      people: "Persone",
      outro: "Per favore confermate la disponibilità.",
    },
    fr: {
      intro: "Bonjour Artemis, je souhaite me renseigner sur une location.",
      vehicle: "Véhicule",
      pickup: "Prise en charge",
      return: "Retour",
      people: "Personnes",
      outro: "Veuillez confirmer la disponibilité.",
    },
    de: {
      intro: "Hallo Artemis, ich möchte mich nach einer Mietmöglichkeit erkundigen.",
      vehicle: "Fahrzeug",
      pickup: "Abholung",
      return: "Rückgabe",
      people: "Personen",
      outro: "Bitte bestätigen Sie die Verfügbarkeit.",
    },
    sv: {
      intro: "Hej Artemis, jag skulle vilja fråga om en uthyrning.",
      vehicle: "Fordon",
      pickup: "Upphämtning",
      return: "Återlämning",
      people: "Personer",
      outro: "Vänligen bekräfta tillgänglighet.",
    },
    nl: {
      intro: "Hallo Artemis, ik wil graag informeren over een verhuur.",
      vehicle: "Voertuig",
      pickup: "Ophalen",
      return: "Retour",
      people: "Personen",
      outro: "Bevestig alstublieft de beschikbaarheid.",
    },
  };

  const t = templates[locale] ?? templates.en;
  const lines = [t.intro];
  if (vehicleName) lines.push(`${t.vehicle}: ${vehicleName}`);
  if (from) lines.push(`${t.pickup}: ${from}`);
  if (to) lines.push(`${t.return}: ${to}`);
  if (partySize && partySize > 1) lines.push(`${t.people}: ${partySize}`);
  lines.push(t.outro);
  return lines.join("\n");
}
