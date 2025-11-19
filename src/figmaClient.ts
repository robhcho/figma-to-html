import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()
const FIGMA_TOKEN = process.env.FIGMA_TOKEN

if(!FIGMA_TOKEN) throw new Error('Unauthorized')

export const fetchFigmaFile = async (key: string) => {
  const url = `https://api.figma.com/v1/files/${key}`
  
  try {
    const response = await axios.get(url, {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN,
      }
    })

    return response.data
  } catch (err: any) {
    console.error('Failed to fetch Figma file')
    console.error(err.response?.data || err.message)
    throw new Error('Figma API request failed')
  }
}