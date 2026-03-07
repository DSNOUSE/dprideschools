export default {
  name: 'openMornings',
  title: 'Open Mornings',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'dates',
      title: 'Dates',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'date', title: 'Date', type: 'string' },
            { name: 'time', title: 'Time', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'bookingRequired',
      title: 'Booking Required',
      type: 'boolean',
      initialValue: false,
    },
  ],
};
