Quick start:
1) Push this folder to a new GitHub repo.
2) Netlify → Add new site → Import from Git.
   - Build: npm run build
   - Publish: dist
3) Netlify → Site → Settings → Environment → add:
   - WHOP_CLIENT_ID, WHOP_CLIENT_SECRET (from Whop)
   - WHOP_REDIRECT_URI = https://YOUR-DOMAIN.com/api/auth/callback
   - WHOP_SIGNUP_URL = https://whop.com/social-experiment-tts/
   - WHOP_PRODUCT_ID (or WHOP_COMPANY_ID)
   - ADMIN_WHOP_USER_IDS = user_xxx,user_yyy (optional)
4) Deploy. Visit /members to test.