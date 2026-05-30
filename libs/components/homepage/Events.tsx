import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button, Container, Rating, CircularProgress } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StraightenIcon from '@mui/icons-material/Straighten';
import GroupIcon from '@mui/icons-material/Group';
import { useQuery, useMutation } from '@apollo/client';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_EVENTS } from '../../../apollo/user/query';
import { JOIN_EVENT, LEAVE_EVENT } from '../../../apollo/user/mutation';
import { getImageUrl } from '../../utils';
import Swal from 'sweetalert2';

interface EventItem {
  _id: string;
  eventTitle: string;
  eventDesc: string;
  eventStatus: string;
  eventImage: string;
  fromLocation: string;
  toLocation: string;
  distance: string;
  eventDate: string;
  maxParticipants: number;
  currentParticipants: number;
  rating: number;
}

const FALLBACK_EVENTS: EventItem[] = [
  {
    _id: '1',
    eventTitle: 'Mountain Trail Challenge',
    fromLocation: 'Seoul',
    toLocation: 'Busan',
    distance: '420 km',
    eventDate: 'April 20, 2026',
    eventStatus: 'UPCOMING',
    eventImage: '/img/patrick-hendry-OZh_OBP_fao-unsplash.jpg',
    eventDesc: 'Epic cycling adventure through mountain terrain and scenic routes. Experience breathtaking views and challenging trails.',
    rating: 4.5,
    maxParticipants: 50,
    currentParticipants: 12,
  },
  {
    _id: '2',
    eventTitle: 'City Sprint Classic',
    fromLocation: 'Incheon',
    toLocation: 'Suwon',
    distance: '85 km',
    eventDate: 'May 5, 2026',
    eventStatus: 'UPCOMING',
    eventImage: '/img/dmitrii-vaccinium-9qsK2QHidmg-unsplash (1).jpg',
    eventDesc: 'Fast-paced urban cycling event connecting major cities. Perfect for speed enthusiasts seeking an adrenaline rush.',
    rating: 4.8,
    maxParticipants: 100,
    currentParticipants: 34,
  },
  {
    _id: '3',
    eventTitle: 'Coastal Road Ride',
    fromLocation: 'Gangneung',
    toLocation: 'Sokcho',
    distance: '60 km',
    eventDate: 'May 18, 2026',
    eventStatus: 'UPCOMING',
    eventImage: '/img/andrei-castanha-aQoB4RR2Xco-unsplash.jpg',
    eventDesc: 'Scenic coastal cycling with golden beaches and ocean views. Ideal for leisure riders and nature lovers.',
    rating: 4.2,
    maxParticipants: 80,
    currentParticipants: 21,
  },
];

const Events = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [localCounts, setLocalCounts] = useState<Record<string, number>>({});
  const [localParticipants, setLocalParticipants] = useState<Record<string, string[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data, loading } = useQuery(GET_EVENTS, {
    variables: { input: { page: 1, limit: 3, eventStatus: 'UPCOMING' } },
    fetchPolicy: 'cache-and-network',
    onError: () => {},
  });

  const [joinEvent] = useMutation(JOIN_EVENT);
  const [leaveEvent] = useMutation(LEAVE_EVENT);

  const events: EventItem[] = data?.getEvents?.list?.length
    ? data.getEvents.list
    : FALLBACK_EVENTS;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getParticipants = (event: EventItem): string[] =>
    localParticipants[event._id] ?? (event as any).eventParticipants ?? [];

  const isJoined = (event: EventItem): boolean =>
    !!user?._id && getParticipants(event).includes(user._id as string);

  const handleJoinEvent = async (event: EventItem) => {
    if (!user?._id) {
      router.push('/account/join');
      return;
    }

    if (isJoined(event)) {
      const result = await Swal.fire({
        title: 'Leave this event?',
        text: `You are currently registered for ${event.eventTitle}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, leave',
        cancelButtonColor: '#555',
        confirmButtonColor: '#d33',
        background: '#1a1a1a',
        color: '#ffffff',
      });
      if (!result.isConfirmed) return;

      setLoadingId(event._id);
      try {
        const { data: mutData } = await leaveEvent({ variables: { input: event._id } });
        const updated = mutData?.leaveEvent;
        if (updated) {
          setLocalCounts((prev) => ({ ...prev, [event._id]: updated.currentParticipants }));
          setLocalParticipants((prev) => ({ ...prev, [event._id]: updated.eventParticipants ?? [] }));
        }
        Swal.fire({ title: 'Left', text: `You left ${event.eventTitle}.`, icon: 'info', background: '#1a1a1a', color: '#fff', showConfirmButton: false, timer: 1800 });
      } catch (err: any) {
        Swal.fire({ title: 'Error', text: err?.message ?? 'Could not leave event.', icon: 'error', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
      } finally {
        setLoadingId(null);
      }
      return;
    }

    const result = await Swal.fire({
      title: `Join ${event.eventTitle}?`,
      html: `
        <div style="text-align: left; font-size: 14px; color: #ffffff;">
          <p><strong>Distance:</strong> ${event.distance}</p>
          <p><strong>Route:</strong> ${event.fromLocation} → ${event.toLocation}</p>
          <p><strong>Date:</strong> ${typeof event.eventDate === 'string' && event.eventDate.includes('T') ? formatDate(event.eventDate) : event.eventDate}</p>
          <p><strong>Spots left:</strong> ${event.maxParticipants - (localCounts[event._id] ?? event.currentParticipants)}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, join now!',
      cancelButtonColor: '#d33',
      background: '#1a1a1a',
      color: '#ffffff',
    });

    if (!result.isConfirmed) return;

    setLoadingId(event._id);
    try {
      const { data: mutData } = await joinEvent({ variables: { input: event._id } });
      const updated = mutData?.joinEvent;
      if (updated) {
        setLocalCounts((prev) => ({ ...prev, [event._id]: updated.currentParticipants }));
        setLocalParticipants((prev) => ({ ...prev, [event._id]: updated.eventParticipants ?? [] }));
      }
      Swal.fire({ title: 'Joined!', text: `You have joined ${event.eventTitle}!`, icon: 'success', background: '#1a1a1a', color: '#ffffff', showConfirmButton: false, timer: 2000 });
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('already joined')) {
        Swal.fire({ title: 'Already joined', text: 'You are already registered for this event.', icon: 'info', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
      } else {
        Swal.fire({ title: 'Error', text: msg || 'Could not join event.', icon: 'error', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    // @ts-ignore – MUI Box union type complexity
    <Box component="div" className="events-section">
      <Container maxWidth="lg">
        <Box component="div" className="events-header">
          <Typography variant="h4" component="h2" className="events-title">
            UPCOMING EVENTS
          </Typography>
          <Button variant="outlined" className="events-see-all-button" onClick={() => router.push('/events')}>
            See All →
          </Button>
        </Box>

        {loading && (
          // @ts-ignore
          <Box component="div" sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#1a1a1a' }} />
          </Box>
        )}

        {!loading && (
          <Box component="div" className="events-grid">
            {events.map((event) => {
              const participants = localCounts[event._id] ?? event.currentParticipants;
              const displayDate = typeof event.eventDate === 'string' && event.eventDate.includes('T')
                ? formatDate(event.eventDate)
                : event.eventDate;

              return (
                <Box
                  component="div"
                  key={event._id}
                  className="event-card"
                  onClick={() => router.push('/events')}
                  sx={{ cursor: 'pointer' }}
                >
                  <Box component="div" className="event-image-container">
                    <img
                      src={getImageUrl(event.eventImage)}
                      alt={event.eventTitle}
                      className="event-bg-image"
                    />

                    <Box component="div" className="event-distance-badge-top">
                      <StraightenIcon sx={{ fontSize: 14 }} />
                      <Typography className="badge-text">{event.distance}</Typography>
                    </Box>

                    <Box component="div" className="event-overlay">
                      <Box component="div" className="event-content">
                        <Typography className="event-card-title">{event.eventTitle}</Typography>
                        <Typography className="event-card-description">{event.eventDesc}</Typography>

                        <Box component="div" className="event-route">
                          <LocationOnIcon sx={{ fontSize: 16 }} />
                          <Typography className="event-route-text">{event.fromLocation} → {event.toLocation}</Typography>
                        </Box>

                        <Box component="div" className="event-meta">
                          <Box component="div" className="event-meta-item">
                            <CalendarTodayIcon sx={{ fontSize: 14 }} />
                            <Typography className="event-meta-text">{displayDate}</Typography>
                          </Box>
                          <Box component="div" className="event-meta-item">
                            <GroupIcon sx={{ fontSize: 14 }} />
                            <Typography className="event-meta-text">{participants}/{event.maxParticipants} riders</Typography>
                          </Box>
                        </Box>

                        <Box component="div" className="event-card-footer">
                          <Box component="div" className="event-rating-box">
                            <Typography className="rating-number">{event.rating}</Typography>
                            <Rating value={event.rating} precision={0.5} readOnly size="small" className="rating-stars" />
                          </Box>
                        </Box>

                        <Button
                          fullWidth
                          className={`event-join-button${isJoined(event) ? ' joined' : ''}`}
                          disabled={loadingId === event._id}
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleJoinEvent(event); }}
                        >
                          {loadingId === event._id ? '...' : isJoined(event) ? '✓ Joined — Leave' : 'Join Now'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Events;
