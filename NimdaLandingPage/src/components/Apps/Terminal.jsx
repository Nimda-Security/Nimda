'use client';
import React, { useEffect, useState, useRef } from "react";
import { processCommand } from "../../utils/helpers";

export default function Terminal() {
  const [history, setHistory] = useState([
    { type: "output", text: "Last login: Mon Feb 16 19:00:00 on ttys000" },
  ]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("/home/nimda");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const getPrompt = () => {
    let displayPath = cwd;
    if (displayPath.startsWith("/home/nimda")) {
      displayPath = displayPath.replace("/home/nimda", "~");
    }
    return `nimda@nimda-macbook ${displayPath || "/"} % `;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const prompt = getPrompt();
    const result = processCommand(input, cwd);

    if (result.output === "__CLEAR__") {
      setHistory([]);
      setCwd(result.newCwd);
      setInput("");
      return;
    }

    const newEntries = [
      { type: "input", text: `${prompt}${input}` },
    ];
    if (result.output) {
      newEntries.push({ type: "output", text: result.output });
    }

    setHistory((prev) => [...prev, ...newEntries]);
    setCwd(result.newCwd);
    setInput("");
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="window-terminal-content" onClick={handleContainerClick}>
      <div className="terminal-output">
        {history.map((entry, i) => (
          <div key={i} className={`terminal-line ${entry.type}`}>
            {entry.text}
          </div>
        ))}
      </div>
      <form className="terminal-input-line" onSubmit={handleSubmit}>
        <span className="terminal-prompt">{getPrompt()}</span>
        <input
          ref={inputRef}
          type="text"
          className="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </form>
      <div ref={bottomRef} />
    </div>
  );
}
