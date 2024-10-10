import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const teamMembers = [
  {
    name: 'Rhys Mathews',
    email: 'rm514@uowmail.edu.au',
    role: 'Full-stack Developer',
    description: 'Contributed to both the front-end and back-end of the system, ensuring seamless integration and user experience.',
  },
  {
    name: 'Liam Elton',
    email: 'lce250@uowmail.edu.au',
    role: 'Database Engineer & Documentation Assistant',
    description: 'Designed the database schema, optimized queries, and assisted with project documentation.',
  },
  {
    name: 'Terence Yuan',
    email: 'ty636@uowmail.edu.au',
    role: 'Front-end & Documentation Developer',
    description: 'Developed user interfaces and helped document project functionalities and features.',
  },
  {
    name: 'Phuong An Nhien (Jenny) Do',
    email: 'pand982@uowmail.edu.au',
    role: 'Front-end Developer & Analyst',
    description: 'Specialized in UI/UX design and analyzed user requirements to enhance the application.',
  },
  {
    name: 'Kuldeep Bhatia',
    email: 'kb481@uowmail.edu.au',
    role: 'Full-stack Developer',
    description: 'Worked on both server-side and client-side aspects, ensuring functionality and performance.',
  },
  {
    name: 'Soham Verma',
    email: 'sv948@uowmail.edu.au',
    role: 'Project Manager',
    description: 'Led the project, coordinated team activities, and ensured timely completion of project milestones.',
  },
  {
    name: 'Dr. Janusz Getta Supervisor',
    email: 'jrg@uowmail.edu.au',
    role: 'Project Supervisor',
    description: 'Provided guidance, oversight, and valuable insights throughout the project development process.',
  },
];

const AboutOwners = () => {
  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">About the Owners</h1>
      <p className="text-center mb-5">
        Our team consists of six dedicated students, each bringing their unique skills to develop this system. Under the supervision of our Supervisor, we worked together to deliver a seamless and efficient solution.
      </p>
      <Row>
        {teamMembers.map((member, index) => (
          <Col md={4} sm={6} key={index} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{member.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{member.role}</Card.Subtitle>
                {member.email && (
                  <Card.Text>
                    <strong>Email:</strong> <a href={`mailto:${member.email}`}>{member.email}</a>
                  </Card.Text>
                )}
                <Card.Text>{member.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AboutOwners;
