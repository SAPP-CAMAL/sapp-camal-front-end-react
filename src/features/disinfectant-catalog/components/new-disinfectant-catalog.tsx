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
import { NewDisinfectantCatalogFields } from "./disinfectant-catalog-form-fields";
import { createDisinfectantCatalogService } from "../server/db/disinfectant-catalog.service";
import { useEffect, useState } from "react";

export type NewDisinfectantCatalogForm = {
    name: string;
    description: string;
    status: string;
};

const defaultValues: NewDisinfectantCatalogForm = {
    name: "",
    description: "",
    status: "true",
};

export function NewDisinfectantCatalog() {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const form = useForm<NewDisinfectantCatalogForm>({ defaultValues });

    useEffect(() => {
        if (open) {
            form.reset(defaultValues);
        }
    }, [open, form]);

    const onSubmit = form.handleSubmit(async (data) => {
        try {
            await createDisinfectantCatalogService({
                name: data.name,
                description: data.description || undefined,
                status: true,
            });

            form.reset(defaultValues);

            await queryClient.invalidateQueries({ queryKey: ["disinfectants-catalog"] });

            toast.success("Desinfectante creado exitosamente");
        } catch (error) {
            if (error instanceof HTTPError) {
                const { data } = await error.response.json<{ data: string }>();
                toast.error(data);
            } else {
                toast.error("No se pudo crear el desinfectante");
            }
        }
    });

    return (
        <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon />
                    Crear desinfectante
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
                <DialogHeader>
                    <DialogTitle>Nuevo Desinfectante</DialogTitle>
                    <DialogDescription>Registra un nuevo desinfectante del catálogo.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
                        <NewDisinfectantCatalogFields />
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
