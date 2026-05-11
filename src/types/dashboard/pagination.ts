

export interface CustomPaginatedResponse<T> {
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    records: T[];
}