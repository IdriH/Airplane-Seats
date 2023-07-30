import { useNavigate } from 'react-router-dom';
import ListGroup from 'react-bootstrap/ListGroup';

function PlaneSelection() {
  const navigate = useNavigate();

  const handleClick = (planeType) => {
    navigate('/plane', { state: { type: planeType } });
  };

  return (
    <div div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}>
      <header> Airplanes
      </header>
      <ListGroup horizontal>
        <ListGroup.Item onClick={() => handleClick('Local')}>Local</ListGroup.Item>
        <ListGroup.Item onClick={() => handleClick('Regional')}>Regional</ListGroup.Item>
        <ListGroup.Item onClick={() => handleClick('International')}>International</ListGroup.Item>
      </ListGroup>
    </div>
  );
}

export default PlaneSelection;
