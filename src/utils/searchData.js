import { getCollection } from 'astro:content';
import { advice } from '../data/advice.js';
import { quotes } from '../data/quotes.js';

export async function getAllSearchableContent() {
  // Get blog posts
  const blogPosts = await getCollection('blog');
  
  // Transform blog posts for search
  const blogSearchData = blogPosts.map(post => ({
    title: post.data.title,
    description: post.data.description,
    content: post.body || '', // For searching within content
    url: `/blog/${post.id}`,
    type: 'Blog Post',
    pubDate: post.data.pubDate,
    tags: post.data.tags || []
  }));

  // Transform advice for search  
  const adviceSearchData = advice.map((item, index) => ({
    title: 'Advice Collection',
    description: item.content,
    content: item.content,
    url: '/advice',
    type: 'Advice',
    pubDate: null,
    tags: ['advice', 'wisdom']
  }));

  // Transform quotes for search
  const quotesSearchData = quotes.map((item, index) => ({
    title: `Quote by ${item.author || 'Unknown'}`,
    description: item.text,
    content: item.text,
    url: '/blog/quotes',
    type: 'Quote', 
    pubDate: null,
    tags: ['quotes', item.author?.toLowerCase().replace(/\s+/g, '-') || 'unknown']
  }));

  // Additional static pages
  const staticPages = [
    {
      title: 'Books',
      description: 'Book recommendations and reading list',
      content: 'Books recommendations reading list literature',
      url: '/books',
      type: 'Page',
      pubDate: null,
      tags: ['books', 'reading']
    },
    {
      title: 'Archive',
      description: 'Archive of all blog posts organized by date',
      content: 'Archive blog posts chronological history',
      url: '/archive', 
      type: 'Page',
      pubDate: null,
      tags: ['archive', 'history']
    },
    {
      title: 'Links',
      description: 'Curated links and resources',
      content: 'Links resources bookmarks external',
      url: '/links',
      type: 'Page', 
      pubDate: null,
      tags: ['links', 'resources']
    },
    {
      title: 'Game',
      description: 'Interactive tic-tac-toe game',
      content: 'Game tic tac toe interactive fun',
      url: '/game',
      type: 'Game',
      pubDate: null,
      tags: ['game', 'interactive']
    }
  ];

  // Combine all search data
  return [
    ...blogSearchData,
    ...adviceSearchData,
    ...quotesSearchData,
    ...staticPages
  ];
}

// Client-side version for components that need search data
export function getSearchableContentSync() {
  // This will be populated by the server-side script
  if (typeof window !== 'undefined' && window.searchData) {
    return window.searchData;
  }
  return [];
}