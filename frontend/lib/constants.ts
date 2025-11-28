// API Configuration
export const API_BASE_URL = 'http://127.0.0.1:8000/api';
export const API_ENDPOINT_GET_KEYWORD = `${API_BASE_URL}/get_keywords/`;
export const API_ENDPOINT_NEW_KEYWORD = `${API_BASE_URL}/new_keyword/`;
export const API_ENDPOINT_LOGIN = `${API_BASE_URL}/login/`;
export const API_ENDPOINT_SIGNUP = `${API_BASE_URL}/signup/`;
export const API_ENDPOINT_LOGOUT = `${API_BASE_URL}/logout/`;
export const API_ENDPOINT_PROFILE = `${API_BASE_URL}/profile/`;

// Local Storage Keys
export const TIP_STORAGE_KEY = 'tip-dismissed';

// Type definitions
export type WordObject = Record<string, string>;
export type Paragraph = WordObject[];
export type Keywords = Paragraph[];

export interface User {
	id: number;
	username: string;
	email: string;
	bio?: string;
}

export interface AuthResponse {
	success: boolean;
	message: string;
	user?: User;
}
