'use client';
import { useState } from 'react';
import {
	Container,
	Paper,
	Title,
	Text,
	TextInput,
	PasswordInput,
	Button,
	Anchor,
	Alert,
	Textarea,
	Group,
	Stack,
} from '@mantine/core';
import { AlertCircle, BookOpen } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function AuthPage() {
	const [isLogin, setIsLogin] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		bio: '',
	});

	const { login, signup } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			let result;
			if (isLogin) {
				result = await login(formData.username, formData.password);
			} else {
				result = await signup(
					formData.username,
					formData.email,
					formData.password,
					formData.bio
				);
			}

			if (!result.success) {
				setError(result.message);
			}
		} catch {
			setError(isLogin ? 'Login failed' : 'Signup failed');
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange =
		(field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			setFormData(prev => ({ ...prev, [field]: e.target.value }));
		};

	return (
		<Container size={420} my={40}>
			<Group justify="center" mb="xl">
				<BookOpen size={32} />
				<Title order={1}>Reading Helper</Title>
			</Group>

			<Paper withBorder shadow="md" p={30} mt={30} radius="md">
				<Title order={2} ta="center" mb="md">
					{isLogin ? 'Welcome back!' : 'Create account'}
				</Title>
				<Text c="dimmed" size="sm" ta="center" mb="xl">
					{isLogin ? "Don't have an account yet? " : 'Already have an account? '}
					<Anchor
						size="sm"
						component="button"
						type="button"
						onClick={() => {
							setIsLogin(!isLogin);
							setError('');
							setFormData({ username: '', email: '', password: '', bio: '' });
						}}
					>
						{isLogin ? 'Create account' : 'Sign in'}
					</Anchor>
				</Text>

				{error && (
					<Alert icon={<AlertCircle size={16} />} color="red" mb="md">
						{error}
					</Alert>
				)}

				<form onSubmit={handleSubmit}>
					<Stack>
						<TextInput
							label="Username"
							placeholder="Your username"
							required
							value={formData.username}
							onChange={handleInputChange('username')}
						/>

						{!isLogin && (
							<TextInput
								label="Email"
								placeholder="your@email.com"
								type="email"
								required
								value={formData.email}
								onChange={handleInputChange('email')}
							/>
						)}

						<PasswordInput
							label="Password"
							placeholder="Your password"
							required
							value={formData.password}
							onChange={handleInputChange('password')}
						/>

						{!isLogin && (
							<Textarea
								label="Bio (Optional)"
								placeholder="Tell us a bit more about yourself..."
								value={formData.bio}
								onChange={handleInputChange('bio')}
								autosize
								minRows={3}
							/>
						)}

						<Button type="submit" fullWidth loading={loading}>
							{isLogin ? 'Sign in' : 'Create account'}
						</Button>
					</Stack>
				</form>
			</Paper>

			<Text c="dimmed" size="sm" ta="center" mt="xl">
				Help you understand technical articles with keyword explanations
			</Text>
		</Container>
	);
}
