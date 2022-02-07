import React from 'react';

const Footer = () => {
  const date =  new Date()
  return (
      <footer>
        <p>copyright &copy;{date.getFullYear()} <button style={{color: 'orange'}}>protek</button>  </p>
      </footer>
  )
};

export default Footer;
