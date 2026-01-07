import { useApp } from "@/context/AppContext";

export const DebugInfo = () => {
  const { masterSkills, jobRoles, loading, error, isAuthenticated } = useApp();

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
        <div>Loading: {loading ? '⏳' : '✅'}</div>
        <div>Master Skills: {masterSkills.length}</div>
        <div>Job Roles: {jobRoles.length}</div>
        {error && <div className="text-red-400">Error: {error}</div>}
      </div>
    </div>
  );
};