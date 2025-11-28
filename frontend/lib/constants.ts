// API Configuration
export const API_BASE_URL = 'http://localhost:8000/api';
export const API_ENDPOINT_GET_KEYWORD = `${API_BASE_URL}/get_keywords/`;
export const API_ENDPOINT_NEW_KEYWORD = `${API_BASE_URL}/new_keyword/`;
export const API_ENDPOINT_LOGIN = `${API_BASE_URL}/login/`;
export const API_ENDPOINT_SIGNUP = `${API_BASE_URL}/signup/`;
export const API_ENDPOINT_LOGOUT = `${API_BASE_URL}/logout/`;
export const API_ENDPOINT_PROFILE = `${API_BASE_URL}/profile/`;
export const API_ENDPOINT_CLEAR_KEYWORD_HISTORY = `${API_BASE_URL}/clear_user_keyword_history/`;

// Local Storage Keys
export const TIP_STORAGE_KEY = 'tip-dismissed';

// Type definitions
export type WordObject = Record<string, string>;
export type Paragraph = WordObject[];
export type Keywords = Paragraph[];

export interface KeywordExplanationPair {
	id?: number;
	keyword: string;
	explanation: string;
}

export interface User {
	id: number;
	username: string;
	email: string;
	bio?: string;
	known_keywords?: string[];
	all_keyword_explanation_pairs?: KeywordExplanationPair[];
}

export interface AuthResponse {
	success: boolean;
	message: string;
	user?: User;
}
