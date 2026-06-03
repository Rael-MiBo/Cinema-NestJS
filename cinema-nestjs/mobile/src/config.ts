import Constants from 'expo-constants';

const fallback = 'http://localhost:3000';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  Constants.expoConfig?.extra?.apiUrl ??
  fallback;
