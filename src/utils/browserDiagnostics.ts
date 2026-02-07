// Browser diagnostics utility for authentication issues

export interface BrowserDiagnostics {
  hasExtensions: boolean;
  popupsBlocked: boolean;
  cookiesEnabled: boolean;
  localStorageEnabled: boolean;
  hasSecurityPolicies: boolean;
  userAgent: string;
  recommendations: string[];
}

export const runBrowserDiagnostics = (): BrowserDiagnostics => {
  const diagnostics: BrowserDiagnostics = {
    hasExtensions: false,
    popupsBlocked: false,
    cookiesEnabled: true,
    localStorageEnabled: true,
    hasSecurityPolicies: false,
    userAgent: navigator.userAgent,
    recommendations: []
  };

  // Check for browser extensions
  try {
    diagnostics.hasExtensions = !!(
      (window as any).chrome?.runtime ||
      document.querySelector('[data-extension-id]') ||
      navigator.userAgent.includes('Extension') ||
      // Check for common extension indicators
      document.querySelector('[data-adblock]') ||
      document.querySelector('[data-ghostery]') ||
      (window as any).adblockDetected
    );
  } catch (error) {
  }

  // Check if popups are blocked (basic test)
  try {
    const popup = window.open('', '_blank', 'width=1,height=1');
    if (!popup || popup.closed) {
      diagnostics.popupsBlocked = true;
    } else {
      popup.close();
    }
  } catch (error) {
    diagnostics.popupsBlocked = true;
  }

  // Check cookies
  try {
    document.cookie = 'test=1; SameSite=Strict';
    diagnostics.cookiesEnabled = document.cookie.includes('test=1');
    // Clean up test cookie
    document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  } catch (error) {
    diagnostics.cookiesEnabled = false;
  }

  // Check localStorage
  try {
    localStorage.setItem('test', '1');
    diagnostics.localStorageEnabled = localStorage.getItem('test') === '1';
    localStorage.removeItem('test');
  } catch (error) {
    diagnostics.localStorageEnabled = false;
  }

  // Check for strict security policies (COEP/CORP)
  try {
    // Check if we're in a secure context with strict policies
    const hasStrictPolicies = !!(
      window.location.protocol === 'https:' &&
      (document.querySelector('meta[http-equiv="Cross-Origin-Embedder-Policy"]') ||
       document.querySelector('meta[http-equiv="Cross-Origin-Resource-Policy"]'))
    );
    diagnostics.hasSecurityPolicies = hasStrictPolicies;
  } catch (error) {
    diagnostics.hasSecurityPolicies = false;
  }

  // Generate recommendations
  if (diagnostics.hasExtensions) {
    diagnostics.recommendations.push('Try disabling browser extensions temporarily');
    diagnostics.recommendations.push('Use incognito/private mode to bypass extensions');
  }

  if (diagnostics.popupsBlocked) {
    diagnostics.recommendations.push('Allow popups for this site');
    diagnostics.recommendations.push('Check browser popup blocker settings');
  }

  if (!diagnostics.cookiesEnabled) {
    diagnostics.recommendations.push('Enable cookies for authentication');
    diagnostics.recommendations.push('Check browser privacy settings');
  }

  if (!diagnostics.localStorageEnabled) {
    diagnostics.recommendations.push('Enable local storage for session management');
    diagnostics.recommendations.push('Check browser storage settings');
  }

  if (diagnostics.hasSecurityPolicies) {
    diagnostics.recommendations.push('Strict security policies detected - use redirect authentication');
    diagnostics.recommendations.push('COEP/CORP policies may block popup authentication');
  }

  if (diagnostics.recommendations.length === 0) {
    diagnostics.recommendations.push('Try refreshing the page');
    diagnostics.recommendations.push('Clear browser cache and cookies');
    diagnostics.recommendations.push('Try a different browser');
  }

  return diagnostics;
};

export const logBrowserDiagnostics = (): void => {
  const diagnostics = runBrowserDiagnostics();
  
  console.group('🔍 Browser Diagnostics for Authentication');
  
  if (diagnostics.recommendations.length > 0) {
    diagnostics.recommendations.forEach((rec, index) => {
    });
  }
  
  console.groupEnd();
};