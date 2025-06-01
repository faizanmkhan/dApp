import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider';
export default async function Root({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<MiniKitProvider>
				<body className={inter.className}>{children}</body>
			</MiniKitProvider>
		</html>
	)
}

createRoot(document.getElementById("root")!).render(<App />);
