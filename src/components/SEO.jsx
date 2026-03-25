import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_SITE_URL = 'https://bee-yuan.com';

function upsertMeta(key, value, attr = 'name') {
  if (!value) return;

  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', value);
}

function upsertLink(rel, href) {
  if (!href) return;

  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

export default function SEO({
  title,
  description,
  keywords,
  image = '/vite.svg',
  robots = 'index,follow',
}) {
  const { pathname } = useLocation();

  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL;
    const canonicalUrl = new URL(pathname, siteUrl).toString();
    const imageUrl = new URL(image, siteUrl).toString();

    document.title = title;

    upsertMeta('description', description);
    upsertMeta('keywords', keywords);
    upsertMeta('robots', robots);
    upsertMeta('og:title', title, 'property');
    upsertMeta('og:description', description, 'property');
    upsertMeta('og:type', 'website', 'property');
    upsertMeta('og:url', canonicalUrl, 'property');
    upsertMeta('og:image', imageUrl, 'property');
    upsertMeta('og:site_name', '蜂緣 BeeYuan', 'property');
    upsertMeta('og:locale', 'zh_TW', 'property');
    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);
    upsertMeta('twitter:image', imageUrl);
    upsertLink('canonical', canonicalUrl);
  }, [title, description, keywords, image, robots, pathname]);

  return null;
}
