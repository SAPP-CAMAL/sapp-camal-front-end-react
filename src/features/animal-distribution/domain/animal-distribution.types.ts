/**
 * Tipos para la distribución de animales (Orders/Pedidos)
 */

// Tipos para la respuesta de la API
export interface OrderPerson {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface OrderVehicle {
  id: number;
  plate: string;
}

export interface OrderShipping {
  id: number;
  vehicleId: number;
  personId: number;
  transportsProductsChannels: string | null;
  status: boolean;
  person: OrderPerson;
  vehicle: OrderVehicle;
}

export interface OrderStatus {
  id: number;
  name: string;
  code: string;
  description: string;
  status: boolean;
}

export interface OrderType {
  id: number;
  idRol: number;
  status: boolean;
}

export interface ProductiveStage {
  id: number;
  name: string;
}

export interface DetailCertificateBrands {
  id: number;
  productiveStage: ProductiveStage;
}

export interface AnimalWeighing {
  id: number;
  idWeighingStage: number;
  unit: string;
  totalWeight: number;
}

export interface DetailsSpeciesCertificate {
  id: number;
  code: string;
  animalCode: string;
  detailCertificateBrands: DetailCertificateBrands;
  animalWeighing: AnimalWeighing[];
}

export interface SpeciesProduct {
  id: number;
  productName: string;
  productCode: string;
}

export interface AnimalProduct {
  id: number;
  available: boolean;
  speciesProduct: SpeciesProduct;
  detailsSpeciesCertificate: DetailsSpeciesCertificate;
}

export interface OrderDetail {
  id: number;
  idOrder: number;
  idAnimalProduct: number;
  status: boolean;
  animalProduct?: AnimalProduct;
}

export interface OrderAddress {
  id: number;
  addresseeId: number;
  parishId: number;
  firstStree: string;
  status: boolean;
}

export interface OrderPersonRole {
  id: number;
  personId: number;
  roleId: number;
  hasLogin: boolean;
  status: boolean;
  person: OrderPerson;
}

export interface OrderAddressee {
  id: number;
  personRoleId: number;
  status: boolean;
  addresses: OrderAddress;
  personRole: OrderPersonRole;
}

export interface Order {
  id: number;
  idAddressee: number;
  idOrderStatus: number;
  idOrderType: number;
  idShipping: number;
  idVeterinarian: number;
  requestedDate: string;
  approvedDate: string | null;
  idApprovedBy: number | null;
  validityHours: number;
  status: boolean;
  orderType: OrderType;
  orderStatus: OrderStatus;
  shipping: OrderShipping;
  orderDetails: OrderDetail[];
  addressee: OrderAddressee;
  certificate: any | null;
  approvedBy: any | null;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface OrdersResponse {
  code: number;
  message: string;
  data: {
    meta: PaginationMeta;
    items: Order[];
  };
}

export interface OrdersFilters {
  page?: number;
  limit?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  idSpecie?: number;
  idOrderStatus?: number;
  searchTerm?: string;
}

// Tipo legacy para compatibilidad (se mapea desde Order)
export interface AnimalDistribution {
  id: number;
  nroDistribucion: string;
  fechaDistribucion: string;
  nombreDestinatario: string;
  lugarDestino: string;
  placaMedioTransporte: string;
  idsIngresos: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "ENTREGADO";
}

// Función para mapear Order a AnimalDistribution
export function mapOrderToDistribution(order: Order): AnimalDistribution {
  const addresseeName = order.addressee.personRole.person.fullName;
  const destination = order.addressee.addresses.firstStree;
  const vehiclePlate = order.shipping.vehicle.plate;
  const driverName = order.shipping.person.fullName;
  const ingresosCount = order.orderDetails.length;

  return {
    id: order.id,
    nroDistribucion: order.id.toString(),
    fechaDistribucion: order.requestedDate,
    nombreDestinatario: addresseeName,
    lugarDestino: destination,
    placaMedioTransporte: `${vehiclePlate}/${driverName}`,
    idsIngresos: ingresosCount.toString(),
    estado: order.orderStatus.name as any,
  };
}
