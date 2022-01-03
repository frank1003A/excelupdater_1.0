import './App.css';
import Container from './components/Container';
import Appbar from './components/Appbar';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <div className="App">
      <Appbar/>
      <Container/>
      <BottomNav/>
    </div>
  );
}

export default App;
