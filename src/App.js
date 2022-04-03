import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Bar from './components/Bar'
import Footer from './components/Footer'
import LoginForm from './routes/LoginForm';
import Homepage from './pages/Homepage';
import Documentation from './routes/Documentation';

function App() {
  return (
    <BrowserRouter>
    <div className="App">
      <Bar/>
      <Routes>
        <Route path='/' element={<Homepage/>}/> 
        <Route path='/login' element={<LoginForm/>}/>
        <Route path='/documentation' element={<Documentation/>}/>
      </Routes>
      <Footer/>
    </div>
    </BrowserRouter>
  );
}

export default App;