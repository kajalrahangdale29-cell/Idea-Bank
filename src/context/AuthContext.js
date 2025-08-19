// src/context/AuthContext.js
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employeeId, setEmployeeId] = useState('');

  return (
    <AuthContext.Provider value={{ employeeId, setEmployeeId }}>
      {children}
    </AuthContext.Provider>
  );
};
