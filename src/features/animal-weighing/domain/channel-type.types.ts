export interface ChannelType {
  id: number;
  code: string;
  name: string;
  description: string;
  hooksQuantity: number;
  status: boolean;
}

export interface GetChannelTypesResponse {
  code: number;
  message: string;
  data: ChannelType[];
}
