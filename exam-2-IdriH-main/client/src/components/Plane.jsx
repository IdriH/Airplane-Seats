import React, { useState, useEffect,useCallback } from "react";
import Table from 'react-bootstrap/Table';
import { useLocation } from 'react-router-dom';
import Booking from './Booking';
import { seatsContext } from "./Contexts";
import API from "../API";
import SeatsInfo from "./SeatsInfo";
import RandomBooking from "./RandomBooking";
import UserBooking from './UserBooking';
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";

function Plane(props) {
  
  const location = useLocation();
  const planeType = location.state.type;
  const [waiting, setWaiting] = useState(true);
  const [seats, setSeats] = useState([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(false);
  const navigate = useNavigate();

  const handleBookingConfirmation = () => {
    setBookingConfirmed(true);
    setBookingStatus(!bookingStatus);  // Flip the bookingStatus to trigger useEffect in UserBooking

  };

  const loggedIn = props.loggedIn;

 

  let row = 0;
  let col = 0;
  let plane_id = 0;

  if(planeType === "Regional") {
    plane_id = 2
    row = 20 ;
    col = 5 ;
  } else if (planeType === "Local") {
    plane_id = 3
    row = 15 ;
    col = 4;
  } else if (planeType === "International") {
    plane_id = 1
    row = 25 ;
    col = 6;
  }

  const initialSeats = Array(row).fill().map(() => Array(col).fill({status: 'Available'}));
  //const [seats, setSeats] = useState(initialSeats);

  useEffect(() => {
    API.getSeats(plane_id)
      .then(apiSeats => {
        const seatsCopy = [...initialSeats];
        apiSeats.forEach(seat => {
          const row = parseInt(seat.id.split('R').pop().split('C')[0]) - 1;
          const col = parseInt(seat.id.split('C').pop()) - 1;
          
          seatsCopy[row][col] = {id: seat.id, status: seat.status};
        });
        setSeats(seatsCopy);
        setWaiting(false)
      })
      .catch(e => { 
        console.log(e);
      }); 
  }, []);

  const updateSeats = (updatedSeats) => {
    setSeats(oldSeats => {
      const seatsCopy = [...oldSeats];
      updatedSeats.forEach(updatedSeat => {
        const row = parseInt(updatedSeat.seat_id.split('R').pop().split('C')[0]) - 1;
        const col = parseInt(updatedSeat.seat_id.split('C').pop()) - 1;
        seatsCopy[row][col] = {id: updatedSeat.seat_id, status: 'occupied'};
      });
      return seatsCopy;
    });
  }

  const handleSeatClick = (row, col) => {
      if (!loggedIn) {
        navigate("/login");
        return;
      }

    const newSeats = [...seats];
    if (newSeats[row][col].status === 'available') {
      newSeats[row][col].status = 'selected';
    }else if(newSeats[row][col].status === 'selected'){ 
      newSeats[row][col].status = 'available';
    }else {
      alert('This seat is already occupied or selected !');
    }
    setSeats(newSeats);
  };

  return (
    <seatsContext.Provider value={{seats, setSeats , updateSeats}}>
      <h1 className="text-center">{planeType}</h1>
      <Table responsive>
        <thead>
          <tr>
            <th>#</th>
            {Array.from({ length: col }).map((_, index) => (
              <th key={index}>{String.fromCharCode(65 + index)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {seats.map((row, rowIndex) => (
            <tr >
              <td>{rowIndex + 1}</td>
              {row.map((seat, colIndex) => (
                <Seat 
                  key={seat.id}
                  id={seat.id}
                  status={seat.status}
                  onClick={() => handleSeatClick(rowIndex, colIndex)}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      <SeatsInfo/>
     
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '60px'}}>
        <Booking  user={props.user} onConfirm={handleBookingConfirmation}  plane_id = {plane_id}/>
        {loggedIn && <RandomBooking user={props.user} onConfirm={handleBookingConfirmation } plane_id = {plane_id} />}
        {loggedIn && <UserBooking plane_id = {plane_id} user = {props.user} bookingStatus={bookingStatus} setBookingStatus={setBookingStatus}/>}
      </div>
    </seatsContext.Provider>
  );
}

function Seat(props) {
  const getColor = () => {
    switch(props.status) {
      case 'available': return 'grey';
      case 'selected': return 'green';
      case 'occupied': return 'red';
      default: return 'black';
    }
  }

  return (
    <td onClick={props.onClick} style={{backgroundColor: getColor()}}>
      Seat {props.id}: {props.status}
    </td>
  );
}

export default Plane;
