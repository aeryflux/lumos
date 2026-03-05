/**
 * useWebGLSupport - Detect WebGL availability
 *
 * Returns true if WebGL is available and functional.
 * Used to show graceful fallback when WebGL context limit is reached.
 */

import { useState, useEffect } from 'react';

export interface WebGLSupportResult {
  supported: boolean;
  checked: boolean;
  error?: string;
}

export function useWebGLSupport(): WebGLSupportResult {
  const [result, setResult] = useState<WebGLSupportResult>({
    supported: true, // Optimistic default
    checked: false,
  });

  useEffect(() => {
    const checkWebGL = (): WebGLSupportResult => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!gl) {
          return {
            supported: false,
            checked: true,
            error: 'WebGL not supported by browser',
          };
        }

        // Check for context loss (happens when too many contexts are active)
        if (gl.isContextLost()) {
          return {
            supported: false,
            checked: true,
            error: 'WebGL context lost - too many active contexts',
          };
        }

        // Clean up test canvas
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (loseContext) {
          loseContext.loseContext();
        }

        return {
          supported: true,
          checked: true,
        };
      } catch (e) {
        return {
          supported: false,
          checked: true,
          error: e instanceof Error ? e.message : 'WebGL check failed',
        };
      }
    };

    setResult(checkWebGL());
  }, []);

  return result;
}

/**
 * Synchronous WebGL check (for immediate use without hook)
 */
export function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    if (gl.isContextLost()) return false;

    // Clean up
    const loseContext = gl.getExtension('WEBGL_lose_context');
    if (loseContext) loseContext.loseContext();

    return true;
  } catch {
    return false;
  }
}

export default useWebGLSupport;
