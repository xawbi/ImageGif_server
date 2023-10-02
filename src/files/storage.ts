import { diskStorage } from 'multer'
import * as fs from 'fs'

const generateId = () =>
  Array(18)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('')

export const normalizeFileName = (req, file, callback) => {
  const fileExtName = file.originalname.split('.').pop()

  callback(null, `${generateId()}.${fileExtName}`)
}

const generatePathName = (req, file, callback) => {
  const userId = req.user.id

  const userFolderPath = `./uploads/${userId}`
  if (!fs.existsSync(userFolderPath)) {
    fs.mkdirSync(userFolderPath)
  }

  callback(null, userFolderPath)
}

export const fileFilter = (req, file, callback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true) // Принять файл
  } else {
    callback(new Error('Недопустимый тип файла')) // Отклонить файл
  }
}

export const fileStorage = diskStorage({
  destination: generatePathName,
  filename: normalizeFileName,
})
