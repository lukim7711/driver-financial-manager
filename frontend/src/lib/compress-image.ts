const MAX_SIZE = 1024 * 1024 // 1MB (ocr.space free limit)
const MAX_WIDTH = 2048
const MAX_HEIGHT = 4096

function resizeCanvas(
  img: HTMLImageElement,
  maxW: number,
  maxH: number
): { width: number; height: number } {
  let { width, height } = img
  if (width > maxW || height > maxH) {
    const ratio = Math.min(maxW / width, maxH / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }
  return { width, height }
}

function canvasToFile(
  canvas: HTMLCanvasElement,
  name: string,
  quality: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Compression failed'))
          return
        }
        resolve(
          new File([blob], name, { type: 'image/jpeg' })
        )
      },
      'image/jpeg',
      quality
    )
  })
}

export async function compressImage(
  file: File
): Promise<File> {
  if (file.size <= MAX_SIZE) return file

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = async () => {
      URL.revokeObjectURL(url)

      const { width, height } = resizeCanvas(
        img, MAX_WIDTH, MAX_HEIGHT
      )

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas not supported'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)

      try {
        let quality = 0.85
        const MIN_QUALITY = 0.4
        let result = await canvasToFile(
          canvas, file.name, quality
        )

        while (
          result.size > MAX_SIZE &&
          quality > MIN_QUALITY
        ) {
          quality -= 0.1
          result = await canvasToFile(
            canvas, file.name, quality
          )
        }

        resolve(result)
      } catch (err) {
        reject(err)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
