// Layout.tsx
import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | 
        <Link to="/login">Login</Link>
         <Link to="/signup">Signup</Link>
        <Link to="/upload">Upload</Link>
      </nav>
      <hr />
     
      <Outlet />
    </div>
  );
}
