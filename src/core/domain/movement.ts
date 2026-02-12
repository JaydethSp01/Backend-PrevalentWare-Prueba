export type MovementType = "INCOME" | "EXPENSE";

export interface MovementDomain {
  id: string;
  concept: string;
  amount: number;
  type: MovementType;
  date: Date;
  userId: string;
  userName?: string;
}

export interface MovementCreateDomain {
  concept: string;
  amount: number;
  type: MovementType;
  date: Date;
  userId: string;
}
