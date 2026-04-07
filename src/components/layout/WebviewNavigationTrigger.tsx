'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * An invisible component that detects client-side route changes and notifies
 * the host webview (Android/iOS) to trigger events like interstitial ads.
 */
function NavigationObserver() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    if (typeof window !== 'undefined') {
      // 1. Modern Standard: postMessage
      window.postMessage({ type: 'webview-navigation', url }, '*');

      // 2. Android Bridge: Looking for a standard 'Android' interface
      if ((window as any).Android && typeof (window as any).Android.onPageNavigation === 'function') {
        (window as any).Android.onPageNavigation(url);
      }

      // 3. iOS Bridge: Looking for a 'navigation' message handler
      if ((window as any).webkit?.messageHandlers?.navigation) {
        (window as any).webkit.messageHandlers.navigation.postMessage({ url });
      }
      
      // 4. Fallback: Log for debugging in webview console
      console.log(`[Webview Navigation] Path changed to: ${url}`);
    }
  }, [pathname, searchParams]);

  return null;
}

export function WebviewNavigationTrigger() {
  return (
    <Suspense fallback={null}>
      <NavigationObserver />
    </Suspense>
  );
}
