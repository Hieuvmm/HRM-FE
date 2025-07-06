import React from 'react';
// react-bootstrap
import { Row, Col, Button, OverlayTrigger, Tooltip, ButtonToolbar, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

// project import
import Card from '../../components/Card/MainCard';
const ManageEmployees = () => {

    return(
        <React.Fragment>
      <Row>
        <Col>
          <Card title="">
            <Button variant="outline-secondary" size="lg">
              Add New
            </Button>
             <Button variant="dark" size="lg">
              Add New
            </Button>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
    )
}

export default ManageEmployees;
