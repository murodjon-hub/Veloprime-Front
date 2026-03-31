import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';

const TopProperties = ({ initialInput, ...props }: any) => {
  return (
     <Box className="hero-section">
     
      <img 
        src="../img/berend-verheijen-JQu0OZ9YqUY-unsplash.jpg" 
        alt="Mountain biking action background" 
        className="hero-bg-image"
      />
      
      {/* Overlay for gradient and content layering */}
      <Box className="hero-overlay" />

      <Box className="hero-content">
        <Typography variant="h2" component="h1" className="hero-title">
          JOIN OUR COMMUNITY
          <br />
          OF RIDERS
        </Typography>
        <Typography variant="body1" className="hero-subtitle">
          Join a growing community of passionate riders. Get exclusive updates,
          expert tips, and early access to our newest models.
        </Typography>
        <Box className="hero-form-container">
          <TextField
            variant="outlined"
            placeholder="Enter your email address"
            className="hero-email-input"
          />
          <Button 
            variant="contained" 
            disableElevation
            className="hero-sign-up-button"
          >
            Sign Up
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TopProperties;
