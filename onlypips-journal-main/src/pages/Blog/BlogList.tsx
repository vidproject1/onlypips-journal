
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '@/components/Layout/PublicLayout';
import { blogPosts, BlogPost } from '@/data/blogPosts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User } from 'lucide-react';

const BlogList = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Backtests", "Trading News", "Broker Reviews", "Education", "Psychology", "Technical Analysis"];

  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <PublicLayout>
      <div className="relative py-20 px-4 md:px-6 bg-muted/10 border-b border-border/40">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-4" variant="secondary">The Trading Blog</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Insights for Modern Traders</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert analysis, trading psychology, and strategies to help you become a profitable trader.
          </p>
        </div>
      </div>

      <div className="container max-w-6xl py-8 px-4 md:px-6">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group h-full">
                <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 bg-card/50 backdrop-blur-sm border-border/50">
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> {post.readTime}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3 text-sm">
                      {post.excerpt}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="mt-auto pt-0 text-xs text-muted-foreground flex items-center justify-between border-t border-border/30 p-6">
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" /> {post.author}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> {post.date}
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No posts found in this category.
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default BlogList;
