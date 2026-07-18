import { VehicleCard } from "@/components/VehicleCard";
import type { Vehicle } from "@/lib/fleet";
import { cn } from "@/lib/cn";

export function FleetGrid({
  vehicles,
  className,
}: {
  vehicles: Vehicle[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "stagger-children grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.slug} vehicle={vehicle} />
      ))}
    </div>
  );
}
