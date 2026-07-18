import { z } from "zod";
import { Resend } from "resend";
import { business } from "@/lib/site";
import { ALL_CAR_PICKUPS } from "@/lib/pickup";
import { asLocale, type LocalizedString } from "@/lib/i18n-locale";
import { localizeField } from "@/lib/fleet";
import type { Locale } from "@/i18n/routing";

const pickupEnum = z.enum(ALL_CAR_PICKUPS);

const schema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().min(5),
  vehicle: z.string().optional(),
  pickup: z.string().min(4),
  returnDate: z.string().min(4),
  pickupLocation: pickupEnum.optional(),
  returnLocation: pickupEnum.optional(),
  childSeat: z.boolean().optional(),
  arrivalInfo: z.string().optional(),
  partySize: z.coerce.number().int().min(1).max(20).optional(),
  estimatedTotal: z.coerce.number().min(0).optional(),
  message: z.string().optional(),
  locale: z.string().optional(),
});

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
};

function labelFor(
  location: (typeof ALL_CAR_PICKUPS)[number] | undefined,
  locale: Locale,
) {
  if (!location) return localizeField(locationLabel.apollonia, locale);
  return localizeField(locationLabel[location], locale);
}

function confirmationEmail(data: z.infer<typeof schema>, locale: Locale) {
  const pickupLabel = labelFor(data.pickupLocation, locale);
  const returnLabel = labelFor(data.returnLocation ?? data.pickupLocation, locale);

  const templates: Record<
    Locale,
    {
      subject: string;
      hello: string;
      thanks: string;
      vehicle: string;
      pickup: string;
      return: string;
      pickupLoc: string;
      returnLoc: string;
      childSeat: string;
      party: string;
      estimate: string;
      vehicleFallback: string;
    }
  > = {
    en: {
      subject: "We received your enquiry: Artemis Rental",
      hello: `Hi ${data.name},`,
      thanks: "Thanks for your rental enquiry. We will get back to you shortly.",
      vehicle: "Vehicle",
      pickup: "Pickup",
      return: "Return",
      pickupLoc: "Pickup location",
      returnLoc: "Return location",
      childSeat: "Child seat: yes",
      party: "Party size",
      estimate: "Estimated total",
      vehicleFallback: "we will suggest one",
    },
    el: {
      subject: "Λάβαμε το αίτημά σας: Artemis Rental",
      hello: `Γεια σας ${data.name},`,
      thanks: "Ευχαριστούμε για το αίτημα ενοικίασης. Θα επικοινωνήσουμε σύντομα.",
      vehicle: "Όχημα",
      pickup: "Παραλαβή",
      return: "Επιστροφή",
      pickupLoc: "Σημείο παραλαβής",
      returnLoc: "Σημείο επιστροφής",
      childSeat: "Παιδικό κάθισμα: ναι",
      party: "Άτομα",
      estimate: "Ενδεικτικό σύνολο",
      vehicleFallback: "θα προτείνουμε εμείς",
    },
    it: {
      subject: "Abbiamo ricevuto la tua richiesta: Artemis Rental",
      hello: `Ciao ${data.name},`,
      thanks: "Grazie per la richiesta di noleggio. Ti risponderemo a breve.",
      vehicle: "Veicolo",
      pickup: "Ritiro",
      return: "Riconsegna",
      pickupLoc: "Luogo di ritiro",
      returnLoc: "Luogo di riconsegna",
      childSeat: "Seggiolino: sì",
      party: "Persone",
      estimate: "Totale indicativo",
      vehicleFallback: "ti proporremo noi",
    },
    fr: {
      subject: "Nous avons reçu votre demande : Artemis Rental",
      hello: `Bonjour ${data.name},`,
      thanks: "Merci pour votre demande de location. Nous vous répondrons bientôt.",
      vehicle: "Véhicule",
      pickup: "Prise en charge",
      return: "Retour",
      pickupLoc: "Lieu de prise en charge",
      returnLoc: "Lieu de retour",
      childSeat: "Siège enfant : oui",
      party: "Personnes",
      estimate: "Total indicatif",
      vehicleFallback: "nous vous en proposerons un",
    },
    de: {
      subject: "Wir haben Ihre Anfrage erhalten: Artemis Rental",
      hello: `Hallo ${data.name},`,
      thanks: "Danke für Ihre Mietanfrage. Wir melden uns in Kürze.",
      vehicle: "Fahrzeug",
      pickup: "Abholung",
      return: "Rückgabe",
      pickupLoc: "Abholort",
      returnLoc: "Rückgabeort",
      childSeat: "Kindersitz: ja",
      party: "Personen",
      estimate: "Geschätzter Gesamtbetrag",
      vehicleFallback: "wir schlagen eines vor",
    },
    sv: {
      subject: "Vi har tagit emot din förfrågan: Artemis Rental",
      hello: `Hej ${data.name},`,
      thanks: "Tack för din hyresförfrågan. Vi återkommer snart.",
      vehicle: "Fordon",
      pickup: "Upphämtning",
      return: "Återlämning",
      pickupLoc: "Upphämtningsplats",
      returnLoc: "Återlämningsplats",
      childSeat: "Barnstol: ja",
      party: "Personer",
      estimate: "Uppskattad totalsumma",
      vehicleFallback: "vi föreslår ett",
    },
    nl: {
      subject: "We hebben je aanvraag ontvangen: Artemis Rental",
      hello: `Hoi ${data.name},`,
      thanks: "Bedankt voor je verhuuraanvraag. We nemen spoedig contact op.",
      vehicle: "Voertuig",
      pickup: "Ophalen",
      return: "Terugbrengen",
      pickupLoc: "Ophaallocatie",
      returnLoc: "Terugbrenglocatie",
      childSeat: "Kinderzitje: ja",
      party: "Personen",
      estimate: "Geschat totaal",
      vehicleFallback: "wij stellen er een voor",
    },
  };

  const t = templates[locale];
  const lines = [
    t.hello,
    "",
    t.thanks,
    "",
    `${t.vehicle}: ${data.vehicle || t.vehicleFallback}`,
    `${t.pickup}: ${data.pickup}`,
    `${t.return}: ${data.returnDate}`,
    `${t.pickupLoc}: ${pickupLabel}`,
    `${t.returnLoc}: ${returnLabel}`,
    data.childSeat ? t.childSeat : null,
    data.partySize ? `${t.party}: ${data.partySize}` : null,
    data.estimatedTotal != null ? `${t.estimate}: ~€${data.estimatedTotal}` : null,
    "",
    "Artemis Rental",
    business.phones[0].display,
  ];

  return {
    subject: t.subject,
    text: lines.filter(Boolean).join("\n"),
  };
}

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid form" }, { status: 400 });
  }

  const data = parsed.data;
  const locale = asLocale(data.locale);
  const summary = [
    `New Artemis booking enquiry`,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Vehicle: ${data.vehicle || "any"}`,
    `Pickup date: ${data.pickup}`,
    `Return date: ${data.returnDate}`,
    `Pickup location: ${data.pickupLocation ?? "apollonia"}`,
    `Return location: ${data.returnLocation ?? data.pickupLocation ?? "apollonia"}`,
    `Child seat: ${data.childSeat ? "yes" : "no"}`,
    `Party size: ${data.partySize ?? "-"}`,
    `Arrival info: ${data.arrivalInfo || "-"}`,
    `Estimated total: ${data.estimatedTotal != null ? `€${data.estimatedTotal}` : "-"}`,
    `Locale: ${locale}`,
    `Message: ${data.message || "-"}`,
  ].join("\n");

  if (!process.env.RESEND_API_KEY) {
    console.info("[book-enquiry]", summary);
    return Response.json({
      ok: true,
      mode: "log",
      message: "Enquiry logged (RESEND_API_KEY not set)",
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.BOOKING_FROM_EMAIL ?? "Artemis Rental <onboarding@resend.dev>";

  await resend.emails.send({
    from,
    to: business.email,
    replyTo: data.email,
    subject: `Booking enquiry: ${data.name} (${data.pickup})`,
    text: summary,
  });

  const confirmation = confirmationEmail(data, locale);

  await resend.emails.send({
    from,
    to: data.email,
    subject: confirmation.subject,
    text: confirmation.text,
  });

  return Response.json({ ok: true });
}
