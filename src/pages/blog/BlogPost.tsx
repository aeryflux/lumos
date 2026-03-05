/**
 * BlogPost - Individual Blog Post Page
 *
 * Displays a single blog post with full content.
 */

import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, Rss } from 'lucide-react';
import DOMPurify from 'dompurify';
import './BlogPost.css';

// Blog posts data (same as in Blog.tsx - could be shared)
const blogPosts = [
  {
    id: 1,
    title: 'Introducing AeryFlux: Explore the World in 3D',
    excerpt: 'Today we\'re excited to announce AeryFlux, an interactive 3D globe experience that brings music, news, weather, and knowledge from every corner of the planet.',
    date: '2026-01-15',
    readTime: '5 min read',
    category: 'Announcement',
    content: `
      <p>We're thrilled to announce the launch of AeryFlux, a revolutionary way to explore our world through an interactive 3D globe experience.</p>

      <h2>What is AeryFlux?</h2>
      <p>AeryFlux is a cross-platform application that lets you discover music, news, weather, and knowledge from every corner of the planet. Using a beautiful hexagonal globe interface, you can tap on any country to learn more about it.</p>

      <h2>Key Features</h2>
      <ul>
        <li><strong>Music Mode</strong> - Discover top tracks from any country</li>
        <li><strong>News Mode</strong> - Stay informed with headlines from around the world</li>
        <li><strong>Weather Mode</strong> - View real-time weather data on a color-coded globe</li>
        <li><strong>Wiki Mode</strong> - Learn facts about countries and landmarks</li>
        <li><strong>Challenge Mode</strong> - Complete interactive globe challenges and earn Stars</li>
      </ul>

      <h2>Available Platforms</h2>
      <p>AeryFlux is available on:</p>
      <ul>
        <li>Web browsers (Chrome, Firefox, Safari, Edge)</li>
        <li>iOS (iPhone and iPad)</li>
        <li>Android phones and tablets</li>
        <li>Desktop version (coming soon)</li>
      </ul>

      <h2>What's Next?</h2>
      <p>We're just getting started. In the coming months, we'll be adding new features like collaborative exploration, social sharing, and even more ways to discover the world.</p>

      <p>Ready to explore? <a href="/download">Download AeryFlux now</a>!</p>
    `
  },
  {
    id: 2,
    title: 'Building a Hexagonal Weather Globe with Three.js',
    excerpt: 'A deep dive into how we created our unique hexagonal Goldberg polyhedron globe for displaying weather data with optimal performance on mobile devices.',
    date: '2026-01-10',
    readTime: '8 min read',
    category: 'Technical',
    content: `
      <p>One of the most distinctive features of AeryFlux is our hexagonal globe. In this post, we'll dive deep into how we built it using Three.js and why we chose this approach.</p>

      <h2>Why Hexagons?</h2>
      <p>Traditional globe representations use triangular meshes (icospheres), but for displaying weather data, hexagons offer several advantages:</p>
      <ul>
        <li>More uniform cell sizes across the globe</li>
        <li>Better visual representation of discrete data</li>
        <li>Easier to color-code individual cells</li>
        <li>Lower polygon count for mobile performance</li>
      </ul>

      <h2>The Goldberg Polyhedron</h2>
      <p>Our globe is based on a Goldberg polyhedron, which is a convex polyhedron made of hexagons and exactly 12 pentagons. This structure provides excellent coverage of a sphere with minimal distortion.</p>

      <h2>Performance Optimization</h2>
      <p>Mobile devices have limited GPU resources, so we implemented several optimizations:</p>
      <ul>
        <li>Subdivision level 3 (162 cells) for mobile, level 5 (2,562 cells) for desktop</li>
        <li>Instanced rendering for repeated elements</li>
        <li>Frustum culling to skip off-screen cells</li>
        <li>Level-of-detail switching based on zoom</li>
      </ul>

      <h2>The Result</h2>
      <p>The final implementation runs at 60fps on modern mobile devices while displaying real-time temperature data across the entire globe. Each hexagonal cell can be individually colored and animated.</p>
    `
  },
  {
    id: 3,
    title: 'The Journey to 1.0: Lessons Learned',
    excerpt: 'From a simple idea to a full-fledged monorepo with 6 apps, here\'s what we learned building AeryFlux over the past year.',
    date: '2026-01-05',
    readTime: '6 min read',
    category: 'Behind the Scenes',
    content: `
      <p>AeryFlux started as a weekend project and grew into a full ecosystem of 6 apps. Here's what we learned along the way.</p>

      <h2>Start Small, Think Big</h2>
      <p>Our first prototype was just a spinning globe with clickable countries. But from day one, we designed with scalability in mind. The modular architecture we chose early on made it possible to add new features without major refactoring.</p>

      <h2>The Monorepo Decision</h2>
      <p>Managing multiple apps in separate repositories became unsustainable. Moving to a monorepo with shared packages was one of the best decisions we made:</p>
      <ul>
        <li>Shared code between Atlas mobile and Lumos web</li>
        <li>Unified tooling and configurations</li>
        <li>Atomic commits across multiple apps</li>
        <li>Easier dependency management</li>
      </ul>

      <h2>Naming Matters</h2>
      <p>Each app in our ecosystem has a unique name with a cultural reference:</p>
      <ul>
        <li><strong>Atlas</strong> (Greek mythology) - The titan who carries the world</li>
        <li><strong>Lumos</strong> (Harry Potter) - The light spell, our landing page</li>
        <li><strong>Edison</strong> (History) - The inventor, our dev hub</li>
        <li><strong>Pythagoras</strong> (Greek) - Pure logic, our API</li>
        <li><strong>Holocron</strong> (Star Wars) - Knowledge archive, admin backoffice</li>
      </ul>

      <h2>What's Next?</h2>
      <p>Version 1.0 is just the beginning. We're already working on exciting new features that we can't wait to share with you.</p>
    `
  },
];

export function BlogPost() {
  const { id } = useParams();
  const postId = parseInt(id || '0', 10);
  const post = blogPosts.find(p => p.id === postId);

  if (!post) {
    return (
      <div className="blog-post-page">
        <div className="blog-post-container">
          <div className="blog-post-not-found">
            <Rss size={48} />
            <h1>Post Not Found</h1>
            <p>The blog post you're looking for doesn't exist.</p>
            <Link to="/blog" className="btn btn-primary">
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-page">
      <div className="blog-post-container">
        <Link to="/blog" className="blog-post-back">
          <ChevronLeft size={16} />
          Back to Blog
        </Link>

        <article className="blog-post">
          <header className="blog-post-header">
            <span className="blog-post-category">{post.category}</span>
            <h1>{post.title}</h1>
            <div className="blog-post-meta">
              <span><Calendar size={14} /> {post.date}</span>
              <span><Clock size={14} /> {post.readTime}</span>
            </div>
          </header>

          <div
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />
        </article>
      </div>
    </div>
  );
}

export default BlogPost;
