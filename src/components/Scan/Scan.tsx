import { Html5QrcodeScanner } from 'html5-qrcode';
import React, { useEffect, useState } from 'react';
import { BiTransfer } from "react-icons/bi";
import { FaArrowRight } from "react-icons/fa6";
import { IoPersonCircle, IoTime, IoTimeOutline } from "react-icons/io5";
import { TbBuildingFactory } from "react-icons/tb";
import { SupplyChainDatum } from '../AddProduct/AddProductInput';
import CopyAddress from '../AddProduct/CopyAddress';
import "../styles/scan.css";

const Scan = () => {
  const data: SupplyChainDatum = {
    manufacturer: "7bca7e61335570f3d7a2ee065d35e9f5ef82b6ce633047b58db30654",
    manufactureDate: "1703240605",
    expiryDate: "1703650605",
    currentOwner: "7bca7e61335570f3d7a2ee065d35e9f5ef82b6ce633047b58db30654",
    photos: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7JqGOFBlcufK4x2PdydaqSRdUDjuAMYc7Rl8HVB6DVQ&s", "https://bafybeiaw4x4v4twv4h7a4bwattahatafihxrscjmfls3y7lwnpvlyiafvu.ipfs.nftstorage.link/"],
    owners: ["7bca7e61335570f3d7a2ee065d35e9f5ef82b6ce633047b58db306540", "7bca7e61335570f3d7a2ee065d35e9f5ef82b6ce633047b58db30654"],
    comments: ["The product is really good"]
  }
  const [datumDetails, setdatumDetails] = useState<SupplyChainDatum>(data)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [commentValue, setCommentValue] = useState<string>('');
  const [transferValue, setTransferValue] = useState<string>('');
  const setScanResult = (result: string) => {
    console.log(result);
    setShowDetails(() => true)
  };

  const convertTimeStampToDate = (data: string) => {
    const date = new Date(Number(data) * 1000);
    return date.toDateString()
  }

  const [selectedPhoto, setSelectedPhoto] = useState<string>(datumDetails?.photos[0]);

  const handleSelectPhoto = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentValue(e.target.value);
  };

  const handleChangeTransfer = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransferValue(e.target.value);
  };
  const handleAddReview = () => {
    console.log("SupplyChainDatum", datumDetails)
    if (commentValue.trim() !== '') {
      setdatumDetails((prevDetails) => ({
        ...prevDetails,
        comments: prevDetails?.comments ? [...prevDetails?.comments, commentValue.trim()] : [commentValue.trim()],
      }));
      setCommentValue('');
    }
  };

  const handleTransfer = () => {
    if (transferValue.trim() !== '') {
      setdatumDetails((prevDetails) => ({
        ...prevDetails,
        owners: prevDetails?.owners ? [...prevDetails?.owners, transferValue.trim()] : [transferValue.trim()],
        currentOwner: transferValue
      }));
      setTransferValue('');
      console.log("Datum", datumDetails)

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
    <div className='scanContainer'>
      {showDetails && <div className='detailsContainer'>
        <div className='detailsContainerLeft'>
          <div>
            {selectedPhoto && (
              <div>
                <img className='selectedPhoto' src={selectedPhoto} alt="Selected" />
              </div>
            )}

            <div className="photo-list">
              <div className="photo-grid">
                {data.photos.map((photo, index) => (
                  <div
                    key={index}
                    className={`photo-item ${photo === selectedPhoto ? 'blurred' : ''}`}
                    onClick={() => handleSelectPhoto(photo)}
                  >
                    <img src={photo} alt={`Photo ${index}`} />
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
                return <div className='indvReviews' key={index}>{items}</div>
              })}
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              <input
                type='text'
                className='commentInput'
                onChange={handleChange}
                value={commentValue}
              />
              <button className='commentButton' onClick={handleAddReview}>
                Add Review
              </button>
            </form>

            <form onSubmit={(e) => e.preventDefault()}>
              <input
                type='text'
                className='commentInput'
                onChange={handleChangeTransfer}
                value={transferValue}
              />
              <button className='commentButton' onClick={handleTransfer}>
                Transfer Product
              </button>
            </form>

          </div>

        </div>
      </div>}
      <div id="reader"></div>
    </div>
  );
};

export default Scan;
