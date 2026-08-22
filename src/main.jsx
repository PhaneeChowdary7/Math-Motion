import { createRoot } from 'react-dom/client';
import 'katex/dist/katex.min.css';
import App from './App.jsx';
import './styles.css';

if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('reveal-ready');
}

createRoot(document.getElementById('root')).render(<App />);
