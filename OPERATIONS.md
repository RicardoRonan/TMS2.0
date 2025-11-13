# Operations Guide - MetaStack

This guide covers environment setup, local development, testing, and deployment procedures for the MetaStack application.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Local Development](#local-development)
3. [Testing](#testing)
4. [Building](#building)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

## Environment Setup

### Prerequisites

- **Node.js:** v20 or higher
- **npm:** v9 or higher (comes with Node.js)
- **Git:** Latest version

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd TMS2.0
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your values:
   ```env
   # Required
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   
   # Optional
   VITE_BRANDFETCH_CLIENT_ID=your-client-id
   VITE_IMGBB_API_KEY=your-imgbb-key
   VITE_CHAT_WEBHOOK_URL=your-webhook-url
   VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Getting Other API Keys

- **Brandfetch:** [brandfetch.com](https://brandfetch.com) (optional, has default)
- **ImgBB:** [api.imgbb.com](https://api.imgbb.com) (optional)
- **Google Analytics:** [analytics.google.com](https://analytics.google.com) (optional)

## Local Development

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:css` - Run Stylelint
- `npm run fix:css` - Fix CSS linting issues
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run analyze` - Build and generate bundle analysis

### Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

3. **Run linting and type checking:**
   ```bash
   npm run lint
   npm run type-check
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Test locally:**
   ```bash
   npm run dev
   ```

6. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests:** `src/utils/__tests__/`
- **Component Tests:** `src/views/__tests__/`
- **Test Setup:** `src/test/setup.ts`

### Writing Tests

Example test file:
```typescript
import { describe, it, expect } from 'vitest'
import { yourFunction } from '../your-module'

describe('yourFunction', () => {
  it('should work correctly', () => {
    expect(yourFunction()).toBe(expected)
  })
})
```

## Building

### Production Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Bundle Analysis

```bash
npm run analyze
```

This will:
1. Build the application
2. Generate a bundle analysis report at `reports/bundle.html`
3. Open the report in your browser (if configured)

### Build Verification

After building, verify the output:
```bash
npm run preview
```

This serves the production build locally for testing.

## Deployment

### Netlify Deployment

The project is configured for Netlify deployment.

#### Automatic Deployment

1. **Connect repository to Netlify:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider
   - Select the repository

2. **Configure build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - These are already configured in `netlify.toml`

3. **Set environment variables:**
   - Go to **Site settings** → **Environment variables**
   - Add all variables from `.env.example`
   - Required:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. **Deploy:**
   - Netlify will automatically deploy on push to `main` branch
   - Or trigger a manual deploy from the dashboard

#### Manual Deployment

```bash
# Build the project
npm run build

# Deploy dist/ folder to Netlify
# Use Netlify CLI or drag-and-drop in dashboard
```

### CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Workflow steps:**
1. Lint and type check
2. Run tests
3. Build application
4. Upload artifacts

**To view CI results:**
- Go to GitHub repository
- Click "Actions" tab
- View workflow runs

### Preview Deploys

Netlify automatically creates preview deploys for pull requests if:
- GitHub integration is connected
- Netlify app is installed in GitHub

## Environment Variables

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BRANDFETCH_CLIENT_ID` | Brandfetch API client ID | `1id3wA510J5w3dLiN0H` (demo) |
| `VITE_IMGBB_API_KEY` | ImgBB API key | None |
| `VITE_CHAT_WEBHOOK_URL` | Chat webhook URL | None |
| `VITE_GOOGLE_ANALYTICS_ID` | Google Analytics ID | None |
| `VITE_APP_NAME` | App name override | "MetaStack" |
| `VITE_APP_VERSION` | App version | None |
| `VITE_APP_DESCRIPTION` | App description override | None |
| `VITE_API_BASE_URL` | Custom API base URL | None |

## Troubleshooting

### Build Fails

**Issue:** Build fails with errors

**Solutions:**
1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check for TypeScript errors:
   ```bash
   npm run type-check
   ```

3. Check for linting errors:
   ```bash
   npm run lint
   ```

### Tests Fail

**Issue:** Tests fail locally

**Solutions:**
1. Clear test cache:
   ```bash
   npm test -- --clearCache
   ```

2. Check test setup:
   ```bash
   cat src/test/setup.ts
   ```

3. Run tests in verbose mode:
   ```bash
   npm test -- --reporter=verbose
   ```

### Supabase Connection Issues

**Issue:** "Supabase not configured" warning

**Solutions:**
1. Verify environment variables are set:
   ```bash
   # Local
   cat .env
   
   # Netlify
   # Check in Netlify Dashboard → Site settings → Environment variables
   ```

2. Verify Supabase project is active:
   - Check Supabase Dashboard
   - Ensure project is not paused

3. Check network connectivity:
   - Verify Supabase URL is accessible
   - Check firewall settings

### Security Headers Issues

**Issue:** Content blocked by CSP or other security headers

**Solutions:**
1. Check browser console for CSP violations
2. Update CSP in `netlify.toml`:
   ```toml
   Content-Security-Policy = "default-src 'self'; ..."
   ```
3. Test changes in preview deploy first

### Bundle Size Issues

**Issue:** Bundle is too large

**Solutions:**
1. Generate bundle analysis:
   ```bash
   npm run analyze
   ```

2. Review `reports/bundle.html`:
   - Identify large dependencies
   - Consider code splitting
   - Remove unused dependencies

3. Check manual chunks in `vite.config.js`

### CI/CD Failures

**Issue:** GitHub Actions workflow fails

**Solutions:**
1. Check workflow logs in GitHub Actions tab
2. Run checks locally:
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

3. Fix any failing checks
4. Push fixes to trigger new workflow run

## Performance Optimization

### Bundle Optimization

1. **Analyze bundle:**
   ```bash
   npm run analyze
   ```

2. **Review large dependencies:**
   - Check `reports/bundle.html`
   - Consider lazy loading for large libraries

3. **Optimize images:**
   - Use WebP format where possible
   - Compress images before adding
   - Use lazy loading (already implemented)

### Runtime Performance

1. **Monitor performance:**
   - Use browser DevTools Performance tab
   - Check Lighthouse scores

2. **Optimize queries:**
   - Review Supabase query patterns
   - Add indexes where needed
   - Use pagination for large datasets

## Security Best Practices

1. **Never commit `.env` file**
2. **Use environment variables for secrets**
3. **Review security headers regularly**
4. **Keep dependencies updated:**
   ```bash
   npm audit
   npm audit fix
   ```

5. **Review CSP violations:**
   - Check browser console
   - Update CSP as needed

## Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Vue 3 Docs:** https://vuejs.org
- **Vite Docs:** https://vitejs.dev
- **Netlify Docs:** https://docs.netlify.com
- **GitHub Actions Docs:** https://docs.github.com/en/actions

## Getting Help

1. Check this guide first
2. Review `RELEASE_NOTES.md` for recent changes
3. Check GitHub Issues
4. Review CI/CD logs
5. Check browser console for errors

---

**Last Updated:** 2025-11-13

