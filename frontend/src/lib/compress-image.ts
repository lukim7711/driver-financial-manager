const MAX_SIZE = 1024 * 1024 // 1MB (ocr.space free limit)

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

      let { width, height } = img

      // Strategy: keep original resolution if width <= 1080
      // Only downscale if extremely large (e.g. tablet screenshots)
      const MAX_W = 1440
      const MAX_H = 10000
      if (width > MAX_W || height > MAX_H) {
        const ratio = Math.min(
          MAX_W / width, MAX_H / height
        )
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

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
        // Progressive quality: start high, step down
        let quality = 0.9
        const MIN_QUALITY = 0.35
        const STEP = 0.1
        let result = await canvasToFile(
          canvas, file.name, quality
        )

        while (
          result.size > MAX_SIZE &&
          quality > MIN_QUALITY
        ) {
          quality -= STEP
          result = await canvasToFile(
            canvas, file.name, quality
          )
        }

        // If still too large, scale down width to 720
        if (result.size > MAX_SIZE && width > 720) {
          const ratio2 = 720 / width
          const w2 = Math.round(width * ratio2)
          const h2 = Math.round(height * ratio2)
          canvas.width = w2
          canvas.height = h2
          const ctx2 = canvas.getContext('2d')
          if (ctx2) {
            ctx2.drawImage(img, 0, 0, w2, h2)
            result = await canvasToFile(
              canvas, file.name, 0.6
            )
          }
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

export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}
