import { Link } from 'react-router-dom';
import './NotFound.css';

export function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <p>this page doesn't exist</p>
        <Link to="/" className="not-found-link">back to home</Link>
      </div>
    </div>
  );
}

export default NotFound;
