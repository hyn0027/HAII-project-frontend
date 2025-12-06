'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
	Container,
	Title,
	Text,
	Button,
	Alert,
	Card,
	Flex,
	Stack,
	Group,
	ActionIcon,
	Tooltip,
	Center,
	Box,
	Loader,
	Menu,
	useMantineColorScheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
	BookOpen,
	History,
	Sun,
	Moon,
	AlertCircle,
	User,
	LogOut,
	ArrowLeft,
	Trash2,
} from 'lucide-react';
import { type Keywords } from '@/lib/constants';
import { useAuth } from '@/components/AuthContext';
import AuthPage from '@/components/AuthPage';
import { apiClient } from '@/lib/auth';
import dynamic from 'next/dynamic';

function KeywordHighlight({ wordObj }: { wordObj: Record<string, string> }) {
	const hasExplanation = !!wordObj.explanation;

	if (hasExplanation) {
		return (
			<Tooltip inline multiline w="500" label={wordObj.explanation} position="top" withArrow>
				<Text
					component="span"
					style={{
						cursor: 'help',
						textDecoration: 'underline',
						fontWeight: 500,
					}}
				>
					{wordObj.word}
				</Text>
			</Tooltip>
		);
	}

	return (
		<Text
			component="span"
			style={{
				fontWeight: 500,
			}}
		>
			{wordObj.word}
		</Text>
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
				<Menu.Item leftSection={<LogOut size={14} />} color="red" onClick={logout}>
					Logout
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}

function ThemeToggle() {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();

	return (
		<ActionIcon onClick={toggleColorScheme} variant="subtle" aria-label="Toggle color scheme">
			{colorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
		</ActionIcon>
	);
}

const ClientOnlyThemeToggle = dynamic(() => Promise.resolve(ThemeToggle), {
	ssr: false,
	loading: () => (
		<ActionIcon variant="subtle" aria-label="Loading theme toggle">
			<div style={{ width: 18, height: 18, opacity: 0.5 }} />
		</ActionIcon>
	),
});

interface SavedPassage {
	id: number;
	split_result: string[][];
	split_result_with_explanations: Keywords;
}

export default function HistoryPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const [passages, setPassages] = useState<SavedPassage[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleting, setDeleting] = useState<number | null>(null);
	const [error, setError] = useState('');

	useEffect(() => {
		if (user) {
			fetchSavedPassages();
		}
	}, [user]);

	const fetchSavedPassages = async () => {
		setLoading(true);
		setError('');

		try {
			const response = await apiClient.get('/get_all_saved_passages/');
			setPassages(response.data.passages);
		} catch (err) {
			if (axios.isAxiosError(err) && err.response?.status === 401) {
				setError('Please log in again to continue.');
			} else {
				setError('Failed to fetch saved passages. Please try again.');
			}
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleDeletePassage = async (passageId: number) => {
		setDeleting(passageId);
		setError('');

		try {
			await apiClient.post('/delete_saved_passage/', {
				passage_id: passageId,
			});

			setPassages(passages.filter(passage => passage.id !== passageId));

			notifications.show({
				title: 'Success!',
				message: 'Passage deleted successfully',
				color: 'green',
			});
		} catch (err) {
			if (axios.isAxiosError(err) && err.response?.status === 401) {
				setError('Please log in again to continue.');
			} else {
				setError('Failed to delete passage. Please try again.');
			}
			console.error(err);
		} finally {
			setDeleting(null);
		}
	};

	if (authLoading) {
		return (
			<Container size="sm" mt={50}>
				<Center>
					<Loader size="lg" />
				</Center>
			</Container>
		);
	}

	if (!user) {
		return <AuthPage />;
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
								<History size={24} color="#3b82f6" />
							</Box>
							<div>
								<Title order={2} size="h3">
									Reading History
								</Title>
								<Text size="sm" c="dimmed">
									Your saved passages and explanations
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
					<Group>
						<Button
							variant="subtle"
							leftSection={<ArrowLeft size={16} />}
							onClick={() => router.push('/')}
						>
							Back to Main Page
						</Button>
					</Group>

					{error && (
						<Alert
							icon={<AlertCircle size={16} />}
							title="Error"
							color="red"
							variant="light"
						>
							{error}
						</Alert>
					)}

					{loading && (
						<Center>
							<Loader size="lg" />
						</Center>
					)}

					{/* Saved Passages */}
					{!loading && passages.length > 0 && (
						<Stack gap="lg">
							<Title order={3}>Your Saved Passages ({passages.length})</Title>
							{passages.map(passage => (
								<Card key={passage.id} shadow="sm" padding="lg" withBorder>
									<Stack gap="md">
										<Flex justify="space-between" align="center">
											<Group gap="sm">
												<BookOpen size={16} />
												<Text size="sm" c="dimmed">
													Passage #{passage.id}
												</Text>
											</Group>
											<ActionIcon
												variant="subtle"
												color="red"
												onClick={() => handleDeletePassage(passage.id)}
												loading={deleting === passage.id}
												aria-label="Delete passage"
											>
												<Trash2 size={16} />
											</ActionIcon>
										</Flex>

										<Stack gap="md">
											{passage.split_result_with_explanations.map(
												(paragraph, pIdx) => (
													<Card
														key={pIdx}
														withBorder
														padding="md"
														bg="gray.0"
													>
														<Text
															style={{
																lineHeight: 1.6,
																textAlign: 'justify',
															}}
														>
															{paragraph.map((wordObj, wIdx) => {
																const currentWord = wordObj.word;
																const nextWord =
																	wIdx < paragraph.length - 1
																		? paragraph[wIdx + 1].word
																		: '';
																const shouldAddSpace =
																	wIdx < paragraph.length - 1 &&
																	!/[(\[{]$/.test(currentWord) &&
																	!/^[.,;:!?)\]}]/.test(nextWord);

																return (
																	<span key={wIdx}>
																		<KeywordHighlight
																			wordObj={wordObj}
																		/>
																		{shouldAddSpace && ' '}
																	</span>
																);
															})}
														</Text>
													</Card>
												)
											)}
										</Stack>
									</Stack>
								</Card>
							))}
						</Stack>
					)}

					{/* Empty State */}
					{!loading && passages.length === 0 && !error && (
						<Card shadow="sm" padding="xl">
							<Center>
								<Stack gap="md" align="center">
									<Box
										style={{
											width: '64px',
											height: '64px',
											backgroundColor: '#dbeafe',
											borderRadius: '50%',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<History size={32} color="#3b82f6" />
									</Box>
									<div>
										<Title order={3} ta="center">
											No Saved Passages Yet
										</Title>
										<Text ta="center" c="dimmed" maw="400px">
											Start reading articles and save passages with
											explanations to see them here.
										</Text>
									</div>
									<Button onClick={() => router.push('/')}>Start Reading</Button>
								</Stack>
							</Center>
						</Card>
					)}
				</Stack>
			</Container>

			{/* Footer */}
			<Box style={{ borderTop: '1px solid #e5e7eb', marginTop: '3rem' }} />
		</Box>
	);
}
