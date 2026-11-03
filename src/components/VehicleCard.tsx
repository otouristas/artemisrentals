import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Vehicle } from "@/lib/fleet";
import { getCurrentSeasonRate, getLowestRate } from "@/lib/fleet";
import { GearIcon, PinIcon, SeatIcon } from "@/components/icons";

/** Marketplace-style listing card: photo, name, rating line, spec chips, price. */
export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const t = useTranslations("Fleet");
  const tBook = useTranslations("Book");
  const href =
    vehicle.category === "car" ? `/cars/${vehicle.slug}` : `/scooters/${vehicle.slug}`;
  const { price: todayRate } = getCurrentSeasonRate(vehicle.rateKey);
  const lowest = getLowestRate(vehicle.rateKey);
  const displayRate = todayRate ?? lowest;

  return (
    <article className="group">
      <Link href={href} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-aegean">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-foam">
          <Image
            src={vehicle.image}
            alt={vehicle.name}
            fill
            className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
          />
          {vehicle.transmission === "automatic" ? (
            <span className="absolute left-3 top-3 rounded-md bg-foam/95 px-2 py-1 text-[11px] font-semibold text-aegean shadow-sm">
              {t("automatic")}
            </span>
          ) : null}
        </div>
        <div className="pt-3">
          {/* No per-car rating: reviews are for the desk, not individual models. */}
          <h3 className="text-[17px] font-semibold leading-snug text-aegean">{vehicle.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-aegean/55">
            <PinIcon className="h-3.5 w-3.5" />
            {tBook("places.apollonia")} · {tBook("places.kamares")}
          </p>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            <li className="chip">
              <SeatIcon className="h-3.5 w-3.5" />
              {t("seats", { count: vehicle.seats })}
            </li>
            <li className="chip">
              <GearIcon className="h-3.5 w-3.5" />
              {vehicle.transmission === "automatic" ? t("automatic") : t("manual")}
            </li>
            {vehicle.engineCc ? <li className="chip">{t("cc", { cc: vehicle.engineCc })}</li> : null}
          </ul>
          <p className="mt-3 text-[15px] text-aegean">
            {todayRate ? (
              <>
                <span className="text-lg font-bold">€{todayRate}</span>
                <span className="text-aegean/60"> {t("perDay")}</span>
              </>
            ) : displayRate ? (
              <span className="font-bold">{t("fromDay", { price: displayRate })}</span>
            ) : (
              <span className="font-semibold">{t("contactForPrice")}</span>
            )}
          </p>
        </div>
      </Link>
    </article>
  );
}
