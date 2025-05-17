import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
  try {
    const posts = await getCollection('blog');
    return rss({
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      site: context.site,
      items: posts.map((post) => ({
        ...post.data,
        link: `/blog/${post.id}/`,
      })),
    });
  } catch (error) {
   	console.error('Error generating RSS feed:', error);
    return new Response('Failed to generate RSS feed. Please try again. IF error persists, you can let me know at mtoutcalt@gmail.com', { status: 500 });
  }
}
