import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function MyHook() {
  // 1. AUTOSAVE
  const [myListVar, myListFunc] = useState(() => {
    const savedData = localStorage.getItem("my_awesome_list");
    return savedData ? JSON.parse(savedData) : [];
  });

  const [myVar, myFunc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myInputVar, myInputFunc] = useState(""); // 1. TOTAL COUNT

  // EDIT
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // 2. TOTAL COUNT
  const totalCount = myListVar.length;
  const checkedCount = myListVar.filter((item) => item.checked).length;
  const progress =
    totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  // 1. CURSOR
  const myCursorVar = useRef(null);
  useEffect(() => {
    if (myCursorVar.current) {
      myCursorVar.current.focus();
    }
    localStorage.setItem("my_awesome_list", JSON.stringify(myListVar));
  }, [myListVar]);

  // 2. INPUT
  // 1. CHECKBOX add 'checked: false'
  const myAddEntry = (myApiVar) => {
    myApiVar.preventDefault(); // 1. ENTER KEY
    if (myInputVar.trim()) {
      const myEntryVar = { id: Date.now(), text: myInputVar, checked: false };
      myListFunc([...myListVar, myEntryVar]);
      myInputFunc("");
      myCursorVar.current.focus(); // 2. CURSOR
    }
  };

  // 1. DELETE
  const deleteItem = (idToDelete) => {
    const updatedList = myListVar.filter(
      (myItemVar) => myItemVar.id !== idToDelete,
    );
    myListFunc(updatedList);
  };

  // EDIT
  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditText(entry.text);
  };
  const saveEdit = (id) => {
    myListFunc(
      myListVar.map((entry) =>
        entry.id === id ? { ...entry, text: editText } : entry,
      ),
    );
    setEditingId(null);
    setEditText("");
  };

  // 2. CHECKBOX
  const myCheckboxVar = (id) => {
    myListFunc(
      myListVar.map((myEntryVar) =>
        myEntryVar.id === id
          ? { ...myEntryVar, checked: !myEntryVar.checked }
          : myEntryVar,
      ),
    );
  };

  const myFetchVar = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("https://dummyjson.com/quotes/random");

      if (!response.ok) {
        throw new Error("Server problem!");
      }

      const result = await response.json();
      myFunc(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    myFetchVar();
  }, []);

  if (loading && !myVar) return <h1>Loading...</h1>;
  if (error)
    return (
      <h1>
        Error: {error} <button onClick={myFetchVar}>Try Again</button>
      </h1>
    );

  return (
    <div className="app-container">
      {/* ROW 1: INPUT BOX & STATS */}
      <div className="top-control-row">
        {/* // 3. INPUT */}
        {/* // 3. CURSOR add 'ref={myCursorVar}' */}
        {/* // 2. ENTER KEY */}
        <form onSubmit={myAddEntry} className="input-wrapper">
          <input
            ref={myCursorVar}
            type="text"
            value={myInputVar}
            onChange={(myApiVar) => myInputFunc(myApiVar.target.value)}
            placeholder="Add to your list..."
            className="main-input"
          />
        </form>

        {/* // 3. TOTAL COUNT  */}
        <div className="stat-box">
          <span className="stat-label">Total</span>
          <span className="stat-number">{totalCount}</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Done</span>
          <span className="stat-number">{checkedCount}</span>
        </div>
      </div>

      <div className="progress-group">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              backgroundColor: progress === 100 ? "#177E89" : "#CC3E28",
            }}
          ></div>
        </div>

        <div className="celebration-row">
          {progress === 100 && totalCount > 0 && (
            <span className="celebration-banner">Your list is done!</span>
          )}
        </div>
      </div>

      {/* ROW 3: LIST */}
      <ul className="todo-list">
        {/* 3. CHECKBOX */}
        {myListVar.map((myEntryVar) => (
          <li
            key={myEntryVar.id}
            className={editingId === myEntryVar.id ? "editing-row" : ""}
          >
            {/* 4. CHECKBOX */}
            <input
              type="checkbox"
              checked={myEntryVar.checked || false}
              onChange={() => myCheckboxVar(myEntryVar.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  myCheckboxVar(myEntryVar.id);
                }
              }}
            />

            {/* EDIT */}
            {editingId === myEntryVar.id ? (
              <>
                <input
                  className="edit-input"
                  value={editText}
                  autoFocus
                  onChange={(event) => setEditText(event.target.value)}
                  onBlur={() => saveEdit(myEntryVar.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveEdit(myEntryVar.id);
                    if (event.key === "Escape") setEditingId(null);
                  }}
                />
                <button className="icon-btn" onClick={() => setEditingId(null)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </>
            ) : (
              <>
                <span
                  className="task-text"
                  style={{
                    textDecoration: myEntryVar.checked
                      ? "line-through"
                      : "none",
                  }}
                >
                  {myEntryVar.text}
                </span>
                <button
                  className="icon-btn"
                  onClick={() => startEdit(myEntryVar)}
                >
                  <i className="fa-regular fa-pen-to-square"></i>
                </button>
                {/* 2. DELETE */}
                <button
                  className="icon-btn delete-btn"
                  onClick={() => deleteItem(myEntryVar.id)}
                >
                  <i className="fa-regular fa-trash-can"></i>
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* ROW 4: QUOTES */}
      <div className="quote-container">
        <p className="quote-text">{myVar.quote}</p>
        <p className="quote-author">- {myVar.author}</p>
      </div>
    </div>
  );
}

export default MyHook;
