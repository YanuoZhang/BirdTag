import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/login')}>Go to Login</button>;
};

export default Home;