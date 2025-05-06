import { useEffect, useState } from "react";
import "./App.css";
import { convertStatusToWorklog, exampleInput as exampleNote } from "./utils";

function App() {
  const [worklog, setWorklog] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const convert = (e: any) => {
    const input = e.target.value;
    setNote(input);
  };
  console.log(note)

  useEffect(() => {
    const result: string = convertStatusToWorklog(note);
    setWorklog(result);
  }, [note]);

  return (
    <>
      <div>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <h2>Paste your status note here</h2>
          <button onClick={() => setNote(exampleNote)}>try an example</button>
        </div>
        <textarea
          onChange={convert}
          content={note}
          style={{ width: 650, height: 200, fontSize: "0.75rem" }}
          placeholder={exampleNote}
        />
        <h2>Your worklog</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontSize: "1.7rem",
          }}
        >
          <span
            style={{
              fontFamily: "Liberation Mono, monospace",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "start",
              flexWrap: "wrap",
            }}
          >
            {worklog.split(";").map((line, i) => (
              <div key={i}>
                {line}
                <br />
              </div>
            ))}
          </span>
        </div>
      </div>
    </>
  );
}

export default App;
