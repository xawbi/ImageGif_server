import { Injectable, PipeTransform } from '@nestjs/common'
import * as path from 'path'
import * as sharp from 'sharp'
import { diskStorage } from 'multer'
import * as fs from 'fs'
import * as uuid from 'uuid'

export const fileFilter = (req, file, callback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/webp',
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true)
  } else {
    callback(new Error('Invalid file type'))
  }
}

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<string>>
{
  async transform(file: Express.Multer.File): Promise<string> {
    try {
      const filename: string = uuid.v4() + '.' + file.mimetype.split('/')[1]

      const uploadDirectory = global.filePath
      if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, { recursive: true })
      } else if (uploadDirectory.split('/')[1] !== `uploads`) {
        const files = fs.readdirSync(uploadDirectory)
        if (files.length > 0) {
          files.map(file => {
            fs.unlinkSync(`${uploadDirectory}/${file}`)
          })
        }
      }

      const metadataFile = await sharp(file.buffer).metadata()
      let width = metadataFile.width
      let height = metadataFile.height
      let size = metadataFile.size

      if (file.mimetype !== 'image/gif') {
        const result = await sharp(file.buffer)
          .webp({ quality: 100 })
          .toFile(path.join(uploadDirectory, filename))

        width = result.width
        height = result.height
        size = result.size
      } else {
        const gifFilePath = path.join(uploadDirectory, filename)

        diskStorage({
          destination: (req, file, callback) => {
            callback(null, uploadDirectory)
          },
          filename: (req, file, callback) => {
            callback(null, filename)
          },
        })

        const fileStream = fs.createWriteStream(gifFilePath)
        fileStream.write(file.buffer)
      }

      if (uploadDirectory.split('/')[1] !== `avatars`) {
        return `${filename} ${width} ${height} ${size}`
      } else return `${filename} ${size}`
    } catch (error) {
      console.error('Error in SharpPipe:', error)
      throw error
    }
  }
}
