import React, { useEffect, useState, useContext } from 'react';
import { getUserBooking } from '../API'; // Make sure the path is correct
import API from '../API';
import Button from 'react-bootstrap/Button';
import { seatsContext } from './Contexts';

function UserBooking(props) {
    const [seatIds, setSeatIds] = useState([]);
    const { seats, setSeats } = useContext(seatsContext);
   const bookingStatus = props.bookingStatus;
   const setBookingStatus = props.setBookingStatus;
    const fetchUserBooking = () => {
      const userId = props.user.id;
      const planeId = props.plane_id;
      console.log(userId + " " + planeId)
      
      getUserBooking(planeId)

        .then(seatIds => {
          setSeatIds(seatIds);
        })
        .catch(error => {
          console.error('There was an error!', error);
        });
    };
  
    useEffect(() => {
      fetchUserBooking();
      console.log(props.user)
    }, [bookingStatus,props.user]); // Run on initial rendering and every time bookingStatus changes
  
    const handleDelete = async () => {
     
      const userId = props.user.id;
      const planeId = props.plane_id;
      
      try {
        const deleted = await API.deleteUserBookings(userId, planeId);
  
        if (deleted) {
          await API.getSeats(planeId)
          .then(apiSeats => {
            const seatsCopy = [...seats];
            apiSeats.forEach(seat => {
              const row = parseInt(seat.id.split('R').pop().split('C')[0]) - 1;
              const col = parseInt(seat.id.split('C').pop()) - 1;
              
              seatsCopy[row][col] = {id: seat.id, status: seat.status};
            });
            setSeats(seatsCopy);
          })
          setSeatIds([]);
          setBookingStatus(!bookingStatus); // Flip the status to trigger useEffect
        }
      } catch (error) {
        console.error('There was an error!', error);
      }
    };
  
    return (
      <div>
        <h2>Your Bookings</h2>
        {seatIds.map((seatId, index) => (
          <p key={index}>Seat ID: {seatId}</p>
        ))}
        {seatIds.length > 0 && <Button variant="danger" onClick={handleDelete}>Delete All</Button>}
      </div>
    );
  }
  
  export default UserBooking;
  