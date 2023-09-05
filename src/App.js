import React from "react";
import Die from "./Die";
import { nanoid } from "nanoid";

export default function App() {
  const [rolls, setRolls] = React.useState(0);
  const [record, setRecord] = React.useState(
    JSON.parse(localStorage.getItem("record")) || null
  );
  const [time, setTime] = React.useState({ minutes: 0, seconds: 0 });
  const [dice, setDice] = React.useState(allNewDice());
  const [tenzies, setTenzies] = React.useState(false);

  function countRolls() {
    setRolls((prevRolls) => prevRolls + 1);
  }

  React.useEffect(() => {
    if (tenzies) {
      const recordStorage = JSON.parse(localStorage.getItem("record")) || null;
      const newRecord =
        recordStorage === null ? rolls : Math.min(recordStorage, rolls);
      localStorage.setItem("record", JSON.stringify(newRecord));
      setRecord(newRecord);
      return;
    }
    const interval = setInterval(() => {
      setTime((prevTime) =>
        prevTime.seconds >= 59
          ? { minutes: prevTime.minutes + 1, seconds: 0 }
          : { ...prevTime, seconds: prevTime.seconds + 1 }
      );
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [tenzies, rolls]);

  React.useEffect(() => {
    const allHeld = dice.every((die) => die.isHeld);
    const firstValue = dice[0].value;
    const allSameValue = dice.every((die) => die.value === firstValue);
    if (allHeld && allSameValue) {
      setTenzies(true);
    }
  }, [dice]);

  function generateNewDie() {
    return {
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid(),
    };
  }

  function allNewDice() {
    const newDice = [];
    for (let i = 0; i < 10; i++) {
      newDice.push(generateNewDie());
    }
    return newDice;
  }

  function rollDice() {
    if (!tenzies) {
      countRolls();
      setDice((oldDice) =>
        oldDice.map((die) => {
          return die.isHeld ? die : generateNewDie();
        })
      );
    } else {
      setTime({ minutes: 0, seconds: 0 });
      setRolls(0);
      setTenzies(false);
      setDice(allNewDice());
    }
  }

  function holdDice(id) {
    setDice((oldDice) =>
      oldDice.map((die) => {
        return die.id === id ? { ...die, isHeld: !die.isHeld } : die;
      })
    );
  }

  const diceElements = dice.map((die) => (
    <Die
      key={die.id}
      value={die.value}
      isHeld={die.isHeld}
      holdDice={() => holdDice(die.id)}
    />
  ));

  return (
    <main>
      <h1 className="title">Tenzies</h1>
      <p className="instructions">
        Roll the dice until all the numbers are the same. To freeze a die, click
        on it.
      </p>
      <div className="results-container">
        <span className="container-element">Rolls</span>
        <span className="container-element">Record</span>
        <span className="container-element">Time</span>
        <span className="container-element">{rolls}</span>
        <span className="container-element">
          {record === null ? "-" : record}
        </span>
        <span className="container-element">
          {`${time.minutes}:${time.seconds.toString().padStart(2, "0")}`}
        </span>
      </div>
      <div className="dice-container">{diceElements}</div>
      <button className="roll-dice" onClick={rollDice}>
        {tenzies ? "New Game" : "Roll"}
      </button>
    </main>
  );
}
