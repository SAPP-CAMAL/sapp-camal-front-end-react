export interface AnimalIncomeData {
    idSpecies: number;
    species: string;
    quantity: number;
    totalAmount: number;
    percentage: number;
}

export interface AnimalIncomeHistoryData {
    date: string;
    [species: string]: string | number;
}

export interface AnimalIncomeReport {
    startDate: string;
    endDate: string;
    data: AnimalIncomeData[];
    total: {
        quantity: number;
        amount: number;
    };
    historyData: AnimalIncomeHistoryData[];
}

export interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}
