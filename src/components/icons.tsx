/** Small line icons for listing chips and booking panels. 20px grid, currentColor. */
type IconProps = { className?: string };

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-4 w-4"}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function SeatIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 3.5h3a1.5 1.5 0 0 1 1.5 1.5v6H6.5A1.5 1.5 0 0 1 5 9.5V4.5a1 1 0 0 1 1-1Z" />
      <path d="M5 11h8.5a1.5 1.5 0 0 1 1.5 1.5V14H5v-3Z" />
      <path d="M6.5 14v2.5M13.5 14v2.5" />
    </Svg>
  );
}

export function GearIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="5" cy="4.5" r="1.5" />
      <circle cx="10" cy="4.5" r="1.5" />
      <circle cx="15" cy="4.5" r="1.5" />
      <circle cx="5" cy="15.5" r="1.5" />
      <circle cx="10" cy="15.5" r="1.5" />
      <path d="M5 6v8M10 6v8M15 6v4H5" />
    </Svg>
  );
}

export function FuelIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 17V4.5A1.5 1.5 0 0 1 5.5 3h5A1.5 1.5 0 0 1 12 4.5V17M3 17h10" />
      <path d="M6 7h4" />
      <path d="M12 9h1.5a1 1 0 0 1 1 1v3.5a1 1 0 0 0 2 0V7l-2-2" />
    </Svg>
  );
}

export function EngineIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 8h2l1-2h5l1 2h1.5a1 1 0 0 1 1 1v1.5H17V9h1v5h-1v-1.5h-1.5V14a1 1 0 0 1-1 1H7l-1.5-2H4V8Z" />
      <path d="M8.5 6V4h3v2" />
    </Svg>
  );
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className ?? "h-4 w-4"} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="m10 1.8 2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.7-5 2.7 1-5.6-4.1-4 5.6-.8L10 1.8Z"
      />
    </svg>
  );
}

export function PinIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10 17.5s5.5-5 5.5-9.5a5.5 5.5 0 1 0-11 0c0 4.5 5.5 9.5 5.5 9.5Z" />
      <circle cx="10" cy="8" r="2" />
    </Svg>
  );
}

export function CalendarIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
      <path d="M3 8.5h14M7 2.5v4M13 2.5v4" />
    </Svg>
  );
}

export function ShieldIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10 2.5 4 5v4.5c0 4 2.6 6.9 6 8 3.4-1.1 6-4 6-8V5l-6-2.5Z" />
      <path d="m7.5 10 1.8 1.8 3.4-3.6" />
    </Svg>
  );
}

export function WalletIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2.5" y="5" width="15" height="11" rx="2" />
      <path d="M2.5 8h15M13 12h1.5" />
    </Svg>
  );
}

export function FerryIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 13.5 4.5 10h11l1.5 3.5" />
      <path d="M6 10V7h8v3M9 7V4.5h2V7" />
      <path d="M2.5 16.5c1.2 0 1.8-.8 2.5-.8s1.3.8 2.5.8 1.8-.8 2.5-.8 1.3.8 2.5.8 1.8-.8 2.5-.8 1.3.8 2.5.8" />
    </Svg>
  );
}

export function WrenchIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12.5 3a4 4 0 0 0-3.8 5.3L3.5 13.5a1.4 1.4 0 0 0 2 2l5.2-5.2A4 4 0 0 0 16 6.5l-2.3 2.3-2.2-.3-.3-2.2L13.5 4a4 4 0 0 0-1-.1Z" />
    </Svg>
  );
}

export function HelmetIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 13a7 7 0 0 1 14 0v1.5H9.5L8 11H3.2" />
      <path d="M10 6v3.5h6.5" />
    </Svg>
  );
}

export function ChatIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 4.5h12a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H8l-4 3v-3a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 4 4.5Z" />
    </Svg>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </Svg>
  );
}

export function ArrowRightIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" />
    </Svg>
  );
}
