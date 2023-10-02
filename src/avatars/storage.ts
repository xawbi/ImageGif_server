import { diskStorage } from 'multer'
import * as fs from 'fs'
import { normalizeFileName } from '../files/storage'

const generatePathName = (req, file, callback) => {
  const userId = req.user.id
  const userFolderPath = `./avatars/${userId}`

  if (!fs.existsSync(userFolderPath)) {
    fs.mkdirSync(userFolderPath)
  } else {
    // Получить список файлов в папке пользователя
    const files = fs.readdirSync(userFolderPath)
    // Если есть файлы, удалить их
    if (files.length > 0) {
      files.forEach(file => {
        fs.unlinkSync(`${userFolderPath}/${file}`)
      })
    }
  }

  callback(null, userFolderPath)
}

export const avatarStorage = diskStorage({
  destination: generatePathName,
  filename: normalizeFileName,
})
