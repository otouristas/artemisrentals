import faqsData from "../../content/data/faqs.json";
import { getAllVehicles, getLowestRate, getRatesMeta, seasonForDate } from "./fleet";
import { ALL_CAR_PICKUPS, type PickupLocation } from "./pickup";
import { toolHelpers, type ChatVehicleCard } from "./ai-context";
import { asLocale } from "@/lib/i18n-locale";
import type { Locale } from "@/i18n/routing";
import { touristasCopy } from "./touristas-copy";

export type ChatDraft = {
  bookingActive?: boolean;
  vehicleSlug?: string;
  vehicleName?: string;
  category?: "car" | "scooter";
  from?: string;
  to?: string;
  partySize?: number;
  transmission?: "manual" | "automatic";
  pickupLocation?: PickupLocation;
  name?: string;
  email?: string;
  phone?: string;
};

export type LocalChatCard =
  | { kind: "recommend"; vehicles: ChatVehicleCard[]; from?: string | null; to?: string | null }
  | { kind: "rate"; dailyEur: number | null; season?: string }
  | { kind: "guide"; results: { slug: string; title: string; path: string }[] }
  | { kind: "prefill"; url: string; whatsappUrl: string; vehicle?: ChatVehicleCard | null };

export type BookingSubmitPayload = {
  name: string;
  email: string;
  phone: string;
  vehicle?: string;
  pickup: string;
  returnDate: string;
  pickupLocation?: PickupLocation;
  partySize?: number;
  locale: Locale;
  message?: string;
};

export type ChatFollowUp =
  | { type: "message"; label: string }
  | { type: "book"; label: string }
  | { type: "whatsapp"; label: string };

export type LocalChatReply = {
  text: string;
  cards: LocalChatCard[];
  draft: ChatDraft;
  followUps: ChatFollowUp[];
  submitEnquiry?: BookingSubmitPayload;
};

function msg(label: string): ChatFollowUp {
  return { type: "message", label };
}

function stripEmDashes(text: string) {
  return text.replace(/\u2014|\u2013/g, ",");
}

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

function parsePartySize(text: string): number | undefined {
  const n = normalize(text);
  const digit = n.match(
    /(?:family of|party of|for|για)\s*(\d)|(\d)\s*(?:people|persons|adults|seats|ατομα|ατόμων|άτομα)/i,
  );
  if (digit) {
    const value = Number(digit[1] || digit[2]);
    if (value >= 1 && value <= 9) return value;
  }
  if (/^\s*[1-9]\s*$/.test(text.trim())) {
    return Number(text.trim());
  }
  if (/\b(family|οικογεν)/i.test(n)) return 4;
  if (/\b(couple|ζευγαρ|two of us|δυο μας|δύο μας)\b/i.test(n)) return 2;
  if (/\b(solo|alone|μονο[ςσ]?)\b/i.test(n)) return 1;
  return undefined;
}

function parseTransmission(text: string): "manual" | "automatic" | undefined {
  const n = normalize(text);
  if (/automatic|αυτοματο/.test(n)) return "automatic";
  if (/manual|χειροκινητο/.test(n)) return "manual";
  return undefined;
}

function parseCategory(text: string): "car" | "scooter" | undefined {
  const n = normalize(text).trim();
  // Explicit choice only. Do not treat "which car fits a family" as selecting a car.
  if (
    /^(i want a )?scooters?$/.test(n) ||
    /^scooter$/.test(n) ||
    /want a scooter|θελω scooter|θέλω scooter/.test(n)
  ) {
    return "scooter";
  }
  if (
    /^(i want a )?cars?$/.test(n) ||
    /^car$/.test(n) ||
    /want a car|θελω αυτοκιν|θέλω αυτοκιν/.test(n)
  ) {
    return "car";
  }
  if (/scooter|μηχαν|moto|vespa/.test(n) && /want|θελω|θέλω|book|κλεισ|ενοικ/.test(n)) {
    return "scooter";
  }
  if (/\bcar\b|αυτοκινητ/.test(n) && /want|θελω|θέλω|book|κλεισ|ενοικ/.test(n)) {
    return "car";
  }
  return undefined;
}

function parseEmail(text: string): string | undefined {
  const m = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  return m?.[0];
}

function parsePhone(text: string): string | undefined {
  const m = text.match(
    /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}\b/,
  );
  if (!m) return undefined;
  const digits = m[0].replace(/\D/g, "");
  if (digits.length < 8) return undefined;
  return m[0].trim();
}

function parseName(text: string): string | undefined {
  const named = text.match(
    /(?:(?:my name is|i'm|i am|this is|ονομαζομαι|με λενε|ειμαι)\s+)([A-Za-zΑ-Ωα-ωίϊΐόάέήύϋΰώς][A-Za-zΑ-Ωα-ωίϊΐόάέήύϋΰώς\s'-]{1,40})/i,
  );
  if (named?.[1]) {
    const value = named[1].replace(/[.!,].*$/, "").trim();
    if (value.split(/\s+/).length <= 4) return value;
  }
  // Bare full name reply while we are waiting for name (2–3 words, letters only)
  const bare = text.trim();
  if (
    /^[A-Za-zΑ-Ωα-ωίϊΐόάέήύϋΰώς][A-Za-zΑ-Ωα-ωίϊΐόάέήύϋΰώς' -]{1,40}$/.test(bare) &&
    bare.split(/\s+/).length >= 2 &&
    bare.split(/\s+/).length <= 3 &&
    !/@/.test(bare) &&
    !/\d/.test(bare)
  ) {
    return bare;
  }
  return undefined;
}

function parsePickupLocation(text: string): PickupLocation | undefined {
  const n = normalize(text);
  const map: Array<[RegExp, PickupLocation]> = [
    [/kamares|καμαρ/, "kamares"],
    [/heliport|ελικοδρομ/, "heliport"],
    [/artemon|αρτεμων/, "artemonas"],
    [/kastro|καστρ/, "kastro"],
    [/vathi|βαθ/, "vathi"],
    [/platys|platy|πλατυ/, "platys-gialos"],
    [/faros|φαρ/, "faros"],
    [/apollonia|απολλων/, "apollonia"],
  ];
  for (const [re, loc] of map) {
    if (re.test(n) && (ALL_CAR_PICKUPS as readonly string[]).includes(loc)) return loc;
  }
  return undefined;
}

function parseDates(text: string): { from?: string; to?: string } {
  const iso = [...text.matchAll(/\b(20\d{2}-\d{2}-\d{2})\b/g)].map((m) => m[1]);
  if (iso.length >= 2) return { from: iso[0], to: iso[1] };
  if (iso.length === 1) return { from: iso[0] };

  const months: Record<string, number> = {
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    sept: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12,
    ιαν: 1,
    φεβ: 2,
    μαρ: 3,
    απρ: 4,
    μαϊ: 5,
    μαι: 5,
    ιουν: 6,
    ιουλ: 7,
    αυγ: 8,
    σεπ: 9,
    οκτ: 10,
    νοε: 11,
    δεκ: 12,
  };

  const range = text.match(
    /\b(\d{1,2})\s*[-–, /]\s*(\d{1,2})\s+([A-Za-zΑ-Ωα-ωίϊΐόάέήύϋΰώς]+)\b/i,
  );
  if (range) {
    const monthKey = normalize(range[3]).slice(0, 3);
    const month =
      months[normalize(range[3])] ??
      months[monthKey] ??
      Object.entries(months).find(([k]) => normalize(range[3]).startsWith(k))?.[1];
    if (month) {
      const year = new Date().getFullYear();
      const from = `${year}-${String(month).padStart(2, "0")}-${String(Number(range[1])).padStart(2, "0")}`;
      const to = `${year}-${String(month).padStart(2, "0")}-${String(Number(range[2])).padStart(2, "0")}`;
      return { from, to };
    }
  }

  const single = text.match(
    /\b(\d{1,2})\s+([A-Za-zΑ-Ωα-ωίϊΐόάέήύϋΰώς]+(?:\s+\d{4})?)\b/i,
  );
  if (single && !range) {
    const parts = normalize(single[2]).split(/\s+/);
    const monthKey = parts[0].slice(0, 3);
    const month =
      months[parts[0]] ??
      months[monthKey] ??
      Object.entries(months).find(([k]) => parts[0].startsWith(k))?.[1];
    if (month) {
      const year = parts[1] && /^\d{4}$/.test(parts[1]) ? Number(parts[1]) : new Date().getFullYear();
      return {
        from: `${year}-${String(month).padStart(2, "0")}-${String(Number(single[1])).padStart(2, "0")}`,
      };
    }
  }

  return {};
}

function scoreFaq(query: string, q: string, a: string) {
  const words = normalize(query)
    .split(/[^a-z0-9\u0370-\u03ff]+/i)
    .filter((w) => w.length > 2);
  const hay = normalize(`${q} ${a}`);
  return words.reduce((sum, w) => (hay.includes(w) ? sum + 1 : sum), 0);
}

function wantsBooking(text: string, draft: ChatDraft) {
  const n = normalize(text);
  if (draft.bookingActive) return true;
  return /book|reserv|enquire|inquiry|request|availability|rent|κρατησ|ενοικ|διαθεσιμο|θέλω|θελω|want a car|want a scooter|να κλεισ/.test(
    n,
  );
}

function wantsConfirmSend(text: string) {
  const n = normalize(text);
  return /^(send|submit|confirm|yes|ok|okay|στείλε|στειλε|αποστολη|αποστολή|ναι|ενταξει|εντάξει)\b/.test(
    n,
  ) || /send (my )?enquir|submit (my )?(request|enquir)|στείλε το αίτημα|στειλε το αιτημα/.test(n);
}

function findNamedVehicle(text: string) {
  const n = normalize(text);
  return getAllVehicles().find((v) => n.includes(normalize(v.name)) || n.includes(v.slug));
}

function mergeDraft(prev: ChatDraft, message: string): ChatDraft {
  const next: ChatDraft = { ...prev };
  const dates = parseDates(message);
  const partySize = parsePartySize(message);
  const transmission = parseTransmission(message);
  const category = parseCategory(message);
  const email = parseEmail(message);
  const phone = parsePhone(message);
  const pickupLocation = parsePickupLocation(message);
  const named = findNamedVehicle(message);

  if (dates.from) next.from = dates.from;
  if (dates.to) next.to = dates.to;
  if (partySize) next.partySize = partySize;
  if (transmission) next.transmission = transmission;
  if (category) {
    next.category = category;
    if (category === "scooter" && !next.partySize) next.partySize = 2;
  }
  if (email) next.email = email;
  if (phone) next.phone = phone;
  if (pickupLocation) next.pickupLocation = pickupLocation;

  if (named) {
    next.vehicleSlug = named.slug;
    next.vehicleName = named.name;
    next.category = named.category === "scooter" ? "scooter" : "car";
    if (next.category === "scooter" && !next.partySize) next.partySize = 2;
  }

  // Only treat bare names as the guest name when we already need contact details
  if (next.bookingActive && next.from && next.to && !next.name) {
    const name = parseName(message);
    if (name && !named) next.name = name;
  } else {
    const name = parseName(message);
    if (name && /(?:my name is|i'm|i am|ονομαζομαι|με λενε)/i.test(message)) {
      next.name = name;
    }
  }

  // Booking funnel only on explicit book intent, named vehicle pick, or dates while already booking
  if (wantsBooking(message, prev)) next.bookingActive = true;
  if (named) next.bookingActive = true;
  if (prev.bookingActive) next.bookingActive = true;
  if (dates.from && prev.bookingActive) next.bookingActive = true;
  // Choosing dates after a fleet suggestion can start the enquiry
  if (dates.from && (prev.partySize || prev.category || prev.vehicleSlug) && !prev.bookingActive) {
    if (/^\s*\d/.test(message.trim()) || parseDates(message).from) {
      next.bookingActive = true;
    }
  }

  return next;
}

function draftComplete(draft: ChatDraft) {
  return Boolean(draft.from && draft.to && draft.name && draft.email && draft.phone);
}

function missingBookingStep(
  draft: ChatDraft,
): "category" | "partySize" | "dates" | "name" | "email" | "phone" | "done" {
  // Prefer type first, then people, then dates, then contact
  if (!draft.vehicleSlug && !draft.category) return "category";
  if (draft.category === "scooter" && !draft.partySize) {
    // scooters default to 2; treat as filled
  } else if (!draft.partySize && draft.category !== "scooter") {
    return "partySize";
  }
  if (!draft.from || !draft.to) return "dates";
  if (!draft.name) return "name";
  if (!draft.email) return "email";
  if (!draft.phone) return "phone";
  return "done";
}

function copy(locale: Locale) {
  return touristasCopy(locale);
}

function recommendCards(
  helpers: ReturnType<typeof toolHelpers>,
  draft: ChatDraft,
): LocalChatCard {
  const category = draft.category ?? "car";
  const size =
    draft.partySize ?? (category === "scooter" ? 2 : 4);
  const rec = helpers.recommendVehicle(
    size,
    draft.transmission,
    category,
    draft.from,
    draft.to,
  );
  return {
    kind: "recommend",
    vehicles: rec.vehicles,
    from: rec.from,
    to: rec.to,
  };
}

function bookingHandoffCards(
  helpers: ReturnType<typeof toolHelpers>,
  draft: ChatDraft,
): LocalChatCard[] {
  const booking = helpers.prefillBooking(draft.vehicleSlug, draft.from, draft.to);
  const cards: LocalChatCard[] = [
    {
      kind: "prefill",
      url: booking.url,
      whatsappUrl: booking.whatsappUrl,
      vehicle: booking.vehicle,
    },
  ];
  if (draft.vehicleSlug || draft.category) {
    cards.unshift(recommendCards(helpers, draft));
  }
  return cards;
}

export function answerTouristasLocal(
  message: string,
  locale: string = "en",
  incomingDraft: ChatDraft = {},
): LocalChatReply {
  const loc = asLocale(locale);
  const helpers = toolHelpers(loc);
  const t = copy(loc);
  const n = normalize(message);
  const hadDatesBefore = Boolean(incomingDraft.from && incomingDraft.to);
  let draft = mergeDraft(incomingDraft, message);
  const cards: LocalChatCard[] = [];
  let followUps: ChatFollowUp[] = [];
  let submitEnquiry: BookingSubmitPayload | undefined;

  // Confirm + submit complete enquiry
  if (draft.bookingActive && draftComplete(draft) && wantsConfirmSend(message)) {
    submitEnquiry = {
      name: draft.name!,
      email: draft.email!,
      phone: draft.phone!,
      vehicle: draft.vehicleName || draft.vehicleSlug,
      pickup: draft.from!,
      returnDate: draft.to!,
      pickupLocation: draft.pickupLocation ?? "apollonia",
      partySize: draft.partySize,
      locale: loc,
      message: "Submitted via Touristas AI chat",
    };
    cards.push(...bookingHandoffCards(helpers, draft));
    return {
      text: stripEmDashes(`${t.sent}\n\n${t.summary(draft)}`),
      cards,
      draft,
      followUps: [msg(t.followGuide), msg(t.followPickup)],
      submitEnquiry,
    };
  }

  // Active booking conversation: gather missing fields one step at a time
  if (draft.bookingActive) {
    // Scooters always count as 2 people for seat fit
    if (draft.category === "scooter" && !draft.partySize) {
      draft = { ...draft, partySize: 2 };
    }

    const step = missingBookingStep(draft);

    if (step === "category") {
      // No fleet cards yet. Pick type first so the flow can move forward.
      const text = draft.partySize
        ? t.askCategoryAfterPeople(draft.partySize)
        : t.askVehicle;
      followUps = [msg(t.followCar), msg(t.followScooter)];
      return {
        text: stripEmDashes(text),
        cards: [],
        draft,
        followUps,
      };
    }

    if (step === "partySize") {
      followUps = [msg(t.followPeople2), msg(t.followPeople4)];
      return {
        text: stripEmDashes(
          draft.category === "car" ? t.askPeopleAfterCategory : t.askPeople,
        ),
        cards: [],
        draft,
        followUps,
      };
    }

    if (step === "dates") {
      // Show matching vehicles once type + people are known
      cards.push(recommendCards(helpers, draft));
      followUps = [msg(t.followDates)];
      return {
        text: stripEmDashes(draft.from && !draft.to ? t.askReturn : t.askDates),
        cards,
        draft,
        followUps,
      };
    }

    if (step === "name") {
      const repeatedDates = hadDatesBefore && Boolean(parseDates(message).from);
      const datesSaved: Record<Locale, string> = {
        en: "Those dates are already saved.",
        el: "Οι ημερομηνίες είναι ήδη καταχωρημένες.",
        it: "Le date sono già salvate.",
        fr: "Ces dates sont déjà enregistrées.",
        de: "Diese Daten sind bereits gespeichert.",
        sv: "De datumen är redan sparade.",
        nl: "Die data zijn al opgeslagen.",
      };
      const lead = repeatedDates ? datesSaved[loc] : t.summary(draft);
      return {
        text: stripEmDashes(`${lead}\n\n${t.askName}`),
        cards: [],
        draft,
        followUps: [],
      };
    }

    if (step === "email") {
      return {
        text: stripEmDashes(t.askEmail),
        cards: [],
        draft,
        followUps: [],
      };
    }

    if (step === "phone") {
      return {
        text: stripEmDashes(t.askPhone),
        cards: [],
        draft,
        followUps: [],
      };
    }

    // Complete: offer send / form / WhatsApp
    cards.push(...bookingHandoffCards(helpers, draft));
    followUps = [
      msg(t.followSend),
      { type: "book" as const, label: t.followForm },
      { type: "whatsapp" as const, label: t.followWhatsApp },
    ];
    return {
      text: stripEmDashes(`${t.ready}\n\n${t.summary(draft)}`),
      cards,
      draft,
      followUps,
    };
  }

  // Named vehicle (show it; booking stays optional until they say so)
  const named = findNamedVehicle(message);
  if (named) {
    draft = {
      ...draft,
      vehicleSlug: named.slug,
      vehicleName: named.name,
      category: named.category === "scooter" ? "scooter" : "car",
    };
    const fit = helpers.checkVehicleFit(named.slug, draft.from, draft.to, draft.partySize);
    if (fit.found) {
      cards.push({
        kind: "recommend",
        vehicles: [
          {
            slug: fit.slug,
            name: fit.name,
            category: fit.category,
            seats: fit.seats,
            transmission: fit.transmission,
            engineCc: fit.engineCc,
            image: fit.image,
            path: fit.path,
            fromPrice: fit.fromPrice,
            bookUrl: fit.bookUrl,
            whatsappUrl: fit.whatsappUrl,
          },
        ],
        from: draft.from ?? null,
        to: draft.to ?? null,
      });
    }
    followUps = [msg(t.followBook), msg(t.followDates)];
    return {
      text: stripEmDashes(t.namedVehicle(named.name)),
      cards,
      draft,
      followUps,
    };
  }

  // Fleet browse (recommend only; do not force the booking funnel)
  const wantsFleet =
    /fleet|vehicle|car|scooter|rent|ενοικ|στολο|αυτοκινητ|οικογεν|family|suggest|προτειν|ποιο|which|fits/.test(
      n,
    ) || Boolean(draft.partySize);

  if (wantsFleet && !/pickup|παραλαβ|kamares|καμαρ/.test(n) && !draft.bookingActive) {
    const browseDraft: ChatDraft = {
      ...draft,
      bookingActive: false,
      category: draft.category ?? (draft.partySize && draft.partySize >= 3 ? "car" : draft.category),
      partySize: draft.partySize ?? (/\bfamily|οικογεν/.test(n) ? 4 : draft.partySize),
    };
    if (/\bfamily|οικογεν/.test(n) && !browseDraft.partySize) browseDraft.partySize = 4;
    if (/\bcar\b|αυτοκινητ|family|οικογεν/.test(n) && !browseDraft.category) {
      browseDraft.category = "car";
    }
    if (/scooter|μηχαν/.test(n) && !browseDraft.category) browseDraft.category = "scooter";

    cards.push(recommendCards(helpers, browseDraft));
    const size = browseDraft.partySize ?? (browseDraft.category === "scooter" ? 2 : 4);
    const text =
      browseDraft.category === "scooter"
        ? t.recommendScooter
        : size >= 3
          ? t.recommendFamily
          : t.recommendCars;
    followUps = [msg(t.followBook), msg(t.followDates)];
    return {
      text: stripEmDashes(text),
      cards,
      draft: browseDraft,
      followUps,
    };
  }

  // Rates
  if (/rate|price|cost|τιμ|ποσο κοστιζ|how much|€|eur/.test(n)) {
    const rates = getRatesMeta();
    const cars = getAllVehicles().filter((v) => v.category === "car" && v.rateKey);
    const sample = cars[0];
    const season = seasonForDate(draft.from ? new Date(`${draft.from}T12:00:00`) : new Date());
    let daily: number | null = null;
    if (sample?.rateKey) {
      daily = getLowestRate(sample.rateKey);
      const estimated = helpers.estimateSeasonRate(
        sample.rateKey,
        draft.from ?? new Date().toISOString().slice(0, 10),
      );
      if (estimated.dailyEur != null) daily = estimated.dailyEur;
    }
    const lines = Object.entries(rates.vehicles)
      .slice(0, 6)
      .map(([key, row]) => `${key}: €${row.low}-€${row.peak}/day`);
    cards.push({ kind: "rate", dailyEur: daily, season });
    cards.push(recommendCards(helpers, { ...draft, category: draft.category ?? "car" }));
    followUps = [msg(t.followDates), msg(t.followBook), msg(t.followCar)];
    return {
      text: stripEmDashes(`${t.rates}\n${lines.join(". ")}`),
      cards,
      draft,
      followUps,
    };
  }

  // Pickup
  if (/pickup|pick-up|παραλαβ|kamares|καμαρ|apollonia|απολλων|heliport|ελικοδρομ/.test(n)) {
    followUps = [msg(t.followBook), msg(t.followDates), msg(t.followGuide)];
    return { text: stripEmDashes(t.pickup), cards: [], draft, followUps };
  }

  // Deposit / booking basics
  if (/deposit|prepay|προκαταβολ|book|κρατησ/.test(n)) {
    draft = { ...draft, bookingActive: true };
    if (draft.category === "scooter" && !draft.partySize) {
      draft = { ...draft, partySize: 2 };
    }
    const step = missingBookingStep(draft);
    if (step !== "done") {
      const ask =
        step === "category"
          ? draft.partySize
            ? t.askCategoryAfterPeople(draft.partySize)
            : t.askVehicle
          : step === "dates"
            ? t.askDates
            : step === "partySize"
              ? t.askPeopleAfterCategory
              : step === "name"
                ? t.askName
                : step === "email"
                  ? t.askEmail
                  : t.askPhone;
      if (step === "dates") {
        cards.push(recommendCards(helpers, draft));
      }
      followUps =
        step === "category"
          ? [msg(t.followCar), msg(t.followScooter)]
          : step === "dates"
            ? [msg(t.followDates)]
            : step === "partySize"
              ? [msg(t.followPeople2), msg(t.followPeople4)]
              : [];
      return {
        text: stripEmDashes(`${t.deposit}\n\n${ask}`),
        cards,
        draft,
        followUps,
      };
    }
    cards.push(...bookingHandoffCards(helpers, draft));
    followUps = [
      msg(t.followSend),
      { type: "book" as const, label: t.followForm },
      { type: "whatsapp" as const, label: t.followWhatsApp },
    ];
    return {
      text: stripEmDashes(`${t.deposit}\n\n${t.ready}\n\n${t.summary(draft)}`),
      cards,
      draft,
      followUps,
    };
  }

  // FAQ
  const faqs = faqsData[loc] ?? faqsData.en;
  const ranked = faqs
    .map((f: { q: string; a: string }) => ({ ...f, score: scoreFaq(message, f.q, f.a) }))
    .filter((f: { score: number }) => f.score > 0)
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score);
  if (ranked[0] && ranked[0].score >= 2) {
    followUps = [msg(t.followBook), msg(t.followGuide), msg(t.followPickup)];
    return {
      text: stripEmDashes(`${t.matchedFaq} ${ranked[0].a}`),
      cards: [],
      draft,
      followUps,
    };
  }

  // Guide / blog
  if (/guide|beach|ferry|χωρι|παραλι|odigos|οδηγ|blog|stay|διαμον/.test(n)) {
    const guide = helpers.findGuideArticle(message);
    if (guide.results.length > 0) {
      cards.push({ kind: "guide", results: guide.results });
      followUps = [msg(t.followBook), msg(t.followDates), msg(t.followBeaches)];
      return { text: stripEmDashes(t.guideIntro), cards, draft, followUps };
    }
  }

  if (ranked[0]) {
    followUps = [msg(t.followBook), msg(t.followGuide)];
    return {
      text: stripEmDashes(`${t.matchedFaq} ${ranked[0].a}`),
      cards: [],
      draft,
      followUps,
    };
  }

  followUps = [msg(t.followBook), msg(t.followDates), msg(t.followGuide), msg(t.followPickup)];
  return { text: stripEmDashes(t.fallback), cards: [], draft, followUps };
}
