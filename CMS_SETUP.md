# CMS Setup (Sanity)

1. Create a Sanity account at https://www.sanity.io/
2. Create a new project
3. Copy the Project ID and Dataset name into your `.env`:
   - NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   - NEXT_PUBLIC_SANITY_DATASET=production
4. Run `npx sanity dev` to start the studio locally
5. Create content:
   - Homepage (single document)
   - News (multiple documents)
   - Admissions (single document)
6. Deploy the studio to Vercel or Netlify for easy editing by non-technical staff.

# Forms

- Admissions form uses Formspree: replace `YOUR_FORM_ID` with your Formspree form ID.
- Alternatively, use Sanity Forms or a simple API route + email service.

# Preview

- To enable draft preview, set SANITY_PREVIEW_SECRET in your environment.
- Access `/api/preview?secret=YOUR_SECRET` to preview drafts.
