# Quick EC2 Deployment Checklist

Use this checklist to track your deployment progress.

---

## Pre-Deployment

- [ ] AWS account ready
- [ ] Supabase project set up
- [ ] Database schema executed
- [ ] Stripe account configured
- [ ] OpenAI API key obtained
- [ ] Domain name (optional)

---

## EC2 Setup

- [ ] Launch EC2 instance (t3.medium, Ubuntu 22.04)
- [ ] Configure security group (SSH, HTTP, HTTPS)
- [ ] Download and save key pair (.pem file)
- [ ] Note EC2 public IP address
- [ ] Connect via SSH successfully

---

## Server Configuration

- [ ] Update Ubuntu packages (`sudo apt update && sudo apt upgrade -y`)
- [ ] Install Node.js 20.x
- [ ] Install Git
- [ ] Install build tools

---

## Application Setup

- [ ] Upload/clone application code
- [ ] Create `.env.local` with all credentials
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Verify build completed successfully

---

## PM2 Setup

- [ ] Install PM2 globally
- [ ] Start application with PM2
- [ ] Configure PM2 startup script
- [ ] Save PM2 configuration
- [ ] Verify application running with `pm2 status`

---

## Nginx Setup

- [ ] Install Nginx
- [ ] Create Nginx configuration file
- [ ] Enable site configuration
- [ ] Test Nginx configuration (`sudo nginx -t`)
- [ ] Restart Nginx
- [ ] Verify Nginx is running

---

## Testing

- [ ] Test from EC2: `curl http://localhost`
- [ ] Test from browser: `http://YOUR_EC2_IP`
- [ ] Verify login page loads
- [ ] Test login functionality
- [ ] Test dashboard access

---

## SSL Certificate (Optional)

- [ ] Point domain to EC2 IP
- [ ] Verify DNS propagation
- [ ] Install Certbot
- [ ] Obtain SSL certificate
- [ ] Update `NEXT_PUBLIC_APP_URL` in `.env.local`
- [ ] Restart application
- [ ] Test HTTPS access

---

## Security

- [ ] Configure UFW firewall
- [ ] Verify firewall rules
- [ ] Update Stripe webhook URL
- [ ] Test webhook endpoint

---

## Final Steps

- [ ] Document all credentials securely
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test all features
- [ ] Train users

---

## Monitoring Commands

```bash
# Application status
pm2 status

# View logs
pm2 logs ai-homecare

# Nginx status
sudo systemctl status nginx

# System resources
htop
df -h
free -m

# Check listening ports
netstat -tulpn
```

---

## Important Information

**EC2 Public IP**: _______________________

**EC2 Public DNS**: _______________________

**Domain Name**: _______________________

**SSH Command**:
```bash
ssh -i ai-homecare-key.pem ubuntu@YOUR_IP
```

**Application URL**: _______________________

---

## Emergency Contacts

**AWS Support**: https://console.aws.amazon.com/support/

**Supabase Support**: https://supabase.com/support

**Stripe Support**: https://support.stripe.com/

---

✅ **Deployment Complete!**
