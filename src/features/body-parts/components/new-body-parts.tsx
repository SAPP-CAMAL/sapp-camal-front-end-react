"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
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
import { BodyPartsFormFields } from "./body-parts-form-fields";
import { createBodyPartsService } from "../server/db/body-parts.service";
import { useEffect, useState } from "react";
import { BODY_PARTS_TAG } from "../constants/body-parts.constants";

export type NewBodyPartsForm = {
  code: string;
  description: string;
};

const defaultValues: NewBodyPartsForm = {
  code: "",
  description: "",
};

export function NewBodyParts({ idPartType }: { idPartType: number }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewBodyPartsForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createBodyPartsService({
        code: data.code,
        description: data.description,
        idPartType,
      });

      form.reset(defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [BODY_PARTS_TAG],
      });

      toast.success("Parte del cuerpo creada exitosamente");
      setOpen(false);
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Nueva parte del cuerpo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Nueva Parte del Cuerpo</DialogTitle>
          <DialogDescription>
            Define una nueva parte del cuerpo para este tipo de parte.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <BodyPartsFormFields />
            <div className="flex justify-end col-span-2 gap-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={form.formState.isSubmitting}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || form.formState.isLoading
                }
              >
                {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
