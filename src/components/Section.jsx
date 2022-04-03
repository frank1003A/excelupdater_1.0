import image from '../assets/86.svg'
import {Link} from 'react-router-dom'
import { Typography } from '@mui/material'

const Section = () => {
  const divStyle = {
    padding: '.5rem', 
    display: 'flex', 
    flexDirection: 'row', 
   // gap: '2rem', 
    background: '#eee',
    justifyContent: 'center' 
  }

  const inner = {
    display: 'flex', 
    flexDirection: 'row',
    alignItems: 'center' 
  }

  return (
    <div>
        <div style={divStyle}>
            <div className="image">
                <img style={{height: '100px'}} src={image} alt="" />
            </div>
            <div style={inner}>
            <Typography style={{ fontWeight: 600, fontSize: 20, marginRight : '1rem'}}>Welcome to Mapsheet Version @0.1.1</Typography>
            <Link to="/documentation">Read Documentation</Link>
            </div>
        </div>
    </div>
  )
}

export default Section
