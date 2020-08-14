import fs from 'fs'
import path from 'path'

import activeDir from './active-dir'

export default function removeImage(filePath: string) {
  filePath = path.join(activeDir, '..', filePath)
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, error => {
      if (error) reject(error)
      resolve()
    })
  })
}