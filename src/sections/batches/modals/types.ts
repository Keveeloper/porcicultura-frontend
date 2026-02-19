export interface BatchResponse {
    id: string,
    batch_number: string,
    company: CompanyInterface,
    createdAt: string,
    updatedAt: string
}

interface CompanyInterface {
    id: string,
    name: string,
    nit: string,
    createdAt: string,
    updatedAt: string
}