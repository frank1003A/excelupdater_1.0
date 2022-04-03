import {useState} from 'react'

const AnalyticsCenter = () => {
  const [useCount, setCount] = useState(0)
  const [updateCount, setupdateCount] = useState(0)

  function returnCounter() {
    if (localStorage.getItem('isLogin') === 'true'){
      
    }
  }

  return (
    <div>
        <div className="scontainer">
           <div className="bankinfo">
             <p>{useCount} Login attempts</p>
             <p>{updateCount} Number of Manifest Updated</p>
           </div>
        </div>
    </div>
  )
}

export default AnalyticsCenter