import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import homepage from './sanity/schemas/homepage';
import news from './sanity/schemas/news';
import admissions from './sanity/schemas/admissions';
import openMornings from './sanity/schemas/openMornings';
import newsletter from './sanity/schemas/newsletter';

export default defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  title: 'DPRIDE International School',
  basePath: '/admin/studio',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: [homepage, news, admissions, openMornings, newsletter],
  },
});
