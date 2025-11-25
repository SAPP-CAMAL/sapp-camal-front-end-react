"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, User, MapPin, Mail, Phone } from "lucide-react";
import { Addressees } from "@/features/addressees/domain";
import { toCapitalize } from "@/lib/toCapitalize";

interface AddresseeSummaryCardProps {
  addressee: Addressees;
  onEdit: () => void;
}

export function AddresseeSummaryCard({
  addressee,
  onEdit,
}: AddresseeSummaryCardProps) {
  const address = addressee.addresses?.[0];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-teal-600 text-white p-3 rounded">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            Destinatario Seleccionado
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
              <span className="text-gray-600">Nombre Completo: </span>
              <span className="font-medium">
                {toCapitalize(addressee.fullName, true)}
              </span>
            </div>

            <div>
              <span className="text-gray-600">Correo Electrónico: </span>
              <div className="inline-flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-medium">{addressee.email || "—"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-gray-600">Identificación: </span>
              <span className="font-medium">
                {addressee.identification}
              </span>
            </div>

            <div>
              <span className="text-gray-600">Ubicación: </span>
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-medium">
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
