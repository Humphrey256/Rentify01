/**
 * Utility function to get the correct image URL regardless of environment
 * @param {string} imagePath - The image path from the API
 * @returns {string} - The correct URL for the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/600x400?text=No+Image';
  
  // If it's already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  // Handle different path formats
  if (imagePath.startsWith('/')) {
    return `${baseUrl}${imagePath}`;
  } else {
    return `${baseUrl}/${imagePath}`;
  }
};
