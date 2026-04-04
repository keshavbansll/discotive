import React, { useState, useEffect } from "react";
import SystemFailure from "./SystemFailure";

const NetworkBoundary = ({ children }) => {
  // Check the initial state immediately (useful for offline refreshes)
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      // Optional: Force a soft reload to ensure Firebase/APIs reconnect cleanly
      // window.location.reload();
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (isOffline) {
    return (
      <SystemFailure
        errorType="Connection Severed"
        errorMessage="The engine was unable to establish a secure link. Awaiting network realignment."
        // We override the button behavior here to check connection rather than just reloading
        resetBoundary={() => {
          if (navigator.onLine) {
            setIsOffline(false);
          } else {
            // Provide a subtle visual feedback that it checked but failed
            console.warn("Network still severed.");
          }
        }}
      />
    );
  }

  return children;
};

export default NetworkBoundary;
