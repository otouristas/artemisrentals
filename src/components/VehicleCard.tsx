import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Vehicle } from "@/lib/fleet";
import { getLowestRate } from "@/lib/fleet";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const t = useTranslations("Fleet");
  const href =
    vehicle.category === "car" ? `/cars/${vehicle.slug}` : `/scooters/${vehicle.slug}`;
  const lowest = getLowestRate(vehicle.rateKey);

  return (
    <article className="group overflow-hidden rounded-2xl bg-foam/70 shadow-[0_10px_40px_rgba(11,42,60,0.08)] ring-1 ring-aegean/8 transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(11,42,60,0.12)]">
      <Link href={href} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-limestone/80 p-3">
          <Image
            src={vehicle.image}
            alt={vehicle.name}
            fill
            className="object-contain p-2 transition duration-500 group-hover:scale-[1.02]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl text-aegean">{vehicle.name}</h3>
          <p className="mt-2 text-sm text-aegean/70">
            {vehicle.engineCc ? `${t("cc", { cc: vehicle.engineCc })} · ` : ""}
            {t("seats", { count: vehicle.seats })} ·{" "}
            {vehicle.transmission === "automatic" ? t("automatic") : t("manual")}
          </p>
          <p className="mt-3 text-sm font-semibold text-olive">
            {lowest ? t("fromDay", { price: lowest }) : t("contactForPrice")}
          </p>
        </div>
      </Link>
    </article>
  );
}
