# Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended)

**Pros**: Zero configuration, automatic SSL, global CDN, serverless functions
**Cons**: Vendor lock-in

**Steps**:

1. Push code to GitHub repository

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click "New Project" and import your repository

4. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
   OPENAI_API_KEY
   N8N_WEBHOOK_SECRET
   N8N_WEBHOOK_URL
   NEXT_PUBLIC_APP_URL
   ```

5. Click "Deploy"

6. Configure custom domain (optional)

7. Set up Stripe webhooks:
   - Endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `customer.subscription.*`, `invoice.*`

---

### Option 2: AWS EC2

**Pros**: Full control, predictable pricing
**Cons**: More setup required

**Steps**:

1. **Launch EC2 Instance**:
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.medium (minimum)
   - Security group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Connect via SSH**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2**:
   ```bash
   sudo npm install -g pm2
   ```

5. **Clone repository**:
   ```bash
   git clone your-repo-url
   cd ai-homecare-management
   ```

6. **Create `.env.local`**:
   ```bash
   nano .env.local
   # Paste your environment variables
   ```

7. **Install dependencies and build**:
   ```bash
   npm install
   npm run build
   ```

8. **Start with PM2**:
   ```bash
   pm2 start npm --name "homecare" -- start
   pm2 save
   pm2 startup
   ```

9. **Install and configure Nginx**:
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/homecare
   ```

   Paste:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/homecare /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Install SSL with Certbot**:
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com
    ```

---

### Option 3: Docker

**Pros**: Portable, consistent environment
**Cons**: Additional layer of complexity

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:20-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci

   COPY . .
   RUN npm run build

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

2. **Create docker-compose.yml**:
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       env_file:
         - .env.local
       restart: always
   ```

3. **Build and run**:
   ```bash
   docker-compose up -d
   ```

---

## Post-Deployment Checklist

- [ ] Verify Supabase connection
- [ ] Test user authentication
- [ ] Verify Stripe webhooks
- [ ] Test patient creation
- [ ] Verify API routes work
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Configure backup strategy
- [ ] Set up n8n automation workflows
- [ ] Test email notifications (if implemented)
- [ ] Load test with expected traffic

---

## Environment-Specific Configuration

### Production
- Set `NEXT_PUBLIC_APP_URL` to your domain
- Use production Stripe keys
- Enable error tracking
- Set up database backups

### Staging
- Use test Stripe keys
- Use separate Supabase project
- Lower resource limits

---

## Monitoring

### Application Health
- Monitor `/api/health` endpoint (create one if needed)
- Set up uptime monitoring (UptimeRobot, Pingdom)

### Database
- Monitor Supabase dashboard
- Set up query performance alerts
- Track database size growth

### Logs
- Use Vercel logs or PM2 logs
- Set up log aggregation (Papertrail, Loggly)

---

## Scaling

### Horizontal Scaling
- Deploy multiple instances behind load balancer
- Use managed database (Supabase scales automatically)

### Vertical Scaling
- Upgrade EC2 instance type
- Increase database resources

### CDN
- Use Vercel Edge Network
- Or configure CloudFront for EC2 deployments

---

## Backup Strategy

### Database
- Supabase provides automated backups
- Set up additional backup using `pg_dump`

### Files/Storage
- Back up Supabase Storage buckets
- Sync to S3 or similar

### Code
- Git repository is primary backup
- Tag releases

---

## Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues
- Verify Supabase credentials
- Check IP allowlist in Supabase
- Verify RLS policies

### Stripe Webhooks Not Working
- Check webhook secret
- Verify endpoint URL
- Test with Stripe CLI

### Performance Issues
- Enable Next.js caching
- Add database indexes
- Use CDN for static assets
- Optimize images

---

## Security Best Practices

- [ ] Never commit `.env.local` to git
- [ ] Use environment-specific API keys
- [ ] Rotate secrets regularly
- [ ] Enable 2FA on all accounts
- [ ] Use HTTPS only
- [ ] Implement rate limiting
- [ ] Regular security audits
- [ ] Keep dependencies updated
