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
import { useEffect, useState } from "react";
import { IntroductorFormFields } from "./introductor-form-fields";
import { Specie } from "../domain";

export type NewIntroductorForm = {
  name: string;
  description: string;
  identification: string;
};

const defaultValues: NewIntroductorForm = {
  name: "",
  description: "",
  identification: "",
};

type NewIntroductorProps = {
  species: Specie[];
  onRefresh: () => void;
  introducerRolId?: number;
};
export function NewIntroductor({
  species,
  onRefresh,
  introducerRolId,
}: NewIntroductorProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<NewIntroductorForm>({ defaultValues });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        {/* <Button>
          <PlusIcon />
          Nuevo Introductor
        </Button> */}
      </DialogTrigger>
      <DialogContent className="w-[95vw] md:max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Introductor</DialogTitle>
          <DialogDescription>
            Busca y selecciona la persona que será registrada como Introductor.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-8 grid grid-cols-1 gap-2">
            <IntroductorFormFields
              species={species}
              introducerRolId={introducerRolId}
            />
            <div className="flex justify-end col-span-2 gap-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={form.formState.isSubmitting}
                onClick={() => {
                  setOpen(false);
                  onRefresh();
                }}
              >
                Finalizar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
