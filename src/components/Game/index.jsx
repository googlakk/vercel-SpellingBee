import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSpeechSynthesis } from 'react-speech-kit'
import axios from 'axios'

import stages from '../../utils/stages'
import levels from '../../utils/levels'
import LevelHeader from '../modules/LevelHeader/LevelHeader'
import styles from './Game.module.scss'
import Btn from '../modules/Buttons'
import AnswerModal from './AnswerModal'
import BtnCheck from '../modules/CheckButtons'
const Game = () => {
  const { speak, voices } = useSpeechSynthesis();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const stageId = searchParams.get('stage');
  const stage = stages[stageId - 1];
  const levelId = searchParams.get('level');
  const levelImg = levels[levelId - 1].img;

  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [prevWords] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const [open, setOpen] = useState(false);
  const [correct, setCorrect] = useState(false);

  const getWordsList = () => {
    axios.get(
      `http://localhost:3001/${stage.title.toLowerCase()}/${levelId}`
    ).then((res) => {
      setWords(res.data.words)
    })
  }

  useEffect(() => {
    getWordsList()
  }, [])

  const onChange = (e) => {
    setInputValue(e.target.value)
  }

  const playSound = (sound) => {
    if (sound) {
      speak({ text: sound, voice: voices[1], rate: 0.45, pitch: 0.75 })
    }
  }

  const nextWord = (correct) => {
    if (currentWord && correct) {
      prevWords.push(currentWord)
    }
    if (prevWords.length === words.length && words.length) {
      return alert('Thats all')
    }
    const newWord = words[Math.round(Math.random() * words.length - 1)]
    if (prevWords.includes(newWord)) {
      return nextWord()
    }
    setCurrentWord(newWord)
    playSound(newWord)
  }

  const checkWord = () => {
    if (inputValue.toLowerCase() !== currentWord.toLowerCase()) {
      setCorrect(false)
    } else {
      setCorrect(true)
      setInputValue('')
    }
    setOpen(true)
  }

  return (
    <div className={styles.container}>
      <LevelHeader stage={stage} levelImg={levelImg} playSound={() => playSound(currentWord)} />
      <div className={styles.playground}>
        {
          !currentWord
            ? <Btn title={'START'} onClick={nextWord} className={styles.startBtn} />
            : (
              <div className={styles.playForm}>
                <input
                  autoFocus={true}
                  name='word'
                  type='text'
                  onChange={onChange}
                  value={inputValue}
                  className={styles.playInput}
                  autoComplete={false}
                />
                <BtnCheck title={'Check'} onClick={checkWord} className={styles.startBtn} />
              </div>
            )
        }
      </div>
      <AnswerModal
        correct={correct}
        word={currentWord}
        open={open}
        setOpen={setOpen}
        nextWord={nextWord}
      />
    </div>
  )
}

export default Game
