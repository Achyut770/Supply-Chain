import { Html5QrcodeScanner } from 'html5-qrcode';
import { Address, AddressDetails, Data, Datum, Lucid, PolicyId, SpendingValidator, UTxO, Unit, fromText, getAddressDetails, toText } from 'lucid-cardano';
import React, { useEffect, useState } from 'react';
import { BiTransfer } from "react-icons/bi";
import { FaArrowRight } from "react-icons/fa6";
import { IoPersonCircle, IoTime, IoTimeOutline } from "react-icons/io5";
import { TbBuildingFactory } from "react-icons/tb";
import { toast } from 'react-toastify';
import { AppState } from '../../App';
import { SupplyChainDatum, SupplyChainDatums, getSupplyChainScript, getValidator, initialSupplyChainDatum } from '../AddProduct/AddProductInput';
import CopyAddress from '../CopyAddress';
import "../styles/scan.css";
import { getScannedDatumUtxo, signAndSubmitTx } from '../utils';

const jsonParse = (data: string) => {
  try {
    return JSON.parse(data)
  } catch (error) {
    toast.error("Incorrect Format")
  }
}

export const changeHexTotext = (data: string) => {
  return toText(data)
}


const SupplyChainRedemer = Data.Enum([
  Data.Literal("Comment"),
  Data.Literal("Transfer"),
]);

type SupplyChainRedemer = Data.Static<typeof SupplyChainRedemer>;

const Scan = ({ appState }: { appState: AppState }) => {
  const [datumDetails, setdatumDetails] = useState<SupplyChainDatum>(initialSupplyChainDatum)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [commentValue, setCommentValue] = useState<string>('');
  const [transferValue, setTransferValue] = useState<string>('');
  const [supplyChainAddress, setSupplyChainAddress] = useState("");
  const [addReviewLoading, setAddreviewLoading] = useState(false)
  const [transferLoading, setTransferLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nftClassHex, setNftClassHex] = useState("")
  const [selectedPhoto, setSelectedPhoto] = useState<string>("");
  const [utxo, setUtxo] = useState<UTxO>()
  const [validater, setValidater] = useState<SpendingValidator | undefined>()
  const { lucid, wAddr } = appState


  const createSupplyChaintxnForTransferAndComment = async (lucid: Lucid, dtm: Datum, utxo: UTxO, red: SupplyChainRedemer, pkh: string, validator: SpendingValidator, beneficiaryPKH: string, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setValue: React.Dispatch<React.SetStateAction<string>>, datums: SupplyChainDatum) => {
    const redemer = Data.to<SupplyChainRedemer>(red, SupplyChainRedemer)
    try {
      const tx = await lucid
        .newTx()
        .collectFrom([utxo], redemer)
        .attachSpendingValidator(validator)
        .payToContract(supplyChainAddress, { inline: dtm }, { [nftClassHex]: BigInt(1) })
        .addSignerKey(beneficiaryPKH)
        .complete();
      await signAndSubmitTx(tx);
      setLoading(() => false)
      setValue(() => "")
      setdatumDetails(() => datums)
      toast.success("Succesfull")
    } catch (error) {
      toast.error("Something Went Wrong")
      setLoading(() => false)
      console.error("Error", error)
    }
  }

  const setScanResult = async (result: string) => {
    if (!lucid || !wAddr) {
      toast.error("Plz connect Wallet")
      return
    }
    const data = jsonParse(result)
    const address: Address | undefined = getSupplyChainScript(data.nftPolicyIdHex as PolicyId, data.nftTokenhex as string, lucid)
    setNftClassHex(() => data.nftAssetClassHex)
    if (!address) return
    setSupplyChainAddress(() => address)
    if (!address) return
    setIsLoading(() => true)
    const utxoAndDatum = await getScannedDatumUtxo(lucid, address, data.nftAssetClassHex)
    if (!utxoAndDatum || !utxoAndDatum[0]) return
    const datumDetail: SupplyChainDatum = utxoAndDatum[0]
    const valid = getValidator(data.nftPolicyIdHex, data.nftTokenhex)
    setIsLoading(() => false)
    setValidater(() => valid)
    setdatumDetails(() => datumDetail)
    setSelectedPhoto(() => datumDetail.photos[0])
    setUtxo(() => utxoAndDatum[1])
    setShowDetails(() => true)
  };

  const convertTimeStampToDate = (data: string) => {
    const date = new Date(Number(data));
    return date.toDateString()
  }

  const handleSelectPhoto = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentValue(e.target.value);
  };

  const handleChangeTransfer = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransferValue(e.target.value);
  };

  const handleAddReview = async () => {
    if (!lucid || !utxo || !wAddr || !validater) return
    if (commentValue.trim() !== '') {
      const datumDetail = {
        ...datumDetails, comments: datumDetails?.comments ? [...datumDetails?.comments, fromText(commentValue.trim())] : [fromText(commentValue.trim())], expiryDate: BigInt(datumDetails.expiryDate),
        manufactureDate: BigInt(datumDetails.manufactureDate)
      }
      const dtm: Datum = Data.to(datumDetail, SupplyChainDatums);
      const details: AddressDetails = getAddressDetails(wAddr);
      const beneficiaryPKH: string | undefined = details?.paymentCredential?.hash
      if (!beneficiaryPKH) return
      if (beneficiaryPKH !== datumDetail.currentOwner) return toast.error("You Are not the owner")
      setAddreviewLoading(() => true)

      const datums = { ...datumDetail, manufactureDate: datumDetail.manufactureDate.toString(), expiryDate: datumDetail.expiryDate.toString() }
      await createSupplyChaintxnForTransferAndComment(lucid, dtm, utxo, "Comment", beneficiaryPKH, validater, beneficiaryPKH, setAddreviewLoading, setCommentValue, datums)
    }
  };

  const handleTransfer = async () => {
    if (!lucid || !utxo || !wAddr || !validater) return
    const cardanoRegex = /^[0-9a-fA-F]{56}$/;
    if (!cardanoRegex.test(transferValue)) return toast.error("Plz write correct form of pub key hash")
    if (transferValue.trim() !== '') {
      const datumDetail = {
        ...datumDetails, owners: datumDetails?.owners ? [...datumDetails?.owners, transferValue.trim()] : [transferValue.trim()],
        currentOwner: transferValue,
        expiryDate: BigInt(datumDetails.expiryDate),
        manufactureDate: BigInt(datumDetails.manufactureDate)
      }
      const dtm: Datum = Data.to(datumDetail, SupplyChainDatums);
      const details: AddressDetails = getAddressDetails(wAddr);
      const beneficiaryPKH: string | undefined = details?.paymentCredential?.hash
      if (!beneficiaryPKH) return
      if (beneficiaryPKH != datumDetails.currentOwner) return toast.error("You Are not the owner")
      setTransferLoading(() => true)

      const datums = { ...datumDetail, manufactureDate: datumDetail.manufactureDate.toString(), expiryDate: datumDetail.expiryDate.toString() }
      console.log("Datums", datums)
      await createSupplyChaintxnForTransferAndComment(lucid, dtm, utxo, "Transfer", beneficiaryPKH, validater, beneficiaryPKH, setTransferLoading, setTransferValue, datums)
    }
  };


  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 5 }, false);
    scanner.render(onScanSuccess, onScanError);
    function onScanSuccess(decodedText: string) {
      scanner.clear();
      setScanResult(decodedText);
    }
    function onScanError(err: any) {
      console.warn(err);
    }
    return () => {
      scanner.clear();
    };
  }, []);


  return (
    <>
      {isLoading ? <div className='plzConnectWallet'>...Fetching Data....</div > :
        <div className='scanContainer'>
          {showDetails && <div className='detailsContainer'>
            <div className='detailsContainerLeft'>
              <div>
                {selectedPhoto && (
                  <div>
                    <img className='selectedPhoto' src={!selectedPhoto ? "HTML" : changeHexTotext(selectedPhoto)} alt="Selected" />
                  </div>
                )}

                <div className="photo-list">
                  <div className="photo-grid">
                    {datumDetails.photos.map((photo, index) => (
                      <div
                        key={index}
                        className={`photo-item ${photo === selectedPhoto ? 'blurred' : ''}`}
                        onClick={() => handleSelectPhoto(photo)}
                      >
                        <img src={changeHexTotext(photo)} alt={`Photo ${index}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className='detailsContainerRight'>
              <div className='productDetails'>
                <div>
                  <b>
                    Manufacturer
                    <span className="iconSpan">
                      <TbBuildingFactory />
                    </span>
                    :</b>
                  <CopyAddress data={datumDetails.manufacturer} />
                </div>
                <div>
                  <b>
                    CurrentOwner
                    <span className="iconSpan">
                      <IoPersonCircle />
                    </span>
                    :</b>
                  <CopyAddress data={datumDetails.currentOwner} />
                </div>
                <div>
                  <b>
                    Manufacture Date
                    <span className="iconSpan">
                      <IoTimeOutline />
                    </span>
                    :</b>
                  {convertTimeStampToDate(datumDetails.manufactureDate)}
                </div>
                <div>
                  <b>
                    Expiry Date
                    <span className="iconSpan">
                      <IoTime />
                    </span>
                    :</b>
                  {convertTimeStampToDate(datumDetails.expiryDate)}
                </div>
                <div>
                  <b>
                    Owners
                    <span className="iconSpan">
                      <BiTransfer />
                    </span>
                    :</b>
                  {datumDetails?.owners?.map((owner, index) => (
                    <span key={index}>
                      <CopyAddress data={owner} />
                      {index !== (!datumDetails?.owners?.length ? 1 : datumDetails?.owners?.length) - 1 && (
                        <span className="arrowSpan">
                          <FaArrowRight />
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h2>Reviews</h2>
                <div>
                  {datumDetails?.comments?.map((items, index) => {
                    return <div className='indvReviews' key={index}> {index + 1}.{changeHexTotext(items)}</div>
                  })}
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                  <input
                    type='text'
                    className='commentInput'
                    onChange={handleChange}
                    value={commentValue}
                    placeholder='Write  a review'
                  />
                  <button disabled={addReviewLoading} className='commentButton' onClick={handleAddReview}>
                    {addReviewLoading ? "Reviewing" : "Add Review"}
                  </button>
                </form>

                <form onSubmit={(e) => e.preventDefault()}>
                  <input
                    type='text'
                    className='commentInput'
                    onChange={handleChangeTransfer}
                    value={transferValue}
                    placeholder='Write  a PubKeyHash of receiver'
                  />
                  <button disabled={transferLoading} className='commentButton' onClick={handleTransfer}>
                    {transferLoading ? "Transfering" : "Transfers"}
                  </button>
                </form>

              </div>

            </div>
          </div>}
          <div id="reader"></div>
        </div>
      }

    </>
  );
};

export default Scan;
