const DEFAULTS = {
  siteName: 'Random Character Creator',
  siteTitle: 'Random Character Creator - Criador de Mundos RPG',
  baseUrl: 'https://random-character-creator-rpg.vercel.app/',
  description: 'Plataforma para criação de mundos, personagens e histórias de RPG.',
  keywords: 'RPG, criação de mundos, personagens, fantasia, medieval, storytelling',
  author: 'Ana Laura Lis',
  image: 'https://random-character-creator-rpg.vercel.app/assets/preview.png',
  imageWidth: '1200',
  imageHeight: '630'
};

const ensureTag = (selector, create) => {
  const existing = document.head.querySelector(selector);
  if (existing) return existing;
  const node = create();
  document.head.appendChild(node);
  return node;
};

const setMeta = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  robots,
  imageWidth,
  imageHeight
} = {}) => {
  const finalTitle = title || DEFAULTS.siteTitle;
  const finalDescription = description || DEFAULTS.description;
  const finalKeywords = keywords || DEFAULTS.keywords;
  const finalAuthor = author || DEFAULTS.author;
  const finalImage = image || DEFAULTS.image;
  const finalUrl = url || DEFAULTS.baseUrl;
  const finalRobots = robots || 'index, follow';
  const finalImageWidth = imageWidth || DEFAULTS.imageWidth;
  const finalImageHeight = imageHeight || DEFAULTS.imageHeight;

  document.title = finalTitle;

  ensureTag('meta[name="description"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'description');
    return m;
  }).setAttribute('content', finalDescription);

  ensureTag('meta[name="keywords"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'keywords');
    return m;
  }).setAttribute('content', finalKeywords);

  ensureTag('meta[name="author"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'author');
    return m;
  }).setAttribute('content', finalAuthor);

  ensureTag('meta[name="robots"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'robots');
    return m;
  }).setAttribute('content', finalRobots);

  ensureTag('meta[name="googlebot"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'googlebot');
    return m;
  }).setAttribute('content', finalRobots);

  ensureTag('link[rel="canonical"]', () => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    return link;
  }).setAttribute('href', finalUrl);

  const setOg = (property, value) => {
    ensureTag(`meta[property="og:${property}"]`, () => {
      const m = document.createElement('meta');
      m.setAttribute('property', `og:${property}`);
      return m;
    }).setAttribute('content', value);
  };

  setOg('type', type);
  setOg('title', finalTitle);
  setOg('description', finalDescription);
  setOg('image', finalImage);
  setOg('image:secure_url', finalImage);
  setOg('image:width', finalImageWidth);
  setOg('image:height', finalImageHeight);
  setOg('url', finalUrl);
  setOg('site_name', DEFAULTS.siteName);

  const setTw = (name, value) => {
    ensureTag(`meta[name="twitter:${name}"]`, () => {
      const m = document.createElement('meta');
      m.setAttribute('name', `twitter:${name}`);
      return m;
    }).setAttribute('content', value);
  };

  setTw('card', 'summary_large_image');
  setTw('title', finalTitle);
  setTw('description', finalDescription);
  setTw('image', finalImage);
};

export const setPageMeta = setMeta;
export default setMeta;
