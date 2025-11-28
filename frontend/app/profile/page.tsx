'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import {
	Container,
	Paper,
	Title,
	TextInput,
	Textarea,
	Button,
	Stack,
	Group,
	Alert,
	PasswordInput,
	Box,
	Text,
	ActionIcon,
	Flex,
	Badge,
	Modal,
} from '@mantine/core';
import { Plus, Edit, Check, X } from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';

interface ProfileFormData {
	email: string;
	bio: string;
	known_keywords: string[];
}

interface PasswordChangeData {
	current_password: string;
	new_password: string;
	confirm_password: string;
}

export default function ProfilePage() {
	const { user, updateProfile, loading } = useAuth();
	const router = useRouter();
	const [formData, setFormData] = useState<ProfileFormData>({
		email: '',
		bio: '',
		known_keywords: [],
	});
	const [passwordData, setPasswordData] = useState<PasswordChangeData>({
		current_password: '',
		new_password: '',
		confirm_password: '',
	});
	const [newKeyword, setNewKeyword] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const [passwordModalOpened, { open: openPasswordModal, close: closePasswordModal }] = useDisclosure(false);

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!loading && !user) {
			router.push('/');
		}
	}, [user, loading, router]);

	// Initialize form data when user data is available
	useEffect(() => {
		if (user) {
			setFormData({
				email: user.email || '',
				bio: user.bio || '',
				known_keywords: user.known_keywords || [],
			});
		}
	}, [user]);

	const handleInputChange = (field: keyof ProfileFormData, value: string | string[]) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
		}));
	};

	const handlePasswordChange = (field: keyof PasswordChangeData, value: string) => {
		setPasswordData(prev => ({
			...prev,
			[field]: value,
		}));
	};

	const addKeyword = () => {
		const trimmedKeyword = newKeyword.trim().toLowerCase();
		if (trimmedKeyword && !formData.known_keywords.includes(trimmedKeyword)) {
			handleInputChange('known_keywords', [...formData.known_keywords, trimmedKeyword]);
			setNewKeyword('');
		} else if (formData.known_keywords.includes(trimmedKeyword)) {
			setAlert({ type: 'error', message: 'Keyword already exists' });
		}
	};

	const removeKeyword = (keyword: string) => {
		handleInputChange(
			'known_keywords',
			formData.known_keywords.filter(kw => kw !== keyword)
		);
	};

	const handleSubmitProfile = async () => {
		try {
			setIsSubmitting(true);
			setAlert(null);

			// Basic email validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				setAlert({ type: 'error', message: 'Please enter a valid email address' });
				return;
			}

			const result = await updateProfile(formData);

			if (result.success) {
				setAlert({ type: 'success', message: result.message || 'Profile updated successfully!' });
			} else {
				setAlert({ type: 'error', message: result.message || 'Failed to update profile' });
			}
		} catch (error) {
            console.log(error);
			setAlert({ type: 'error', message: 'An error occurred while updating profile' });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmitPassword = async () => {
		try {
			setIsSubmitting(true);
			setAlert(null);

			if (passwordData.new_password !== passwordData.confirm_password) {
				setAlert({ type: 'error', message: 'New passwords do not match' });
				return;
			}

			if (passwordData.new_password.length < 6) {
				setAlert({ type: 'error', message: 'New password must be at least 6 characters long' });
				return;
			}

			const result = await updateProfile({
				current_password: passwordData.current_password,
				new_password: passwordData.new_password,
			});

			if (result.success) {
				setAlert({ type: 'success', message: 'Password changed successfully!' });
				setPasswordData({
					current_password: '',
					new_password: '',
					confirm_password: '',
				});
				closePasswordModal();
			} else {
				setAlert({ type: 'error', message: result.message || 'Failed to change password' });
			}
		} catch (error) {
            console.log(error);
			setAlert({ type: 'error', message: 'An error occurred while changing password' });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleKeywordKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			addKeyword();
		}
	};

	if (loading) {
		return (
			<Container size="sm" py="xl">
				<Text>Loading...</Text>
			</Container>
		);
	}

	if (!user) {
		return null; // Will be redirected by useEffect
	}

	return (
		<Container size="md" py="xl">
			<Stack gap="lg">
				<Group justify="space-between">
					<Title order={2}>User Profile</Title>
					<Button variant="outline" onClick={() => router.back()}>
						Back
					</Button>
				</Group>

				{alert && (
					<Alert color={alert.type === 'success' ? 'green' : 'red'} onClose={() => setAlert(null)} withCloseButton>
						{alert.message}
					</Alert>
				)}

				<Paper shadow="md" p="lg">
					<Stack gap="md">
						<Title order={3}>Profile Information</Title>
						
						<TextInput
							label="Username"
							value={user.username}
							disabled
							description="Username cannot be changed"
						/>

						<TextInput
							label="Email"
							value={formData.email}
							onChange={(e) => handleInputChange('email', e.target.value)}
							placeholder="Enter your email"
							required
						/>

						<Textarea
							label="Bio"
							value={formData.bio}
							onChange={(e) => handleInputChange('bio', e.target.value)}
							placeholder="Tell us about yourself..."
							autosize
							minRows={3}
							maxRows={6}
						/>

						<Box>
							<Text fw={500} size="sm" mb="xs">
								Known Keywords
							</Text>
							<Text size="xs" c="dimmed" mb="sm">
								Add keywords that you do not need further explanation for.
							</Text>
							
							<Group mb="xs">
								<TextInput
									placeholder="Add a keyword..."
									value={newKeyword}
									onChange={(e) => setNewKeyword(e.target.value)}
									onKeyPress={handleKeywordKeyPress}
									style={{ flex: 1 }}
								/>
								<ActionIcon onClick={addKeyword} variant="filled" disabled={!newKeyword.trim()}>
									<Plus size={16} />
								</ActionIcon>
							</Group>

							<Flex wrap="wrap" gap="xs">
								{formData.known_keywords.map((keyword, index) => (
									<Badge
										key={index}
										variant="light"
										rightSection={
											<ActionIcon
												size="xs"
												variant="transparent"
												onClick={() => removeKeyword(keyword)}
											>
												<X size={10} />
											</ActionIcon>
										}
									>
										{keyword}
									</Badge>
								))}
								{formData.known_keywords.length === 0 && (
									<Text size="sm" c="dimmed">No keywords added yet</Text>
								)}
							</Flex>
						</Box>

						<Group justify="flex-end">
							<Button
								onClick={handleSubmitProfile}
								loading={isSubmitting}
								disabled={!formData.email.trim()}
								leftSection={<Check size={16} />}
							>
								Update Profile
							</Button>
						</Group>
					</Stack>
				</Paper>

				<Paper shadow="md" p="lg">
					<Stack gap="md">
						<Group justify="space-between">
							<Title order={3}>Security</Title>
							<Button
								variant="outline"
								leftSection={<Edit size={16} />}
								onClick={openPasswordModal}
							>
								Change Password
							</Button>
						</Group>
						<Text size="sm" c="dimmed">
							Change your password to keep your account secure
						</Text>
					</Stack>
				</Paper>
			</Stack>

			{/* Password Change Modal */}
			<Modal opened={passwordModalOpened} onClose={closePasswordModal} title="Change Password" size="md">
				<Stack gap="md">
					<PasswordInput
						label="Current Password"
						value={passwordData.current_password}
						onChange={(e) => handlePasswordChange('current_password', e.target.value)}
						placeholder="Enter your current password"
						required
					/>

					<PasswordInput
						label="New Password"
						value={passwordData.new_password}
						onChange={(e) => handlePasswordChange('new_password', e.target.value)}
						placeholder="Enter your new password"
						required
					/>

					<PasswordInput
						label="Confirm New Password"
						value={passwordData.confirm_password}
						onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
						placeholder="Confirm your new password"
						required
					/>

					<Group justify="flex-end" mt="md">
						<Button variant="outline" onClick={closePasswordModal}>
							Cancel
						</Button>
						<Button
							onClick={handleSubmitPassword}
							loading={isSubmitting}
							disabled={!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
						>
							Change Password
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Container>
	);
}