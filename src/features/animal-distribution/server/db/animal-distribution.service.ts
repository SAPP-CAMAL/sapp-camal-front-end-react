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
