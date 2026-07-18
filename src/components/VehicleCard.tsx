import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Vehicle } from "@/lib/fleet";
import { getCurrentSeasonRate, getLowestRate } from "@/lib/fleet";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const t = useTranslations("Fleet");
  const href =
    vehicle.category === "car" ? `/cars/${vehicle.slug}` : `/scooters/${vehicle.slug}`;
  const { price: todayRate } = getCurrentSeasonRate(vehicle.rateKey);
  const lowest = getLowestRate(vehicle.rateKey);
  const displayRate = todayRate ?? lowest;

  return (
    <article className="card-premium group overflow-hidden">
      <Link href={href} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-aegean/[0.04]">
          <Image
            src={vehicle.image}
            alt={vehicle.name}
            fill
            className="object-cover object-center transition duration-500 group-hover:scale-[1.04]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl text-aegean">{vehicle.name}</h3>
            <span className="shrink-0 rounded-full bg-aegean/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-aegean/65">
              {vehicle.category}
            </span>
          </div>
          <p className="mt-2 text-sm text-aegean/70">
            {vehicle.engineCc ? `${t("cc", { cc: vehicle.engineCc })} · ` : ""}
            {t("seats", { count: vehicle.seats })} ·{" "}
            {vehicle.transmission === "automatic" ? t("automatic") : t("manual")}
          </p>
          <p className="mt-4 text-sm font-semibold text-olive">
            {todayRate
              ? t("todayFrom", { price: todayRate })
              : displayRate
                ? t("fromDay", { price: displayRate })
                : t("contactForPrice")}
          </p>
        </div>
      </Link>
    </article>
  );
}
