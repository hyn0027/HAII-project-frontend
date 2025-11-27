import type { Metadata } from 'next';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

export const metadata: Metadata = {
	title: 'Technical Article Reading Helper',
	description: 'AI-powered tool to help understand technical articles with keyword explanations',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<MantineProvider>{children}</MantineProvider>
			</body>
		</html>
	);
}
