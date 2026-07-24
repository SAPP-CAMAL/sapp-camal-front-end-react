"use client";

import { PuzzleIcon } from "lucide-react";
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
import { REPORT_ELEMENT_TYPES } from "../domain/report-template-admin.domain";
import { NewReportElementForm } from "./new-report-element";

export function NewReportElementFields({ showStatus = false }: { showStatus?: boolean }) {
    const form = useFormContext<NewReportElementForm>();

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <PuzzleIcon /> Elemento de la Sección
                    </CardTitle>
                    <CardDescription>Define el tipo y las propiedades del elemento dentro de la sección.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-4 items-start">
                    <FormField
                        control={form.control}
                        name="elementType"
                        rules={{ required: { value: true, message: "El tipo es requerido" } }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccione un tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {REPORT_ELEMENT_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="key"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Clave</FormLabel>
                                <FormControl>
                                    <Input maxLength={50} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="label"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Etiqueta</FormLabel>
                                <FormControl>
                                    <Input maxLength={100} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="width"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ancho</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Alto</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="orderIndex"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Orden</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
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

                    <FormField
                        control={form.control}
                        name="positionConfig"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel>Configuración de posición (JSON)</FormLabel>
                                <FormControl>
                                    <Textarea rows={3} placeholder='{"x": 0, "y": 0}' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="styles"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel>Estilos (JSON)</FormLabel>
                                <FormControl>
                                    <Textarea rows={3} placeholder='{"fontSize": 12}' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
