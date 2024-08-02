import { NextApiRequest, NextApiResponse } from 'next';
import http from 'http';
import https from 'https';
import url from 'url';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return new Promise<void>((resolve, reject) => {
    if (!process.env.API_BASE_URL) {
      console.error('API_BASE_URL is not defined');
      res.status(500).json({ error: 'API_BASE_URL is not defined' });
      return resolve();
    }

    console.log('Original request URL:', req.url);

    const targetUrl = new URL(process.env.API_BASE_URL);
    const parsedUrl = url.parse(req.url || '', true);
    const path = parsedUrl.pathname ? parsedUrl.pathname.replace(/^\/api\/proxy/, '') : '';
    targetUrl.pathname = path || targetUrl.pathname;
    targetUrl.search = parsedUrl.search || '';

    console.log('Forwarding to:', targetUrl.toString());

    const options: http.RequestOptions = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: targetUrl.pathname + targetUrl.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: targetUrl.host,
      },
    };

    console.log('Request options:', JSON.stringify(options, null, 2));

    const proxyReq = (targetUrl.protocol === 'https:' ? https : http).request(options, (proxyRes) => {
      console.log('Received response with status:', proxyRes.statusCode);
      res.writeHead(proxyRes.statusCode ?? 500, proxyRes.headers);
      proxyRes.pipe(res);
    });

    req.pipe(proxyReq);

    proxyReq.on('error', (error) => {
      console.error('Proxy error for URL:', targetUrl.toString(), 'Error:', error);
      res.status(500).json({ error: 'Proxy error' });
      resolve();
    });

    res.on('close', () => {
      console.log('Response closed for URL:', targetUrl.toString());
      proxyReq.destroy();
      resolve();
    });

    proxyReq.end();
  });
}
