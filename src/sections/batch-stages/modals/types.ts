export interface BatchStageResponse {
    id: string,
    stage_type: string,
    start_date: string,
    end_date: string,
    number_of_weeks: number,
    initial_pigs: number,
    initial_batch_weight: number,
    final_batch_weight: number | null,
    initial_pig_weight: number,
    final_pig_weight: number | null,
    status: string,
    batch: BatchInterface,
    createdAt: string,
    updatedAt: string
}

interface BatchInterface {
    id: string,
}