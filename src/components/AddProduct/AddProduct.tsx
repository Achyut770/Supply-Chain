import { AppState } from "../../App";
import "../styles/AddProduct.css";
import AddProductInput from './AddProductInput';
import Nft from './Nft';

export interface AddProduct {
  appState: AppState,
  setAppState: React.Dispatch<React.SetStateAction<AppState>>
}

const AddProduct = ({ appState, setAppState }: AddProduct) => {
  return (
    <div className='addProductContainer'>
      <Nft appState={appState} setAppState={setAppState} />
      <AddProductInput appState={appState} />
    </div>
  )
}

export default AddProduct