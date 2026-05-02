import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import sharp from 'sharp';
import { readFileSync } from 'fs';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { id: post.id },
    props: { title: post.data.title, description: post.data.description },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, description } = props as { title: string; description: string };

  const fontData = readFileSync(
    new URL('../../../public/fonts/Jost-Medium.woff', import.meta.url)
  );

  const markup = {
    type: 'div',
    props: {
      style: { display: 'flex', width: 1200, height: 630, background: '#151515', fontFamily: 'Jost' },
      children: [
        {
          type: 'div',
          props: { style: { width: 8, background: '#ff6b6b', flexShrink: 0 }, children: '' },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px', flexGrow: 1 },
            children: [
              {
                type: 'div',
                props: { style: { fontSize: 14, color: '#555555', letterSpacing: 4, textTransform: 'uppercase' }, children: 'markoutcalt.com' },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    {
                      type: 'div',
                      props: { style: { fontSize: 64, fontWeight: 800, color: '#ffffff', lineHeight: 1.05, letterSpacing: -2, marginBottom: 20 }, children: title },
                    },
                    {
                      type: 'div',
                      props: { style: { fontSize: 22, color: '#aaaaaa', lineHeight: 1.4 }, children: description },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: { style: { fontSize: 15, color: '#555555' }, children: 'Mark Outcalt' },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(markup as any, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Jost',
        data: fontData.buffer as ArrayBuffer,
        weight: 500,
        style: 'normal',
      },
    ],
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
