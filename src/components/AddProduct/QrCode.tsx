import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode';
import "../styles/QrCode.css"
import { RxCross1 } from "react-icons/rx";

interface QrCodeprops {
  data: string, setShowQrCode: React.Dispatch<React.SetStateAction<boolean>>, setSupplyChainToInitial: () => void;
}
const QrCode = ({ data, setShowQrCode, setSupplyChainToInitial }: QrCodeprops) => {
  const [qrCodeData, setQRCodeData] = useState('');
  const generateQRCode = async () => {
    try {
      console.log("Data", data)
      const qrCodeData = await QRCode.toDataURL(data);
      setQRCodeData(qrCodeData);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };
  const hideQrCode = () => {
    setShowQrCode(() => false)
    setSupplyChainToInitial()
  }
  useEffect(() => {
    generateQRCode()
  }, [data])
  return (
    <div>
      <div className='wholeBackground'></div>
      <div className='backgroundQr'>
        <span className='cross' onClick={() => hideQrCode()}> <RxCross1 /></span>
        <img src={qrCodeData} className='qrCodeImage' />

        <a
          href={qrCodeData}
          download="qrcode.png"
          target="_blank"
          rel="noopener noreferrer"
        >Download Qr Code</a>
      </div>
    </div>
  )
}

export default QrCode