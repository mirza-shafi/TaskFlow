export interface Habit {
  _id?: string;
  name: string;
  emoji: string;
  data: boolean[]; // 31 days completion status
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHabitPayload {
  name: string;
  emoji: string;
}

export interface UpdateHabitPayload {
  name?: string;
  emoji?: string;
  data?: boolean[];
}
