export type WeighingStageData = {
  id: number;
  code: string;
  name: string;
  description: string;
  status: boolean;
};

export type GetWeighingStagesResponse = {
  code: number;
  message: string;
  data: WeighingStageData[];
};
