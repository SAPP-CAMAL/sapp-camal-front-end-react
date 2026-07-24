"use client";

import { WorkflowIcon, TriangleAlertIcon } from "lucide-react";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAllSpecies } from "@/features/specie/hooks";
import { NewLineForm } from "./new-line";

export function NewLineFields({ showStatus = false }: { showStatus?: boolean }) {
    const form = useFormContext<NewLineForm>();
    const speciesQuery = useAllSpecies();
    const species = speciesQuery.data?.data ?? [];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <WorkflowIcon /> Línea de Faenamiento
                    </CardTitle>
                    <CardDescription>Define el nombre, la especie y la descripción de la línea.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-x-2 gap-y-4 items-start">
                    <FormField
                        control={form.control}
                        name="name"
                        rules={{ required: { value: true, message: "El nombre es requerido" } }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre *</FormLabel>
                                <FormControl>
                                    <Input maxLength={50} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="idSpecie"
                        rules={{ required: { value: true, message: "La especie es requerida" } }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Especie *</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    value={field.value ? String(field.value) : undefined}
                                    disabled={!species.length}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={species.length ? "Seleccione una especie" : "No hay especies disponibles"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {species.map((specie) => (
                                            <SelectItem key={specie.id} value={String(specie.id)}>{specie.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                {!species.length && !speciesQuery.isLoading && (
                                    <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
                                        <TriangleAlertIcon className="h-4 w-4 mt-0.5 shrink-0" />
                                        <span>No hay especies activas disponibles.</span>
                                    </div>
                                )}
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                    <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {showStatus && (
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Seleccione un estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="true">Activo</SelectItem>
                                            <SelectItem value="false">Inactivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
