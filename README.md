# AirWatch — Vercel frontend starter

This folder is a static frontend starter for deployment on Vercel.

## Upload to GitHub
1. Create/open your `airwatch` GitHub repository.
2. Choose **Add file → Upload files**.
3. Extract this ZIP on your computer first, then upload `index.html`, `vercel.json`, and this `README.md` from the extracted folder (not the ZIP itself).
4. Commit the files.
5. In Vercel, choose **Add New → Project**, import the `airwatch` repository, and deploy with the default static settings.

## Important limitations
This frontend is not a live monitoring service. The original prototype uses a FastAPI backend (`/api/...`) and a separate long-running worker; those are not included as Vercel static functions here. Vercel static hosting alone cannot continuously process a live stream or send real match alerts. Do not treat demo/simulated events as confirmed airings. A separate persistent backend/worker, durable storage for uploads, authorized stream ingest, a validated matcher, and email-provider credentials must be configured before real monitoring works.
