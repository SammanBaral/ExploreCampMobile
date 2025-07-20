import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'leaflet/dist/leaflet.css';

// Add error handling for the root creation
try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
        throw new Error("Root element not found");
    }

    const root = createRoot(rootElement);
    root.render(<App />);
} catch (error) {
    console.error("Failed to initialize app:", error);
    // Fallback for older browsers or WebView
    const rootElement = document.getElementById("root");
    if (rootElement) {
        rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>App Loading Error</h1>
        <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="window.location.reload()">Reload</button>
      </div>
    `;
    }
}
