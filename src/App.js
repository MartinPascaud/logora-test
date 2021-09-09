import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

import './css/mystyles.css';
import './App.scss';


function App() {
  const [contribution, setContribution] = useState("")
  const [votes, setVotes] = useState(0)
  const [prediction, setPrediction] = useState()
  const [score, setScore] = useState(0)
  const [historyList, setHistoryList] = useState()

  const onChangeContribution = useCallback((event) => {
    setContribution(event.target.value)
    },[setContribution]
  )
  const onChangeVotes = useCallback((event) => {
    setVotes(event.target.value)
  }, [setVotes])

  const getEval = () => {
    if (contribution.trim() === "") return
    axios.get('https://moderation.logora.fr/predict', {
      params: {
        text: contribution
      }
    })
      .then((res) => {
        setPrediction((prevRes) => {
          return {
            ...prevRes,
            contrib: res.config.params.text,
            pred: res.data.prediction[0]
          }
        })
      })
      .catch((error) => {
        console.log("Predict error", error);
      })
    axios.get('https://moderation.logora.fr/score', {
      params: {
        text: contribution,
        votes: votes
      }
    })
      .then((res) => {
        setScore((prevRes) => {
          return {
            ...prevRes,
            contrib: res.config.params.text,
            score: res.data.score
          }
        })
      })
      .catch((error) => {
        console.log("Score error", error);
      })
  }
  useEffect(() => {
    let cumul;
    prediction && score && (cumul = Object.assign(prediction, score)) && sessionStorage.setItem(sessionStorage.length, JSON.stringify(cumul))
    let historyTab = []
    for (let i = 0 ; i < sessionStorage.length ; i++) {
      const obj = JSON.parse(sessionStorage.getItem(i));
      historyTab.push(obj)
    }
    setHistoryList(historyTab.map((test, key) => 
      <div className="box" key={key}>
        {test.contrib}&nbsp;
        <p className="level">
          <span className={
            test.pred > 0.5 
              ? "has-text-danger"
              : "has-text-primary"
          }>
            {test.pred}
          </span>
          <span className="has-text-link">
            {test.score}
          </span>
        </p>
      </div>
    ).reverse())
  }, [prediction])

  return (
    <div className="App">
      <div className="columns">
        <div className="column is-6">
          <div className="column">
            <textarea
              className="textarea is-primary"
              placeholder="Contribution"
              value={contribution}
              onChange={onChangeContribution}
            />
          </div>
          <div className="column">
            <input
              className="input is-primary"
              type="number"
              placeholder="Votes"
              value={votes}
              onChange={onChangeVotes}
            />
          </div>
          <div className="column">
            <div className="columns">
              <div className="column">
                <button 
                  className="button is-primary"
                  onClick={getEval}
                >
                  Envoyer
                </button>
              </div>
              {prediction && <div className="column mt-0 pt-0">
                <div className="column mt-0 pl-0">
                  <p>{prediction?.contrib}</p>
                  <p className={
                    prediction?.pred > 0.5 
                      ? "has-text-danger"
                      : "has-text-primary"
                  }>
                    {prediction?.pred}
                    <span className="has-text-black">&nbsp;(prédiction)</span>
                  </p>
                  <p className="has-text-link">
                    {score?.score}
                    <span className="has-text-black">&nbsp;(score)</span>
                  </p>
                </div>
              </div>}
            </div>
          </div>
        </div>
        <div className="column is-5 mt-3">
          {historyList}
        </div>
      </div>
    </div>
  );
}

export default App;
