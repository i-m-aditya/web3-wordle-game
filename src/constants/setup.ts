import { WOW_ABI } from './abi'
import { BigNumber, ethers } from 'ethers'

//@ts-ignore
const provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
export const signer = provider.getSigner()
export const wowContract = new ethers.Contract(
  '0x36d2010B315a6f901484c0609d5051854C2B6109',
  WOW_ABI,
  signer
)
