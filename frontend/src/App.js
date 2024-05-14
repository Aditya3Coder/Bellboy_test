import logo from './logo.svg';
import './App.css';
import axios from "axios"
import {useState, useEffect} from "react"

function App() {
  const [students, setstudents] = useState([])
useEffect(()=>{
  async function fetchdata(){
    try {
      const students = await axios.get("http://127.0.0.1:8000/api_test/")
      console.log(students.data)
      setstudents(students.data)

    } catch (error) {
      console.log(error)
    }
  }
  fetchdata()
},[])
  return (
    <div className="App">
      <h1>om gan gan ganpatye namah   </h1>
      <h1>om gan gan ganpatye namah   </h1>
      {
        students.map((student,i)=>{
          return(
          <h2>{student.name}  {student.Address} </h2>
          )
        })
      }
      <h2></h2>
    </div>
  );
}

export default App;
