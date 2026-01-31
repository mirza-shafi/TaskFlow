export interface DeviceInfo {
  userAgent: string;
  browser: string;
  os: string;
  device: string;
}

export interface Session {
  _id: string;
  userId: string;
  refreshToken: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  lastActivity: string;
  createdAt: string;
  isActive: boolean;
}
