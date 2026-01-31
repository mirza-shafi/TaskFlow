/**
 * Utility function to get the full URL for an avatar
 * Handles both relative paths from API and full URLs
 */
export function getAvatarUrl(avatarPath?: string): string {
  if (!avatarPath) return '';
  
  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  
  // Get API base URL (remove /api/v1 from the end if present)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
  const baseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, '');
  
  // Remove leading slash from avatar path if present
  const cleanPath = avatarPath.startsWith('/') ? avatarPath.slice(1) : avatarPath;
  
  // Combine base URL with avatar path
  return `${baseUrl}/${cleanPath}`;
}

/**
 * Get user initials for avatar fallback
 */
export function getUserInitials(name?: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
