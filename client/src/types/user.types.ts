export interface AppearanceSettings {
  theme?: 'light' | 'dark' | 'auto';
  fontSize?: 'small' | 'medium' | 'large';
  startWeekOn?: 'sunday' | 'monday';
  showWeekNumbers?: boolean;
  timeZone?: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  appearance?: AppearanceSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  appearance?: AppearanceSettings;
}
