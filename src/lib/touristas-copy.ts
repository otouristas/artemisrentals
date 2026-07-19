import type { Locale } from "@/i18n/routing";
import { business } from "./site";

/** Minimal draft shape for summary strings (avoids circular import with touristas-local). */
type DraftSummary = {
  vehicleName?: string;
  category?: string;
  from?: string;
  to?: string;
  partySize?: number;
  pickupLocation?: string;
  name?: string;
  email?: string;
  phone?: string;
};

export type TouristasCopy = {
  askVehicle: string;
  askCategoryAfterPeople: (n: number) => string;
  askPeopleAfterCategory: string;
  askDates: string;
  askReturn: string;
  askPeople: string;
  askName: string;
  askNameForTrip: (d: DraftSummary) => string;
  askEmail: string;
  askPhone: string;
  ready: string;
  sent: string;
  recommendFamily: string;
  recommendScooter: string;
  recommendCars: string;
  recommendForTrip: (d: DraftSummary) => string;
  rates: string;
  pickup: string;
  deposit: string;
  fallback: string;
  matchedFaq: string;
  guideIntro: string;
  namedVehicle: (name: string) => string;
  summary: (d: DraftSummary) => string;
  followBook: string;
  followDates: string;
  followContinue: string;
  followCar: string;
  followScooter: string;
  followPeople2: string;
  followPeople4: string;
  followSend: string;
  followForm: string;
  followWhatsApp: string;
  followBeaches: string;
  followPickup: string;
  followGuide: string;
  peopleLabel: (n: number) => string;
};

type SummaryLabels = {
  title: string;
  vehicle: string;
  type: string;
  dates: string;
  people: string;
  pickup: string;
  name: string;
  email: string;
  phone: string;
};

function formatDay(iso?: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function tripBits(d: DraftSummary): { when: string; who: string; what: string } {
  const when =
    d.from && d.to ? `${formatDay(d.from)} to ${formatDay(d.to)}` : d.from ? formatDay(d.from) : "";
  const who = d.partySize ? `${d.partySize}` : "";
  const what = d.vehicleName
    ? d.vehicleName
    : d.category === "scooter"
      ? "scooter"
      : d.category === "car"
        ? "car"
        : "vehicle";
  return { when, who, what };
}

function buildSummary(labels: SummaryLabels, d: DraftSummary): string {
  return [
    labels.title,
    d.vehicleName
      ? `${labels.vehicle}: ${d.vehicleName}`
      : d.category
        ? `${labels.type}: ${d.category}`
        : null,
    d.from && d.to ? `${labels.dates}: ${d.from} → ${d.to}` : null,
    d.partySize ? `${labels.people}: ${d.partySize}` : null,
    d.pickupLocation ? `${labels.pickup}: ${d.pickupLocation}` : null,
    d.name ? `${labels.name}: ${d.name}` : null,
    d.email ? `${labels.email}: ${d.email}` : null,
    d.phone ? `${labels.phone}: ${d.phone}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

const phone = business.phones[0].display;

const en: TouristasCopy = {
  askVehicle: "Car or scooter, which suits your trip better?",
  askCategoryAfterPeople: (n: number) =>
    `Got it, ${n} people. Would you like a car or a scooter?`,
  askPeopleAfterCategory: "A car works well. How many people will you be?",
  askDates:
    "When do you need it? Share pick-up and return dates, e.g. 19-23 July or 2026-07-19 to 2026-07-23.",
  askReturn: "Pick-up date saved. What is the return date?",
  askPeople: "How many people will you be?",
  askName: "Happy to send this to Artemis. What is your name?",
  askNameForTrip: (d) => {
    const { when, what } = tripBits(d);
    const lead = when
      ? `Nice, ${what} for ${when} is noted.`
      : `Nice, a ${what} enquiry is noted.`;
    return `${lead} Happy to send this to Artemis. What is your name?`;
  },
  askEmail: "Thanks. Which email should Artemis use to confirm?",
  askPhone: "Last step: a mobile or WhatsApp number so they can reach you.",
  ready:
    "Your enquiry is ready. Check the summary, then tap “Send my enquiry”, open the booking form, or continue on WhatsApp.",
  sent: "Enquiry sent to Artemis. They will reply shortly with availability.",
  recommendFamily:
    "For a family, these cars from our Apollonia fleet fit best. Tap one to book, or say you want to reserve.",
  recommendScooter:
    "These scooters are from our Apollonia fleet. Tap one, or continue if you want Artemis to confirm availability.",
  recommendCars:
    "Here are solid options from our fleet. Tap one to book, or say when you want to reserve.",
  recommendForTrip: (d) => {
    const { when, who, what } = tripBits(d);
    if (d.category === "scooter" || what === "scooter") {
      return when
        ? `For ${when}, these scooters from our Apollonia fleet fit ${who || "2"} people. Tap one, or continue and I will take your details.`
        : `These scooters from our Apollonia fleet fit ${who || "2"} people. Tap one, or continue and I will take your details.`;
    }
    if (d.partySize && d.partySize >= 3) {
      return when
        ? `For ${when}, these cars fit a party of ${who}. Tap one, or continue and I will take your details.`
        : `These cars fit a party of ${who}. Tap one, or continue and I will take your details.`;
    }
    return when
      ? `For ${when}, here are cars from our Apollonia fleet. Tap one, or continue and I will take your details.`
      : `Here are cars from our Apollonia fleet. Tap one, or continue and I will take your details.`;
  },
  rates:
    "Indicative daily car rates below. Scooter prices are quoted on enquiry. Want to lock in dates next?",
  pickup:
    "Car pickup is free in Apollonia, Kamares, heliport, Artemonas and Kastro. Vathi / Platys Gialos / Faros / Chrysopigi on request (fee confirmed at booking). Scooters: Apollonia office only. Shall we start a booking?",
  deposit: `No prepayment is required. We can collect dates and contact details here, or call ${phone}.`,
  fallback:
    "I can help with cars, scooters, rates, booking and Sifnos tips. Tell me what you need, e.g. a scooter for two next week.",
  matchedFaq: "From the Artemis FAQs:",
  guideIntro: "Here are related reads from our Sifnos guide. Want a car or scooter for those days too?",
  namedVehicle: (name: string) =>
    `Yes, we have the ${name}. What pick-up and return dates do you need?`,
  summary: (d) =>
    buildSummary(
      {
        title: "Enquiry summary:",
        vehicle: "Vehicle",
        type: "Type",
        dates: "Dates",
        people: "People",
        pickup: "Pick-up",
        name: "Name",
        email: "Email",
        phone: "Phone",
      },
      d,
    ),
  followBook: "I want to book a vehicle",
  followDates: "Share my dates",
  followContinue: "Continue with enquiry",
  followCar: "I want a car",
  followScooter: "I want a scooter",
  followPeople2: "2 people",
  followPeople4: "4 people",
  followSend: "Send my enquiry",
  followForm: "Open booking form",
  followWhatsApp: "Continue on WhatsApp",
  followBeaches: "Beaches by car",
  followPickup: "Pick up at Kamares",
  followGuide: "Sifnos guide tips",
  peopleLabel: (n: number) => `${n} people`,
};

const el: TouristasCopy = {
  askVehicle: "Αυτοκίνητο ή scooter, τι σας βολεύει καλύτερα;",
  askCategoryAfterPeople: (n: number) =>
    `Ωραία, ${n} άτομα. Θέλετε αυτοκίνητο ή scooter;`,
  askPeopleAfterCategory: "Αυτοκίνητο, τέλεια. Πόσα άτομα θα είστε;",
  askDates:
    "Πότε το χρειάζεστε; Πείτε ημερομηνίες παραλαβής και επιστροφής, π.χ. 19-23 Ιουλίου ή 2026-07-19 έως 2026-07-23.",
  askReturn: "Η ημερομηνία παραλαβής καταχωρήθηκε. Ποια είναι η ημερομηνία επιστροφής;",
  askPeople: "Πόσα άτομα θα είστε;",
  askName: "Με χαρά να το στείλω στην Artemis. Πώς σας λένε;",
  askNameForTrip: (d) => {
    const { when, what } = tripBits(d);
    const label =
      what === "scooter" ? "scooter" : what === "car" ? "αυτοκίνητο" : what;
    const lead = when
      ? `Ωραία, ${label} για ${when} καταχωρήθηκε.`
      : `Ωραία, αίτημα για ${label} καταχωρήθηκε.`;
    return `${lead} Με χαρά να το στείλω στην Artemis. Πώς σας λένε;`;
  },
  askEmail: "Ευχαριστώ. Ποιο email να χρησιμοποιήσει η Artemis για επιβεβαίωση;",
  askPhone: "Τελευταίο βήμα: ένα κινητό ή WhatsApp για να σας βρουν.",
  ready:
    "Το αίτημα είναι έτοιμο. Ελέγξτε τη σύνοψη και πατήστε «Στείλε το αίτημα», ανοίξτε τη φόρμα, ή συνεχίστε στο WhatsApp.",
  sent: "Το αίτημα στάλθηκε στην Artemis. Θα σας απαντήσουν σύντομα για διαθεσιμότητα.",
  recommendFamily:
    "Για οικογένεια, αυτά τα αυτοκίνητα από τον στόλο μας στην Απολλωνία ταιριάζουν καλύτερα. Πατήστε ένα για κράτηση, ή πείτε αν θέλετε να κλείσετε.",
  recommendScooter:
    "Αυτά τα scooter είναι από τον στόλο μας στην Απολλωνία. Πατήστε ένα, ή συνεχίστε για να πάρει η Artemis τα στοιχεία σας.",
  recommendCars:
    "Ορίστε καλές επιλογές από τον στόλο μας. Πατήστε ένα για κράτηση, ή πείτε πότε θέλετε να κλείσετε.",
  recommendForTrip: (d) => {
    const { when, who } = tripBits(d);
    if (d.category === "scooter") {
      return when
        ? `Για ${when}, αυτά τα scooter από τον στόλο μας στην Απολλωνία ταιριάζουν σε ${who || "2"} άτομα. Πατήστε ένα, ή συνεχίστε για τα στοιχεία σας.`
        : `Αυτά τα scooter από τον στόλο μας στην Απολλωνία ταιριάζουν σε ${who || "2"} άτομα. Πατήστε ένα, ή συνεχίστε για τα στοιχεία σας.`;
    }
    if (d.partySize && d.partySize >= 3) {
      return when
        ? `Για ${when}, αυτά τα αυτοκίνητα ταιριάζουν σε ${who} άτομα. Πατήστε ένα, ή συνεχίστε για τα στοιχεία σας.`
        : `Αυτά τα αυτοκίνητα ταιριάζουν σε ${who} άτομα. Πατήστε ένα, ή συνεχίστε για τα στοιχεία σας.`;
    }
    return when
      ? `Για ${when}, ορίστε αυτοκίνητα από τον στόλο μας στην Απολλωνία. Πατήστε ένα, ή συνεχίστε για τα στοιχεία σας.`
      : `Ορίστε αυτοκίνητα από τον στόλο μας στην Απολλωνία. Πατήστε ένα, ή συνεχίστε για τα στοιχεία σας.`;
  },
  rates:
    "Ενδεικτικές ημερήσιες τιμές αυτοκινήτων παρακάτω. Τα scooter τιμολογούνται στο αίτημα. Θέλετε να κλείσουμε ημερομηνίες;",
  pickup:
    "Παραλαβή αυτοκινήτων: δωρεάν σε Απολλωνία, Καμάρες, ελικοδρόμιο, Αρτεμώνα και Κάστρο. Βαθύ / Πλατύς Γιαλός / Φάρος / Χρυσοπηγή κατόπιν αιτήματος (χρέωση επιβεβαιώνεται στην κράτηση). Scooter: μόνο γραφείο Απολλωνίας. Θέλετε να ξεκινήσουμε κράτηση;",
  deposit: `Δεν απαιτείται προκαταβολή. Μπορούμε να μαζέψουμε ημερομηνίες και στοιχεία εδώ, ή καλέστε ${phone}.`,
  fallback:
    "Μπορώ να βοηθήσω με αυτοκίνητα, scooter, τιμές, κράτηση και συμβουλές για τη Σίφνο. Πείτε μου τι χρειάζεστε, π.χ. scooter για δύο την επόμενη εβδομάδα.",
  matchedFaq: "Από τις συχνές ερωτήσεις Artemis:",
  guideIntro: "Βρήκα σχετικά άρθρα από τον οδηγό Σίφνου. Θέλετε και αυτοκίνητο ή scooter για αυτές τις μέρες;",
  namedVehicle: (name: string) =>
    `Ναι, έχουμε ${name}. Ποιες ημερομηνίες παραλαβής και επιστροφής θέλετε;`,
  summary: (d) =>
    buildSummary(
      {
        title: "Σύνοψη αιτήματος:",
        vehicle: "Όχημα",
        type: "Τύπος",
        dates: "Ημερομηνίες",
        people: "Άτομα",
        pickup: "Παραλαβή",
        name: "Όνομα",
        email: "Email",
        phone: "Τηλέφωνο",
      },
      d,
    ),
  followBook: "Θέλω να κλείσω όχημα",
  followDates: "Να δώσω ημερομηνίες",
  followContinue: "Συνέχεια με το αίτημα",
  followCar: "Θέλω αυτοκίνητο",
  followScooter: "Θέλω scooter",
  followPeople2: "2 άτομα",
  followPeople4: "4 άτομα",
  followSend: "Στείλε το αίτημα",
  followForm: "Άνοιξε τη φόρμα κράτησης",
  followWhatsApp: "Συνέχεια στο WhatsApp",
  followBeaches: "Παραλίες με αυτοκίνητο",
  followPickup: "Παραλαβή στις Καμάρες",
  followGuide: "Οδηγός Σίφνου",
  peopleLabel: (n: number) => `${n} άτομα`,
};

const it: TouristasCopy = {
  askVehicle: "Auto o scooter, cosa le serve di più?",
  askCategoryAfterPeople: (n: number) =>
    `Perfetto, ${n} persone. Preferisce un'auto o uno scooter?`,
  askPeopleAfterCategory: "Un'auto va bene. Quante persone sarete?",
  askDates:
    "Quando le serve? Indichi le date di ritiro e riconsegna, ad es. 19-23 luglio o 2026-07-19 a 2026-07-23.",
  askReturn: "Data di ritiro salvata. Qual è la data di riconsegna?",
  askPeople: "Quante persone sarete?",
  askName: "Con piacere invio questa richiesta ad Artemis. Come si chiama?",
  askNameForTrip: (d) => {
    const { when, what } = tripBits(d);
    const label =
      what === "scooter" ? "scooter" : what === "car" ? "auto" : what;
    const lead = when
      ? `Ottimo, ${label} per ${when} è annotato.`
      : `Ottimo, richiesta per ${label} annotata.`;
    return `${lead} Con piacere invio questa richiesta ad Artemis. Come si chiama?`;
  },
  askEmail: "Grazie. Quale email deve usare Artemis per la conferma?",
  askPhone: "Ultimo passo: un cellulare o WhatsApp per contattarla.",
  ready:
    "La richiesta è pronta. Controlli il riepilogo, poi tocchi «Invia la richiesta», apra il modulo o continui su WhatsApp.",
  sent: "Richiesta inviata ad Artemis. Le risponderanno a breve con la disponibilità.",
  recommendFamily:
    "Per una famiglia, queste auto della flotta di Apollonia sono le più adatte. Ne tocchi una per prenotare, o dica se vuole riservare.",
  recommendScooter:
    "Questi scooter fanno parte della nostra flotta ad Apollonia. Ne tocchi uno, o continui per lasciare i suoi dati.",
  recommendCars:
    "Ecco buone opzioni dalla nostra flotta. Ne tocchi una per prenotare, o dica quando vuole riservare.",
  recommendForTrip: (d) => {
    const { when, who } = tripBits(d);
    if (d.category === "scooter") {
      return when
        ? `Per ${when}, questi scooter della flotta di Apollonia vanno bene per ${who || "2"} persone. Ne tocchi uno, o continui con i suoi dati.`
        : `Questi scooter della flotta di Apollonia vanno bene per ${who || "2"} persone. Ne tocchi uno, o continui con i suoi dati.`;
    }
    if (d.partySize && d.partySize >= 3) {
      return when
        ? `Per ${when}, queste auto vanno bene per ${who} persone. Ne tocchi una, o continui con i suoi dati.`
        : `Queste auto vanno bene per ${who} persone. Ne tocchi una, o continui con i suoi dati.`;
    }
    return when
      ? `Per ${when}, ecco auto della flotta di Apollonia. Ne tocchi una, o continui con i suoi dati.`
      : `Ecco auto della flotta di Apollonia. Ne tocchi una, o continui con i suoi dati.`;
  },
  rates:
    "Tariffe giornaliere indicative per le auto qui sotto. I prezzi scooter si comunicano su richiesta. Vuole fissare le date?",
  pickup:
    "Ritiro auto gratuito ad Apollonia, Kamares, eliporto, Artemonas e Kastro. Vathi / Platys Gialos / Faros / Chrysopigi su richiesta (costo confermato in prenotazione). Scooter: solo ufficio Apollonia. Iniziamo una prenotazione?",
  deposit: `Non è richiesto alcun anticipo. Possiamo raccogliere date e contatti qui, oppure chiami ${phone}.`,
  fallback:
    "Posso aiutarla con auto, scooter, tariffe, prenotazione e consigli su Sifnos. Mi dica di cosa ha bisogno, ad es. uno scooter per due la prossima settimana.",
  matchedFaq: "Dalle FAQ di Artemis:",
  guideIntro: "Ecco letture dalla guida di Sifnos. Vuole anche un'auto o uno scooter per quei giorni?",
  namedVehicle: (name: string) =>
    `Sì, abbiamo ${name}. Quali date di ritiro e riconsegna le servono?`,
  summary: (d) =>
    buildSummary(
      {
        title: "Riepilogo richiesta:",
        vehicle: "Veicolo",
        type: "Tipo",
        dates: "Date",
        people: "Persone",
        pickup: "Ritiro",
        name: "Nome",
        email: "Email",
        phone: "Telefono",
      },
      d,
    ),
  followBook: "Voglio prenotare un veicolo",
  followDates: "Condividi le mie date",
  followContinue: "Continua con la richiesta",
  followCar: "Voglio un'auto",
  followScooter: "Voglio uno scooter",
  followPeople2: "2 persone",
  followPeople4: "4 persone",
  followSend: "Invia la richiesta",
  followForm: "Apri il modulo di prenotazione",
  followWhatsApp: "Continua su WhatsApp",
  followBeaches: "Spiagge in auto",
  followPickup: "Ritiro a Kamares",
  followGuide: "Consigli sulla guida di Sifnos",
  peopleLabel: (n: number) => `${n} persone`,
};

const fr: TouristasCopy = {
  askVehicle: "Voiture ou scooter, qu'est-ce qui vous convient le mieux ?",
  askCategoryAfterPeople: (n: number) =>
    `D'accord, ${n} personnes. Souhaitez-vous une voiture ou un scooter ?`,
  askPeopleAfterCategory: "Une voiture, parfait. Combien de personnes serez-vous ?",
  askDates:
    "Quand en avez-vous besoin ? Indiquez les dates de prise en charge et de retour, ex. 19-23 juillet ou 2026-07-19 au 2026-07-23.",
  askReturn: "Date de prise en charge enregistrée. Quelle est la date de retour ?",
  askPeople: "Combien de personnes serez-vous ?",
  askName: "Avec plaisir, j'envoie cela à Artemis. Quel est votre nom ?",
  askNameForTrip: (d) => {
    const { when, what } = tripBits(d);
    const label =
      what === "scooter" ? "scooter" : what === "car" ? "voiture" : what;
    const lead = when
      ? `Parfait, ${label} pour ${when} est noté.`
      : `Parfait, demande pour ${label} notée.`;
    return `${lead} Avec plaisir, j'envoie cela à Artemis. Quel est votre nom ?`;
  },
  askEmail: "Merci. Quelle adresse e-mail Artemis doit utiliser pour confirmer ?",
  askPhone: "Dernière étape : un mobile ou WhatsApp pour vous joindre.",
  ready:
    "Votre demande est prête. Vérifiez le résumé, puis appuyez sur « Envoyer ma demande », ouvrez le formulaire, ou continuez sur WhatsApp.",
  sent: "Demande envoyée à Artemis. Ils vous répondront bientôt avec les disponibilités.",
  recommendFamily:
    "Pour une famille, ces voitures de notre flotte à Apollonia conviennent le mieux. Appuyez sur une pour réserver, ou dites si vous voulez réserver.",
  recommendScooter:
    "Ces scooters font partie de notre flotte à Apollonia. Appuyez sur un, ou continuez pour laisser vos coordonnées.",
  recommendCars:
    "Voici de bonnes options de notre flotte. Appuyez sur une pour réserver, ou dites quand vous voulez réserver.",
  recommendForTrip: (d) => {
    const { when, who } = tripBits(d);
    if (d.category === "scooter") {
      return when
        ? `Pour ${when}, ces scooters de notre flotte à Apollonia conviennent à ${who || "2"} personnes. Appuyez sur un, ou continuez pour vos coordonnées.`
        : `Ces scooters de notre flotte à Apollonia conviennent à ${who || "2"} personnes. Appuyez sur un, ou continuez pour vos coordonnées.`;
    }
    if (d.partySize && d.partySize >= 3) {
      return when
        ? `Pour ${when}, ces voitures conviennent à ${who} personnes. Appuyez sur une, ou continuez pour vos coordonnées.`
        : `Ces voitures conviennent à ${who} personnes. Appuyez sur une, ou continuez pour vos coordonnées.`;
    }
    return when
      ? `Pour ${when}, voici des voitures de notre flotte à Apollonia. Appuyez sur une, ou continuez pour vos coordonnées.`
      : `Voici des voitures de notre flotte à Apollonia. Appuyez sur une, ou continuez pour vos coordonnées.`;
  },
  rates:
    "Tarifs journaliers indicatifs pour les voitures ci-dessous. Les prix scooters sont communiqués sur demande. Souhaitez-vous fixer les dates ?",
  pickup:
    "Prise en charge voiture gratuite à Apollonia, Kamares, héliport, Artemonas et Kastro. Vathi / Platys Gialos / Faros / Chrysopigi sur demande (frais confirmés à la réservation). Scooters : bureau Apollonia uniquement. On commence une réservation ?",
  deposit: `Aucun acompte n'est requis. Nous pouvons recueillir dates et coordonnées ici, ou appelez ${phone}.`,
  fallback:
    "Je peux vous aider avec voitures, scooters, tarifs, réservation et conseils sur Sifnos. Dites-moi ce dont vous avez besoin, ex. un scooter pour deux la semaine prochaine.",
  matchedFaq: "D'après les FAQ Artemis :",
  guideIntro: "Voici des lectures du guide de Sifnos. Souhaitez-vous aussi une voiture ou un scooter pour ces jours ?",
  namedVehicle: (name: string) =>
    `Oui, nous avons ${name}. Quelles dates de prise en charge et de retour vous faut-il ?`,
  summary: (d) =>
    buildSummary(
      {
        title: "Résumé de la demande :",
        vehicle: "Véhicule",
        type: "Type",
        dates: "Dates",
        people: "Personnes",
        pickup: "Prise en charge",
        name: "Nom",
        email: "E-mail",
        phone: "Téléphone",
      },
      d,
    ),
  followBook: "Je veux réserver un véhicule",
  followDates: "Partager mes dates",
  followContinue: "Continuer la demande",
  followCar: "Je veux une voiture",
  followScooter: "Je veux un scooter",
  followPeople2: "2 personnes",
  followPeople4: "4 personnes",
  followSend: "Envoyer ma demande",
  followForm: "Ouvrir le formulaire de réservation",
  followWhatsApp: "Continuer sur WhatsApp",
  followBeaches: "Plages en voiture",
  followPickup: "Prise en charge à Kamares",
  followGuide: "Conseils du guide de Sifnos",
  peopleLabel: (n: number) => `${n} personnes`,
};

const de: TouristasCopy = {
  askVehicle: "Auto oder Scooter, was passt besser zu Ihrer Reise?",
  askCategoryAfterPeople: (n: number) =>
    `Alles klar, ${n} Personen. Möchten Sie ein Auto oder einen Scooter?`,
  askPeopleAfterCategory: "Ein Auto, super. Wie viele Personen werden Sie sein?",
  askDates:
    "Wann brauchen Sie es? Nennen Sie Abhol- und Rückgabedatum, z. B. 19-23 Juli oder 2026-07-19 bis 2026-07-23.",
  askReturn: "Abholdatum gespeichert. Wie lautet das Rückgabedatum?",
  askPeople: "Wie viele Personen werden Sie sein?",
  askName: "Gerne sende ich das an Artemis. Wie heißen Sie?",
  askNameForTrip: (d) => {
    const { when, what } = tripBits(d);
    const label =
      what === "scooter" ? "Scooter" : what === "car" ? "Auto" : what;
    const lead = when
      ? `Schön, ${label} für ${when} ist notiert.`
      : `Schön, Anfrage für ${label} ist notiert.`;
    return `${lead} Gerne sende ich das an Artemis. Wie heißen Sie?`;
  },
  askEmail: "Danke. Welche E-Mail soll Artemis zur Bestätigung nutzen?",
  askPhone: "Letzter Schritt: eine Mobil- oder WhatsApp-Nummer, damit sie Sie erreichen.",
  ready:
    "Ihre Anfrage ist bereit. Prüfen Sie die Zusammenfassung und tippen Sie dann auf „Anfrage senden“, öffnen Sie das Formular oder fahren Sie auf WhatsApp fort.",
  sent: "Anfrage an Artemis gesendet. Sie melden sich in Kürze mit der Verfügbarkeit.",
  recommendFamily:
    "Für eine Familie passen diese Autos aus unserer Flotte in Apollonia am besten. Tippen Sie eines an, oder sagen Sie, ob Sie reservieren möchten.",
  recommendScooter:
    "Diese Scooter stammen aus unserer Flotte in Apollonia. Tippen Sie einen an, oder fahren Sie fort, um Ihre Daten zu hinterlassen.",
  recommendCars:
    "Hier sind gute Optionen aus unserer Flotte. Tippen Sie eines an, oder sagen Sie, wann Sie reservieren möchten.",
  recommendForTrip: (d) => {
    const { when, who } = tripBits(d);
    if (d.category === "scooter") {
      return when
        ? `Für ${when} passen diese Scooter aus unserer Flotte in Apollonia für ${who || "2"} Personen. Tippen Sie einen an, oder fahren Sie mit Ihren Daten fort.`
        : `Diese Scooter aus unserer Flotte in Apollonia passen für ${who || "2"} Personen. Tippen Sie einen an, oder fahren Sie mit Ihren Daten fort.`;
    }
    if (d.partySize && d.partySize >= 3) {
      return when
        ? `Für ${when} passen diese Autos für ${who} Personen. Tippen Sie eines an, oder fahren Sie mit Ihren Daten fort.`
        : `Diese Autos passen für ${who} Personen. Tippen Sie eines an, oder fahren Sie mit Ihren Daten fort.`;
    }
    return when
      ? `Für ${when} hier Autos aus unserer Flotte in Apollonia. Tippen Sie eines an, oder fahren Sie mit Ihren Daten fort.`
      : `Hier Autos aus unserer Flotte in Apollonia. Tippen Sie eines an, oder fahren Sie mit Ihren Daten fort.`;
  },
  rates:
    "Richtwerte für Tagespreise von Autos unten. Scooter-Preise werden auf Anfrage genannt. Möchten Sie als Nächstes Daten festlegen?",
  pickup:
    "Auto-Abholung ist kostenlos in Apollonia, Kamares, Heliport, Artemonas und Kastro. Vathi / Platys Gialos / Faros / Chrysopigi auf Anfrage (Gebühr bei Buchung bestätigt). Scooter: nur Büro Apollonia. Sollen wir mit einer Buchung starten?",
  deposit: `Keine Vorauszahlung erforderlich. Wir können Daten und Kontaktdaten hier erfassen, oder rufen Sie ${phone} an.`,
  fallback:
    "Ich kann bei Autos, Scootern, Preisen, Buchung und Sifnos-Tipps helfen. Sagen Sie mir, was Sie brauchen, z. B. einen Scooter für zwei nächste Woche.",
  matchedFaq: "Aus den Artemis-FAQs:",
  guideIntro: "Hier sind passende Artikel aus dem Sifnos-Guide. Möchten Sie auch ein Auto oder einen Scooter für diese Tage?",
  namedVehicle: (name: string) =>
    `Ja, wir haben ${name}. Welche Abhol- und Rückgabedaten brauchen Sie?`,
  summary: (d) =>
    buildSummary(
      {
        title: "Anfrageübersicht:",
        vehicle: "Fahrzeug",
        type: "Typ",
        dates: "Daten",
        people: "Personen",
        pickup: "Abholung",
        name: "Name",
        email: "E-Mail",
        phone: "Telefon",
      },
      d,
    ),
  followBook: "Ich möchte ein Fahrzeug buchen",
  followDates: "Meine Daten teilen",
  followContinue: "Anfrage fortsetzen",
  followCar: "Ich möchte ein Auto",
  followScooter: "Ich möchte einen Scooter",
  followPeople2: "2 Personen",
  followPeople4: "4 Personen",
  followSend: "Anfrage senden",
  followForm: "Buchungsformular öffnen",
  followWhatsApp: "Auf WhatsApp fortfahren",
  followBeaches: "Strände mit dem Auto",
  followPickup: "Abholung in Kamares",
  followGuide: "Tipps vom Sifnos-Guide",
  peopleLabel: (n: number) => `${n} Personen`,
};

const sv: TouristasCopy = {
  askVehicle: "Bil eller scooter, vad passar din resa bäst?",
  askCategoryAfterPeople: (n: number) =>
    `Okej, ${n} personer. Vill du ha en bil eller en scooter?`,
  askPeopleAfterCategory: "En bil, bra. Hur många personer blir ni?",
  askDates:
    "När behöver du den? Ange upphämtnings- och återlämningsdatum, t.ex. 19-23 juli eller 2026-07-19 till 2026-07-23.",
  askReturn: "Upphämtningsdatum sparat. Vad är återlämningsdatumet?",
  askPeople: "Hur många personer blir ni?",
  askName: "Gärna skickar jag detta till Artemis. Vad heter du?",
  askNameForTrip: (d) => {
    const { when, what } = tripBits(d);
    const label =
      what === "scooter" ? "scooter" : what === "car" ? "bil" : what;
    const lead = when
      ? `Fint, ${label} för ${when} är noterad.`
      : `Fint, förfrågan om ${label} är noterad.`;
    return `${lead} Gärna skickar jag detta till Artemis. Vad heter du?`;
  },
  askEmail: "Tack. Vilken e-post ska Artemis använda för bekräftelsen?",
  askPhone: "Sista steget: ett mobil- eller WhatsApp-nummer så de kan nå dig.",
  ready:
    "Din förfrågan är klar. Kontrollera sammanfattningen och tryck sedan på ”Skicka min förfrågan”, öppna formuläret eller fortsätt på WhatsApp.",
  sent: "Förfrågan skickad till Artemis. De svarar snart med tillgänglighet.",
  recommendFamily:
    "För en familj passar dessa bilar från vår flotta i Apollonia bäst. Tryck på en för att boka, eller säg om du vill reservera.",
  recommendScooter:
    "Dessa scootrar är från vår flotta i Apollonia. Tryck på en, eller fortsätt för att lämna dina uppgifter.",
  recommendCars:
    "Här är bra alternativ från vår flotta. Tryck på en för att boka, eller säg när du vill reservera.",
  recommendForTrip: (d) => {
    const { when, who } = tripBits(d);
    if (d.category === "scooter") {
      return when
        ? `För ${when} passar dessa scootrar från vår flotta i Apollonia för ${who || "2"} personer. Tryck på en, eller fortsätt med dina uppgifter.`
        : `Dessa scootrar från vår flotta i Apollonia passar för ${who || "2"} personer. Tryck på en, eller fortsätt med dina uppgifter.`;
    }
    if (d.partySize && d.partySize >= 3) {
      return when
        ? `För ${when} passar dessa bilar för ${who} personer. Tryck på en, eller fortsätt med dina uppgifter.`
        : `Dessa bilar passar för ${who} personer. Tryck på en, eller fortsätt med dina uppgifter.`;
    }
    return when
      ? `För ${when} här är bilar från vår flotta i Apollonia. Tryck på en, eller fortsätt med dina uppgifter.`
      : `Här är bilar från vår flotta i Apollonia. Tryck på en, eller fortsätt med dina uppgifter.`;
  },
  rates:
    "Indikativa dagspriser för bilar nedan. Scooterpriser anges vid förfrågan. Vill du låsa datum härnäst?",
  pickup:
    "Bilhämtning är gratis i Apollonia, Kamares, helikopterplatta, Artemonas och Kastro. Vathi / Platys Gialos / Faros / Chrysopigi på begäran (avgift bekräftas vid bokning). Scootrar: endast kontor Apollonia. Ska vi starta en bokning?",
  deposit: `Ingen förskottsbetalning krävs. Vi kan samla in datum och kontaktuppgifter här, eller ring ${phone}.`,
  fallback:
    "Jag kan hjälpa till med bilar, scootrar, priser, bokning och Sifnos-tips. Säg vad du behöver, t.ex. en scooter för två nästa vecka.",
  matchedFaq: "Från Artemis vanliga frågor:",
  guideIntro: "Här är relaterade artiklar från Sifnos-guiden. Vill du också ha en bil eller scooter de dagarna?",
  namedVehicle: (name: string) =>
    `Ja, vi har ${name}. Vilka upphämtnings- och återlämningsdatum behöver du?`,
  summary: (d) =>
    buildSummary(
      {
        title: "Sammanfattning av förfrågan:",
        vehicle: "Fordon",
        type: "Typ",
        dates: "Datum",
        people: "Personer",
        pickup: "Upphämtning",
        name: "Namn",
        email: "E-post",
        phone: "Telefon",
      },
      d,
    ),
  followBook: "Jag vill boka ett fordon",
  followDates: "Dela mina datum",
  followContinue: "Fortsätt förfrågan",
  followCar: "Jag vill ha en bil",
  followScooter: "Jag vill ha en scooter",
  followPeople2: "2 personer",
  followPeople4: "4 personer",
  followSend: "Skicka min förfrågan",
  followForm: "Öppna bokningsformuläret",
  followWhatsApp: "Fortsätt på WhatsApp",
  followBeaches: "Stränder med bil",
  followPickup: "Hämta i Kamares",
  followGuide: "Tips från Sifnos-guiden",
  peopleLabel: (n: number) => `${n} personer`,
};

const nl: TouristasCopy = {
  askVehicle: "Auto of scooter, wat past beter bij uw reis?",
  askCategoryAfterPeople: (n: number) =>
    `Oké, ${n} personen. Wilt u een auto of een scooter?`,
  askPeopleAfterCategory: "Een auto, prima. Met hoeveel personen bent u?",
  askDates:
    "Wanneer heeft u hem nodig? Geef ophaal- en retourdata, bijv. 19-23 juli of 2026-07-19 tot 2026-07-23.",
  askReturn: "Ophaaldatum opgeslagen. Wat is de retourdatum?",
  askPeople: "Met hoeveel personen bent u?",
  askName: "Graag stuur ik dit naar Artemis. Wat is uw naam?",
  askNameForTrip: (d) => {
    const { when, what } = tripBits(d);
    const label =
      what === "scooter" ? "scooter" : what === "car" ? "auto" : what;
    const lead = when
      ? `Mooi, ${label} voor ${when} is genoteerd.`
      : `Mooi, aanvraag voor ${label} is genoteerd.`;
    return `${lead} Graag stuur ik dit naar Artemis. Wat is uw naam?`;
  },
  askEmail: "Dank u. Welk e-mailadres moet Artemis gebruiken voor de bevestiging?",
  askPhone: "Laatste stap: een mobiel of WhatsApp-nummer zodat ze u kunnen bereiken.",
  ready:
    "Uw aanvraag is klaar. Controleer de samenvatting en tik dan op “Stuur mijn aanvraag”, open het formulier, of ga verder op WhatsApp.",
  sent: "Aanvraag verzonden naar Artemis. Zij antwoorden binnenkort met beschikbaarheid.",
  recommendFamily:
    "Voor een gezin passen deze auto's uit onze vloot in Apollonia het best. Tik er een aan om te boeken, of zeg of u wilt reserveren.",
  recommendScooter:
    "Deze scooters komen uit onze vloot in Apollonia. Tik er een aan, of ga verder om uw gegevens achter te laten.",
  recommendCars:
    "Hier zijn goede opties uit onze vloot. Tik er een aan om te boeken, of zeg wanneer u wilt reserveren.",
  recommendForTrip: (d) => {
    const { when, who } = tripBits(d);
    if (d.category === "scooter") {
      return when
        ? `Voor ${when} passen deze scooters uit onze vloot in Apollonia voor ${who || "2"} personen. Tik er een aan, of ga verder met uw gegevens.`
        : `Deze scooters uit onze vloot in Apollonia passen voor ${who || "2"} personen. Tik er een aan, of ga verder met uw gegevens.`;
    }
    if (d.partySize && d.partySize >= 3) {
      return when
        ? `Voor ${when} passen deze auto's voor ${who} personen. Tik er een aan, of ga verder met uw gegevens.`
        : `Deze auto's passen voor ${who} personen. Tik er een aan, of ga verder met uw gegevens.`;
    }
    return when
      ? `Voor ${when} hier auto's uit onze vloot in Apollonia. Tik er een aan, of ga verder met uw gegevens.`
      : `Hier auto's uit onze vloot in Apollonia. Tik er een aan, of ga verder met uw gegevens.`;
  },
  rates:
    "Indicatieve dagtarieven voor auto's hieronder. Scooterprijzen worden op aanvraag gegeven. Wilt u hierna data vastleggen?",
  pickup:
    "Auto-ophalen is gratis in Apollonia, Kamares, helikopterplatform, Artemonas en Kastro. Vathi / Platys Gialos / Faros / Chrysopigi op aanvraag (kosten bij boeking bevestigd). Scooters: alleen kantoor Apollonia. Zal ik een boeking starten?",
  deposit: `Geen vooruitbetaling vereist. We kunnen hier data en contactgegevens verzamelen, of bel ${phone}.`,
  fallback:
    "Ik kan helpen met auto's, scooters, tarieven, boeken en Sifnos-tips. Vertel me wat u nodig heeft, bijv. een scooter voor twee volgende week.",
  matchedFaq: "Uit de Artemis FAQ:",
  guideIntro: "Hier zijn gerelateerde artikelen uit de Sifnos-gids. Wilt u ook een auto of scooter voor die dagen?",
  namedVehicle: (name: string) =>
    `Ja, we hebben ${name}. Welke ophaal- en retourdata heeft u nodig?`,
  summary: (d) =>
    buildSummary(
      {
        title: "Samenvatting van de aanvraag:",
        vehicle: "Voertuig",
        type: "Type",
        dates: "Data",
        people: "Personen",
        pickup: "Ophalen",
        name: "Naam",
        email: "E-mail",
        phone: "Telefoon",
      },
      d,
    ),
  followBook: "Ik wil een voertuig boeken",
  followDates: "Mijn data delen",
  followContinue: "Doorgaan met aanvraag",
  followCar: "Ik wil een auto",
  followScooter: "Ik wil een scooter",
  followPeople2: "2 personen",
  followPeople4: "4 personen",
  followSend: "Stuur mijn aanvraag",
  followForm: "Open boekingsformulier",
  followWhatsApp: "Doorgaan op WhatsApp",
  followBeaches: "Stranden per auto",
  followPickup: "Ophalen in Kamares",
  followGuide: "Tips van de Sifnos-gids",
  peopleLabel: (n: number) => `${n} personen`,
};

const byLocale: Record<Locale, TouristasCopy> = {
  en,
  el,
  it,
  fr,
  de,
  sv,
  nl,
};

export function touristasCopy(locale: Locale): TouristasCopy {
  return byLocale[locale] ?? en;
}
