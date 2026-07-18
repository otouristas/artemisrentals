export const CAR_FREE_PICKUPS = [
  "apollonia",
  "kamares",
  "heliport",
  "artemonas",
  "kastro",
] as const;

export const CAR_REQUEST_PICKUPS = ["vathi", "platys-gialos", "faros"] as const;

export const ALL_CAR_PICKUPS = [...CAR_FREE_PICKUPS, ...CAR_REQUEST_PICKUPS] as const;

export const SCOOTER_PICKUPS = ["apollonia"] as const;

export type CarPickupLocation = (typeof ALL_CAR_PICKUPS)[number];
export type ScooterPickupLocation = (typeof SCOOTER_PICKUPS)[number];
export type PickupLocation = CarPickupLocation;

export function isOnRequestPickup(location: PickupLocation) {
  return (CAR_REQUEST_PICKUPS as readonly string[]).includes(location);
}

export function pickupsForCategory(category: "car" | "scooter" | undefined): readonly PickupLocation[] {
  if (category === "scooter") return SCOOTER_PICKUPS;
  return ALL_CAR_PICKUPS;
}
