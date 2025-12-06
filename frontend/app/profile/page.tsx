'use client';
import React, { useState, useEffect, useRef } from 'react';
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
	Card,
	ScrollArea,
	Menu,
	useMantineColorScheme,
} from '@mantine/core';
import {
	Plus,
	Edit,
	Check,
	X,
	Trash,
	AlertTriangle,
	User,
	LogOut,
	BookOpen,
	Sun,
	Moon,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useDisclosure } from '@mantine/hooks';

const ClientOnlyThemeToggle = dynamic(() => Promise.resolve(ThemeToggle), {
	ssr: false,
});

function ThemeToggle() {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	return (
		<ActionIcon
			onClick={() => toggleColorScheme()}
			variant="subtle"
			aria-label="Toggle color scheme"
		>
			{colorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
		</ActionIcon>
	);
}

function UserMenu() {
	const { user, logout } = useAuth();
	const router = useRouter();

	if (!user) return null;

	const handleProfileClick = () => {
		router.push('/profile');
	};

	const handleHomeClick = () => {
		router.push('/');
	};

	const handleHistoryClick = () => {
		router.push('/history');
	};

	return (
		<Menu shadow="md" width={200}>
			<Menu.Target>
				<ActionIcon variant="subtle" aria-label="User menu">
					<User size={18} />
				</ActionIcon>
			</Menu.Target>

			<Menu.Dropdown>
				<Menu.Label>Welcome, {user.username}!</Menu.Label>
				<Menu.Item leftSection={<BookOpen size={14} />} onClick={handleHomeClick}>
					Home
				</Menu.Item>
				<Menu.Item leftSection={<User size={14} />} onClick={handleProfileClick}>
					Profile
				</Menu.Item>
				<Menu.Item leftSection={<BookOpen size={14} />} onClick={handleHistoryClick}>
					History
				</Menu.Item>
				<Menu.Divider />
				<Menu.Item
					color="red"
					leftSection={<LogOut size={14} />}
					onClick={() => {
						logout();
						router.push('/');
					}}
				>
					Logout
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}

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
	const { user, updateProfile, loading, refreshUser, clearKeywordHistory } = useAuth();
	const router = useRouter();
	const hasRefreshed = useRef(false);
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
	const [passwordModalOpened, { open: openPasswordModal, close: closePasswordModal }] =
		useDisclosure(false);
	const [clearAllModalOpened, { open: openClearAllModal, close: closeClearAllModal }] =
		useDisclosure(false);

	useEffect(() => {
		if (!loading && !user) {
			router.push('/');
		}
	}, [user, loading, router]);

	useEffect(() => {
		if (!loading && user && !hasRefreshed.current) {
			refreshUser();
			hasRefreshed.current = true;
		}
	}, [user, loading, refreshUser]);

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
				setAlert({
					type: 'success',
					message: result.message || 'Profile updated successfully!',
				});
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
				setAlert({
					type: 'error',
					message: 'New password must be at least 6 characters long',
				});
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
			refreshUser();
		}
	};

	const handleClearAllHistory = async () => {
		try {
			setIsSubmitting(true);
			setAlert(null);

			const result = await clearKeywordHistory();

			if (result.success) {
				setAlert({
					type: 'success',
					message: 'All keyword history cleared successfully!',
				});
				closeClearAllModal();
			} else {
				setAlert({ type: 'error', message: result.message || 'Failed to clear history' });
			}
		} catch (error) {
			console.log(error);
			setAlert({ type: 'error', message: 'An error occurred while clearing history' });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClearIndividualHistory = async (keyword: string) => {
		try {
			setIsSubmitting(true);
			setAlert(null);

			const result = await clearKeywordHistory([keyword]);

			if (result.success) {
				setAlert({
					type: 'success',
					message: `History for "${keyword}" cleared successfully!`,
				});
			} else {
				setAlert({ type: 'error', message: result.message || 'Failed to clear history' });
			}
		} catch (error) {
			console.log(error);
			setAlert({ type: 'error', message: 'An error occurred while clearing history' });
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
		<Box style={{ minHeight: '100vh' }}>
			{/* Header */}
			<Box
				style={{
					borderBottom: '1px solid #e5e7eb',
					padding: '1rem 0',
				}}
			>
				<Container size="xl">
					<Flex justify="space-between" align="center">
						<Group gap="md">
							<Box
								style={{
									padding: '8px',
									backgroundColor: '#dbeafe',
									borderRadius: '8px',
									display: 'flex',
								}}
							>
								<User size={24} color="#3b82f6" />
							</Box>
							<div>
								<Title order={2} size="h3">
									User Profile
								</Title>
								<Text size="sm" c="dimmed">
									Manage your account settings and preferences
								</Text>
							</div>
						</Group>
						<Group>
							<UserMenu />
							<ClientOnlyThemeToggle />
						</Group>
					</Flex>
				</Container>
			</Box>

			<Container size="xl" py="xl">
				<Stack gap="xl">
					{alert && (
						<Alert
							color={alert.type === 'success' ? 'green' : 'red'}
							onClose={() => setAlert(null)}
							withCloseButton
						>
							{alert.message}
						</Alert>
					)}

					<Paper shadow="sm" p="lg">
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
								onChange={e => handleInputChange('email', e.target.value)}
								placeholder="Enter your email"
								required
							/>

							<Textarea
								label="Bio"
								value={formData.bio}
								onChange={e => handleInputChange('bio', e.target.value)}
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
										onChange={e => setNewKeyword(e.target.value)}
										onKeyPress={handleKeywordKeyPress}
										style={{ flex: 1 }}
									/>
									<ActionIcon
										onClick={addKeyword}
										variant="filled"
										disabled={!newKeyword.trim()}
									>
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
										<Text size="sm" c="dimmed">
											No keywords added yet
										</Text>
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

					{/* Keyword Explanation History Section */}
					<Paper shadow="sm" p="lg">
						<Stack gap="md">
							<Group justify="space-between">
								<div>
									<Title order={3}>Keyword Learning History</Title>
									<Text size="sm" c="dimmed">
										View and manage your keyword explanation history
									</Text>
								</div>
								{user?.all_keyword_explanation_pairs &&
									user.all_keyword_explanation_pairs.length > 0 && (
										<Button
											variant="outline"
											color="red"
											leftSection={<Trash size={16} />}
											onClick={openClearAllModal}
										>
											Clear All History
										</Button>
									)}
							</Group>

							{user?.all_keyword_explanation_pairs &&
							user.all_keyword_explanation_pairs.length > 0 ? (
								<ScrollArea h={400}>
									<Stack gap="sm">
										{user.all_keyword_explanation_pairs.map((pair, index) => (
											<Card key={index} p="md" withBorder>
												<Group justify="space-between" align="flex-start">
													<Box style={{ flex: 1 }}>
														<Group gap="xs" mb="xs">
															<Badge variant="light" color="blue">
																{pair.keyword}
															</Badge>
														</Group>
														<Text size="sm" c="dimmed" mb="xs">
															{pair.explanation}
														</Text>
														{pair.reason && (
															<Text size="xs" c="dimmed" fs="italic">
																Reason: {pair.reason}
															</Text>
														)}
													</Box>
													<ActionIcon
														color="red"
														variant="light"
														onClick={() =>
															handleClearIndividualHistory(
																pair.keyword
															)
														}
														disabled={isSubmitting}
													>
														<Trash size={14} />
													</ActionIcon>
												</Group>
											</Card>
										))}
									</Stack>
								</ScrollArea>
							) : (
								<Text size="sm" c="dimmed" ta="center" py="xl">
									No keyword explanations learned yet. Start reading passages to
									build your vocabulary history!
								</Text>
							)}
						</Stack>
					</Paper>

					<Paper shadow="sm" p="lg">
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
				<Modal
					opened={passwordModalOpened}
					onClose={closePasswordModal}
					title="Change Password"
					size="md"
				>
					<Stack gap="md">
						<PasswordInput
							label="Current Password"
							value={passwordData.current_password}
							onChange={e => handlePasswordChange('current_password', e.target.value)}
							placeholder="Enter your current password"
							required
						/>

						<PasswordInput
							label="New Password"
							value={passwordData.new_password}
							onChange={e => handlePasswordChange('new_password', e.target.value)}
							placeholder="Enter your new password"
							required
						/>

						<PasswordInput
							label="Confirm New Password"
							value={passwordData.confirm_password}
							onChange={e => handlePasswordChange('confirm_password', e.target.value)}
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
								disabled={
									!passwordData.current_password ||
									!passwordData.new_password ||
									!passwordData.confirm_password
								}
							>
								Change Password
							</Button>
						</Group>
					</Stack>
				</Modal>

				{/* Clear All History Confirmation Modal */}
				<Modal
					opened={clearAllModalOpened}
					onClose={closeClearAllModal}
					title={
						<Group gap="xs">
							<AlertTriangle size={20} color="red" />
							<Text fw={500}>Clear All Keyword History</Text>
						</Group>
					}
					size="md"
				>
					<Stack gap="md">
						<Text>
							Are you sure you want to clear all your keyword learning history? This
							action cannot be undone.
						</Text>

						<Group justify="flex-end" mt="md">
							<Button variant="outline" onClick={closeClearAllModal}>
								Cancel
							</Button>
							<Button
								color="red"
								onClick={handleClearAllHistory}
								loading={isSubmitting}
							>
								Clear All History
							</Button>
						</Group>
					</Stack>
				</Modal>
			</Container>
		</Box>
	);
}
