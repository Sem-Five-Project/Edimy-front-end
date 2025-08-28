import app from './firebaseConfig';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
