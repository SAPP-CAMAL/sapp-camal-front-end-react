export interface Corral {
  id:              number;
  idCorralType:    number;
  name:            string;
  description:     string;
  minimumQuantity: number;
  maximumQuantity: number;
  status:          boolean;
  corralType:         CorralType;
  corralGroupDetails: CorralGroupDetail[];
}

interface CorralGroupDetail {
  id:       number;
  corralId: number;
  groupId:  number;
  status:   boolean;
}

interface CorralType {
  id:          number;
  description: string;
  code:        string;
  status:      boolean;
}
