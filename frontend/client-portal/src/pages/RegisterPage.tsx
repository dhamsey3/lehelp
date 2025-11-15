import { Container } from '@mui/material';
import { RegisterForm } from '../components/RegisterForm';

const RegisterPage = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <RegisterForm />
    </Container>
  );
};

export default RegisterPage;
