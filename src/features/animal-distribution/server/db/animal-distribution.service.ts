import { http } from "@/lib/ky";
import type { OrdersResponse, OrdersFilters } from "../../domain/animal-distribution.types";

/**
 * Servicio para obtener los pedidos paginados
 * @param filters Filtros de búsqueda
 * @returns Promise con la respuesta de pedidos
 */
export async function getPaginatedOrders(filters: OrdersFilters = {}): Promise<OrdersResponse> {
    try {
        const response = await http.post("v1/1.0.0/orders/paginated-orders", {
            json: {
                page: filters.page || 1,
                limit: filters.limit || 10,
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
                ...(filters.idSpecie && { idSpecie: filters.idSpecie }),
                ...(filters.idOrderStatus && { idOrderStatus: filters.idOrderStatus }),
                ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
            },
        }).json<OrdersResponse>();

        return response;
    } catch (error) {
        console.error("Error fetching paginated orders:", error);
        throw error;
    }
}

/**
 * Servicio para cambiar el estado de una orden
 * @param orderId ID de la orden
 * @param orderStatusCode Código del estado (APR o REC)
 * @returns Promise con la respuesta
 */
export async function updateOrderStatus(orderId: number, orderStatusCode: "APR" | "REC"): Promise<any> {
    try {
        const response = await http.patch(`v1/1.0.0/orders/${orderId}`, {
            json: {
                orderStatusCode,
            },
        }).json<any>();

        return response;
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
}


export interface AnimalDistributionFilters{
  startDate: string,
  endDate: string,
  weighingStageCode: string,
  idSpecie: number,
  page: number,
  limit: number
}

export async function getAnimalDistributionReportService(filters: AnimalDistributionFilters, typeReport: 'EXCEL' | 'PDF') {
    const response = await http.post('v1/1.0.0/detail-specie-cert/distribution-report', {
        searchParams: { typeReport },
        json: filters,
    });

    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || '';
    const contentDisposition = response.headers.get('content-disposition') || '';

    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    let dateRange = `${filters.startDate}-${filters.endDate}`;
    if (filters.startDate === filters.endDate) dateRange = filters.startDate;

    const defaultFilename = `Reporte-distribucion-${dateRange}.${typeReport.toLowerCase() === 'excel' ? 'xlsx' : 'pdf'}`;
    const filename = filenameMatch?.[1]?.replace(/['"]/g, '') || defaultFilename;

    return { blob, filename, contentType };
}
