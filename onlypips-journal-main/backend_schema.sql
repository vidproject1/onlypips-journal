-- Create the blog_posts table
-- Run this in your database SQL editor

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL, -- This is where you paste your HTML content
  author TEXT NOT NULL,
  date TEXT DEFAULT TO_CHAR(NOW(), 'Mon DD, YYYY'), -- Or use TIMESTAMP: published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  read_time TEXT, -- e.g. "5 min read"
  category TEXT NOT NULL, -- e.g. "Backtests", "Trading News", "Broker Reviews", "Education", "Psychology", "Technical Analysis"
  image TEXT -- URL to the header image
);

-- Create an index for faster lookups by slug
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

-- Example usage:
-- INSERT INTO blog_posts (slug, title, excerpt, content, author, read_time, category, image)
-- VALUES (
--   'my-first-post',
--   'My First Dynamic Post',
--   'This is an excerpt...',
--   '<h2>Hello World</h2><p>This is my content.</p>',
--   'Charles',
--   '2 min read',
--   'Trading News',
--   'https://example.com/image.jpg'
-- );
