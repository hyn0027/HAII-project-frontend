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
import {
	BookOpen,
	Sparkles,
	Lightbulb,
	Sun,
	Moon,
	AlertCircle,
} from 'lucide-react';
import { API_ENDPOINT_GET_KEYWORD, TIP_STORAGE_KEY, type Keywords } from '@/lib/constants';

function KeywordHighlight({ wordObj }: { wordObj: Record<string, string> }) {
	if (!wordObj.explanation) return <>{wordObj.word}</>;

	return (
		<Tooltip label={wordObj.explanation} position="top" withArrow>
			<Text
				component="span"
				style={{
					backgroundColor: '#dbeafe',
					color: '#1e40af',
					padding: '2px 4px',
					borderRadius: '4px',
					cursor: 'pointer',
					fontWeight: 500,
				}}
			>
				{wordObj.word}
			</Text>
		</Tooltip>
	);
}

function ThemeToggle() {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();

	return (
		<ActionIcon
			onClick={toggleColorScheme}
			variant="subtle"
			size="lg"
			aria-label="Toggle color scheme"
		>
			{colorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
		</ActionIcon>
	);
}

const ClientOnlyThemeToggle = dynamic(() => Promise.resolve(ThemeToggle), {
	ssr: false,
	loading: () => (
		<ActionIcon variant="subtle" size="lg" aria-label="Loading theme toggle">
			<div style={{ width: 18, height: 18, opacity: 0.5 }} />
		</ActionIcon>
	),
});

export default function Home() {
	const [passage, setPassage] = useState('');
	const [keywords, setKeywords] = useState<Keywords>([]);
	const [loading, setLoading] = useState(false);
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
								<Sparkles size={20} />
								<Title order={3}>Enter Your Article</Title>
							</Group>
							<form onSubmit={handleSubmit}>
								<Stack gap="md">
									<Textarea
										value={passage}
										onChange={e =>
											setPassage(e.target.value)
										}
										placeholder="Paste your technical article here. We will help you identify and explain complex terms and concepts..."
										minRows={8}
										autosize
									/>
									<Flex
										justify="space-between"
										align="center"
									>
										<Badge variant="light" color="gray">
											{passage.length} characters
										</Badge>
										<Button
											type="submit"
											disabled={
												loading || !passage.trim()
											}
											loading={loading}
											leftSection={<Sparkles size={16} />}
										>
											{loading
												? 'Processing...'
												: 'Get Explanations'}
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
										<Title order={3}>
											Keyword Explanations
										</Title>
									</Group>
									{!showTip && (
										<Button
											variant="subtle"
											size="sm"
											onClick={handleShowTip}
											leftSection={
												<Lightbulb size={16} />
											}
										>
											Show tip
										</Button>
									)}
								</Flex>

								{showTip && (
									<Alert
										icon={<Lightbulb size={16} />}
										title="Tip"
										color="blue"
										variant="light"
										withCloseButton
										onClose={handleDismissTip}
									>
										Hover over highlighted terms to see
										their explanations.
									</Alert>
								)}

								<Stack gap="md">
									{keywords.map((paragraph, pIdx) => (
										<Card
											key={pIdx}
											withBorder
											padding="md"
										>
											<Text
												style={{
													lineHeight: 1.6,
													textAlign: 'justify',
												}}
											>
												{paragraph.map(
													(wordObj, wIdx) => {
														const currentWord =
															wordObj.word;
														const nextWord =
															wIdx <
															paragraph.length - 1
																? paragraph[
																		wIdx + 1
																	].word
																: '';
														const shouldAddSpace =
															wIdx <
																paragraph.length -
																	1 &&
															!/[(\[{]$/.test(
																currentWord
															) &&
															!/^[.,;:!?)\]}]/.test(
																nextWord
															);

														return (
															<span key={wIdx}>
																<KeywordHighlight
																	wordObj={
																		wordObj
																	}
																/>
																{shouldAddSpace &&
																	' '}
															</span>
														);
													}
												)}
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
										<Text
											ta="center"
											c="dimmed"
											maw="400px"
										>
											Paste a technical article above and
											we will identify complex terms and
											provide explanations.
										</Text>
									</div>
								</Stack>
							</Center>
						</Card>
					)}
				</Stack>
			</Container>

			{/* Footer */}
			<Box
				style={{ borderTop: '1px solid #e5e7eb', marginTop: '3rem' }}
			/>
		</Box>
	);
}
