import { Toaster } from './components/ui/sonner';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CityProvider } from './context/CityContext';

export default function App() {
  return (
    <ErrorBoundary>
      <CityProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" theme="dark" />
      </CityProvider>
    </ErrorBoundary>
  );
}
