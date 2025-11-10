export interface ProductAnatomicalLocation {
  id: number;
  idProduct: number;
  code: string;
  name: string;
  bodyRegion: string;
  status: boolean;
}

export interface GetProductAnatomicalLocationsResponse {
  code: number;
  message: string;
  data: ProductAnatomicalLocation[];
}
