# Fix: Tipo de Transporte se Actualizaba al Revés

## Problema Identificado

Cuando se editaba un vehículo y se cambiaba el "Tipo de Transporte", el cambio no se guardaba correctamente. El sistema parecía actualizar "al revés" o no reflejar el cambio seleccionado.

### Causa Raíz

El problema estaba en la relación entre `transportTypeId`, `vehicleTypeId` y `vehicleDetailId`:

1. **`transportTypeId`**: ID del tipo de transporte (ej: "PRODUCTOS Y SUBPRODUCTOS")
2. **`vehicleTypeId`**: ID del tipo de vehículo (ej: "FURGON C")
3. **`vehicleDetailId`**: ID de la combinación de ambos (relación en la tabla `vehicle_detail`)

El formulario guardaba `transportTypeId` en el estado local, pero al actualizar el vehículo, solo enviaba `vehicleDetailId` (que se tomaba incorrectamente del campo `vehicleTypeId`).

## Solución Implementada

### 1. Carga Dinámica de Tipos de Vehículo

Ahora cuando se selecciona un tipo de transporte, se cargan dinámicamente los tipos de vehículo disponibles para ese transporte:

```typescript
useEffect(() => {
  const loadVehicleTypes = async () => {
    if (!vehicleData.transportTypeId) {
      setAvailableVehicleTypes([]);
      return;
    }

    setIsLoadingVehicleTypes(true);
    try {
      const response = await getDetailVehicleByTransportIdService(
        Number(vehicleData.transportTypeId)
      );
      setAvailableVehicleTypes(response.data || []);
    } catch (error) {
      toast.error("Error al cargar tipos de vehículo");
      setAvailableVehicleTypes([]);
    } finally {
      setIsLoadingVehicleTypes(false);
    }
  };

  loadVehicleTypes();
}, [vehicleData.transportTypeId]);
```

### 2. Uso del `vehicleDetailId` Correcto

El campo `vehicleTypeId` ahora guarda el `id` del `vehicleDetail` (que es la combinación correcta de transporte + tipo de vehículo):

```typescript
<Select
  value={vehicleData.vehicleTypeId}
  onValueChange={(value) => handleInputChange("vehicleTypeId", value)}
>
  <SelectContent>
    {availableVehicleTypes?.map((tipo) => (
      <SelectItem key={tipo.id} value={String(tipo.id)}>
        {tipo.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 3. Validaciones Agregadas

Se agregaron validaciones para asegurar que ambos campos estén seleccionados:

```typescript
// Validar que se haya seleccionado tipo de transporte
if (!vehicleData.transportTypeId) {
  toast.error("Debe seleccionar un tipo de transporte");
  return;
}

// Validar que se haya seleccionado tipo de vehículo
if (!vehicleData.vehicleTypeId) {
  toast.error("Debe seleccionar un tipo de vehículo");
  return;
}
```

### 4. UX Mejorada

- El select de "Tipo de Vehículo" se deshabilita hasta que se seleccione un tipo de transporte
- Muestra "Cargando..." mientras obtiene los tipos de vehículo
- Placeholder descriptivo: "Primero seleccione tipo de transporte"

## Flujo Correcto

### Antes (Incorrecto)
```
1. Usuario selecciona "PRODUCTOS Y SUBPRODUCTOS" → transportTypeId = 123
2. Usuario selecciona "FURGON C" → vehicleTypeId = 456 (ID del catálogo)
3. Al guardar: vehicleDetailId = 456 ❌ (incorrecto, es el ID del catálogo)
```

### Ahora (Correcto)
```
1. Usuario selecciona "PRODUCTOS Y SUBPRODUCTOS" → transportTypeId = 123
2. Sistema carga tipos de vehículo para ese transporte
3. Usuario selecciona "FURGON C" → vehicleTypeId = 789 (ID del vehicleDetail)
4. Al guardar: vehicleDetailId = 789 ✅ (correcto, es el ID de la relación)
```

## Estructura de Datos

### Tabla `vehicle_detail`
```
id | transportTypeId | vehicleTypeId | status
---|-----------------|---------------|-------
789| 123            | 456           | true
```

- `id` (789): Es el `vehicleDetailId` que se guarda en el vehículo
- `transportTypeId` (123): Tipo de transporte
- `vehicleTypeId` (456): Tipo de vehículo del catálogo

## Archivos Modificados

1. **`src/features/vehicles/components/new-vehicle.form.tsx`**
   - Agregado estado `availableVehicleTypes`
   - Agregado estado `isLoadingVehicleTypes`
   - Agregado useEffect para cargar tipos dinámicamente
   - Actualizado Select de "Tipo de Vehículo"
   - Agregadas validaciones

2. **Imports agregados:**
   - `getDetailVehicleByTransportIdService`
   - `TransportType` type

## Testing

Para verificar que funciona correctamente:

1. Abrir el formulario de editar vehículo
2. Cambiar el "Tipo de Transporte"
3. Verificar que el "Tipo de Vehículo" se actualiza con las opciones correctas
4. Seleccionar un tipo de vehículo
5. Guardar
6. Verificar que el cambio se refleja correctamente en la lista

## Beneficios

1. ✅ El tipo de transporte se guarda correctamente
2. ✅ Solo se muestran tipos de vehículo compatibles con el transporte seleccionado
3. ✅ Mejor UX con estados de carga y validaciones
4. ✅ Previene errores de datos inconsistentes
5. ✅ Código más mantenible y claro

## API Endpoint Utilizado

```
GET /v1/1.0.0/vehicle-detail/by-transport-id?transportId={id}
```

Retorna los `vehicleDetail` disponibles para un tipo de transporte específico.
