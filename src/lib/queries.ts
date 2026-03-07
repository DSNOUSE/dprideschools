export const homepageQuery = `
*[_type == "homepage"][0]{
  heroTitle,
  heroSubtitle,
  heroCta->{label, href},
  headteacherMessage->{name, message},
  news[]->{title, slug, excerpt, publishedAt},
  admissions->{title, description, bookVisitLabel, applyLabel},
  openMornings->{title, description, dates, bookingRequired}
}
`;

export const newsQuery = `
*[_type == "news"] | order(publishedAt desc){
  title,
  slug,
  excerpt,
  publishedAt,
  body
}
`;

export const admissionsQuery = `
*[_type == "admissions"][0]{
  heroTitle,
  heroDescription,
  howToApply,
  requirements,
  faqs
}
`;

export const openMorningsQuery = `
*[_type == "openMornings"][0]{
  title,
  description,
  dates,
  bookingRequired
}
`;

export const newsletterQuery = `
*[_type == "newsletter"] | order(publishedAt desc){
  title,
  file->{url, originalFilename},
  publishedAt
}
`;
