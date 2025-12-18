This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Google Sheets CMS Setup

This project can use a Google Sheet as a CMS.

1. Create a Google Sheet with the following columns (headers):
   - `id` (unique identifier)
   - `name` (Race name)
   - `date` (ISO 8601 format, e.g., 2026-04-09T00:00:00Z)
   - `location` (City)
   - `province` (Province)
   - `distance` (Comma separated, e.g., "10k, 21k")
   - `type` ("road" or "trail")
   - `url` (Official website URL)
   - `image` (Image URL)
   - `description` (Long description)
   - `discountCode` (Optional discount code)

2. Go to **File > Share > Publish to web**.
3. Select **Entire Document** (or the specific sheet) and **Comma-separated values (.csv)**.
4. Click **Publish** and copy the link.
5. Create a `.env.local` file in the root of the project.
6. Add the variable:
   ```
   GOOGLE_SHEET_CSV_URL=your_csv_link_here
   ```
7. Restart the server.
