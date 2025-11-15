import { Container } from '@mui/material';
import { LoginForm } from '../components/LoginForm';

const LoginPage = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <LoginForm />
    </Container>
  );
};

export default LoginPage;
