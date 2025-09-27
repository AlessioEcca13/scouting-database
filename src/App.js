import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen flex flex-col items-center justify-center text-white">
        <img src={logo} className="App-logo w-20 h-20 animate-spin" alt="logo" />
        <p className="text-xl mb-4">
          Edit <code className="bg-gray-800 px-2 py-1 rounded">src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link text-yellow-300 hover:text-yellow-100 transition-colors duration-300 text-lg font-semibold"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
          <p className="text-green-300 font-bold">✅ Tailwind CSS is working!</p>
        </div>
      </header>
    </div>
  );
}

export default App;
