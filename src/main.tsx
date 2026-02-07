import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSecurityCleanup } from "./utils/securityCleanup";

// Initialize security cleanup on app start
initSecurityCleanup();

createRoot(document.getElementById("root")!).render(<App />);
