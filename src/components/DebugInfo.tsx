import { useLocation } from "react-router-dom";
import { env } from "@/config/env";

export const DebugInfo = () => {
  const location = useLocation();
  
  if (env.appEnv === 'production' && !env.debugMode) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">Debug Info</div>
      <div>Path: {location.pathname}</div>
      <div>API URL: {env.apiBaseUrl}</div>
      <div>Environment: {env.appEnv}</div>
      <div>Debug Mode: {env.debugMode ? 'ON' : 'OFF'}</div>
    </div>
  );
};