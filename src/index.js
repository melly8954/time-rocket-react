import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';  // CSS가 없어도 동작은 하지만, 에러가 없다면 무시 가능

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
