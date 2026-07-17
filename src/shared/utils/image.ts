export function getOptimizedImageUrl(
  url: string,
  options?: { width?: number; height?: number; quality?: number; format?: string },
): string {
  if (!url) return ''
  const { width, height, quality = 80, format = 'webp' } = options || {}

  // If it's an Unsplash URL
  if (url.includes('images.unsplash.com')) {
    const urlObj = new URL(url)
    if (width) urlObj.searchParams.set('w', width.toString())
    if (height) urlObj.searchParams.set('h', height.toString())
    if (quality) urlObj.searchParams.set('q', quality.toString())
    if (format) urlObj.searchParams.set('fm', format)
    return urlObj.toString()
  }

  // If it's a Cloudinary URL
  if (url.includes('res.cloudinary.com')) {
    const parts = url.split('/upload/')
    if (parts.length === 2) {
      const transforms = []
      if (width) transforms.push(`w_${width}`)
      if (height) transforms.push(`h_${height}`)
      if (quality) transforms.push(`q_${quality}`)
      if (format) transforms.push(`f_${format}`)
      const transformStr = transforms.length > 0 ? transforms.join(',') + '/' : ''
      return `${parts[0]}/upload/${transformStr}${parts[1]}`
    }
  }

  // Fallback for Firebase Storage or others
  return url
}

export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = (e) => reject(new Error('Failed to load image'));
    img.src = url;
  });
}
