import app from './firebaseConfig';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

let messaging: Messaging | null = null;

// Initialize messaging only on client side
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Error initializing Firebase messaging:', error);
  }
}

export { messaging, getToken, onMessage };
