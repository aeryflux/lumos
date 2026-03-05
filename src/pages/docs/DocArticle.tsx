/**
 * DocArticle - Documentation Article Page Component
 *
 * Renders a single documentation article with sidebar navigation.
 */

import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import DOMPurify from 'dompurify';
import { docContent, getDocBySlug, getAdjacentDocs } from './docContent';
import './DocArticle.css';

export function DocArticle() {
  const { category, slug } = useParams();
  const fullSlug = category ? `${category}/${slug}` : slug || '';

  const doc = getDocBySlug(fullSlug);
  const { prev, next } = getAdjacentDocs(fullSlug);

  if (!doc) {
    return (
      <div className="doc-article-page">
        <div className="doc-article-container">
          <div className="doc-not-found">
            <BookOpen size={48} />
            <h1>Document Not Found</h1>
            <p>The documentation page you're looking for doesn't exist.</p>
            <Link to="/docs" className="btn btn-primary">
              Back to Documentation
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-article-page">
      <div className="doc-article-layout">
        {/* Sidebar */}
        <aside className="doc-sidebar">
          <div className="doc-sidebar-header">
            <Link to="/docs" className="doc-sidebar-back">
              <ChevronLeft size={16} />
              All Docs
            </Link>
          </div>
          <nav className="doc-sidebar-nav">
            {Object.entries(docContent).map(([catKey, category]) => (
              <div key={catKey} className="doc-sidebar-section">
                <h4>{category.title}</h4>
                <ul>
                  {category.articles.map((article) => (
                    <li key={article.slug}>
                      <Link
                        to={`/docs/${article.slug}`}
                        className={fullSlug === article.slug ? 'active' : ''}
                      >
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="doc-article-main">
          <article className="doc-article">
            <header className="doc-article-header">
              <span className="doc-article-category">{doc.category}</span>
              <h1>{doc.title}</h1>
              {doc.description && <p className="doc-article-desc">{doc.description}</p>}
            </header>

            <div className="doc-article-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(doc.content) }} />

            {/* Navigation */}
            <nav className="doc-article-nav">
              {prev ? (
                <Link to={`/docs/${prev.slug}`} className="doc-nav-link doc-nav-prev">
                  <ChevronLeft size={16} />
                  <div>
                    <span>Previous</span>
                    <strong>{prev.title}</strong>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link to={`/docs/${next.slug}`} className="doc-nav-link doc-nav-next">
                  <div>
                    <span>Next</span>
                    <strong>{next.title}</strong>
                  </div>
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <div />
              )}
            </nav>
          </article>
        </main>
      </div>
    </div>
  );
}

export default DocArticle;
