import '@/styles/globals.css';
import type { AppProps } from 'next/app';

// const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
