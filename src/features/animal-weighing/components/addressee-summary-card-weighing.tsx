"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, User, MapPin } from "lucide-react";
import { Addressees } from "@/features/addressees/domain";
import { toCapitalize } from "@/lib/toCapitalize";

interface AddresseeSummaryCardWeighingProps {
  addressee: Addressees;
  onEdit: () => void;
}

export function AddresseeSummaryCardWeighing({
  addressee,
  onEdit,
}: AddresseeSummaryCardWeighingProps) {
  const address = addressee.addresses;

  return (
    <Card className="border-teal-200">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-teal-100 pb-3">
          <div className="flex items-center gap-4">
            <div className="bg-teal-600 text-white p-2.5 rounded shadow-sm">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">
              Destinatario Seleccionado
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-teal-600 border-teal-200 hover:text-teal-700 hover:bg-teal-50 shadow-sm w-full sm:w-auto ml-0 sm:ml-auto"
          >
            <Edit className="h-4 w-4 mr-2" />
            Cambiar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <div>
              <span className="text-muted-foreground font-medium">Nombre Completo: </span>
              <span className="font-bold text-gray-900 block sm:inline mt-1 sm:mt-0">
                {toCapitalize(addressee.fullName, true)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-muted-foreground font-medium">Identificación: </span>
              <span className="font-bold text-gray-900">
                {addressee.identification}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground font-medium">Ubicación: </span>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-teal-500 shrink-0" />
                <span className="font-bold text-gray-900">
                  {address
                    ? `${toCapitalize(address.canton, true)} - ${toCapitalize(
                        address.province,
                        true
                      )}`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
