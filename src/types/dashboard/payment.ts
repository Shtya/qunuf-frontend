

export type PaymentRow = {
    id: string; // Transaction ID
    property: {
        id: string;
        imagePath: string;
        name: string;
    };
    type: 'Apartment' | 'House';
    address: string;
    price: number;
    date: Date;
};
