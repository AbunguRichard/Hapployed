import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import Grow from '../components/Grow';

export default function GrowPage() {
  const { user } = useContext(AuthContext);
  
  return <Grow userId={user?.id || 'demo-user-123'} />;
}
