import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6 text-center min-h-[60vh]">
      <h1 className="text-6xl font-bold text-on-surface/20 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-on-surface mb-2">Page Not Found</h2>
      <p className="text-on-surface-variant mb-6">The page you are looking for doesn't exist or has been moved.</p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-gold-accent text-surface font-semibold rounded-xl hover:bg-opacity-90 transition-all"
      >
        Return to Home
      </Link>
    </div>
  );
}
