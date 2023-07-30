import React, { useContext,useState } from 'react';
import Button from 'react-bootstrap/Button';
import { seatsContext } from './Contexts';
import API from '../API';

function Booking(props) {
  const { seats, setSeats } = useContext(seatsContext);
  const [errorMessage, setErrorMessage] = useState('');
  const selectedSeats = [];

  seats.forEach((row, rowIndex) => {
    row.forEach((seat, colIndex) => {
      if (seat.status === 'selected') {
        selectedSeats.push({ rowIndex, colIndex, id: seat.id });
      }
    });
  });

  const  handleConfirm = async () => {
    
    
    
    props.onConfirm();

    const user_id = props.user.id;
    const plane_id = props.plane_id; 
  
    const seatsToBook = selectedSeats.map(seat => ({seat_id: seat.id}));
  
    const bookingData = {
      user_id,
      seats: seatsToBook,
    };
  
    try {
      const result = await API.putBooking(bookingData, plane_id);
      console.log(result);
  
      if (result.error) {
        setErrorMessage(result.error);
        // Handle error here, you might want to show an error message to user
        const newSeats = [...seats];
        for (let seat of selectedSeats) {
        newSeats[seat.rowIndex][seat.colIndex].status = 'available';
      }
     } else {
        
        // Update the seats with the optimistic update, you can call your updateSeats function from here
        console.log("seats updated");
        const newSeats = [...seats];
        for (let seat of selectedSeats) {
        newSeats[seat.rowIndex][seat.colIndex].status = 'occupied';
    }
    setSeats(newSeats);

      }
    } catch (err) {
      const errorMessageJSON = JSON.parse(err.message);
      setErrorMessage(errorMessageJSON.error);
      console.log("$$$$$")
      
      console.log(err.message.error);
     
      // Show an error message to the user
    }
  };

  const handleCancel = () => {
    const newSeats = [...seats];
    for (let seat of selectedSeats) {
      newSeats[seat.rowIndex][seat.colIndex].status = 'available';
    }
    setSeats(newSeats);
  };

  if (selectedSeats.length > 0) {
    return (
      <div>
        <h2>Booking</h2>
        {selectedSeats.map(seat => <p key={seat.id}>Seat {seat.id}</p>)}
        <Button variant="success" onClick={handleConfirm}>Confirm</Button>
        <Button variant="danger" onClick={handleCancel}>Cancel</Button>
       {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} 
      </div>
    );
  } else {
    return null;
  }
}

export default Booking;
