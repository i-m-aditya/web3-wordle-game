import {
  InformationCircleIcon,
  ChartBarIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/outline'
import { useState, useEffect } from 'react'
import { Alert } from './components/alerts/Alert'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { AboutModal } from './components/modals/AboutModal'
import { InfoModal } from './components/modals/InfoModal'
import { StatsModal } from './components/modals/StatsModal'
import { ethers } from 'ethers'
import { Cell } from './components/grid/Cell'
import Countdown from 'react-countdown'

import {
  GAME_TITLE,
  WIN_MESSAGES,
  GAME_COPIED_MESSAGE,
  ABOUT_GAME_MESSAGE,
  NOT_ENOUGH_LETTERS_MESSAGE,
  WORD_NOT_FOUND_MESSAGE,
  CORRECT_WORD_MESSAGE,
} from './constants/strings'
import { MAX_WORD_LENGTH, MAX_CHALLENGES } from './constants/settings'
import { isWordInWordList, isWinningWord, solution } from './lib/words'
import { addStatsForCompletedGame, loadStats } from './lib/stats'
import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
} from './lib/localStorage'

import './App.css'

const ALERT_TIME_MS = 2000

function App() {
  const prefersDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches

  const [account, setAccount] = useState('')
  const [signer, setSigner] = useState(null)
  const [provider, setProvider] = useState()

  const [currentGuess, setCurrentGuess] = useState('')
  const [isGameWon, setIsGameWon] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [isNotEnoughLetters, setIsNotEnoughLetters] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false)
  const [isGameLost, setIsGameLost] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [challenges, setChallenges] = useState([
    {
      host: 'Special',
      minDeposit: 100,
      expiry: 1644235200000,
      level: 1,
    },
    {
      host: 'Daily',
      minDeposit: 0,
      expiry: 1644235200000,
      level: 0,
    },
  ])
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme')
      ? localStorage.getItem('theme') === 'dark'
      : prefersDarkMode
      ? true
      : false
  )
  const [successAlert, setSuccessAlert] = useState('')
  const [guesses, setGuesses] = useState<string[]>(() => {
    const loaded = loadGameStateFromLocalStorage()
    if (loaded?.solution !== solution) {
      return []
    }
    const gameWasWon = loaded.guesses.includes(solution)
    if (gameWasWon) {
      setIsGameWon(true)
    }
    if (loaded.guesses.length === MAX_CHALLENGES && !gameWasWon) {
      setIsGameLost(true)
    }
    return loaded.guesses
  })

  const [stats, setStats] = useState(() => loadStats())

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    checkAccount()
  }, [isDarkMode])

  async function checkAccount() {
    //@ts-ignore
    if (window.ethereum) {
      //@ts-ignore
      const provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
      // Prompt user for account connections
      await provider.send('eth_requestAccounts', [])
      const signer = provider.getSigner()
      console.log('Account:', await signer.getAddress())
      const addr = await signer.getAddress()
      //@ts-ignore
      setSigner(signer)
      setAccount(addr)
      setIsWalletConnected(true)
    }
  }

  const connectWallet = async () => {
    //@ts-ignore
    if (window.ethereum) {
      try {
        //@ts-ignore
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        checkAccount()
      } catch (err) {
        console.log('user did not add account...', err)
      }
    }
  }

  const handleDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  useEffect(() => {
    saveGameStateToLocalStorage({ guesses, solution })
  }, [guesses])

  useEffect(() => {
    if (isGameWon) {
      setSuccessAlert(
        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      )
      setTimeout(() => {
        setSuccessAlert('')
        setIsStatsModalOpen(true)
      }, ALERT_TIME_MS)
    }
    if (isGameLost) {
      setTimeout(() => {
        setIsStatsModalOpen(true)
      }, ALERT_TIME_MS)
    }
  }, [isGameWon, isGameLost])

  const onChar = (value: string) => {
    if (
      currentGuess.length < MAX_WORD_LENGTH &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setCurrentGuess(`${currentGuess}${value}`)
    }
  }

  const onDelete = () => {
    setCurrentGuess(currentGuess.slice(0, -1))
  }

  const onEnter = () => {
    if (isGameWon || isGameLost) {
      return
    }
    if (!(currentGuess.length === MAX_WORD_LENGTH)) {
      setIsNotEnoughLetters(true)
      return setTimeout(() => {
        setIsNotEnoughLetters(false)
      }, ALERT_TIME_MS)
    }

    if (!isWordInWordList(currentGuess)) {
      setIsWordNotFoundAlertOpen(true)
      return setTimeout(() => {
        setIsWordNotFoundAlertOpen(false)
      }, ALERT_TIME_MS)
    }

    const winningWord = isWinningWord(currentGuess)

    if (
      currentGuess.length === MAX_WORD_LENGTH &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setGuesses([...guesses, currentGuess])
      setCurrentGuess('')

      if (winningWord) {
        setStats(addStatsForCompletedGame(stats, guesses.length))
        return setIsGameWon(true)
      }

      if (guesses.length === MAX_CHALLENGES - 1) {
        setStats(addStatsForCompletedGame(stats, guesses.length + 1))
        setIsGameLost(true)
      }
    }
  }

  return (
    <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
      <div className=" w-80 mx-auto items-center mb-8 mt-12">
        <div className="flex justify-center mb-1 mt-4">
          <Cell value="W" status="correct" />
          <Cell value="O" status="present" />
          <Cell value="R" />
          <Cell value="L" status="correct" />
          <Cell value="D" />
        </div>
        <div className="flex justify-center mb-1 mt-4">
          <Cell value="O" />
          <Cell value="F" status="correct" />
        </div>
        <div className="flex justify-center mb-1 mt-4">
          <Cell value="W" />
          <Cell value="O" status="present" />
          <Cell value="R" />
          <Cell value="D" status="correct" />
          <Cell value="L" status="present" />
          <Cell value="E" />
        </div>
        <div className="grid grid-cols-2">
          <div className="text-white text-xl pt-5 pb-2">Challenges</div>
        </div>
        {challenges.map((challenge, i) => {
          return (
            <div className="text-white text-xl py-3 px-5 border m-2 rounded-lg border-gray-600 bg-gradient-to-r from-gray-800">
              <div className="grid grid-cols-3 ">
                <div>
                  <div>{challenge.host}</div>
                  <div className="text-xs text-gray-500">
                    Min level {challenge.level}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="flex">
                    {/* <div className="px-4 py-2 text-gray-500 text-xs">
                        WOW required:
                      </div> */}
                    {/* <div className="text-xl text-center">
                        {challenge.minDeposit} WOW
                      </div> */}
                  </div>

                  <div className="flex">
                    <div className="px-4 py-2 text-gray-500 text-xs">
                      Time left:
                    </div>
                    <Countdown
                      className="text-lg font-medium text-gray-900 dark:text-gray-100"
                      date={challenge.expiry}
                      daysInHours={true}
                    />
                  </div>
                </div>
              </div>

              <div>
                <a href="/play">
                  <button className="w-full text-center mt-2 rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">
                    {challenge.minDeposit ? (
                      <div> Deposit {challenge.minDeposit} WOW and Play</div>
                    ) : (
                      <div>Play</div>
                    )}
                  </button>
                </a>
              </div>
            </div>
          )
        })}
        <div className="grid grid-cols-2">
          <button
            type="button"
            className="mx-auto mt-8 flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 select-none"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
          <a href="/stake">
            <button
              type="button"
              className="mx-auto mt-8 flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-100 bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 select-none"
              onClick={connectWallet}
            >
              Stake
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}

export default App
