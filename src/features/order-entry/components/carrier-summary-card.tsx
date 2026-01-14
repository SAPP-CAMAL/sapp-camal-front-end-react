"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Edit } from "lucide-react";
import { Carrier } from "@/features/carriers/domain";

interface CarrierSummaryCardProps {
  carrier: Carrier;
  onEdit: () => void;
}

export function CarrierSummaryCard({
  carrier,
  onEdit,
}: CarrierSummaryCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-teal-600 text-white p-3 rounded">
            <Truck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            Transportista Seleccionado
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="ml-auto text-teal-600 hover:text-teal-700 hover:bg-teal-100"
          >
            <Edit className="h-4 w-4 mr-2" />
            Cambiar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">Transportista: </span>
              <span className="font-medium">{carrier.person?.fullName || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-600">Identificación: </span>
              <span className="font-medium">{carrier.person.identification}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-gray-600">Vehículo: </span>
              <span className="font-medium">{carrier.vehicle?.plate || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-600">Tipo: </span>
              <span className="font-medium">
                {carrier.vehicle?.vehicleDetail?.vehicleType?.name || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
