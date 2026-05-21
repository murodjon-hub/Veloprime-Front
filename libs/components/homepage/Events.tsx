import React from 'react';
import { Box, Typography, Button, Container, Rating } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StraightenIcon from '@mui/icons-material/Straighten';
import PersonIcon from '@mui/icons-material/Person';
import Swal from 'sweetalert2';

interface Event {
  id: string;
  title: string;
  from: string;
  to: string;
  distance: string;
  date: string;
  createdBy: string;
  image: string;
  description: string;
  rating: number;
}

const eventsData: Event[] = [
  {
    id: '1',
    title: 'Mountain Trail Challenge',
    from: 'Seoul',
    to: 'Busan',
    distance: '420 km',
    date: 'April 20, 2026',
    createdBy: 'RiderKing',
    image: '/img/patrick-hendry-OZh_OBP_fao-unsplash.jpg',
    description: 'Epic cycling adventure through mountain terrain and scenic routes. Experience breathtaking views and challenging trails for ultimate relaxation.',
    rating: 4.5,
  },
  {
    id: '2',
    title: 'City Sprint Classic',
    from: 'Incheon',
    to: 'Suwon',
    distance: '85 km',
    date: 'May 5, 2026',
    createdBy: 'SpeedQueen',
    image: '/img/dmitrii-vaccinium-9qsK2QHidmg-unsplash (1).jpg',
    description: 'Fast-paced urban cycling event connecting major cities. Perfect for speed enthusiasts and competitive riders seeking an adrenaline rush.',
    rating: 4.8,
  },
  {
    id: '3',
    title: 'Coastal Road Ride',
    from: 'Gangneung',
    to: 'Sokcho',
    distance: '60 km',
    date: 'May 18, 2026',
    createdBy: 'TrailBlazer',
    image: '/img/andrei-castanha-aQoB4RR2Xco-unsplash.jpg',
    description: 'Scenic coastal cycling experience with golden beaches and ocean views. Ideal for leisure riders and water sports enthusiasts alike.',
    rating: 4.2,
  },
];

const Events = () => {
  const handleJoinEvent = (event: Event) => {
    Swal.fire({
      title: `Join ${event.title}?`,
      html: `
        <div style="text-align: left; font-size: 14px; color: #ffffff;">
          <p><strong>Distance:</strong> ${event.distance}</p>
          <p><strong>Route:</strong> ${event.from} → ${event.to}</p>
          <p><strong>Date:</strong> ${event.date}</p>
          <p><strong>Organizer:</strong> ${event.createdBy}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ffffff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, join now!',
      background: '#1a1a1a',
      color: '#ffffff',
      customClass: {
        confirmButton: 'swal-confirm-btn',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Joined!',
          text: `You have successfully joined ${event.title}!`,
          icon: 'success',
          background: '#1a1a1a',
          color: '#ffffff',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  };

  return (
    <Box className="events-section">
      <Container maxWidth="lg">
        <Box className="events-header">
          <Typography variant="h4" component="h2" className="events-title">
            UPCOMING EVENTS
          </Typography>
          <Button variant="outlined" className="events-see-all-button">
            See All →
          </Button>
        </Box>

        <Box className="events-grid">
          {eventsData.map((event) => (
            <Box key={event.id} className="event-card">
              <Box className="event-image-container">
                <img src={event.image} alt={event.title} className="event-bg-image" />
                
                {/* Distance Badge - Top Right */}
                <Box className="event-distance-badge-top">
                  <StraightenIcon sx={{ fontSize: 14 }} />
                  <Typography className="badge-text">{event.distance}</Typography>
                </Box>

                <Box className="event-overlay">
                  <Box className="event-content">
                    <Typography className="event-card-title">
                      {event.title}
                    </Typography>
                    <Typography className="event-card-description">
                      {event.description}
                    </Typography>

                    {/* Route */}
                    <Box className="event-route">
                      <LocationOnIcon sx={{ fontSize: 16 }} />
                      <Typography className="event-route-text">
                        {event.from} → {event.to}
                      </Typography>
                    </Box>

                    {/* Meta Information */}
                    <Box className="event-meta">
                      <Box className="event-meta-item">
                        <CalendarTodayIcon sx={{ fontSize: 14 }} />
                        <Typography className="event-meta-text">{event.date}</Typography>
                      </Box>
                      <Box className="event-meta-item">
                        <PersonIcon sx={{ fontSize: 14 }} />
                        <Typography className="event-meta-text">{event.createdBy}</Typography>
                      </Box>
                    </Box>

                    <Box className="event-card-footer">
                      <Box className="event-rating-box">
                        <Typography className="rating-number">{event.rating}</Typography>
                        <Rating value={event.rating} precision={0.5} readOnly size="small" className="rating-stars" />
                      </Box>
                    </Box>

                    <Button 
                      fullWidth 
                      className="event-join-button"
                      onClick={() => handleJoinEvent(event)}
                    >
                      Join Now
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Events;
