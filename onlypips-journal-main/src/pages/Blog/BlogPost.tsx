
import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import PublicLayout from '@/components/Layout/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ArrowLeft, Share2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      console.log('Fetching post for slug:', slug);
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          console.error('Error fetching blog post:', error);
        } else if (!data) {
          console.warn('No blog post found for slug:', slug);
        } else {
          setPost(data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PublicLayout>
    );
  }

  if (!post) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="mb-8 text-muted-foreground">The blog post you are looking for does not exist or has been moved.</p>
          <div className="flex justify-center gap-4">
            <Link to="/blog">
              <Button variant="default">Back to Blog</Button>
            </Link>
          </div>
          <div className="mt-8 text-xs text-muted-foreground">
            Debug: Slug "{slug}" not found in database.
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <article className="min-h-screen pb-20">
        {/* Hero Section */}
        <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img 
            src={post.image || '/placeholder.svg'} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
            <div className="container max-w-4xl text-center space-y-6">
              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                {post.category}
              </Badge>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-4 text-white/80 text-sm md:text-base">
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-2" /> {post.author}
                </span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" /> {post.date}
                </span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" /> {post.read_time}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container max-w-3xl -mt-10 relative z-30">
          <div className="bg-background border border-border/40 rounded-xl shadow-xl p-6 md:p-12">
            <Link to="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Blog
            </Link>
            
            <div 
              className="prose prose-invert prose-lg max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight 
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="mt-12 pt-8 border-t border-border/40 flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant="outline">{post.category}</Badge>
                <Badge variant="outline">Trading</Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </div>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
};

export default BlogPost;
