export interface FeedConsumptionRow {
  stage: string;
  days: number;
  kilos: number;
  feed_per_pig: number;
  feed_per_day: number;
  conv: number;
}

export interface WeightPerStageRow {
  stage: string;
  initial_weight: number;
  final_weight: number;
  gain: number;
  gain_per_day: number;
}

export interface FinalReportResponse {
  farm_name: string;
  batch_number: string;
  entry_date: string;
  exit_date: string;
  days: number;
  initial_pigs: number;
  final_pigs: number;
  mortality: number;
  mortality_percentage: number;
  feed_consumption: FeedConsumptionRow[];
  feed_consumption_total: Omit<FeedConsumptionRow, 'stage'>;
  weight_per_stage: WeightPerStageRow[];
  weight_per_stage_total: Omit<WeightPerStageRow, 'stage'>;
  total_batch_weight_farm: number;
  total_batch_weight_slaughter: number;
  average_slaughter_weight: number;
}
