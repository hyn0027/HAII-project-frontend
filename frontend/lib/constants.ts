// API Configuration
export const API_ENDPOINT = "http://127.0.0.1:8000/api/get_keywords/";

// Local Storage Keys
export const TIP_STORAGE_KEY = "tip-dismissed";

// Type definitions
export type WordObject = Record<string, string>;
export type Paragraph = WordObject[];
export type Keywords = Paragraph[];
