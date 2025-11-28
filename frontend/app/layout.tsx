import type { Metadata } from 'next';
import { MantineProvider } from '@mantine/core';
import { AuthProvider } from '@/components/AuthContext';
import '@mantine/core/styles.css';

export const metadata: Metadata = {
	title: 'Reading Helper',
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
				<MantineProvider>
					<AuthProvider>{children}</AuthProvider>
				</MantineProvider>
			</body>
		</html>
	);
}
