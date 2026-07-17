"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getAllVehicles } from "@/lib/fleet";
import { business, whatsappUrl } from "@/lib/site";

export function BookingForm({
  locale,
  defaultVehicle,
}: {
  locale: string;
  defaultVehicle?: string;
}) {
  const t = useTranslations("Book");
  const vehicles = getAllVehicles();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          vehicle: form.get("vehicle"),
          pickup: form.get("pickup"),
          returnDate: form.get("returnDate"),
          message: form.get("message"),
          locale,
        }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl bg-foam/80 p-6 ring-1 ring-aegean/10 md:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("name")} name="name" required />
          <Field label={t("email")} name="email" type="email" required />
          <Field label={t("phone")} name="phone" required />
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-aegean/80">{t("vehicle")}</span>
            <select
              name="vehicle"
              defaultValue={defaultVehicle ?? ""}
              className="w-full rounded-xl border border-aegean/15 bg-white px-3 py-2.5 outline-none ring-sun/40 focus:ring"
            >
              <option value="">{t("vehicleAny")}</option>
              {vehicles.map((v) => (
                <option key={v.slug} value={v.slug}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
          <Field label={t("pickup")} name="pickup" type="date" required />
          <Field label={t("return")} name="returnDate" type="date" required />
        </div>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-aegean/80">{t("message")}</span>
          <textarea
            name="message"
            rows={4}
            className="w-full rounded-xl border border-aegean/15 bg-white px-3 py-2.5 outline-none ring-sun/40 focus:ring"
          />
        </label>
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-aegean px-6 py-3 text-sm font-semibold text-foam transition hover:bg-aegean-deep disabled:opacity-60"
        >
          {status === "sending" ? t("sending") : t("submit")}
        </button>
        {status === "success" && <p className="text-sm text-olive">{t("success")}</p>}
        {status === "error" && <p className="text-sm text-red-700">{t("error")}</p>}
      </form>

      <aside className="space-y-4">
        <div className="rounded-3xl bg-aegean p-6 text-foam">
          <p className="font-display text-2xl">{business.name}</p>
          <p className="mt-2 text-foam/75">{t("address")}</p>
          <p className="mt-2 text-sm text-foam/70">{t("altPickup")}</p>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={`tel:${business.phones[0].e164}`}
              className="rounded-full bg-foam px-4 py-2.5 text-center text-sm font-semibold text-aegean"
            >
              {t("call")}: {business.phones[0].display}
            </a>
            <a
              href={whatsappUrl("Hello Artemis, I would like to enquire about a rental.")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-foam/30 px-4 py-2.5 text-center text-sm font-semibold text-foam"
            >
              {t("whatsapp")}
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-aegean/80">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-aegean/15 bg-white px-3 py-2.5 outline-none ring-sun/40 focus:ring"
      />
    </label>
  );
}
