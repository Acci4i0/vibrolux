import type { NextConfig } from 'next';

/**
 * GitHub Pages: the workflow passes the repository sub-path (/vibrolux) and the site is exported as static files.
 * Locally it is unset and nothing changes. BASE_PATH reaches the code for the raw paths next/link doesn't prefix.
 * SITE_ORIGIN (https://acci4i0.github.io, or the own domain once Pages serves it) makes canonical, hreflang and structured-data URLs absolute.
 */
const basePath = process.env.PAGES_BASE_PATH;

const nextConfig: NextConfig = {
  devIndicators: false,
  env: { BASE_PATH: basePath ?? '', SITE_ORIGIN: process.env.PAGES_ORIGIN ?? 'http://localhost:3000' },
  // trailingSlash: pages export as folder/index.html, so the home's data file is /vibrolux/index.txt, not /vibrolux.txt (outside the site)
  ...(basePath !== undefined && { output: 'export' as const, basePath, trailingSlash: true }),
};

export default nextConfig;
