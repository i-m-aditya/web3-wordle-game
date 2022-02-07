import { getGuessStatuses } from './statuses'
import { solutionIndex } from './words'
import { GAME_TITLE } from '../constants/strings'
import { createImage } from './ImgConverter'

function parseGuessesIntoNumbers(guesses: string[]) {
  const length = guesses.length
  const correctGuess = guesses[length - 1]
  console.log(correctGuess)
}

export const shareStatus = (
  guesses: string[],
  lost: boolean,
  account: string
) => {
  console.log(
    `${GAME_TITLE} ${solutionIndex} ${lost ? 'X' : guesses.length}/6\n\n`
  )

  navigator.clipboard.writeText(
    `${GAME_TITLE} ${solutionIndex} ${lost ? 'X' : guesses.length}/6\n\n` +
      generateEmojiGrid(guesses)
  )
  const wordleNumber = solutionIndex.toString()
  const wordleScore = `${lost ? 'X' : guesses.length}/6`
  var today = new Date()
  var date =
    today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
  var time =
    today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()

  var timeOfCompletion = date + ' || ' + time
  createImage(
    wordleNumber,
    wordleScore,
    generateEmojiGrid(guesses),
    account,
    timeOfCompletion
  )
}

export const generateEmojiGrid = (guesses: string[]) => {
  return guesses
    .map((guess) => {
      const status = getGuessStatuses(guess)
      return guess
        .split('')
        .map((_, i) => {
          switch (status[i]) {
            case 'correct':
              return '🟩'
            case 'present':
              return '🟨'
            default:
              return '⬛'
          }
        })
        .join('')
    })
    .join('\n')
}
