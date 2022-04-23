import image from '../assets/86.svg'
import {Link} from 'react-router-dom'
import { Typography } from '@mui/material'

const Section = () => {
  return (
    <div>
        <div className='sectionContainer'>
            <div className="image">
                <img src={image} alt="" />
            </div>
            <div className='sectionInner'>
            <Typography style={{ fontWeight: 600, fontSize: 20}}>Welcome to Mapsheet Version @0.1.1</Typography>
            <Link to="/documentation">Read Documentation</Link>
            </div>
        </div>
    </div>
  )
}

export default Section
