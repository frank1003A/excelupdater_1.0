import image from '../assets/86.svg'
import imgcon from '../assets/convention.png'
import imgzero from '../assets/zero.png'

const Section = () => {
  const divStyle = {
    padding: '.5rem', 
    display: 'flex', 
    flexDirection: 'row', 
    gap: '2rem', 
    background: '#eee',
    justifyContent: 'center' 
  }
  return (
    <div>
        <div style={divStyle}>
            <div className="image">
                <img style={{height: '100px'}} src={image} alt="" />
            </div>
            <div className="info">
                <p>Please keep the naming convention for your manifest: </p>
                 <img style={{height: '20px'}} src={imgcon} alt="" />
            </div>
            <div className="info">
                <p>Set default reference or code cells to zero: </p>
                 <img style={{height: '40px'}} src={imgzero} alt="" />
            </div>
        </div>
    </div>
  )
}

export default Section