import React, { createContext, useState } from 'react';

export const UserContext = createContext({
  user: { name: '', id: '' },
  setUser: () => {},
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: '',
    id: '',
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};