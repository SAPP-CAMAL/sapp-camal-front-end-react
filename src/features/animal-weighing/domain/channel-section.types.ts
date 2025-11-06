export interface ChannelSection {
  id: number;
  sectionCode: string;
  orderNumber: number;
  idChannelType: number;
  description: string;
  status: boolean;
}

export interface GetChannelSectionsResponse {
  code: number;
  message: string;
  data: ChannelSection[];
}
