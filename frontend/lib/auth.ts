import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL, type AuthResponse, type User } from './constants';

// Create dedicated axios instance for API calls
const apiClient: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Add request interceptor to ensure credentials are always included
apiClient.interceptors.request.use(
	config => {
		config.withCredentials = true;
		return config;
	},
	error => {
		return Promise.reject(error);
	}
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
	response => response,
	error => {
		console.log('API Error:', error.response?.status);
		return Promise.reject(error);
	}
);

export interface LoginCredentials {
	username: string;
	password: string;
}

export interface SignupCredentials {
	username: string;
	email: string;
	password: string;
	bio?: string;
}

export const authApi = {
	async login(credentials: LoginCredentials): Promise<AuthResponse> {
		try {
			const response = await apiClient.post('/login/', credentials);
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				return error.response.data;
			}
			throw new Error('Login failed');
		}
	},

	async signup(credentials: SignupCredentials): Promise<AuthResponse> {
		try {
			const response = await apiClient.post('/signup/', credentials);
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				return error.response.data;
			}
			throw new Error('Signup failed');
		}
	},

	async logout(): Promise<AuthResponse> {
		try {
			const response = await apiClient.post('/logout/');
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				return error.response.data;
			}
			throw new Error('Logout failed');
		}
	},

	async getProfile(): Promise<{ success: boolean; user?: User; message?: string }> {
		try {
			const response = await apiClient.get('/profile/');
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				return error.response.data;
			}
			return { success: false, message: 'Failed to get profile' };
		}
	},

	async updateProfile(
		data: Partial<User> & { current_password?: string; new_password?: string }
	): Promise<AuthResponse> {
		try {
			const response = await apiClient.put('/profile/', data);
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				return error.response.data;
			}
			throw new Error('Profile update failed');
		}
	},

	async clearKeywordHistory(keywords?: string[]): Promise<{ success: boolean; message: string }> {
		try {
			const data = keywords ? { keywords } : { clear_all: true };
			const response = await apiClient.post('/clear_user_keyword_history/', data);
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				return error.response.data;
			}
			return { success: false, message: 'Failed to clear keyword history' };
		}
	},
};

// Helper function to make authenticated API calls
export const makeAuthenticatedRequest = async <T>(
	method: 'get' | 'post' | 'put' | 'delete',
	url: string,
	data?: Record<string, unknown>
): Promise<T> => {
	const response = await apiClient({
		method,
		url: url.replace(API_BASE_URL, ''), // Remove base URL since apiClient already has it
		data,
	});
	return response.data;
};

// Export the configured axios instance for use in other components
export { apiClient };
