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
import { NewReportTemplateFields } from "./report-template-form-fields";
import { createReportTemplateService } from "../server/db/report-template-admin.service";
import { useEffect, useState } from "react";
import { ReportType } from "../domain/report-template-admin.domain";

export type NewReportTemplateForm = {
    idCode: number;
    name: string;
    description: string;
    type: ReportType;
    status: string;
};

const defaultValues: NewReportTemplateForm = {
    idCode: 0,
    name: "",
    description: "",
    type: "EXCEL",
    status: "true",
};

export function NewReportTemplate() {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const form = useForm<NewReportTemplateForm>({ defaultValues });

    useEffect(() => {
        if (open) {
            form.reset(defaultValues);
        }
    }, [open, form]);

    const onSubmit = form.handleSubmit(async (data) => {
        try {
            await createReportTemplateService({
                idCode: data.idCode,
                name: data.name,
                description: data.description || undefined,
                type: data.type,
                status: true,
            });

            form.reset(defaultValues);

            await queryClient.invalidateQueries({ queryKey: ["report-templates-admin"] });

            toast.success("Plantilla de reporte creada exitosamente");
        } catch (error) {
            if (error instanceof HTTPError) {
                const { data } = await error.response.json<{ data: string }>();
                toast.error(data);
            } else {
                toast.error("No se pudo crear la plantilla de reporte");
            }
        }
    });

    return (
        <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon />
                    Crear plantilla
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
                <DialogHeader>
                    <DialogTitle>Nueva Plantilla de Reporte</DialogTitle>
                    <DialogDescription>Registra una nueva plantilla de reporte exportable.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
                        <NewReportTemplateFields />
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
