import Container from 'react-bootstrap/Container';

import { Navbar, Nav, Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { LogoutButton, LoginButton } from './Auth';


function NavigationBar(props) {
    const navigate = useNavigate();
    
  return (
    <Navbar className="bg-body-tertiary">
      
        <Navbar.Brand href = "/"  onClick={event => {event.preventDefault(); navigate("/");}}>Airplane</Navbar.Brand>

        <Nav className="ms-auto">
        <Navbar.Text className="mx-2">
        </Navbar.Text>
        <Form className="mx-2">
          {props.loggedIn ? <LogoutButton logout={props.logout} /> : <LoginButton />}
        </Form>
      </Nav>
      
    </Navbar>
  );
}

export  { NavigationBar };
