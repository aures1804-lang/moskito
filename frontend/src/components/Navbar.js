import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          <span className="fs-4">🦟 Moskito</span>
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              active={location.pathname === '/'}
              className="px-3"
            >
              📋 Evaluación
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/casos" 
              active={location.pathname === '/casos'}
              className="px-3"
            >
              📊 Casos Registrados
            </Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;

