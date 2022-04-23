import React from 'react';
import { Typography } from "@mui/material";

const Footer = () => {
  const date =  new Date()
  return (
      <footer>
        <Typography>copyright &copy;{date.getFullYear()} </Typography><Typography style={{color: 'orange', marginLeft: '5px'}}>Protek</Typography>
      </footer>
  )
};

export default Footer;
