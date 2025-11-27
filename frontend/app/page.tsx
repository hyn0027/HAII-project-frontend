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
	useMantineColorScheme,
} from '@mantine/core';
import { BookOpen, Newspaper, Lightbulb, Sun, Moon, AlertCircle } from 'lucide-react';
import {
	API_ENDPOINT_GET_KEYWORD,
	API_ENDPOINT_NEW_KEYWORD,
	TIP_STORAGE_KEY,
	type Keywords,
} from '@/lib/constants';

function KeywordHighlight({
	wordObj,
	loadingWord,
	onWordClick,
}: {
	wordObj: Record<string, string>;
	loadingWord: string | null;
	onWordClick: (word: string) => void;
}) {
	const isLoading = loadingWord === wordObj.word;
	const hasExplanation = !!wordObj.explanation;
	const isClickable = !hasExplanation && !loadingWord;

	// Words with explanations: show tooltip, not clickable
	if (hasExplanation) {
		return (
			<Tooltip label={wordObj.explanation} position="top" withArrow>
				<Text
					component="span"
					style={{
						cursor: 'help',
						textDecoration: 'underline',
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
			}}
			onClick={isClickable ? () => onWordClick(wordObj.word) : undefined}
		>
			{wordObj.word}
		</Text>
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
	const [passage, setPassage] = useState('');
	const [keywords, setKeywords] = useState<Keywords>([]);
	const [loading, setLoading] = useState(false);
	const [loadingWord, setLoadingWord] = useState<string | null>(null);
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

	const handleWordClick = async (word: string) => {
		setLoadingWord(word);
		setError('');

		try {
			const res = await axios.post(API_ENDPOINT_NEW_KEYWORD, {
				keywords_with_explanations: keywords,
				requested_word: word,
			});
			setKeywords(res.data.keywords_with_explanations);
		} catch (err) {
			setError('Failed to fetch explanation for the selected word. Please try again.');
			console.error(err);
		} finally {
			setLoadingWord(null);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!passage.trim()) return;

		setLoading(true);
		setError('');
		setKeywords([]);

		try {
			const res = await axios.post(API_ENDPOINT_GET_KEYWORD, { passage });
			setKeywords(res.data.keywords_with_explanations);
		} catch (err) {
			setError(
				'Failed to fetch keyword explanations. Please check if the backend server is running.'
			);
			console.error(err);
		} finally {
			setLoading(false);
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
									Technical Article Reading Helper
								</Title>
								<Text size="sm" c="dimmed">
									AI-powered keyword explanations
								</Text>
							</div>
						</Group>
						<ClientOnlyThemeToggle />
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
								</Flex>

								{showTip && (
									<Alert
										icon={<Lightbulb size={16} />}
										withCloseButton
										onClose={handleDismissTip}
									>
										Hover over underlined terms to see explanations. Click on
										words to get new explanations.
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
