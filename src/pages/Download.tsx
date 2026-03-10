import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Legacy /download page - redirects to home
 * Kept for Google indexing compatibility
 */
export function DownloadPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
}

export default DownloadPage;
