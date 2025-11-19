import dotenv from 'dotenv'
import { fetchFigmaFile } from './figmaClient.js'
import { findFrame } from './utils/findTargetFrame.js'
import { extractText } from './utils/extractText.js'
import fs from 'fs'

dotenv.config()

const CACHE_PATH = './figmaCache.json'

const main = async () => {
  const fileKey = process.env.FILE_KEY
  if(!fileKey) {
    console.error('Missing file key')
    process.exit(1)
  }  

  let fileData
  
  if(fs.existsSync(CACHE_PATH)) {
    console.log('using cached figma data')
    fileData = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'))
  } else {
    fileData = await fetchFigmaFile(fileKey)
    console.log('connected to figma successfully')
    fs.writeFileSync(CACHE_PATH, JSON.stringify(fileData, null, 2))
    console.log('cached figma data')
  }

  const root = fileData.nodes["0:0"].document
  if(!root) {
    console.error('could not find root')
    console.log('available keys:', Object.keys(fileData))
    process.exit(1)
  }
  
  const screen = findFrame(root, 'Sign in screen')    
  console.log('target frame:', JSON.stringify(screen, null, 2))  
  const texts = extractText(root)
  console.log(JSON.stringify(texts, null, 2))
}

main().catch((err) => {
  console.error(err)
})