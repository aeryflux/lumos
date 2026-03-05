import { Link } from 'react-router-dom';
import { Rss, Calendar, ArrowRight, Clock } from 'lucide-react';
import { useTranslation } from '../i18n';
import './Blog.css';

// Placeholder blog posts - these would come from the API in production
const blogPosts = [
  {
    id: 1,
    titleKey: 'blog.posts.intro.title',
    excerptKey: 'blog.posts.intro.excerpt',
    date: '2026-01-15',
    readTime: 5,
    categoryKey: 'blog.categories.announcement',
    image: null
  },
  {
    id: 2,
    titleKey: 'blog.posts.hexGlobe.title',
    excerptKey: 'blog.posts.hexGlobe.excerpt',
    date: '2026-01-10',
    readTime: 8,
    categoryKey: 'blog.categories.engineering',
    image: null
  },
  {
    id: 3,
    titleKey: 'blog.posts.journey.title',
    excerptKey: 'blog.posts.journey.excerpt',
    date: '2026-01-05',
    readTime: 6,
    categoryKey: 'blog.categories.tutorial',
    image: null
  },
];

export function Blog() {
  const { t } = useTranslation();

  return (
    <div className="blog-page">
      <div className="blog-container">
        {/* Header */}
        <div className="blog-header">
          <div className="blog-header-icon">
            <Rss size={32} />
          </div>
          <h1>{t('blog.title')}</h1>
          <p>{t('blog.subtitle')}</p>
        </div>

        {/* Featured Post */}
        {blogPosts.length > 0 && (
          <div className="blog-featured">
            <div className="blog-featured-content">
              <span className="blog-category">{t(blogPosts[0].categoryKey)}</span>
              <h2>{t(blogPosts[0].titleKey)}</h2>
              <p>{t(blogPosts[0].excerptKey)}</p>
              <div className="blog-meta">
                <span><Calendar size={14} /> {blogPosts[0].date}</span>
                <span><Clock size={14} /> {blogPosts[0].readTime} {t('blog.minRead')}</span>
              </div>
              <Link to={`/blog/${blogPosts[0].id}`} className="blog-read-more">
                {t('blog.readMore')} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="blog-featured-image">
              <div className="blog-image-placeholder">
                <Rss size={48} />
              </div>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        <div className="blog-grid">
          <h3>{t('blog.featured')}</h3>
          <div className="blog-posts">
            {blogPosts.slice(1).map((post) => (
              <article key={post.id} className="blog-card">
                <div className="blog-card-image">
                  <div className="blog-image-placeholder">
                    <Rss size={24} />
                  </div>
                </div>
                <div className="blog-card-content">
                  <span className="blog-category">{t(post.categoryKey)}</span>
                  <h4>{t(post.titleKey)}</h4>
                  <p>{t(post.excerptKey)}</p>
                  <div className="blog-meta">
                    <span><Calendar size={12} /> {post.date}</span>
                    <span><Clock size={12} /> {post.readTime} {t('blog.minRead')}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Subscribe */}
        <div className="blog-subscribe">
          <h3>{t('blog.subscribe.title')}</h3>
          <p>{t('blog.subscribe.desc')}</p>
          <form className="blog-subscribe-form">
            <input type="email" placeholder={t('blog.subscribe.placeholder') as string} />
            <button type="submit" className="btn btn-primary">{t('blog.subscribe.button')}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Blog;
