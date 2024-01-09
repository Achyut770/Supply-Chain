import {
  Constr,
  Data,
  MintingPolicy,
  PolicyId, UTxO, Unit,
  applyParamsToScript,
  fromText
} from "lucid-cardano";
import { useState } from 'react';
import "../styles/nft.css";
import { signAndSubmitTx } from '../utils';
import { AddProduct } from './AddProduct';
import { toast } from "react-toastify";
const Nft = ({ appState, setAppState }: AddProduct) => {
  const { lucid, wAddr } = appState
  const [loading, setLoading] = useState(false)

  const getUtxo = async (address: string): Promise<UTxO> => {
    const utxos = await lucid!.utxosAt(address);
    const utxo = utxos[0];
    return utxo;
  };

  type GetFinalPolicy = {
    nftPolicy: MintingPolicy;
    unit: Unit;
  };

  const getFinalPolicy = async (utxo: UTxO): Promise<GetFinalPolicy> => {
    const tn = fromText("SupplyChain NFT");
    const outRef = new Constr(0, [
      new Constr(0, [utxo.txHash]),
      BigInt(utxo.outputIndex),
    ]);
    const nftPolicy: MintingPolicy = {
      type: "PlutusV2",
      script: applyParamsToScript(
        "5901a8010000323232323232323232232222533300832323232533300c3370e9000180580089919191919191919191919299980d180e8010991919299980d19b8748000c0640044c94ccc06ccdc3801a4004266e3c01005c528180c0008b191980080080591299980f0008a60103d87a800013232533301d3375e60446036004030266e952000330210024bd70099802002000981100118100009bad301a002375c60300022c6036002646464a66603066e1d200200114bd6f7b63009bab301d30160023016001323300100100222533301b00114c0103d87a8000132323232533301c3371e01e004266e95200033020374c00297ae01330060060033756603a0066eb8c06c008c07c008c074004c8cc004004008894ccc06800452f5bded8c0264646464a66603666e3d22100002100313301f337606ea4008dd3000998030030019bab301c003375c6034004603c00460380026eacc064004c064004c060004c05c004c058008dd6180a00098060029bae3012001300a0011630100013010002300e001300600114984d958dd7000918029baa001230033754002ae6955ceaab9e5573eae815d0aba201",
        [tn, outRef],
      ),
    };
    const policyId: PolicyId = lucid!.utils.mintingPolicyToId(nftPolicy);
    const unit: Unit = policyId + tn;
    setAppState({
      ...appState,
      nftPolicyIdHex: policyId,
      nftTokenhex: tn,
      nftAssetClassHex: unit,
    });
    console.log("Policy Id , TokenHex , AssetClass", policyId, tn, unit)
    return { nftPolicy, unit };
  };

  const mintNFT = async () => {
    if (wAddr) {
      setLoading(() => true)
      try {
        const utxo = await getUtxo(wAddr);
        const { nftPolicy, unit } = await getFinalPolicy(utxo);
        const tx = await lucid!
          .newTx()
          .mintAssets({ [unit]: BigInt(1) }, Data.void())
          .attachMintingPolicy(nftPolicy)
          .collectFrom([utxo])
          .complete();
        await signAndSubmitTx(tx);
        setLoading(() => false)
        toast.success("Succesfully Minted")
      } catch (error) {
        console.log("Error", error)
        setLoading(() => false)
        toast.error("Something Went wrong")
      }
    } else {
      toast.error("Plz Connect Wallet")
    }
  };

  return (
    <div className='nftContainer' > <button className='mintNftButton' onClick={mintNFT}> {loading ? "Minting Nft" : "Mint Nft"}</button></div>
  )
}

export default Nft