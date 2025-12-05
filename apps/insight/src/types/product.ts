export interface Product {
    id: string;
    name: string;
    sellingPrice: number;
    costPrice: number;
    currentStock: number;
    minStock: number;
    photoUrl?: string;
    category?: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductInput {
    name: string;
    sellingPrice: number;
    costPrice: number;
    currentStock: number;
    minStock: number;
    photoUrl?: string;
    category?: string;
}
