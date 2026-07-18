"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function FaqAccordion({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mt-10 divide-y divide-aegean/12 border-y border-aegean/12">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="font-display text-xl text-aegean md:text-2xl">{f.q}</span>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-aegean/15 text-lg text-aegean transition",
                  isOpen && "bg-aegean text-foam",
                )}
                aria-hidden
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="pb-5 text-aegean/75">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
