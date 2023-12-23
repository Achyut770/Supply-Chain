import React from 'react'
import "./styles/Nav.css"
import { AppState } from '../App';

interface NavProps {
  navIndex: number;
  SetNavIndex: React.Dispatch<React.SetStateAction<number>>;
  appState: AppState;
  connectLucidAndNami: () => Promise<void>;
}

export const handleCopy = async (data: string | undefined) => {
  try {
    data && await navigator.clipboard.writeText(data);
    alert("Copid to clipboard")
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};

const Nav = ({ navIndex, SetNavIndex, appState, connectLucidAndNami }: NavProps) => {

  return (
    <nav className='navContainer'>
      <div className='navLeft'><span className='big'>Supply</span><span className='small'>Chain</span></div>
      <div className='navRight'>   {["Scan", "AddProduct"].map((items, index) => {
        return <div className={index === navIndex ? "Nav Underscore" : "Nav"} onClick={() => SetNavIndex(index)}>{items}</div>
      })}
        <div className='walateAddressConnectWallet'>
          {!appState?.wAddr ?
            <button onClick={connectLucidAndNami}>Connect Wallet</button>
            : <div onClick={() => handleCopy(appState?.wAddr)}>{appState?.wAddr.slice(0, 5)}...{appState?.wAddr.slice(35, 40)}</div>}
        </div></div>
    </nav>
  )
}

export default Nav