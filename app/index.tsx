/**
 * Main app index — renders the full SportLK app shell.
 * Auth gate is handled in app/_layout.tsx, so by the time we reach
 * this screen the user is guaranteed to be authenticated.
 */
import MainApp from '../src/screens/MainApp';

export default MainApp;
