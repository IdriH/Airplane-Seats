import { useState ,useEffect } from 'react';
import { Button, Col, Container, Row} from 'react-bootstrap';
import  PlaneSelection  from './components/PlaneSelection';
import {BrowserRouter, Routes,Route, Outlet,useNavigate} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';

import Plane from './components/Plane.jsx'
import { NavigationBar } from './components/NavigationBar';
import NotFound from './components/NotFound';
import UserBooking from './components/UserBooking';
import { NotFoundLayout, LoginLayout, LoadingLayout } from './components/PageLayout';
import API from './API';
import { Navigate } from 'react-router-dom';
function App() {
  


  // This state keeps track if the user is currently logged-in.
  const [loggedIn, setLoggedIn] = useState(false);
  // This state contains the user's info.
  const [user, setUser] = useState(null);


  const [loading, setLoading] = useState(false);

  

  //optimistic update about showing the user booking
  const [bookingConfirmed, setBookingConfirmed] = useState(false);



  const handleBookingConfirmation = () => {
    setBookingConfirmed(true);
  };
  

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const user = await API.getUserInfo();  // here you have the user info, if already logged in
        setUser(user);
        setLoggedIn(true); setLoading(false);
      } catch (err) {
        handleErrors(err); // mostly unauthenticated user, thus set not logged in
        setUser(null);
        setLoggedIn(false); setLoading(false);
      }
    };
    init();
  }, []);  // This useEffect is called only the first time the component is mounted.

  /**
   * This function handles the login process.
   * It requires a username and a password inside a "credentials" object.
   */
  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
    } catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  };

  /**
   * This function handles the logout process.
   */ 
  const handleLogout = async () => {
  console.log("logout")
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setUser(null);
  };


  return (
    <BrowserRouter>
    <Container fluid className="p-0">
      <Routes>
        <Route path="/" element={<MainLayout logout={handleLogout} user={user} loggedIn={loggedIn} />}>
          <Route index element={<PlaneSelection />} />
          <Route path = "/plane" element={
            
              <Plane loggedIn = {loggedIn} user = {user} handleBookingConfirmation={handleBookingConfirmation}/>
            
          } />
          <Route path='*' element={ <NotFound/> } />
        </Route>
        <Route path="/login" element={!loggedIn ? <LoginLayout login={handleLogin} /> : <Navigate replace to='/' />} />
      </Routes>
      </Container>
    </BrowserRouter>
  )
}

function MainLayout(props){

  return <>
  <header>
  <NavigationBar logout={props.logout} user={props.user} loggedIn={props.loggedIn}/>
  </header>
  <main>
    <Container>
      <Outlet />
    </Container>
  </main>
  </>
}

export default App
