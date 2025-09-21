import React, { useEffect, useRef } from 'react';

interface GoogleSignInButtonProps {
  onLogin: (response: any) => void;
  clientId: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onLogin, clientId }) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.google?.accounts?.id && buttonRef.current && buttonRef.current.childElementCount === 0) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: onLogin,
      });
      window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large', type: 'standard', shape: 'pill', text: 'signin_with' });
    }
  }, [clientId, onLogin]);

  return <div ref={buttonRef} className="h-10 flex items-center justify-center"></div>;
};

export default GoogleSignInButton;