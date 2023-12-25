import { Address, Data, Lucid, TxComplete, TxHash, UTxO, Unit } from "lucid-cardano";
import { toast } from "react-toastify";
import { SupplyChainDatum, SupplyChainDatums } from "./AddProduct/AddProductInput";

export const signAndSubmitTx = async (tx: TxComplete): Promise<TxHash> => {
    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();
    console.log(`Transaction submitted: ${txHash}`);
    toast.info(`Transaction submitted: ${txHash}`);
    return txHash;
};


type SupplyChainDatumUtxoPair = [SupplyChainDatum, UTxO];

export const getScannedDatumUtxo = async (lucid: Lucid, address: Address, nftAssetClass: Unit): Promise<SupplyChainDatumUtxoPair | undefined> => {
    const utxos: UTxO[] = await lucid.utxosAt(address);
    if (!utxos || utxos.length === 0) return;
    const [data] = utxos.filter((items, index) => items.assets[nftAssetClass] === BigInt(1))
    if (!data || !data?.datum) return;
    const datum: SupplyChainDatums = Data.from(data.datum, SupplyChainDatums);
    return [{ ...datum, expiryDate: datum.expiryDate.toString(), manufactureDate: datum.manufactureDate.toString() }, data]
}
