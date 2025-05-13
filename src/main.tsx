
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Make sure the root element exists and we're rendering to it
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found");
  const body = document.body;
  const newRoot = document.createElement("div");
  newRoot.id = "root";
  body.appendChild(newRoot);
}

createRoot(document.getElementById("root")!).render(<App />);
