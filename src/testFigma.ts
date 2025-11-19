import dotenv from 'dotenv'
import { fetchFigmaFile } from './figmaClient.js'
dotenv.config()

const main = async () => {
  const fileKey = process.env.FILE_KEY
  if(!fileKey) {
    console.error('Missing file key')
    process.exit(1)
  }  
  
  const fileData = await fetchFigmaFile(fileKey)

  console.log('connected to figma successfully')
  console.log('file:', fileData)
}

main().catch((err) => {
  console.error(err)
})