import { createHash } from 'node:crypto';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const sha256 = (body) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`;

/**
 * Injects a Content-Security-Policy into the built page only. It is left out of
 * dev so the HMR socket still works, and the hashes are computed from the final
 * markup so editing the inline theme/boot blocks cannot silently break it.
 */
function contentSecurityPolicy() {
  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml(html) {
      const inline = (tag) =>
        [...html.matchAll(new RegExp(`<${tag}(?![^>]*\\bsrc=)[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))]
          .map((match) => sha256(match[1]))
          .join(' ');

      const policy = [
        "default-src 'self'",
        // Scripts stay strict: no unsafe-inline, only the hashed boot block.
        // This is the directive that actually stops injected code running.
        `script-src 'self' ${inline('script')}`,
        // KaTeX positions every glyph with inline styles, so style-src cannot
        // be hash-only. Inline CSS cannot execute script, so the tradeoff is
        // confined to styling.
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
        'upgrade-insecure-requests',
      ].join('; ');

      return {
        html,
        tags: [
          {
            tag: 'meta',
            attrs: { 'http-equiv': 'Content-Security-Policy', content: policy },
            injectTo: 'head-prepend',
          },
        ],
      };
    },
  };
}

/**
 * GitHub Pages serves a project site from /<repo>/, so assets need that prefix.
 * The name is read from GITHUB_REPOSITORY rather than hard-coded, so renaming
 * the repository cannot silently break every asset path. A user site such as
 * <name>.github.io, and any custom domain, both serve from the root.
 */
function pagesBase() {
  if (process.env.GITHUB_PAGES !== 'true') return '/';

  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  if (!repo || repo.endsWith('.github.io')) return '/';

  return `/${repo}/`;
}

export default defineConfig({
  base: pagesBase(),
  plugins: [react(), contentSecurityPolicy()]
});
