import React, { Suspense, useState } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {
  ThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import DialogForm from './components/DialogForm';
import NavigationFrame from './components/NavigationFrame';
import { ConnectionProvider } from './utils/connection';
import WalletPage from './pages/WalletPage';
import { useWallet, WalletProvider } from './utils/wallet';
import { ConnectedWalletsProvider } from './utils/connected-wallets';
import { TokenRegistryProvider } from './utils/tokens/names';
import LoadingIndicator from './components/LoadingIndicator';
import { SnackbarProvider } from 'notistack';
import PopupPage from './pages/PopupPage';
import LoginPage from './pages/LoginPage';
import ConnectionsPage from './pages/ConnectionsPage';
import { isExtension } from './utils/utils';
import { PageProvider, usePage } from './utils/page';

export default function App() {
  // TODO: add toggle for dark mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
          primary: blue,
        },
        // TODO consolidate popup dimensions
        ext: '450',
      }),
    [prefersDarkMode],
  );

  // Disallow rendering inside an iframe to prevent clickjacking.
  if (window.self !== window.top) {
    return null;
  }

  let appElement = (
    <NavigationFrame>
      <Suspense fallback={<LoadingIndicator />}>
        <PageContents />
      </Suspense>
    </NavigationFrame>
  );

  if (isExtension) {
    appElement = (
      <ConnectedWalletsProvider>
        <PageProvider>{appElement}</PageProvider>
      </ConnectedWalletsProvider>
    );
  }

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <ConnectionProvider>
          <TokenRegistryProvider>
            <SnackbarProvider maxSnack={5} autoHideDuration={8000}>
              <WalletProvider>{appElement}</WalletProvider>
            </SnackbarProvider>
          </TokenRegistryProvider>
        </ConnectionProvider>
      </ThemeProvider>
    </Suspense>
  );
}

function PageContents() {
  const wallet = useWallet();
  const [page] = usePage();
  const [showWalletSuggestion, setShowWalletSuggestion] = useState(true);
  const suggestionKey = 'private-irgnore-wallet-suggestion';
  const ignoreSuggestion = window.localStorage.getItem(suggestionKey);
  if (!wallet) {
    return (
      <>
        {!ignoreSuggestion && (
          <WalletSuggestionDialog
            open={showWalletSuggestion}
            onClose={() => setShowWalletSuggestion(false)}
            onIgnore={() => {
              window.localStorage.setItem(suggestionKey, true);
              setShowWalletSuggestion(false);
            }}
          />
        )}
        <LoginPage />
      </>
    );
  }
  const params = new URLSearchParams(window.location.hash.slice(1));
  if (window.opener || params.get('origin')) {
    return <PopupPage opener={window.opener} />;
  }
  if (page === 'wallet') {
    return <WalletPage />;
  } else if (page === 'connections') {
    return <ConnectionsPage />;
  }
}

function WalletSuggestionDialog({ open, onClose, onIgnore }) {
  return (
    <DialogForm open={open} onClose={onClose} fullWidth>
      <DialogTitle>Your New Solana SPL Token Wallet</DialogTitle>
      <DialogContent>
        <Typography>
          WANA is an{' '}
          <a
            style={{ color: 'inherit' }}
            href="https://github.com/twodayslate/spl-token-wallet"
            target="__blank"
          >
            {' '}
            open source
          </a>{' '}
          wallet for advanced users and developers. Use at your own risk.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button type="submit" color="primary" onClick={onIgnore}>
          Ignore Future Dialog
        </Button>
        <Button type="submit" color="primary" onClick={onClose}>
          Ok
        </Button>
      </DialogActions>
    </DialogForm>
  );
}
