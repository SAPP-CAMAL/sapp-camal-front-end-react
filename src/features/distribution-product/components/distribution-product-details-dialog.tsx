"use client";

import { useMemo, useState } from "react";
import { PackageIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getActiveProductsService,
  getDetailDistributionsService,
} from "../server/db/distribution-product.service";
import {
  DETAIL_DISTRIBUTIONS_TAG,
  DISTRIBUTION_HEALTH_PRODUCTS_TAG,
} from "../constants/distribution-product.constants";
import { NewDetailDistribution } from "./new-detail-distribution";
import { DeleteDetailDistribution } from "./delete-detail-distribution";
import { DistributionProduct } from "../domain/distribution-product.domain";

export function DistributionProductDetailsDialog({
  distributionProduct,
}: {
  distributionProduct: DistributionProduct;
}) {
  const [open, setOpen] = useState(false);

  const detailsQuery = useQuery({
    queryKey: [DETAIL_DISTRIBUTIONS_TAG, distributionProduct.id],
    queryFn: getDetailDistributionsService,
    enabled: open,
  });

  const productsQuery = useQuery({
    queryKey: [DISTRIBUTION_HEALTH_PRODUCTS_TAG],
    queryFn: getActiveProductsService,
    enabled: open,
  });

  const details = useMemo(
    () =>
      (detailsQuery.data?.data ?? []).filter(
        (d) => d.idDistributionProduct === distributionProduct.id
      ),
    [detailsQuery.data, distributionProduct.id]
  );

  const products = productsQuery.data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PackageIcon />
          Productos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Productos del Despacho</DialogTitle>
          <DialogDescription>
            Administra los productos, cantidades y destinatarios de este
            despacho de distribución.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end">
          <NewDetailDistribution idDistributionProduct={distributionProduct.id} />
        </div>

        <div className="bg-white border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Destinatario</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center animate-pulse">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : details.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                    No hay productos agregados a este despacho
                  </TableCell>
                </TableRow>
              ) : (
                details.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell>
                      {products.find((p) => p.id === detail.idProduct)
                        ?.description ?? `Producto #${detail.idProduct}`}
                    </TableCell>
                    <TableCell>{detail.quantity}</TableCell>
                    <TableCell>{detail.adressee || "—"}</TableCell>
                    <TableCell className="text-center">
                      <DeleteDetailDistribution
                        id={detail.id}
                        idDistributionProduct={distributionProduct.id}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
