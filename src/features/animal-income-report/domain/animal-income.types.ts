export interface AnimalIncomeData {
    species: string;
    quantity: number;
    totalAmount: number;
    percentage: number;
}

export interface AnimalIncomeReport {
    startDate: string;
    endDate: string;
    data: AnimalIncomeData[];
    total: {
        quantity: number;
        amount: number;
    };
    historyData: {
        date: string;
        BOVINO: number;
        PORCINO: number;
        "OVINO/CAPRINO": number;
    }[];
}

export interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}
