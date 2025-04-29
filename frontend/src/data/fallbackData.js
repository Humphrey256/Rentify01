// Fallback data to display when the backend is unavailable (e.g., during Render spin-up)
export const fallbackProducts = [
  {
    id: 'sample-1',
    name: 'Sample Car',
    price: 50,
    details: 'This is a sample car shown while the server is starting up. Data will refresh once the server is available.',
    is_available: true,
    category: 'car',
    image: 'sample-car.jpg'
  },
  {
    id: 'sample-2',
    name: 'Sample Machine',
    price: 25,
    details: 'This is a sample machine shown while the server is starting up. Data will refresh once the server is available.',
    is_available: true,
    category: 'machine',
    image: 'sample-machine.jpg'
  },
  {
    id: 'sample-3',
    name: 'Sample Generator',
    price: 35,
    details: 'This is a sample generator shown while the server is starting up. Data will refresh once the server is available.',
    is_available: true,
    category: 'machine',
    image: 'sample-generator.jpg'
  }
];