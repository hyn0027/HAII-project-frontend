// API Configuration
export const API_ENDPOINT_GET_KEYWORD = 'http://127.0.0.1:8000/api/get_keywords/';
export const API_ENDPOINT_NEW_KEYWORD = 'http://127.0.0.1:8000/api/new_keyword/';

// Local Storage Keys
export const TIP_STORAGE_KEY = 'tip-dismissed';

// Type definitions
export type WordObject = Record<string, string>;
export type Paragraph = WordObject[];
export type Keywords = Paragraph[];
