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
  askEmail: string;
  askPhone: string;
  ready: string;
  sent: string;
  recommendFamily: string;
  recommendScooter: string;
  recommendCars: string;
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
  askVehicle: "Do you want a car or a scooter?",
  askCategoryAfterPeople: (n: number) =>
    `Got it, ${n} people. Do you want a car or a scooter?`,
  askPeopleAfterCategory: "Great, a car. How many people will you be?",
  askDates:
    "Perfect. What pick-up and return dates work? e.g. 19-23 July or 2026-07-19 to 2026-07-23.",
  askReturn: "I have your pick-up date. What is the return date?",
  askPeople: "How many people will you be?",
  askName: "What is your name?",
  askEmail: "Which email should we use for confirmation?",
  askPhone: "And a mobile or WhatsApp number?",
  ready:
    "Your enquiry is ready. Check the summary, then tap “Send my enquiry”, open the booking form, or continue on WhatsApp.",
  sent: "Enquiry sent to Artemis. They will reply shortly with availability.",
  recommendFamily:
    "For a family, these fit best from the Artemis fleet. Tap Book on a vehicle, or say “I want to book” to continue.",
  recommendScooter:
    "These scooters are from our real Apollonia fleet. Tap Book on one, or say if you want to reserve.",
  recommendCars:
    "Here are options from our fleet. Tap Book on a vehicle, or say “I want to book” when you are ready.",
  rates:
    "Indicative daily car rates. Scooter prices are quoted on enquiry. Want to lock in dates next?",
  pickup:
    "Car pickup is free in Apollonia, Kamares, heliport, Artemonas and Kastro. Vathi / Platys Gialos / Faros on request. Scooters: Apollonia only. Shall we start a booking?",
  deposit: `No prepayment is required. We can collect dates and contact details here, or call ${phone}.`,
  fallback:
    "I can help with fleet, rates, booking and the Sifnos guide. Tell me what you need, e.g. a car 19-23 July.",
  matchedFaq: "From the Artemis FAQs:",
  guideIntro: "Here are related reads. Want a vehicle for those days too?",
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
  followDates: "19-23 July",
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
  askVehicle: "Θέλετε αυτοκίνητο ή scooter;",
  askCategoryAfterPeople: (n: number) =>
    `Ωραία, ${n} άτομα. Θέλετε αυτοκίνητο ή scooter;`,
  askPeopleAfterCategory: "Ωραία, αυτοκίνητο. Πόσα άτομα θα είστε;",
  askDates:
    "Τέλεια. Ποιες ημερομηνίες παραλαβής και επιστροφής θέλετε; π.χ. 19-23 Ιουλίου ή 2026-07-19 έως 2026-07-23.",
  askReturn: "Έχω ημερομηνία παραλαβής. Ποια είναι η ημερομηνία επιστροφής;",
  askPeople: "Πόσα άτομα θα είστε;",
  askName: "Πώς σας λένε;",
  askEmail: "Ποιο email να χρησιμοποιήσουμε για την επιβεβαίωση;",
  askPhone: "Και ένα κινητό ή WhatsApp αριθμό;",
  ready:
    "Έτοιμο το αίτημα. Ελέγξτε τη σύνοψη και πατήστε «Στείλε το αίτημα», ανοίξτε τη φόρμα, ή συνεχίστε στο WhatsApp.",
  sent: "Το αίτημα στάλθηκε στην Artemis. Θα σας απαντήσουν σύντομα για διαθεσιμότητα.",
  recommendFamily:
    "Για οικογένεια, αυτά ταιριάζουν καλύτερα από τον στόλο Artemis. Πατήστε Book σε ένα όχημα, ή πείτε «θέλω να κλείσω» για να συνεχίσουμε.",
  recommendScooter:
    "Αυτά τα scooter είναι από τον πραγματικό μας στόλο στην Απολλωνία. Πατήστε Book ή πείτε αν θέλετε να κλείσετε.",
  recommendCars:
    "Ορίστε επιλογές από τον στόλο μας. Πατήστε Book σε ένα όχημα, ή πείτε «θέλω να κλείσω» όταν είστε έτοιμοι.",
  rates:
    "Ενδεικτικές ημερήσιες τιμές αυτοκινήτων. Τα scooter τιμολογούνται στο αίτημα. Θέλετε να κλείσουμε ημερομηνίες;",
  pickup:
    "Παραλαβή αυτοκινήτων: δωρεάν σε Απολλωνία, Καμάρες, ελικοδρόμιο, Αρτεμώνα και Κάστρο. Βαθύ / Πλατύς Γιαλός / Φάρος κατόπιν αιτήματος. Scooter: μόνο Απολλωνία. Θέλετε να ξεκινήσουμε κράτηση;",
  deposit: `Δεν απαιτείται προκαταβολή. Μπορούμε να μαζέψουμε ημερομηνίες και στοιχεία εδώ, ή καλέστε ${phone}.`,
  fallback:
    "Μπορώ να βοηθήσω με στόλο, τιμές, κράτηση και οδηγό Σίφνου. Πείτε μου τι χρειάζεστε, π.χ. αυτοκίνητο 19-23 Ιουλίου.",
  matchedFaq: "Από τις συχνές ερωτήσεις Artemis:",
  guideIntro: "Βρήκα σχετικά άρθρα. Θέλετε και όχημα για αυτές τις μέρες;",
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
  followDates: "19-23 Ιουλίου",
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
  askVehicle: "Vuole un'auto o uno scooter?",
  askCategoryAfterPeople: (n: number) =>
    `Perfetto, ${n} persone. Vuole un'auto o uno scooter?`,
  askPeopleAfterCategory: "Ottimo, un'auto. Quante persone sarete?",
  askDates:
    "Perfetto. Quali date di ritiro e riconsegna le vanno bene? ad es. 19-23 luglio o 2026-07-19 a 2026-07-23.",
  askReturn: "Ho la data di ritiro. Qual è la data di riconsegna?",
  askPeople: "Quante persone sarete?",
  askName: "Come si chiama?",
  askEmail: "Quale email dobbiamo usare per la conferma?",
  askPhone: "E un numero di cellulare o WhatsApp?",
  ready:
    "La richiesta è pronta. Controlli il riepilogo, poi tocchi «Invia la richiesta», apra il modulo di prenotazione o continui su WhatsApp.",
  sent: "Richiesta inviata ad Artemis. Le risponderanno a breve con la disponibilità.",
  recommendFamily:
    "Per una famiglia, questi sono i più adatti della flotta Artemis. Tocchi Book su un veicolo, oppure dica «voglio prenotare» per continuare.",
  recommendScooter:
    "Questi scooter fanno parte della nostra flotta reale ad Apollonia. Tocchi Book su uno, oppure dica se vuole prenotare.",
  recommendCars:
    "Ecco le opzioni della nostra flotta. Tocchi Book su un veicolo, oppure dica «voglio prenotare» quando è pronto.",
  rates:
    "Tariffe giornaliere indicative per le auto. I prezzi degli scooter vengono comunicati su richiesta. Vuole fissare le date?",
  pickup:
    "Ritiro auto gratuito ad Apollonia, Kamares, eliporto, Artemonas e Kastro. Vathi / Platys Gialos / Faros su richiesta. Scooter: solo Apollonia. Iniziamo una prenotazione?",
  deposit: `Non è richiesto alcun anticipo. Possiamo raccogliere date e dati di contatto qui, oppure chiami ${phone}.`,
  fallback:
    "Posso aiutarla con flotta, tariffe, prenotazione e la guida di Sifnos. Mi dica di cosa ha bisogno, ad es. un'auto 19-23 luglio.",
  matchedFaq: "Dalle FAQ di Artemis:",
  guideIntro: "Ecco letture correlate. Vuole anche un veicolo per quei giorni?",
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
  followDates: "19-23 luglio",
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
  askVehicle: "Souhaitez-vous une voiture ou un scooter ?",
  askCategoryAfterPeople: (n: number) =>
    `D'accord, ${n} personnes. Souhaitez-vous une voiture ou un scooter ?`,
  askPeopleAfterCategory: "Parfait, une voiture. Combien de personnes serez-vous ?",
  askDates:
    "Parfait. Quelles dates de prise en charge et de retour vous conviennent ? ex. 19-23 juillet ou 2026-07-19 au 2026-07-23.",
  askReturn: "J'ai votre date de prise en charge. Quelle est la date de retour ?",
  askPeople: "Combien de personnes serez-vous ?",
  askName: "Quel est votre nom ?",
  askEmail: "Quelle adresse e-mail devons-nous utiliser pour la confirmation ?",
  askPhone: "Et un numéro de mobile ou WhatsApp ?",
  ready:
    "Votre demande est prête. Vérifiez le résumé, puis appuyez sur « Envoyer ma demande », ouvrez le formulaire de réservation, ou continuez sur WhatsApp.",
  sent: "Demande envoyée à Artemis. Ils vous répondront bientôt avec les disponibilités.",
  recommendFamily:
    "Pour une famille, ces véhicules de la flotte Artemis conviennent le mieux. Appuyez sur Book sur un véhicule, ou dites « je veux réserver » pour continuer.",
  recommendScooter:
    "Ces scooters font partie de notre flotte réelle à Apollonia. Appuyez sur Book, ou dites si vous souhaitez réserver.",
  recommendCars:
    "Voici des options de notre flotte. Appuyez sur Book sur un véhicule, ou dites « je veux réserver » quand vous êtes prêt.",
  rates:
    "Tarifs journaliers indicatifs pour les voitures. Les prix des scooters sont communiqués sur demande. Souhaitez-vous fixer les dates ?",
  pickup:
    "Prise en charge voiture gratuite à Apollonia, Kamares, héliport, Artemonas et Kastro. Vathi / Platys Gialos / Faros sur demande. Scooters : Apollonia uniquement. On commence une réservation ?",
  deposit: `Aucun acompte n'est requis. Nous pouvons recueillir dates et coordonnées ici, ou appelez ${phone}.`,
  fallback:
    "Je peux vous aider avec la flotte, les tarifs, la réservation et le guide de Sifnos. Dites-moi ce dont vous avez besoin, ex. une voiture 19-23 juillet.",
  matchedFaq: "D'après les FAQ Artemis :",
  guideIntro: "Voici des lectures associées. Souhaitez-vous aussi un véhicule pour ces jours ?",
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
  followDates: "19-23 juillet",
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
  askVehicle: "Möchten Sie ein Auto oder einen Scooter?",
  askCategoryAfterPeople: (n: number) =>
    `Alles klar, ${n} Personen. Möchten Sie ein Auto oder einen Scooter?`,
  askPeopleAfterCategory: "Super, ein Auto. Wie viele Personen werden Sie sein?",
  askDates:
    "Perfekt. Welche Abhol- und Rückgabedaten passen? z. B. 19-23 Juli oder 2026-07-19 bis 2026-07-23.",
  askReturn: "Ich habe Ihr Abholdatum. Wie lautet das Rückgabedatum?",
  askPeople: "Wie viele Personen werden Sie sein?",
  askName: "Wie heißen Sie?",
  askEmail: "Welche E-Mail sollen wir für die Bestätigung nutzen?",
  askPhone: "Und eine Mobil- oder WhatsApp-Nummer?",
  ready:
    "Ihre Anfrage ist bereit. Prüfen Sie die Zusammenfassung und tippen Sie dann auf „Anfrage senden“, öffnen Sie das Buchungsformular oder fahren Sie auf WhatsApp fort.",
  sent: "Anfrage an Artemis gesendet. Sie melden sich in Kürze mit der Verfügbarkeit.",
  recommendFamily:
    "Für eine Familie passen diese Fahrzeuge aus der Artemis-Flotte am besten. Tippen Sie auf Book bei einem Fahrzeug, oder sagen Sie „ich möchte buchen“, um fortzufahren.",
  recommendScooter:
    "Diese Scooter stammen aus unserer echten Flotte in Apollonia. Tippen Sie auf Book, oder sagen Sie, ob Sie reservieren möchten.",
  recommendCars:
    "Hier sind Optionen aus unserer Flotte. Tippen Sie auf Book bei einem Fahrzeug, oder sagen Sie „ich möchte buchen“, wenn Sie bereit sind.",
  rates:
    "Richtwerte für Tagespreise von Autos. Scooter-Preise werden auf Anfrage genannt. Möchten Sie als Nächstes Daten festlegen?",
  pickup:
    "Auto-Abholung ist kostenlos in Apollonia, Kamares, Heliport, Artemonas und Kastro. Vathi / Platys Gialos / Faros auf Anfrage. Scooter: nur Apollonia. Sollen wir mit einer Buchung starten?",
  deposit: `Keine Vorauszahlung erforderlich. Wir können Daten und Kontaktdaten hier erfassen, oder rufen Sie ${phone} an.`,
  fallback:
    "Ich kann bei Flotte, Preisen, Buchung und dem Sifnos-Guide helfen. Sagen Sie mir, was Sie brauchen, z. B. ein Auto 19-23 Juli.",
  matchedFaq: "Aus den Artemis-FAQs:",
  guideIntro: "Hier sind passende Artikel. Möchten Sie auch ein Fahrzeug für diese Tage?",
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
  followDates: "19-23 Juli",
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
  askVehicle: "Vill du ha en bil eller en scooter?",
  askCategoryAfterPeople: (n: number) =>
    `Okej, ${n} personer. Vill du ha en bil eller en scooter?`,
  askPeopleAfterCategory: "Bra, en bil. Hur många personer blir ni?",
  askDates:
    "Perfekt. Vilka upphämtnings- och återlämningsdatum passar? t.ex. 19-23 juli eller 2026-07-19 till 2026-07-23.",
  askReturn: "Jag har ditt upphämtningsdatum. Vad är återlämningsdatumet?",
  askPeople: "Hur många personer blir ni?",
  askName: "Vad heter du?",
  askEmail: "Vilken e-post ska vi använda för bekräftelsen?",
  askPhone: "Och ett mobil- eller WhatsApp-nummer?",
  ready:
    "Din förfrågan är klar. Kontrollera sammanfattningen och tryck sedan på ”Skicka min förfrågan”, öppna bokningsformuläret eller fortsätt på WhatsApp.",
  sent: "Förfrågan skickad till Artemis. De svarar snart med tillgänglighet.",
  recommendFamily:
    "För en familj passar dessa bäst från Artemis flotta. Tryck Book på ett fordon, eller säg ”jag vill boka” för att fortsätta.",
  recommendScooter:
    "Dessa scootrar är från vår riktiga flotta i Apollonia. Tryck Book på en, eller säg om du vill reservera.",
  recommendCars:
    "Här är alternativ från vår flotta. Tryck Book på ett fordon, eller säg ”jag vill boka” när du är redo.",
  rates:
    "Indikativa dagspriser för bilar. Scooterpriser anges vid förfrågan. Vill du låsa datum härnäst?",
  pickup:
    "Bilhämtning är gratis i Apollonia, Kamares, helikopterplatta, Artemonas och Kastro. Vathi / Platys Gialos / Faros på begäran. Scootrar: endast Apollonia. Ska vi starta en bokning?",
  deposit: `Ingen förskottsbetalning krävs. Vi kan samla in datum och kontaktuppgifter här, eller ring ${phone}.`,
  fallback:
    "Jag kan hjälpa till med flotta, priser, bokning och Sifnos-guiden. Säg vad du behöver, t.ex. en bil 19-23 juli.",
  matchedFaq: "Från Artemis vanliga frågor:",
  guideIntro: "Här är relaterade artiklar. Vill du också ha ett fordon de dagarna?",
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
  followDates: "19-23 juli",
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
  askVehicle: "Wilt u een auto of een scooter?",
  askCategoryAfterPeople: (n: number) =>
    `Oké, ${n} personen. Wilt u een auto of een scooter?`,
  askPeopleAfterCategory: "Prima, een auto. Met hoeveel personen bent u?",
  askDates:
    "Perfect. Welke ophaal- en retourdata passen? bijv. 19-23 juli of 2026-07-19 tot 2026-07-23.",
  askReturn: "Ik heb uw ophaaldatum. Wat is de retourdatum?",
  askPeople: "Met hoeveel personen bent u?",
  askName: "Wat is uw naam?",
  askEmail: "Welk e-mailadres moeten we gebruiken voor de bevestiging?",
  askPhone: "En een mobiel of WhatsApp-nummer?",
  ready:
    "Uw aanvraag is klaar. Controleer de samenvatting en tik dan op “Stuur mijn aanvraag”, open het boekingsformulier, of ga verder op WhatsApp.",
  sent: "Aanvraag verzonden naar Artemis. Zij antwoorden binnenkort met beschikbaarheid.",
  recommendFamily:
    "Voor een gezin passen deze het best uit de Artemis-vloot. Tik op Book bij een voertuig, of zeg “ik wil boeken” om verder te gaan.",
  recommendScooter:
    "Deze scooters komen uit onze echte vloot in Apollonia. Tik op Book, of zeg of u wilt reserveren.",
  recommendCars:
    "Hier zijn opties uit onze vloot. Tik op Book bij een voertuig, of zeg “ik wil boeken” wanneer u klaar bent.",
  rates:
    "Indicatieve dagtarieven voor auto's. Scooterprijzen worden op aanvraag gegeven. Wilt u hierna data vastleggen?",
  pickup:
    "Auto-ophalen is gratis in Apollonia, Kamares, helikopterplatform, Artemonas en Kastro. Vathi / Platys Gialos / Faros op verzoek. Scooters: alleen Apollonia. Zal ik een boeking starten?",
  deposit: `Geen vooruitbetaling vereist. We kunnen hier data en contactgegevens verzamelen, of bel ${phone}.`,
  fallback:
    "Ik kan helpen met vloot, tarieven, boeken en de Sifnos-gids. Vertel me wat u nodig heeft, bijv. een auto 19-23 juli.",
  matchedFaq: "Uit de Artemis FAQ:",
  guideIntro: "Hier zijn gerelateerde artikelen. Wilt u ook een voertuig voor die dagen?",
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
  followDates: "19-23 juli",
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
