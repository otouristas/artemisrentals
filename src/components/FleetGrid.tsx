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
        "stagger-children grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.slug} vehicle={vehicle} />
      ))}
    </div>
  );
}
