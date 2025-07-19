# 🚀 Production Deployment Guide

This guide will help you deploy your AI Blog Generator to production with all the necessary configurations.

## 📋 Prerequisites

Before deploying, ensure you have:

- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [PostgreSQL Database](https://www.postgresql.org/) (or use a managed service)
- [OpenAI API Key](https://platform.openai.com/api-keys)
- [Google OAuth Credentials](https://console.cloud.google.com/)

## 🗄️ Database Setup

### Option 1: Local PostgreSQL

```bash
# Install PostgreSQL locally
# Then create a database
createdb ai_blog_generator
```

### Option 2: Managed Database (Recommended)

- **Vercel Postgres**: Easy integration with Vercel
- **Supabase**: Free tier available
- **Neon**: Serverless PostgreSQL
- **Railway**: Simple deployment

## 🔐 Environment Configuration

1. **Copy the environment template:**

   ```bash
   cp env.example .env.local
   ```

2. **Configure your environment variables:**

   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=sk-your-openai-api-key-here

   # Database Configuration
   DATABASE_URL=postgresql://username:password@host:port/database_name

   # Authentication
   NEXTAUTH_SECRET=your-random-secret-key-here
   NEXTAUTH_URL=https://your-domain.com
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. **Generate a secure NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

## 🔑 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set up OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret to your environment variables

## 🗄️ Database Migration

1. **Generate Prisma client:**

   ```bash
   npm run db:generate
   ```

2. **Push schema to database:**

   ```bash
   npm run db:push
   ```

   Or run migrations:

   ```bash
   npm run db:migrate
   ```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Deploy:**

   ```bash
   vercel
   ```

3. **Configure environment variables in Vercel dashboard**

4. **Set up database:**
   - Use Vercel Postgres or connect external database
   - Update DATABASE_URL in Vercel environment variables

### Option 2: Railway

1. **Connect your GitHub repository to Railway**
2. **Add environment variables in Railway dashboard**
3. **Deploy automatically**

### Option 3: DigitalOcean App Platform

1. **Connect your GitHub repository**
2. **Configure build settings**
3. **Add environment variables**
4. **Deploy**

### Option 4: AWS Amplify

1. **Connect your repository to Amplify**
2. **Configure build settings**
3. **Add environment variables**
4. **Deploy**

## 🔧 Production Optimizations

### 1. Performance

- Enable Next.js Image Optimization
- Use CDN for static assets
- Implement caching strategies

### 2. Security

- Set up HTTPS
- Configure CSP headers
- Enable rate limiting
- Set up monitoring

### 3. Monitoring

- Add error tracking (Sentry)
- Set up analytics (Google Analytics)
- Monitor database performance

## 📊 Analytics Setup

### Google Analytics

1. Create a Google Analytics 4 property
2. Add the tracking ID to your environment variables
3. Implement tracking in your app

### Error Tracking

1. Set up Sentry account
2. Add Sentry SDK to your app
3. Configure error reporting

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run build
      - run: npm run db:generate
      # Add your deployment steps here
```

## 🧪 Testing

### Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema migrated
- [ ] OAuth providers configured
- [ ] OpenAI API key valid
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Error monitoring set up
- [ ] Analytics configured

### Post-deployment Testing

- [ ] User registration/login works
- [ ] AI content generation works
- [ ] Draft saving works
- [ ] Post publishing works
- [ ] Export functionality works
- [ ] Mobile responsiveness
- [ ] Performance metrics

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**

   - Check DATABASE_URL format
   - Verify database is accessible
   - Run `npm run db:generate`

2. **Authentication Issues**

   - Verify Google OAuth credentials
   - Check redirect URIs
   - Ensure NEXTAUTH_SECRET is set

3. **AI Generation Fails**

   - Verify OpenAI API key
   - Check API quota
   - Review error logs

4. **Build Errors**
   - Check Node.js version
   - Clear cache: `rm -rf .next`
   - Reinstall dependencies

## 📞 Support

If you encounter issues:

1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Review [Prisma documentation](https://www.prisma.io/docs)
3. Check [NextAuth.js documentation](https://next-auth.js.org/)
4. Open an issue in the repository

## 🔄 Updates and Maintenance

### Regular Maintenance

- Update dependencies monthly
- Monitor database performance
- Review error logs
- Backup database regularly
- Update security patches

### Scaling Considerations

- Implement caching (Redis)
- Use CDN for static assets
- Consider database read replicas
- Monitor API rate limits

---

**Happy Deploying! 🚀**
