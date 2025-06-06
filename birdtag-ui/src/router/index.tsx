import { createBrowserRouter } from 'react-router-dom';
import Layout from '../pages/Layout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Upload from '../pages/Upload';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,     
    children: [
      { index: true, element: <Home /> },        
      { path: 'login', element: <Login /> },     
      { path: 'upload', element: <Upload /> },     
    ]
  }
]);

