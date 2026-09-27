import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/libre-baskerville/latin-400.css';
import '@fontsource/libre-baskerville/latin-400-italic.css';
import '@fontsource/libre-baskerville/latin-700.css';
import '@fontsource/oswald/latin-500.css';
import { App } from './App';
import './index.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
