# 🚀 EC2 Deployment - Quick Commands Reference

Copy and paste these commands in order.

---

## 1️⃣ Connect to EC2

```bash
ssh -i ai-homecare-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## 2️⃣ Update System & Install Node.js

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential git
node --version
npm --version
```

---

## 3️⃣ Upload Application

**Option A: Using SCP (from your local machine)**
```bash
scp -i ai-homecare-key.pem -r "C:\AI System Dispatcher\AI Homecare" ubuntu@YOUR_EC2_IP:/home/ubuntu/ai-homecare
```

**Option B: Using Git (from EC2)**
```bash
cd /home/ubuntu
git clone YOUR_REPO_URL ai-homecare
cd ai-homecare
```

---

## 4️⃣ Configure Environment

```bash
cd /home/ubuntu/ai-homecare
nano .env.local
```

**Paste your environment variables, then save:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

---

## 5️⃣ Build Application

```bash
npm install
npm run build
```

---

## 6️⃣ Install & Configure PM2

```bash
sudo npm install -g pm2
pm2 start npm --name "ai-homecare" -- start
pm2 save
pm2 startup
# Copy and run the command that PM2 outputs
pm2 status
```

---

## 7️⃣ Install & Configure Nginx

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/ai-homecare
```

**Paste this configuration:**
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
    }
}
```

**Save and enable:**
```bash
sudo ln -s /etc/nginx/sites-available/ai-homecare /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 8️⃣ Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 9️⃣ Test Application

```bash
curl http://localhost
```

**Open in browser:**
```
http://YOUR_EC2_PUBLIC_IP
```

---

## 🔟 Install SSL (Optional - Requires Domain)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Update environment:**
```bash
nano .env.local
# Change NEXT_PUBLIC_APP_URL to https://yourdomain.com
pm2 restart ai-homecare
```

---

## 📊 Useful Commands

### View Application Logs
```bash
pm2 logs ai-homecare
pm2 logs ai-homecare --lines 50
```

### Restart Application
```bash
pm2 restart ai-homecare
```

### Check Status
```bash
pm2 status
sudo systemctl status nginx
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### System Resources
```bash
htop
df -h
free -m
```

### Update Application
```bash
cd /home/ubuntu/ai-homecare
git pull  # if using Git
npm install
npm run build
pm2 restart ai-homecare
```

---

## 🐛 Troubleshooting

### Application not starting?
```bash
pm2 logs ai-homecare --lines 100
pm2 restart ai-homecare
```

### Nginx errors?
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

### Port already in use?
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
pm2 restart ai-homecare
```

### Check if Next.js is running
```bash
netstat -tulpn | grep 3000
curl http://localhost:3000
```

---

## 🔑 Security Group Ports

Make sure these ports are open in AWS Security Group:

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | My IP | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS |

---

## ✅ Done!

Your application should now be running at:
```
http://YOUR_EC2_PUBLIC_IP
```

Or if you set up SSL:
```
https://yourdomain.com
```

---

**Need detailed instructions?** See `AWS_EC2_DEPLOYMENT_GUIDE.md`
