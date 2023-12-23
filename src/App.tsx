import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import {
  Address,
  AddressDetails,
  Blockfrost,
  Lucid,
  MintingPolicy,
  PolicyId,
  ScriptHash,
  SpendingValidator,
  TxHash,
  UTxO,
  Unit,
  getAddressDetails,
} from "lucid-cardano";
import Nav from './components/Nav';
import AddProduct from './components/AddProduct/AddProduct';
import Scan from './components/Scan/Scan';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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




  const connectLucidAndNami = async () => {
    const lucid = await Lucid.new(
      new Blockfrost(
        "https://cardano-preview.blockfrost.io/api/v0",
        "previewBaRUkCnKdVbSRggHyz5kGJrhK2nq2mvb"
      ),
      "Preview"
    );
    if (!window?.cardano?.nami) {
      window.alert("Please install Nami Wallet");
      return;
    }
    const nami = await window.cardano.nami.enable();
    lucid.selectWallet(nami);
    const address: Address = await lucid.wallet.address();
    const details: AddressDetails = getAddressDetails(address);
    setAppState({
      ...appState,
      lucid: lucid,
      wAddr: await lucid.wallet.address(),
    });

  };
  return (
    <div className="App">
      <Nav navIndex={navIndex} SetNavIndex={SetNavIndex} appState={appState} connectLucidAndNami={connectLucidAndNami} />
      {!navIndex ? <Scan /> : <AddProduct setAppState={setAppState} appState={appState} />}

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