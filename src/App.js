import React, { useState } from "react";
import "./App.css";

function App() {
  function getCurrentMonth() {
    const date = new Date();
    const month = date.toLocaleString("es-ar", { month: "long" });
    return month.toUpperCase();
  }
  function daysInThisMonth() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }

  function isWeekend(date) {
    const fakeDate = new Date();
    fakeDate.setDate(date);
    return fakeDate.getDay() === 6 || fakeDate.getDay() === 0;
  }

  function getDayOfWeek(date) {
    const fakeDate = new Date();
    fakeDate.setDate(date);
    return fakeDate.getDay();
  }

  function getKeysByValue(object, value) {
    return Object.keys(object).filter(key => object[key] === value);
  }

  function getWeeksInMonth() {
    var now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    var weeks = [],
      firstDate = new Date(year, month, 1),
      lastDate = new Date(year, month + 1, 0),
      numDays = lastDate.getDate();

    var start = 1;
    var end = 7 - firstDate.getDay();
    while (start <= numDays) {
      weeks.push({ start: start, end: end });
      start = end + 1;
      end = end + 7;
      if (end > numDays) end = numDays;
    }
    return weeks;
  }

  /*
  * Obtiene la persona que hasta el momento:
  * - trabajó menos horas desde el inicio del mes y luego
  * - hace mas dias que no trabaja
  *  Si hay mas de una con estas condiciones, se selecciona de manera aleatoria.
  */
  function getNextPerson(daysWithoutWork, currentPerson, totalWorkedDays) {
    //const days = { ...daysWithoutWork };
    //delete days[currentPerson];
    //const maxValue = Math.max(...Object.values(days));
    //const possiblePersons = getKeysByValue(days, maxValue);
    //const possiblePersons = Object.keys(days);

    const tWorkedDays = { ...totalWorkedDays };
    delete tWorkedDays[currentPerson];

    //obtener las personas que trabajaron menos hasta ahora
    const workedDays = Object.values(tWorkedDays).filter(
      person => person !== currentPerson
    );
    const minValue = workedDays.reduce(
      (min, p) => (p < min ? p : min),
      workedDays[0]
    );
    const possiblePersons = getKeysByValue(tWorkedDays, minValue);

    //obtener la que hace mas tiempo no trabaja
    const days = {};
    possiblePersons.forEach(person => {
      days[person] = daysWithoutWork[person];
    });

    const maxValue = Math.max(...Object.values(days));
    const mostInactive = getKeysByValue(days, maxValue);
    const nextPerson = mostInactive[random(0, mostInactive.length - 1)];

    return nextPerson;
  }

  function initialWorkedDays(people) {
    if (!people) {
      return;
    }
    const workedDays = {};
    people.forEach(p => {
      workedDays[p.name] = 0;
    });
    return workedDays;
  }

  function random(bottom, top) {
    return Math.floor(Math.random() * (1 + top - bottom)) + bottom;
  }

  //el q comienza el mes es random
  const [initialParticipant, setInitialParticipant] = useState(random(0, 3));

  const [schedule, setSchedule] = useState([]);
  const [workedAmount, setWorkedAmount] = useState([]);

  //useEffect(() => {
  const generateData = () => {
    let currentPerson = people[initialParticipant];

    const workedDays = initialWorkedDays(people);

    const daysWithoutWork = initialWorkedDays(people);

    let weeklyWorkedDays = initialWorkedDays(people);

    function incrementDaysWithoutWorkExcept(person1, person2) {
      const nonWorking = people.filter(
        participant =>
          participant.name !== person1 && participant.name !== person2
      );

      nonWorking.forEach(participant => {
        daysWithoutWork[participant.name]++;
      });
    }

    function resetDaysWithoutWork(participant) {
      daysWithoutWork[participant] = 0;
    }

    const maxConsecutiveDays = 3;
    let consecutiveDaysCounter = 0;
    let weekCounter = 1;
    const weeks = [];
    let weeklySchedule = [];
    const weeksInMonth = getWeeksInMonth();

    weeksInMonth.forEach(week => {
      for (let day = week.start; day <= week.end; day++) {
        if (!isWeekend(day)) {
          const person1 = currentPerson.name;
          const person2 = getNextPerson(daysWithoutWork, person1, workedDays);
          weeklySchedule.push({
            pair: [person1, person2],
            dayOfWeek: getDayOfWeek(day)
          });
          resetDaysWithoutWork(person1);
          resetDaysWithoutWork(person2);

          workedDays[person1]++;
          workedDays[person2]++;
          weeklyWorkedDays[person1]++;
          weeklyWorkedDays[person2]++;

          incrementDaysWithoutWorkExcept(person1, person2);
          consecutiveDaysCounter++;

          //cambio persona principal
          if (consecutiveDaysCounter === maxConsecutiveDays) {
            currentPerson = people[currentPerson.next];
            consecutiveDaysCounter = 0;
          }
        }
      }
      if (
        week.end - week.start > 2 ||
        (!isWeekend(week.start) || !isWeekend(week.end))
      ) {
        weeks.push({ week: weekCounter++, weeklySchedule, weeklyWorkedDays });
        weeklyWorkedDays = initialWorkedDays(people);
        weeklySchedule = [];
      }
    });

    setSchedule(weeks);
    setWorkedAmount(workedDays);
  };

  const [showTable, setShowTable] = useState(false);
  const [people, setPeople] = useState([
    { name: "K", next: 1 },
    { name: "A", next: 2 },
    { name: "N", next: 3 },
    { name: "G", next: 0 }
  ]);

  const handlePeopleChange = (e, index) => {
    const newPeople = [...people];
    newPeople[index].name = e.target.value;
    setPeople(newPeople);
  };

  const handleRandom = () => {
    setInitialParticipant(random(0, 3));
    generate();
  };

  const handleSelect = e => {
    setInitialParticipant(e.target.value);
  };

  const generate = () => {
    if (
      people[0].name === "" ||
      people[1].name === "" ||
      people[2].name === "" ||
      people[3].name === ""
    ) {
      alert("Deben completarse las 4 personas");
      return;
    }
    generateData();
    setShowTable(true);
  };

  return (
    <div className="container mt-3">
      <h1 className="mb-5">Planificación laboral</h1>

      <div className="mb-3">
        Mes:{" "}
        <span className="badge badge-info">
          {getCurrentMonth()} - {daysInThisMonth()} días
        </span>
      </div>

      <div className="form">
        <div className="d-flex justify-content-between mb-3">
          <label htmlFor="exampleInputEmail1">Ingresá los nombres: </label>
        </div>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Persona 1"
            aria-label="Username"
            aria-describedby="basic-addon1"
            onChange={e => handlePeopleChange(e, 0)}
            value={people[0].name}
            required
          />
          <input
            type="text"
            className="form-control"
            placeholder="Persona 2"
            aria-label="Username"
            aria-describedby="basic-addon1"
            onChange={e => handlePeopleChange(e, 1)}
            value={people[1].name}
            required
          />
          <input
            type="text"
            className="form-control"
            placeholder="Persona 3"
            aria-label="Username"
            aria-describedby="basic-addon1"
            onChange={e => handlePeopleChange(e, 2)}
            value={people[2].name}
            required
          />
          <input
            type="text"
            className="form-control"
            placeholder="Persona 4"
            aria-label="Username"
            aria-describedby="basic-addon1"
            onChange={e => handlePeopleChange(e, 3)}
            value={people[3].name}
            required
          />
        </div>

        <div className="form-group">
          <div className="d-flex justify-content-between mb-3">
            <label htmlFor="exampleInputEmail1">Quien comienza?</label>
          </div>
          <select
            className="form-control"
            id="exampleFormControlSelect2"
            onChange={handleSelect}
            value={initialParticipant}
          >
            {people.map((person, i) => (
              <option key={i} value={i}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex justify-content-between">
          <button type="button" className="btn btn-primary" onClick={generate}>
            Generar
          </button>

          {showTable && (
            <>
              <button onClick={handleRandom} className="btn btn-danger">
                Aleatorio
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => {
                  window.print();
                }}
              >
                Imprimir
              </button>
            </>
          )}
        </div>
      </div>

      {showTable && (
        <>
          <table className="table mt-5">
            <thead>
              <tr>
                <th scope="col"># Semana</th>
                <th scope="col">Lunes</th>
                <th scope="col">Martes</th>
                <th scope="col">Miercoles</th>
                <th scope="col">Jueves</th>
                <th scope="col">Viernes</th>
                <th scope="col">Dias trabajados</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((week, i) => (
                <tr key={`week-${i}`}>
                  <th scope="row">{i + 1}</th>
                  {week.weeklySchedule[0].dayOfWeek !== 1 &&
                    Array.from(
                      Array(week.weeklySchedule[0].dayOfWeek - 1).keys()
                    ).map((el, i) => <td key={`first-${i}`} />)}

                  {week.weeklySchedule.map((day, i) => {
                    return <td key={i}>{day.pair.join(" - ")}</td>;
                  })}

                  {week.weeklySchedule[week.weeklySchedule.length - 1]
                    .dayOfWeek !== 5 &&
                    Array.from(
                      Array(5 - week.weeklySchedule[0].dayOfWeek - 1).keys()
                    ).map((el, i) => <td key={`last-${i}`} />)}

                  <td key={`worked-${i}`}>
                    {JSON.stringify(week.weeklyWorkedDays, null, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="alert alert-primary" role="alert">
            <strong>Días totales trabajados: </strong>
            {JSON.stringify(workedAmount, null, 2)}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
