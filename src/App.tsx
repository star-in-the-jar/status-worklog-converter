import { useEffect, useState } from "react";
import "./App.css";
import { convertStatusToWorklog, exampleInput as exampleNote, TimeFormat, getTemplateMessage } from "./utils";

function App() {
  const [worklog, setWorklog] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(TimeFormat.DECIMAL_HOURS);

  const convert = (e: any) => {
    const input = e.target.value;
    setNote(input);
  };

  useEffect(() => {
    const result: string = convertStatusToWorklog(note, timeFormat);
    setWorklog(result);
  }, [note, timeFormat]);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column"}}>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <h2>Paste your status note here</h2>
          <button onClick={() => {
            setNote(exampleNote)
            navigator.clipboard.writeText(exampleNote)
          }}>copy an example</button>
          <button onClick={() => {
            navigator.clipboard.writeText(getTemplateMessage())
            console.log("copied to clipboard")
          }}>copy template</button>
        </div>
        <textarea
          onChange={convert}
          content={note}
          style={{ width: 650, height: 200, fontSize: "0.75rem" }}
          placeholder={exampleNote}
        />
        <button onClick={() => setTimeFormat(prevFormat => prevFormat === TimeFormat.DECIMAL_HOURS ? TimeFormat.HOURS_AND_MINUTES : TimeFormat.DECIMAL_HOURS) }>
          {`change time format XXh YYm <-> H,HH`} 
        </button>
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
