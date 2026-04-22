export interface Filing {
  document_id: string;
  property_address: string | null;
  borough: string | null;
  filing_date: string | null;
  document_type: string | null;
  party_1_name: string | null;
  party_2_name: string | null;
  estimated_loan_balance: number | null;
  balance_confirmed: boolean | null;
  acris_url: string | null;
  signal_type: string | null;
  asset_class_flag: string | null;
  inserted_at: string | null;
}

export interface Run {
  id: number;
  ran_at: string | null;
  status: string | null;
  records_found: number | null;
  error_msg: string | null;
}
