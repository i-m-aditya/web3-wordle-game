import axios from 'axios'
import { BigNumber, ethers } from 'ethers'
import { parse } from 'path/posix'
import { WOW_ABI } from '../constants/abi'
import { wowContract } from '../constants/setup'

function getHtml(
  wordleNumber: string,
  wordleScore: string,
  address: string,
  grid: string,
  timeOfCompletion: string,
  level: string
) {
  let customHtml = `
    <div class="wordle">
        <div class="container">  
            <div class="container-item">
                Wordle #${wordleNumber}
            </div>
            <div class="container-item">
                Score :: ${wordleScore}
            </div>
            <div class="container-item">
                Holder :: ${address}
            </div>
            <div>
                Level :: ${level}
            </div>
            <div class="container-item">
                Time :: ${timeOfCompletion}
            </div>
        </div> 
        ${grid}
    </div>
    `

  return customHtml
}

export const shortAddress = (address: string) => {
  if (address === '') {
    return ''
  }
  return address.substr(0, 5) + '...' + address.substr(address.length - 6)
}

function getCSS() {
  const css = `.wordle 
        { 
            border: 4px dotted #03B875; 
            padding: 20px; 
            height: 100%;
            font:  12px/26px Georgia, serif;
            background-color: black;
            color: gray;
        }
        .rows {
            display: flex;
            justify-content: center;
            align-items: center;
        } 
        .container-item {
            margin-top: 0;
        }
        br {
            display: block;
            content: "";
            margin-top: 0;
         }
    `
  return css
}

export async function createImage(
  wordleNumber: string,
  wordleScore: string,
  grid: string,
  account: string,
  timeOfCompletion: string
) {
  grid = grid.replaceAll('\n', '<br>')

  const level = await wowContract.addressToLevel(account)

  const HTML = getHtml(
    wordleNumber,
    wordleScore,
    shortAddress(account),
    grid,
    timeOfCompletion,
    level
  )
  console.log('--html--')
  console.log(HTML)

  const payload = {
    html: `${HTML}`,
    css: `${getCSS()}`,
  }
  let headers = {
    auth: {
      username: '0a2763a2-f0c8-4b30-b800-ae7117236aa8',
      password: 'b03aeace-4c20-4755-9c7f-9a68c772a925',
    },
    headers: {
      'Content-Type': 'application/json',
    },
  }

  let imageUrl: string
  try {
    const response = await axios.post(
      'https://hcti.io/v1/image',
      JSON.stringify(payload),
      headers
    )
    imageUrl = response.data.url
    console.log('Image URL')

    console.log(response.data.url)
    const tokenURI = await uploadImageMetadataToIpfs(
      imageUrl,
      wordleNumber,
      wordleScore,
      timeOfCompletion,
      level
    )
    mintNFT(account, tokenURI)
  } catch (error) {
    console.error(error)
  }
}

async function mintNFT(address: string, tokenURI: string) {
  console.log('WowContract')

  console.log(wowContract)

  const tx = await wowContract.mint(tokenURI, address)
  tx.wait()

  var tokenId = await wowContract.tokenId()

  tokenId = parseInt(tokenId)

  const uri = await wowContract.tokenIdToTokenUri(tokenId - 1)
  console.log('URI')

  console.log(uri)
}

async function uploadImageMetadataToIpfs(
  imageUrl: string,
  wordleNumber: string,
  wordleScore: string,
  timeOfCompletion: string,
  level: string
) {
  console.log('IMAGE-URL')
  console.log(imageUrl)
  console.log('level')
  console.log(level)

  const requestBody = {
    name: `Wordle #${wordleNumber}`,
    description: `Wordle #${wordleNumber}`,
    file_url: imageUrl,
    attributes: [
      {
        trait_type: 'Score',
        value: wordleScore,
      },
      {
        trait_type: 'Time of completion',
        value: timeOfCompletion,
      },
      {
        trait_type: 'Level',
        value: level.toString(),
      },
    ],
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: '4bf08cbc-304e-40e6-9ce3-4eded8ea524c',
  }

  console.log('Request Body')

  console.log(JSON.stringify(requestBody))

  const response = await axios.post(
    'https://api.nftport.xyz/v0/metadata',
    JSON.stringify(requestBody),
    { headers: headers }
  )

  console.log('-----Response-----')
  console.log(response.data.metadata_uri)
  return response.data.metadata_uri
}
