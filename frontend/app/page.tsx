'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import {
	Container,
	Title,
	Text,
	Textarea,
	Button,
	Alert,
	Badge,
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
	Newspaper,
	Lightbulb,
	Sun,
	Moon,
	AlertCircle,
	User,
	LogOut,
	Save,
	History,
} from 'lucide-react';
import { TIP_STORAGE_KEY, type Keywords } from '@/lib/constants';
import { useAuth } from '@/components/AuthContext';
import AuthPage from '@/components/AuthPage';
import { apiClient } from '@/lib/auth';
import { useRouter } from 'next/navigation';

function KeywordHighlight({
	wordObj,
	loadingWord,
	onWordClick,
	onWordRightClick,
}: {
	wordObj: Record<string, string>;
	loadingWord: string | null;
	onWordClick: (word: string) => void;
	onWordRightClick: (word: string) => void;
}) {
	const isLoading = loadingWord === wordObj.word;
	const hasExplanation = !!wordObj.explanation;
	const isClickable = !hasExplanation && !loadingWord;

	// Words with explanations: show tooltip, right-clickable
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
					onContextMenu={e => {
						e.preventDefault();
						onWordRightClick(wordObj.word);
					}}
				>
					{wordObj.word}
				</Text>
			</Tooltip>
		);
	}

	// Words without explanations: clickable or loading
	return (
		<Text
			component="span"
			style={{
				backgroundColor: isLoading ? '#fef3c7' : 'inherit',
				color: isLoading ? '#92400e' : 'inherit',
				cursor: isClickable ? 'pointer' : 'default',
				fontWeight: 500,
			}}
			onClick={isClickable ? () => onWordClick(wordObj.word) : undefined}
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
				<Menu.Item leftSection={<User size={14} />} onClick={handleProfileClick}>
					Profile
				</Menu.Item>
				<Menu.Item leftSection={<History size={14} />} onClick={handleHistoryClick}>
					History
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

export default function Home() {
	const { user, loading: authLoading } = useAuth();
	const [passage, setPassage] = useState('');
	const [keywords, setKeywords] = useState<Keywords>([]);
	const [loading, setLoading] = useState(false);
	const [loadingWord, setLoadingWord] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [showTip, setShowTip] = useState(true);

	useEffect(() => {
		const tipDismissed = localStorage.getItem(TIP_STORAGE_KEY);
		setShowTip(tipDismissed !== 'true');
	}, []);

	const handleDismissTip = () => {
		setShowTip(false);
		localStorage.setItem(TIP_STORAGE_KEY, 'true');
	};

	const handleShowTip = () => {
		setShowTip(true);
		localStorage.removeItem(TIP_STORAGE_KEY);
	};

	// Show loading spinner while checking authentication
	if (authLoading) {
		return (
			<Container size="sm" mt={50}>
				<Center>
					<Loader size="lg" />
				</Center>
			</Container>
		);
	}

	// Show auth page if not logged in
	if (!user) {
		return <AuthPage />;
	}

	const handleWordClick = async (word: string) => {
		setLoadingWord(word);
		setError('');

		try {
			const response = await apiClient.post('/new_keyword/', {
				keywords_with_explanations: keywords,
				requested_word: word,
			});
			setKeywords(response.data.keywords_with_explanations);
		} catch (err) {
			if (axios.isAxiosError(err) && err.response?.status === 401) {
				setError('Please log in again to continue.');
			} else {
				setError('Failed to fetch explanation for the selected word. Please try again.');
			}
			console.error(err);
		} finally {
			setLoadingWord(null);
		}
	};

	const handleWordRightClick = async (word: string) => {
		setError('');

		try {
			const response = await apiClient.post('/add_known_word_to_passage/', {
				keywords_with_explanations: keywords,
				word: word,
			});
			setKeywords(response.data.keywords_with_explanations);
			console.log('Marked word as known:', word);
		} catch (err) {
			if (axios.isAxiosError(err) && err.response?.status === 401) {
				setError('Please log in again to continue.');
			} else {
				setError('Failed to mark word as known. Please try again.');
			}
			console.error(err);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!passage.trim()) return;

		setLoading(true);
		setError('');
		setKeywords([]);

		try {
			const response = await apiClient.post('/get_keywords/', { passage });
			setKeywords(response.data.keywords_with_explanations);
		} catch (err) {
			if (axios.isAxiosError(err) && err.response?.status === 401) {
				setError('Please log in again to continue.');
			} else {
				setError(
					'Failed to fetch keyword explanations. Please check if the backend server is running.'
				);
			}
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleSavePassage = async () => {
		setSaving(true);
		setError('');

		try {
			await apiClient.post('/save_passage/', {
				keywords_with_explanations: keywords,
			});
			notifications.show({
				title: 'Success!',
				message: 'Passage saved successfully',
				color: 'green',
				icon: <Save size={16} />,
			});
		} catch (err) {
			if (axios.isAxiosError(err) && err.response?.status === 401) {
				setError('Please log in again to continue.');
			} else {
				setError('Failed to save passage. Please try again.');
			}
			console.error(err);
		} finally {
			setSaving(false);
		}
	};

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
								<BookOpen size={24} color="#3b82f6" />
							</Box>
							<div>
								<Title order={2} size="h3">
									Reading Helper
								</Title>
								<Text size="sm" c="dimmed">
									Help you understand technical articles with keyword explanations
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
					{/* Input Section */}
					<Card shadow="sm" padding="lg">
						<Stack gap="md">
							<Group gap="sm">
								<Newspaper size={20} />
								<Title order={3}>Enter an article to read!</Title>
							</Group>
							<form onSubmit={handleSubmit}>
								<Stack gap="md">
									<Textarea
										value={passage}
										onChange={e => setPassage(e.target.value)}
										placeholder="Paste your article here. We will help you identify and explain complex terms and concepts..."
										minRows={8}
										autosize
									/>
									<Flex justify="space-between" align="center">
										<Badge variant="light" color="gray">
											{passage.length} characters
										</Badge>
										<Button
											type="submit"
											disabled={loading || !passage.trim()}
											loading={loading}
										>
											{loading ? 'Processing...' : 'Get Explanations'}
										</Button>
									</Flex>
								</Stack>
							</form>
						</Stack>
					</Card>

					{/* Error Message */}
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

					{/* Results Section */}
					{keywords.length > 0 && (
						<Card shadow="sm" padding="lg">
							<Stack gap="md">
								<Flex justify="space-between" align="center">
									<Group gap="sm">
										<BookOpen size={20} />
										<Title order={3}>Article with Keyword Explanations</Title>
									</Group>
									<Group>
										<Button
											variant="filled"
											color="green"
											size="sm"
											onClick={handleSavePassage}
											loading={saving}
											leftSection={<Save size={16} />}
										>
											{saving ? 'Saving...' : 'Save Passage'}
										</Button>
										{!showTip && (
											<Button
												variant="subtle"
												size="sm"
												onClick={handleShowTip}
												leftSection={<Lightbulb size={16} />}
											>
												Show tip
											</Button>
										)}
									</Group>
								</Flex>

								{showTip && (
									<Alert
										icon={<Lightbulb size={16} />}
										withCloseButton
										onClose={handleDismissTip}
									>
										Hover over underlined terms to see explanations. Click on
										words to get new explanations. Right-click on explained
										words to mark them as known.
									</Alert>
								)}

								<Stack gap="md">
									{keywords.map((paragraph, pIdx) => (
										<Card key={pIdx} withBorder padding="md">
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
																loadingWord={loadingWord}
																onWordClick={handleWordClick}
																onWordRightClick={
																	handleWordRightClick
																}
															/>
															{shouldAddSpace && ' '}
														</span>
													);
												})}
											</Text>
										</Card>
									))}
								</Stack>
							</Stack>
						</Card>
					)}

					{/* Empty State */}
					{!keywords.length && !loading && !error && (
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
										<BookOpen size={32} color="#3b82f6" />
									</Box>
									<div>
										<Title order={3} ta="center">
											Ready to Help You Read
										</Title>
										<Text ta="center" c="dimmed" maw="400px">
											Paste a technical article above and we will identify
											complex terms and provide explanations.
										</Text>
									</div>
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
