import React from 'react';
import UserTable from './components/UserTable';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>React Table Assignment</h1>
        <p>A high-performance data table with drag & drop column reordering, intelligent sorting, and seamless user experience for 500+ records</p>
      </header>
      <main>
        <UserTable />
      </main>
    </div>
  );
}

export default App;