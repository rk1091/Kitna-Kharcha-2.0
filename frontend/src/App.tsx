import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="kitna-kharcha-theme">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
