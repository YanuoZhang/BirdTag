import { createBrowserRouter } from 'react-router-dom';
import Layout from '../pages/Layout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Upload from '../pages/Upload';
import Signup from '../pages/Signup';
import ConfirmSignup from '../pages/ConfirmSignup';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'upload', element: <Upload /> },
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: '/confirm',
    element: <ConfirmSignup /> 
  }
]);
