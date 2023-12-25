import {
  Address,
  Blockfrost,
  Lucid,
  PolicyId,
  Unit
} from "lucid-cardano";
import { useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './App.css';
import AddProduct from './components/AddProduct/AddProduct';
import Nav from './components/Nav';
import Scan from './components/Scan/Scan';
import ConnectWallet from "./components/ConnectWallet";

export interface AppState {
  lucid?: Lucid;
  wAddr?: Address;
  nftPolicyIdHex?: PolicyId;
  nftTokenhex?: string;
  nftAssetClassHex?: Unit
}

function App() {
  const [navIndex, SetNavIndex] = useState<number>(0)
  const [appState, setAppState] = useState<AppState>({});
  const [walletConnected, setWalletConnected] = useState(false)
  const connectLucidAndNami = async () => {
    const lucid = await Lucid.new(
      new Blockfrost(
        "https://cardano-preview.blockfrost.io/api/v0",
        process.env.REACT_APP_BLOCKFORST_KEY
      ),
      "Preview"
    );
    if (!window?.cardano?.nami) {
      toast.error("Please install Nami Wallet");
      return;
    }
    const nami = await window.cardano.nami.enable();
    lucid.selectWallet(nami);
    setAppState({
      ...appState,
      lucid: lucid,
      wAddr: await lucid.wallet.address(),
    });
    setWalletConnected(() => true)
  };
  return (
    <div className="App">
      <Nav navIndex={navIndex} SetNavIndex={SetNavIndex} appState={appState} connectLucidAndNami={connectLucidAndNami} />
      {!walletConnected ? <ConnectWallet /> : null}
      {walletConnected ? !navIndex ? <Scan appState={appState} /> : <AddProduct setAppState={setAppState} appState={appState} /> : null}
      <ToastContainer
        z-index={4567}
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

    </div>
  );
}

export default App;