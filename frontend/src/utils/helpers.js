export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getStarArray = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  for (let i = 0; i < fullStars; i++) stars.push('full');
  if (hasHalf) stars.push('half');
  while (stars.length < 5) stars.push('empty');
  return stars;
};

export const categories = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Design',
  'Business',
  'Marketing',
  'Photography',
  'Music',
  'Other',
];

export const categoryIcons = {
  'Web Development': '🌐',
  'Mobile Development': '📱',
  'Data Science': '📊',
  'Machine Learning': '🤖',
  'Design': '🎨',
  'Business': '💼',
  'Marketing': '📈',
  'Photography': '📷',
  'Music': '🎵',
  'Other': '📚',
};
