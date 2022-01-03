import * as React from 'react';
import { AppBar, Box, Toolbar, Typography, Button } from '@mui/material';
import { IconButton } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login'
import protek from '../assets/png/protek_logo.png'


const Appbar = () => {
    return (
        <Box sx={{ flexGrow: 1 }}>
        <AppBar position="absolute" color="transparent" sx={{paddingLeft: '4rem', paddingRight: '4rem'}}>
          <Toolbar>
            <Typography variant="h6" color="orange" component="div" sx={{ flexGrow: 1, margin: 'auto' }}>
              <img src={protek} style={{ height: '45px', display: 'flex'}} alt="logo" />
            </Typography>
          <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="login"
          sx={{ mr: 2, color: 'blue' }}>
            <LoginIcon></LoginIcon>
          </IconButton>
          </Toolbar>
        </AppBar>
      </Box>
    )
}

export default Appbar
