const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

const REDIRECT_MAP = {
  '/blog': '/',
  '/blog/': '/',
  '/blogs': '/pages/blogs/',
  '/blogs/': '/pages/blogs/',
  '/about': '/pages/about/',
  '/about/': '/pages/about/',
  '/contact': '/pages/contact/',
  '/contact/': '/pages/contact/',
  '/work': '/pages/work/',
  '/work/': '/pages/work/',
  '/case-studies': '/pages/case-studies/',
  '/case-studies/': '/pages/case-studies/',
  '/services': '/pages/services/brand-strategy/',
  '/services/': '/pages/services/brand-strategy/',
  '/industries': '/pages/industries/service-base/',
  '/industries/': '/pages/industries/service-base/'
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalize /web 2/ or /web%202/ prefix if routed
  if (pathname.startsWith('/web 2/') || pathname.startsWith('/web%202/')) {
    pathname = pathname.replace(/^\/web(?:%20|\s)2\//, '/');
  }

  // 1. Google SEO & Clean URL 301 Redirects
  if (REDIRECT_MAP[pathname]) {
    res.writeHead(301, {
      'Location': REDIRECT_MAP[pathname] + (parsedUrl.search || ''),
      'Cache-Control': 'public, max-age=31536000'
    });
    return res.end();
  }

  // Handle /blog/<article> -> /blogs/<article>
  if (pathname.startsWith('/blog/') && pathname !== '/blog/') {
    const article = pathname.slice('/blog/'.length);
    const target = '/blogs/' + article;
    res.writeHead(301, {
      'Location': target + (parsedUrl.search || ''),
      'Cache-Control': 'public, max-age=31536000'
    });
    return res.end();
  }

  // 2. Handle /api/save-content
  if (req.method === 'POST' && (pathname === '/api/save-content' || pathname === '/api/save-content.php')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const customizations = data.customizations || {};
        const targetPath = path.join(ROOT, 'data', 'site-customizations.json');
        
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, JSON.stringify(customizations, null, 2), 'utf8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Saved to live server disk!' }));
        console.log('[Hostinger Node Server] Saved site customizations to disk.');
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 3. Handle /api/reset-content
  if (req.method === 'POST' && (pathname === '/api/reset-content' || pathname === '/api/reset-content.php')) {
    try {
      const targetPath = path.join(ROOT, 'data', 'site-customizations.json');
      const empty = { texts: {}, images: {}, lockedProjects: {} };
      fs.writeFileSync(targetPath, JSON.stringify(empty, null, 2), 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Reset all customizations to clean code.' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 4. Serve static files with clean URL resolution
  let safePath = path.normalize(path.join(ROOT, pathname));
  if (!safePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  // Check if pathname has a .html sibling
  if (!fs.existsSync(safePath)) {
    if (fs.existsSync(safePath + '.html')) {
      safePath = safePath + '.html';
    } else {
      const cleanPathname = pathname.replace(/\/$/, '');
      const pagesTarget = path.join(ROOT, 'pages', cleanPathname, 'index.html');
      if (fs.existsSync(pagesTarget)) {
        res.writeHead(301, {
          'Location': '/pages/' + cleanPathname.replace(/^\//, '') + '/' + (parsedUrl.search || '')
        });
        return res.end();
      }
    }
  }

  fs.stat(safePath, (err, stats) => {
    if (err) {
      const page404 = path.join(ROOT, 'pages', '404', 'index.html');
      if (fs.existsSync(page404)) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        return fs.createReadStream(page404).pipe(res);
      }
      res.writeHead(404);
      return res.end('Not Found');
    }

    if (stats.isDirectory()) {
      safePath = path.join(safePath, 'index.html');
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Prevent caching for dynamic data & html
    if (ext === '.html' || ext === '.json') {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(safePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Buttercup Server running on port ${PORT}`);
});
