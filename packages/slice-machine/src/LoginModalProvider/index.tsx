import React, { useState } from "react";
import LoginModal from "@components/LoginModal";

type LoginModalProviderContext = {
  isOpen: boolean;
  closeLogin: () => void;
  openLogin: () => void;
};

export const LoginModalContext = React.createContext<LoginModalProviderContext>(
  {
    isOpen: false,
    openLogin: () => null,
    closeLogin: () => null,
  }
);

const LoginModalProvider: React.FunctionComponent = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeLogin = () => {
    setIsOpen(false);
  };

  const openLogin = () => {
    setIsOpen(true);
  };

  return (
    <LoginModalContext.Provider value={{ isOpen, closeLogin, openLogin }}>
      {children}
      <LoginModal onClose={closeLogin} isOpen={isOpen} />
    </LoginModalContext.Provider>
  );
};

export default LoginModalProvider;
