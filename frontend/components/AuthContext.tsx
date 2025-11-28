'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/auth';
import { User } from '@/lib/constants';

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
	signup: (
		username: string,
		email: string,
		password: string,
		bio?: string
	) => Promise<{ success: boolean; message: string }>;
	logout: () => Promise<void>;
	updateProfile: (
		data: Partial<User> & { current_password?: string; new_password?: string }
	) => Promise<{ success: boolean; message: string }>;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if user is already logged in on component mount
		checkAuthStatus();
	}, []);

	const checkAuthStatus = async () => {
		try {
			setLoading(true);
			const response = await authApi.getProfile();
			if (response.success && response.user) {
				setUser(response.user);
			} else {
				setUser(null);
			}
		} catch (error) {
			console.log('Auth check failed:', error);
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	const login = async (username: string, password: string) => {
		try {
			const response = await authApi.login({ username, password });
			if (response.success && response.user) {
				setUser(response.user);
				return { success: true, message: response.message };
			} else {
				return { success: false, message: response.message };
			}
		} catch {
			return { success: false, message: 'Login failed' };
		}
	};

	const signup = async (username: string, email: string, password: string, bio?: string) => {
		try {
			const response = await authApi.signup({ username, email, password, bio });
			if (response.success && response.user) {
				setUser(response.user);
				return { success: true, message: response.message };
			} else {
				return { success: false, message: response.message };
			}
		} catch {
			return { success: false, message: 'Signup failed' };
		}
	};

	const logout = async () => {
		try {
			await authApi.logout();
		} catch (error) {
			// Even if logout fails on server, clear local state
			console.error('Logout error:', error);
		} finally {
			setUser(null);
		}
	};

	const updateProfile = async (
		data: Partial<User> & { current_password?: string; new_password?: string }
	) => {
		try {
			const response = await authApi.updateProfile(data);
			if (response.success && response.user) {
				setUser(response.user);
				return { success: true, message: response.message };
			} else {
				return { success: false, message: response.message };
			}
		} catch {
			return { success: false, message: 'Profile update failed' };
		}
	};

	const refreshUser = async () => {
		try {
			const response = await authApi.getProfile();
			if (response.success && response.user) {
				setUser(response.user);
			}
		} catch (error) {
			console.log('User refresh failed:', error);
		}
	};

	const value = {
		user,
		loading,
		login,
		signup,
		logout,
		updateProfile,
		refreshUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
