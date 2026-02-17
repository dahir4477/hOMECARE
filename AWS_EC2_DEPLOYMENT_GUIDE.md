# 🚀 AWS EC2 Deployment Guide - Step by Step

Complete guide to deploy AI Homecare Management System to AWS EC2 instance.

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] AWS Account with billing enabled
- [ ] SSH client installed (PuTTY for Windows, Terminal for Mac/Linux)
- [ ] Domain name (optional, but recommended)
- [ ] Supabase project set up
- [ ] Stripe account configured
- [ ] OpenAI API key

---

## 🎯 Overview

**What we'll do:**
1. Launch EC2 instance
2. Configure security groups
3. Connect via SSH
4. Install Node.js and dependencies
5. Upload application code
6. Configure environment variables
7. Install and configure PM2
8. Install and configure Nginx
9. Set up SSL certificate
10. Test the application

**Estimated Time**: 45-60 minutes

---

## Step 1: Launch EC2 Instance

### 1.1 Sign in to AWS Console

1. Go to [https://aws.amazon.com](https://aws.amazon.com)
2. Click "Sign In to the Console"
3. Enter your credentials

### 1.2 Navigate to EC2

1. In the AWS Console, search for "EC2" in the top search bar
2. Click on "EC2" to open the EC2 Dashboard

### 1.3 Launch Instance

1. Click the orange **"Launch Instance"** button

2. **Configure Instance Settings**:

   **Name**: `ai-homecare-production`

   **Application and OS Images (AMI)**:
   - Select: **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type**
   - Architecture: **64-bit (x86)**

   **Instance Type**:
   - Select: **t3.medium** (2 vCPU, 4 GB RAM)
   - Note: For production with many users, consider t3.large or larger

   **Key Pair**:
   - Click "Create new key pair"
   - Name: `ai-homecare-key`
   - Key pair type: **RSA**
   - Private key format: **`.pem`** (for Mac/Linux) or **`.ppk`** (for PuTTY/Windows)
   - Click "Create key pair"
   - **IMPORTANT**: Save the downloaded key file securely - you cannot download it again!

   **Network Settings**:
   - Click "Edit"
   - Auto-assign public IP: **Enable**
   - Firewall (security groups): **Create security group**
   - Security group name: `ai-homecare-sg`
   - Description: `Security group for AI Homecare app`
   
   **Security Group Rules** - Add these rules:
   
   | Type | Protocol | Port Range | Source | Description |
   |------|----------|------------|--------|-------------|
   | SSH | TCP | 22 | My IP | SSH access |
   | HTTP | TCP | 80 | 0.0.0.0/0 | HTTP traffic |
   | HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS traffic |
   | Custom TCP | TCP | 3000 | 0.0.0.0/0 | Next.js (temporary) |

   **Configure Storage**:
   - Size: **30 GB** (gp3)
   - Note: Increase if you expect lots of data

3. **Review and Launch**:
   - Review all settings
   - Click **"Launch Instance"**
   - Wait for the instance to reach "Running" state (2-3 minutes)

### 1.4 Note Your Instance Details

1. Click on your instance ID
2. Note down:
   - **Public IPv4 Address**: (e.g., 54.123.45.67)
   - **Public IPv4 DNS**: (e.g., ec2-54-123-45-67.compute-1.amazonaws.com)

---

## Step 2: Connect to EC2 Instance via SSH

### For Windows Users (using Command Prompt or PowerShell):

1. **Set Key Permissions** (PowerShell as Administrator):
   ```powershell
   icacls "C:\path\to\ai-homecare-key.pem" /inheritance:r
   icacls "C:\path\to\ai-homecare-key.pem" /grant:r "%username%:R"
   ```

2. **Connect via SSH**:
   ```bash
   ssh -i "C:\path\to\ai-homecare-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
   ```

### For Mac/Linux Users:

1. **Set Key Permissions**:
   ```bash
   chmod 400 ~/Downloads/ai-homecare-key.pem
   ```

2. **Connect via SSH**:
   ```bash
   ssh -i ~/Downloads/ai-homecare-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
   ```

3. Type "yes" when prompted to continue connecting

**You should now see**:
```
Welcome to Ubuntu 22.04 LTS
ubuntu@ip-xxx-xx-xx-xx:~$
```

---

## Step 3: Update System and Install Node.js

### 3.1 Update Ubuntu Packages

```bash
sudo apt update
sudo apt upgrade -y
```

Wait for this to complete (2-5 minutes).

### 3.2 Install Node.js 20.x

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 3.3 Install Build Tools

```bash
sudo apt install -y build-essential
```

---

## Step 4: Install Git

```bash
sudo apt install -y git

# Verify
git --version
```

---

## Step 5: Upload Application Code

### Option A: Using Git (Recommended)

If your code is in a Git repository:

```bash
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git ai-homecare
cd ai-homecare
```

### Option B: Using SCP from Your Local Machine

If you don't have Git setup, upload from your local machine:

**From your local machine (Windows):**
```bash
scp -i "C:\path\to\ai-homecare-key.pem" -r "C:\AI System Dispatcher\AI Homecare" ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/ai-homecare
```

**From your local machine (Mac/Linux):**
```bash
scp -i ~/Downloads/ai-homecare-key.pem -r "/path/to/AI Homecare" ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/ai-homecare
```

---

## Step 6: Configure Environment Variables

### 6.1 Navigate to Application Directory

```bash
cd /home/ubuntu/ai-homecare
```

### 6.2 Create Production Environment File

```bash
nano .env.local
```

### 6.3 Paste Your Environment Variables

Copy and paste this, replacing with your actual values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# OpenAI
OPENAI_API_KEY=sk-proj-your_openai_key_here

# n8n
N8N_WEBHOOK_SECRET=your_n8n_secret_here
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook

# App URL
NEXT_PUBLIC_APP_URL=http://YOUR_EC2_PUBLIC_IP
```

**Save and exit**:
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

### 6.4 Verify Environment File

```bash
cat .env.local
```

Make sure all values are correct.

---

## Step 7: Install Dependencies and Build

### 7.1 Install NPM Packages

```bash
npm install
```

This will take 5-10 minutes. You'll see warnings - that's normal.

### 7.2 Build the Application

```bash
npm run build
```

This will take 2-5 minutes. You should see:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
```

---

## Step 8: Install and Configure PM2

PM2 keeps your application running even after you disconnect from SSH.

### 8.1 Install PM2 Globally

```bash
sudo npm install -g pm2
```

### 8.2 Start Application with PM2

```bash
pm2 start npm --name "ai-homecare" -- start
```

You should see:
```
┌─────┬──────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ mode        │ ↺       │ status  │ cpu      │
├─────┼──────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ ai-homecare  │ fork        │ 0       │ online  │ 0%       │
└─────┴──────────────┴─────────────┴─────────┴─────────┴──────────┘
```

### 8.3 Configure PM2 to Start on Reboot

```bash
pm2 save
pm2 startup
```

Copy and run the command that PM2 outputs (it will look like):
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### 8.4 Verify Application is Running

```bash
pm2 status
pm2 logs ai-homecare --lines 20
```

You should see Next.js logs indicating the server is running on port 3000.

### 8.5 Test Direct Access

```bash
curl http://localhost:3000
```

You should see HTML output.

---

## Step 9: Install and Configure Nginx

Nginx acts as a reverse proxy, handling incoming requests and forwarding them to your Next.js app.

### 9.1 Install Nginx

```bash
sudo apt install -y nginx
```

### 9.2 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/ai-homecare
```

### 9.3 Paste Nginx Configuration

**If using IP address only (no domain):**

```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }
}
```

**If using a domain name:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }
}
```

Replace `YOUR_EC2_PUBLIC_IP` or `yourdomain.com` with your actual values.

**Save and exit**: `Ctrl + X`, `Y`, `Enter`

### 9.4 Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/ai-homecare /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default
```

### 9.5 Test Nginx Configuration

```bash
sudo nginx -t
```

You should see:
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 9.6 Restart Nginx

```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 9.7 Check Nginx Status

```bash
sudo systemctl status nginx
```

Should show "active (running)".

---

## Step 10: Test the Application

### 10.1 Test from EC2 Instance

```bash
curl http://localhost
```

Should return HTML.

### 10.2 Test from Your Browser

Open your browser and go to:

```
http://YOUR_EC2_PUBLIC_IP
```

You should see the AI Homecare login page!

---

## Step 11: Set Up SSL Certificate (Optional but Recommended)

### 11.1 Prerequisites

You need a domain name pointing to your EC2 IP address.

**Steps to point domain to EC2:**
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS settings
3. Create an A record:
   - Type: A
   - Name: @ (or leave blank)
   - Value: YOUR_EC2_PUBLIC_IP
   - TTL: 3600
4. Create a CNAME record for www:
   - Type: CNAME
   - Name: www
   - Value: yourdomain.com
   - TTL: 3600
5. Wait 5-30 minutes for DNS propagation

### 11.2 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 11.3 Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email address
- Agree to terms of service (Y)
- Share email with EFF (your choice)
- Certbot will automatically configure Nginx

### 11.4 Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

Should complete successfully.

### 11.5 Update Environment Variable

```bash
cd /home/ubuntu/ai-homecare
nano .env.local
```

Change:
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Save and exit.

### 11.6 Restart Application

```bash
pm2 restart ai-homecare
```

### 11.7 Test HTTPS

Open browser:
```
https://yourdomain.com
```

You should see a padlock icon indicating secure connection!

---

## Step 12: Set Up Firewall (UFW)

### 12.1 Enable UFW

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Type `y` when prompted.

### 12.2 Verify Firewall Status

```bash
sudo ufw status
```

Should show:
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```

---

## Step 13: Configure Stripe Webhooks

### 13.1 Update Stripe Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to Developers → Webhooks
3. Click "Add endpoint"
4. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
5. Listen to events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click "Add endpoint"
7. Copy the webhook signing secret
8. Update `.env.local` on EC2 with the new secret

### 13.2 Restart Application

```bash
pm2 restart ai-homecare
```

---

## Step 14: Monitoring and Maintenance

### 14.1 Useful PM2 Commands

```bash
# View logs
pm2 logs ai-homecare

# View last 50 lines
pm2 logs ai-homecare --lines 50

# Monitor in real-time
pm2 monit

# Restart app
pm2 restart ai-homecare

# Stop app
pm2 stop ai-homecare

# View status
pm2 status
```

### 14.2 Useful Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

### 14.3 Update Application

When you need to update the code:

```bash
cd /home/ubuntu/ai-homecare

# If using Git
git pull origin main

# Rebuild
npm install
npm run build

# Restart
pm2 restart ai-homecare
```

---

## 📊 Quick Reference

### Application URLs

- **HTTP**: http://YOUR_EC2_PUBLIC_IP
- **HTTPS**: https://yourdomain.com (if SSL configured)
- **Login**: https://yourdomain.com/login
- **Dashboard**: https://yourdomain.com/dashboard

### Important Paths

- **Application**: `/home/ubuntu/ai-homecare`
- **Environment**: `/home/ubuntu/ai-homecare/.env.local`
- **Nginx Config**: `/etc/nginx/sites-available/ai-homecare`
- **Nginx Logs**: `/var/log/nginx/`
- **PM2 Logs**: `~/.pm2/logs/`

### Important Commands

```bash
# SSH into server
ssh -i ai-homecare-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# View application logs
pm2 logs ai-homecare

# Restart application
pm2 restart ai-homecare

# Check system resources
htop
df -h
free -m
```

---

## 🐛 Troubleshooting

### Issue: Cannot connect via SSH

**Solution:**
1. Check security group allows SSH (port 22) from your IP
2. Verify you're using correct key file
3. Ensure key file has correct permissions

### Issue: Application not accessible in browser

**Solution:**
1. Check PM2 status: `pm2 status`
2. Check Nginx status: `sudo systemctl status nginx`
3. Check security group allows HTTP (80) and HTTPS (443)
4. View logs: `pm2 logs ai-homecare`

### Issue: "502 Bad Gateway"

**Solution:**
1. Check if Next.js is running: `pm2 status`
2. Restart application: `pm2 restart ai-homecare`
3. Check logs: `pm2 logs ai-homecare`
4. Verify port 3000 is listening: `netstat -tulpn | grep 3000`

### Issue: SSL certificate fails

**Solution:**
1. Ensure domain points to EC2 IP: `nslookup yourdomain.com`
2. Wait for DNS propagation (up to 48 hours)
3. Check Nginx config: `sudo nginx -t`
4. Try again: `sudo certbot --nginx -d yourdomain.com`

### Issue: "Out of memory" errors

**Solution:**
1. Upgrade instance type to t3.large or larger
2. Add swap space:
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

---

## 🎉 Success!

Your AI Homecare Management System is now deployed to AWS EC2!

### What's Next?

1. ✅ Set up database backups
2. ✅ Configure monitoring (CloudWatch)
3. ✅ Set up automated backups
4. ✅ Configure email notifications
5. ✅ Set up staging environment
6. ✅ Implement CI/CD pipeline

---

## 📞 Need Help?

- Check AWS EC2 documentation
- Review application logs: `pm2 logs ai-homecare`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

---

**Deployment completed successfully! 🚀**
