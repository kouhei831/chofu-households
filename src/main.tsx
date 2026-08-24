import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../app/globals.css';
import Visualization from '../app/visualization';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Visualization />
  </StrictMode>,
);
