import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
import { StoreProvider } from './hooks/store';
import { validateContent, errorsOnly } from './services/validateContent';
import {
  certifications,
  domains,
  taskStatements,
  lessons,
  questions,
  flashFire,
  labs,
  sources,
} from './data';
import './index.css';

// Fail loudly in development if content is broken.
if (import.meta.env.DEV) {
  const issues = validateContent({ certifications, domains, taskStatements, lessons, questions, flashFire, labs, sources });
  const errors = errorsOnly(issues);
  if (errors.length > 0) {
    console.error('[content-validation] %d error(s) found:', errors.length);
    errors.forEach((e) => console.error(`  ${e.code} @ ${e.entity}: ${e.message}`));
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
);
