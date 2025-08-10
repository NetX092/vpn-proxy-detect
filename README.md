# Render-ready VPN/Proxy Detection API

This project provides a simple endpoint to detect if a user's IP is a proxy/VPN using the free ip-api.com service, and then mark the user as banned in Firestore.

> NOTE: ip-api.com free endpoint has rate limits and less accuracy than paid IP intel providers. For production use consider IPQualityScore, MaxMind's Anonymous IP, or a paid plan.

## Setup
1. Create a Firebase service account (Project Settings → Service Accounts → Generate new private key). Keep the JSON.
2. Create a GitHub repo and push these files.
3. On Render, create a new **Web Service**:
   - Connect your GitHub repo
   - Build command: *(none required for this simple app)*
   - Start command: `node server.js`
   - Add environment variable `FIREBASE_SERVICE_ACCOUNT_KEY` with the entire JSON value (stringified). Render will store it safely.
4. Deploy. You'll get a HTTPS URL like `https://your-app.onrender.com/`.

## Frontend integration (Firebase client)
On dashboard load, call the endpoint:

```js
auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = '/login.html';

  const resp = await fetch(`https://YOUR-APP.onrender.com/check-ip?uid=${user.uid}`);
  const j = await resp.json();

  if (j.banned) {
    alert('You are using VPN/Proxy. Your account has been banned. Contact support to appeal.');
    await auth.signOut();
    location.href = '/banned.html';
  } else {
    // proceed to load dashboard
  }
});
```

## Notes & Recommendations
- **False positives:** free IP detection can misclassify. Use soft-suspensions first or require manual admin review.
- **Rate limits:** ip-api.com free tier is rate-limited. For higher traffic, upgrade to a paid service.
- **Security:** never commit the service account JSON to the repo. Use environment variables.
- **Logging:** consider adding a Firestore `ipChecks` collection to store API responses and timestamps for audit.