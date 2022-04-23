import imgcon from '../assets/convention.png'
import wrongRange from '../assets/wrongrange.png'
import corRange from '../assets/correctRange.png'
import splitPic from '../assets/spltPay.png'
import { Typography } from '@mui/material'

const Documentation = () => {

  return (
    <div className='docCont'>
        <Typography style={{ fontWeight: 400, color:'orange', }}>Mapsheet version@0.1.1 Documentation</Typography>
        
        <div sclassName='innerCol'>
        <Typography style={{ fontWeight: 400}}>
            The split feature is now available and only works if a customer pays for all item once and the amount paid
            is equal to or greater than the total of <strong>ALL</strong> items they have with marybeth. <br/>
            Each of the items must have the same reference number in manifest for the split feature to work.
            <br/>
            Simply click on the check box before uploading mainfest and the split will automatically be implemented.
        </Typography>
           <img src={splitPic} id='splitimg' alt="Split" />
        </div>
        
        <div className='inner'>
        <Typography style={{ fontWeight: 400}}>Manifest should always be in this format </Typography>
                 <img style={{height: '20px'}} id='formatimg' src={imgcon} alt="" />
        </div>
        <div className='inner'>
          <Typography style={{ fontWeight: 400}}>There is no more need to input Zero (0) in manfest reference column, just create your reference column and you are set.</Typography>
        </div>

        <div className='inner'>
          <Typography>If you already changed a cell information with a reference number and you don't want mapsheet
            to change/update that information, simlply put a bracket with letter O beside your reference like this: {' '} 
            <strong>0353364777(O)</strong>
          </Typography>
        </div>

        <div className='inner'>
        <Typography style={{ fontWeight: 400}}>Your start range and end range is no longer in this format</Typography>
           <img style={{height: '400px'}} src={wrongRange} id='wrimg' alt="Wrong Range" />
        </div>

        <div className='innerCol'>
        <Typography style={{ fontWeight: 400}}>Your start range is A2 and end range is last column of Remark</Typography>
          <img style={{height: '400px'}} src={corRange} id='crimg' alt="Correct Range" />
        </div>
    </div>
  )
}

export default Documentation