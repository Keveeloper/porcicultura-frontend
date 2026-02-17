export type BatchStagesResponse = BatchStagesInterface[];
export interface BatchStagesInterface {
    id: string,
    stage_type: string,
    start_date: string,
    end_date: string,
    number_of_weeks: number,
    initial_pigs: number,
    initial_batch_weight: string,
    final_batch_weight: number | null,
    initial_pig_weight: string,
    final_pig_weight: number | null,
    status: string,
    createdAt: string,
    updatedAt: string
}