export interface BatchStageResponse {
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
    batch: BatchInterface,
    dailyMeals: DailyMealInterface[],
    metrics: MetricsInterface,
    createdAt: string,
    updatedAt: string,
}

export interface BatchInterface {
    id: string,
    batch_number: string,
    createdAt: string,
    updatedAt: string,
}

export interface DailyMealInterface {
    id: string,
    date: string,
    feed_kg: string,
    mortality: number,
    observations: string,
    createdAt: string,
    updatedAt: string
}

export interface MetricsInterface {
    cumulative_feed: string,
    cumulative_mortality: number,
    mortality_percentage: string,
    current_pig_balance: number,
    fcr: string,
}