import imgcon from '../assets/convention.png'
import wrongRange from '../assets/wrongrange.png'
import corRange from '../assets/correctRange.png'
import splitPic from '../assets/spltPay.png'
import { Typography } from '@mui/material'

const Documentation = () => {
    const inner = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem',
        borderBottom: '1px solid #eee'
      }

    const innerCol = {
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        padding: '1rem',
        borderBottom: '1px solid #eee'
      }
    
    const docCont = {
        //display: 'flex', 
        flexDirection: 'column',
        alignItems: 'left',
        paddingLeft: '4rem',
        gap: '2',
        paddingRight: '4rem',
        marginBottom: '1rem',
        paddingTop: '1rem',
    }

  return (
    <div style={docCont}>
        <Typography style={{ fontWeight: 400, color:'orange', marginRight : '1rem'}}>Mapsheet version@0.1.1 Documentation</Typography>
        
        <div style={innerCol}>
        <Typography style={{ fontWeight: 400, paddingLeft: '10rem', paddingRight: '10rem', marginRight : '1rem'}}>
            The split feature is now available and only works if a customer pays for all item once and the amount paid
            is equal to or greater than the total of <strong>ALL</strong> items they have with marybeth.
            <br/>
            Simply click on the check box before uploading mainfest and the split will automatically be implemented.
        </Typography>
           <img style={{height: '100px'}} src={splitPic} alt="Split" />
        </div>
        
        <div style={inner}>
        <Typography style={{ fontWeight: 400, marginRight : '1rem'}}>Manifest should always be in this format </Typography>
                 <img style={{height: '20px'}} src={imgcon} alt="" />
        </div>
        <div style={inner}>
          <Typography style={{ fontWeight: 400, marginRight : '1rem'}}>There is no more need to input Zero (0) in manfest reference column, just create your reference column and you are set.</Typography>
        </div>

        <div style={inner}>
          <Typography style={{paddingLeft: '10rem', paddingRight: '10rem', marginRight : '1rem'}}>If you already changed a cell information with a reference number and you don't want mapsheet
            to change/update that information, simlply put a bracket with letter O beside your reference like this: {' '} 
            <strong>0353364777(O)</strong>
          </Typography>
        </div>

        <div style={innerCol}>
        <Typography style={{ fontWeight: 400, marginRight : '1rem'}}>Your start range and end range is no longer in this format</Typography>
           <img style={{height: '400px'}} src={wrongRange} alt="Wrong Range" />
        </div>

        <div style={innerCol}>
        <Typography style={{ fontWeight: 400, marginRight : '1rem'}}>Your start range is A2 and end range is last column of Remark</Typography>
          <img style={{height: '400px'}} src={corRange} alt="Correct Range" />
        </div>
    </div>
  )
}

export default Documentation