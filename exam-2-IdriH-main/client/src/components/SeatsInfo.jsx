import React, { useContext } from 'react';
import Button from 'react-bootstrap/Button';
import { seatsContext } from './Contexts';
import { Row ,Col} from 'react-bootstrap';


function SeatsInfo(){
    const { seats } = useContext(seatsContext);

    const totalSeats = seats.flat().length;
    const availableSeats = seats.flat().filter(seat => seat.status === 'available').length;
    const occupiedSeats = seats.flat().filter(seat => seat.status === 'occupied').length;
    const requestedSeats = seats.flat().filter(seat => seat.status === 'selected').length;

    return (
      <Row>
        <Col>Total # seats: {totalSeats} </Col>
        <Col># available seats: {availableSeats} </Col>
        <Col>#Occupied seats: {occupiedSeats}</Col>
        <Col>#Requested seats: {requestedSeats}</Col>
      </Row>
    );
}


export default SeatsInfo;