"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { HTTPError } from "ky";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { NewReportElementFields } from "./report-element-form-fields";
import { createReportElementService } from "../server/db/report-template-admin.service";
import { useEffect, useState } from "react";
import { ReportElementType } from "../domain/report-template-admin.domain";

export type NewReportElementForm = {
    elementType: ReportElementType;
    key: string;
    label: string;
    url: string;
    width?: number;
    height?: number;
    orderIndex: number;
    status: string;
    positionConfig: string;
    styles: string;
};

function parseJsonField(value: string, fieldLabel: string): Record<string, unknown> | undefined {
    if (!value.trim()) return undefined;
    try {
        return JSON.parse(value);
    } catch {
        throw new Error(`${fieldLabel} no es un JSON válido`);
    }
}

export function NewReportElement({ fixedSectionId }: { fixedSectionId: number }) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const defaultValues: NewReportElementForm = {
        elementType: "TITLE",
        key: "",
        label: "",
        url: "",
        width: undefined,
        height: undefined,
        orderIndex: 0,
        status: "true",
        positionConfig: "",
        styles: "",
    };

    const form = useForm<NewReportElementForm>({ defaultValues });

    useEffect(() => {
        if (open) {
            form.reset(defaultValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, form]);

    const onSubmit = form.handleSubmit(async (data) => {
        try {
            const positionConfig = parseJsonField(data.positionConfig, "Configuración de posición");
            const styles = parseJsonField(data.styles, "Estilos");

            await createReportElementService({
                idSection: fixedSectionId,
                elementType: data.elementType,
                key: data.key || undefined,
                label: data.label || undefined,
                url: data.url || undefined,
                width: data.width,
                height: data.height,
                orderIndex: data.orderIndex,
                status: true,
                positionConfig,
                styles,
            });

            form.reset(defaultValues);

            await queryClient.invalidateQueries({ queryKey: ["report-elements-admin", fixedSectionId] });

            toast.success("Elemento creado exitosamente");
        } catch (error) {
            if (error instanceof HTTPError) {
                const { data } = await error.response.json<{ data: string }>();
                toast.error(data);
            } else if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("No se pudo crear el elemento");
            }
        }
    });

    return (
        <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon />
                    Crear elemento
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
                <DialogHeader>
                    <DialogTitle>Nuevo Elemento</DialogTitle>
                    <DialogDescription>Registra un nuevo elemento para esta sección.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
                        <NewReportElementFields />
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
                                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
