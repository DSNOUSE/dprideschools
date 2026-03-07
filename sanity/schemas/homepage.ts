export default {
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    {
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      description: 'Main headline on the homepage',
    },
    {
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      rows: 3,
    },
    {
      name: 'heroCta',
      title: 'Hero Call to Action',
      type: 'object',
      fields: [
        { name: 'label', title: 'Label', type: 'string' },
        { name: 'href', title: 'Link', type: 'string' },
      ],
    },
    {
      name: 'headteacherMessage',
      title: 'Headteacher Message',
      type: 'object',
      fields: [
        { name: 'name', title: 'Name', type: 'string' },
        { name: 'message', title: 'Message', type: 'text', rows: 5 },
      ],
    },
    {
      name: 'news',
      title: 'News Items',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'news' }] }],
    },
    {
      name: 'admissions',
      title: 'Admissions Callout',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'bookVisitLabel', title: 'Book Visit Label', type: 'string' },
        { name: 'applyLabel', title: 'Apply Label', type: 'string' },
      ],
    },
  ],
};
