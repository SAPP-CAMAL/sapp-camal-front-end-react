"use client";

import { useEffect, useState } from "react";
import { SquarePenIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { NewReportElementFields } from "./report-element-form-fields";
import { updateReportElementService } from "../server/db/report-template-admin.service";
import { NewReportElementForm } from "./new-report-element";
import { ReportElementAdmin } from "../domain/report-template-admin.domain";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

function parseJsonField(value: string, fieldLabel: string): Record<string, unknown> | undefined {
    if (!value.trim()) return undefined;
    try {
        return JSON.parse(value);
    } catch {
        throw new Error(`${fieldLabel} no es un JSON válido`);
    }
}

export function UpdateReportElement({ reportElement }: { reportElement: ReportElementAdmin }) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const form = useForm<NewReportElementForm>();

    useEffect(() => {
        if (open) {
            form.reset({
                elementType: reportElement.elementType,
                key: reportElement.key ?? "",
                label: reportElement.label ?? "",
                url: reportElement.url ?? "",
                width: reportElement.width ?? undefined,
                height: reportElement.height ?? undefined,
                orderIndex: reportElement.orderIndex,
                status: String(reportElement.status),
                positionConfig: reportElement.positionConfig ? JSON.stringify(reportElement.positionConfig) : "",
                styles: reportElement.styles ? JSON.stringify(reportElement.styles) : "",
            });
        }
    }, [open, form, reportElement]);

    const onSubmit = form.handleSubmit(async (data) => {
        try {
            const positionConfig = form.formState.dirtyFields.positionConfig
                ? parseJsonField(data.positionConfig, "Configuración de posición")
                : undefined;
            const styles = form.formState.dirtyFields.styles
                ? parseJsonField(data.styles, "Estilos")
                : undefined;

            await updateReportElementService(reportElement.id, {
                ...(form.formState.dirtyFields.elementType && { elementType: data.elementType }),
                ...(form.formState.dirtyFields.key && { key: data.key }),
                ...(form.formState.dirtyFields.label && { label: data.label }),
                ...(form.formState.dirtyFields.url && { url: data.url }),
                ...(form.formState.dirtyFields.width && { width: data.width }),
                ...(form.formState.dirtyFields.height && { height: data.height }),
                ...(form.formState.dirtyFields.orderIndex && { orderIndex: data.orderIndex }),
                ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
                ...(form.formState.dirtyFields.positionConfig && { positionConfig }),
                ...(form.formState.dirtyFields.styles && { styles }),
            });

            form.reset(form.formState.defaultValues);

            await queryClient.invalidateQueries({ queryKey: ["report-elements-admin", reportElement.idSection] });

            toast.success("Elemento actualizado exitosamente");
        } catch (error) {
            if (error instanceof HTTPError) {
                const { data } = await error.response.json<{ data: string }>();
                toast.error(data);
            } else if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("No se pudo actualizar el elemento");
            }
        }
    });

    return (
        <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button variant={"outline"}>
                            <SquarePenIcon />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
                    Editar Elemento
                </TooltipContent>
            </Tooltip>
            <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
                <DialogHeader>
                    <DialogTitle>Editar Elemento</DialogTitle>
                    <DialogDescription>Modifica la información del elemento seleccionado.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
                        <NewReportElementFields showStatus />
                        <div className="flex justify-end col-span-2 gap-x-2">
                            <Button
                                type="button"
                                variant={"outline"}
                                disabled={form.formState.isSubmitting}
                                onClick={() => setOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting || form.formState.isLoading}>
                                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
