# Operational Runbooks

## Staging & Production Deployment
- **Staging**: PRs are automatically deployed to preview URLs via Vercel.
- **Production**: Merging to `main` automatically deploys to production via Vercel.

## Rollback Strategy
### Vercel Instant Rollback
1. Navigate to the project on the Vercel dashboard.
2. Go to the "Deployments" tab.
3. Find the previous stable deployment.
4. Click the "..." menu and select **Promote to Production** or **Restore**.
5. Wait ~30 seconds for traffic to re-route.

### Firebase Revert
If a bad Firestore Security Rules deployment occurs:
1. Go to Firebase Console -> Firestore -> Rules.
2. Click on the "History" tab.
3. Select the previous stable version and click "Publish".

## Incident Response: App is Down
1. Check Vercel Status page (https://www.vercel-status.com/).
2. Check Firebase Status page (https://status.firebase.google.com/).
3. If both are operational, check the CI build logs for the latest deployment.
4. Rollback to the previous stable Vercel deployment immediately (see above).
5. Investigate locally by pulling `main` and running `npm run build` and `npm run preview`.

## Rotating Secrets
1. In Vercel, go to Settings -> Environment Variables.
2. Add the new secret value.
3. Trigger a redeploy to apply the new environment variables.

## Banning a User
1. Go to Firebase Console -> Authentication.
2. Find the user by email or UID.
3. Select "Disable account" from the options menu.
