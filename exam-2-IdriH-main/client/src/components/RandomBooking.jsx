import React, { useState, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import API from '../API';
import { seatsContext } from './Contexts';

function RandomBooking(props) {
  const { updateSeats } = useContext(seatsContext);
  const [numberOfSeats, setNumberOfSeats] = useState(''); 
  const [errorMessage, setErrorMessage] = useState('');

  

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const requestData = {
      user_id: props.user.id,
      plane_id: props.plane_id,
      number: numberOfSeats,
    };
  
    try {
      const data = await API.putRandomBooking(requestData);
  
      if (data.error) {
        setErrorMessage(data.error);
      } else {
        setNumberOfSeats('');
        setErrorMessage('');
        //optimistic update
        updateSeats(data.seats);
        props.onConfirm();
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formNumberOfSeats">
        <Form.Label>Number of Seats</Form.Label>
        <Form.Control type="number" placeholder="Enter number of seats" value={numberOfSeats} onChange={(e) => setNumberOfSeats(e.target.value)} required />
      </Form.Group>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} 
      <Button variant="primary" type="submit">
        Book Randomly
      </Button>
    </Form>
  );
}

export default RandomBooking;
