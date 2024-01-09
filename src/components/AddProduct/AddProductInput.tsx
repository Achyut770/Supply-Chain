import { Address, AddressDetails, Data, Datum, Lucid, PolicyId, SpendingValidator, Unit, applyParamsToScript, fromText, getAddressDetails } from 'lucid-cardano';
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'react-toastify';
import { AppState } from '../../App';
import "../styles/AddProductInput.css";
import { signAndSubmitTx } from '../utils';
import QrCode from './QrCode';
import { changeHexTotext } from '../Scan/Scan';

export interface SupplyChainDatum {
    manufacturer?: string;
    manufactureDate: string;
    expiryDate: string;
    photos: string[];
    currentOwner?: string;
    owners?: string[];
    comments?: string[]
}

export const initialSupplyChainDatum: SupplyChainDatum = {
    manufactureDate: '',
    expiryDate: '',
    photos: [],

};

export const getValidator = (CurrencySymbol: PolicyId, tokenName: string,) => {
    const Params = Data.Tuple([Data.Bytes(), Data.Bytes()]);
    type Params = Data.Static<typeof Params>;
    const SupplyChainScript: SpendingValidator = {
        type: "PlutusV2",
        script: applyParamsToScript<Params>(
            "59070701000032323232323232323223223222232323232533300e3232323232323232323232323232323232323253330213370e90000098a999810a999810a999810998051809180f80c1bae300b301f01a133300c01801d01b14a0266601a03003a03629404c8c8c8c94ccc0954ccc0954ccc0954ccc0954ccc0954ccc094cdc79bae3016302301e375c602c6046006266e1cdd69809181180f1bad3012302300314a0266e1cdd69806181180f1bad300c302300314a0266ebcc018c08c078c018c08c00c528099b8f375c601e604603c6eb8c03cc08c00c528099baf3009302301e3009302300314a0266ebcdd38009802981180f0a503300637586008604400466e040052002300837586006604200266014601260400020326020030294054ccc0854ccc0854ccc084cc028c048c07c060dd71805980f80d099980600c00e80d8a50133300d01801d01b14a0264646464646464a66605066e1d2000302700113232533302a533302a533302a533302a533302a533302a533302a3371e6eb8c06cc0a008cdd7180d9814003099b87375a602e60500466eb4c05cc0a0018528099b87375a602260500466eb4c044c0a0018528099baf300b3028023300b302800614a0266e3c004dd7180a18140030a50133302a3371e6eb8c050c0a0018dd7180a1814011a504a229404cdd79ba7004300e302802314a0266ebcc028c0a008cc028c0a00185281bae302e001302600116300537586016604a006660106eb0c028c090008cdc0800a400460146eb0c024c08c004cc030c02cc08800406cc048068c004004894ccc098004530103d87a8000132533302700113374a900019814181480125eb804cc00c00cc0a8008c0a400452811813181398139813981398139813800918129813181318130009800800911299981019b890014800052f5c02a666046004297ae0133024302500233300300330260023370200290011181118119811981198119811800980080091299980f8008a4000266e0120023300200230220012301f302030200012232323232323232323232323232323253330293370e90010008991919299981619b8748000c0ac0044c8c8c8008c08c004c0c8004c0a800458c8cc004004014894ccc0c00045300103d87a800013232323253330313371e00e004266e952000330350014bd7009980300300198190019bae303000230340023032001375c605e002604e0222a66605266e1d200400113232320023020001302f00130270111630270103756605800260580026056002605400260520026050002604e002604c002604a002604800260460026034002604000260300024464646600200200444a66603e00229404c8c94ccc078cdc78010030a511330040040013023002375c60420026eb0c078c07cc07cc07cc07cc07cc07cc07cc07cc05c0088c070c074c074c074c074004888cdc39998031bab30053016301d301e3016300800300200148008888cdc39998029bab300430153006003002001480088c064c068004888c8c8c94ccc060cdc3a40040022900009bad301d301600230160013253330173370e90010008a60103d87a8000132323300100100222533301d00114c103d87a8000132323232533301e3371e014004266e95200033022375000297ae0133006006003375a603e0066eb8c074008c084008c07c004dd5980e180a801180a800991980080080211299980d0008a6103d87a8000132323232533301b3371e010004266e9520003301f374c00297ae0133006006003375660380066eb8c068008c078008c0700048c8c8c8c8c8c8c8c8c8c8c8c94ccc084c090008400458c088004c8cc004004008894ccc08400452f5c026464a66604066ebcc044c07802cc044c0780084cc090008cc0100100044cc010010004c094008c08c004dd618100009810000980f800980b000980e000980a002980d000980d000980880098010009191919191919299980b99b8748008c05800c4c8c8c94ccc068cdc3a400060320022603e60300022c646600200200844a66603c0022980103d87a800013232533301d3375e601c603600400a266e952000330210024bd7009980200200098110011810000980e800980a8018b1bac301b0013013003301900130190023017001300f00123015001300d00614984d958c94ccc038cdc3a40000022a666022601800c2930b0a99980719b874800800454ccc044c0300185261616300c0053001005232533300d3370e900000089919191919191919191919191919299980f1810801099191924c6602600646eb8004cc0480108dd70009980880391bae001163758603e002603e0046eb0c074004c074008dd7180d800980d8011bac30190013019002375a602e002602e0046eb4c054004c054008dd7180980098058010b18058009119198008008019129998088008a4c26466006006602a004600660260026eb8004dd7000918029baa001230033754002ae6955ceaab9e5573eae815d0aba21",
            [CurrencySymbol, tokenName],
            Params
        ),
    };
    return SupplyChainScript
}

export const getSupplyChainScript = (CurrencySymbol: PolicyId, tokenName: string, lucid: Lucid | undefined) => {

    const SupplyChainScript = getValidator(CurrencySymbol, tokenName)
    const supplyChainAddress: Address | undefined = lucid?.utils.validatorToAddress(SupplyChainScript);
    if (supplyChainAddress)
        return supplyChainAddress
}

export const createSupplyChaintxn = async (lucid: Lucid, supplyChainAddress: Address, dtm: Datum, nftAssetClassHex: Unit) => {
    const tx = await lucid
        .newTx()
        .payToContract(supplyChainAddress, { inline: dtm }, { [nftAssetClassHex]: BigInt(1) })
        .complete();
    await signAndSubmitTx(tx);

}

export type SupplyChainDatums = Data.Static<typeof SupplyChainDatums>;

export const SupplyChainDatums = Data.Object({
    manufacturer: Data.Bytes(),
    manufactureDate: Data.Integer(),
    expiryDate: Data.Integer(),
    photos: Data.Array(Data.Bytes()),
    currentOwner: Data.Bytes(),
    owners: Data.Array(Data.Bytes()),
    comments: Data.Array(Data.Bytes())
});


const AddProductInput = ({ appState }: { appState: AppState }) => {
    const { lucid, wAddr, nftPolicyIdHex, nftTokenhex, nftAssetClassHex } = appState
    const [supplyChainDatum, setSupplyChainDatum] = useState<SupplyChainDatum>(initialSupplyChainDatum);
    const [inputValue, setInputValue] = useState<string>('');
    const [showQrCode, setShowQrCode] = useState<boolean>(false);
    const [loading, setLoading] = useState(false)

    const handleAddLink = () => {
        if (inputValue.trim() !== '') {
            setSupplyChainDatum(prevState => ({
                ...prevState,
                photos: [...prevState.photos, fromText(inputValue.trim())]
            }));
            setInputValue('');
        }

    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setSupplyChainDatum(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleDateChange = (date: string) => {
        const newDate = new Date(date);
        const posixTimestamp = newDate.getTime();
        return posixTimestamp
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!nftPolicyIdHex || !nftTokenhex || !nftAssetClassHex) {
            return toast.error("Plz Mint Nft  first")
        }

        if (!lucid || !wAddr) {
            return toast.error("Plz Connect Wallet")
        }
        if (supplyChainDatum.manufactureDate.trim() === '' || supplyChainDatum.expiryDate.trim() === '') {
            toast.error('Manufacture Date and Expiry Date are required fields.');
            return;
        }
        if (supplyChainDatum.manufactureDate.trim() > supplyChainDatum.expiryDate.trim()) {
            toast.error('Manufacture Date should be less than expiry date');
            return;
        }

        if (supplyChainDatum.photos.length === 0) {
            toast.error('Please add at least one photo.');
            return;
        }
        const supplyChainAddress: Address | undefined = getSupplyChainScript(nftPolicyIdHex, nftTokenhex, lucid);
        const manufactureDate = handleDateChange(supplyChainDatum.manufactureDate)
        const expiryDate = handleDateChange(supplyChainDatum.expiryDate)
        const details: AddressDetails = getAddressDetails(wAddr);
        const pkh = details.paymentCredential?.hash
        if (!pkh) return
        const datum: SupplyChainDatums = { manufacturer: pkh, manufactureDate: BigInt(manufactureDate), expiryDate: BigInt(expiryDate), currentOwner: pkh, owners: [pkh], photos: supplyChainDatum.photos, comments: [] }
        const dtm: Datum = Data.to(datum, SupplyChainDatums);
        if (!supplyChainAddress) return
        try {
            const res = await createSupplyChaintxn(lucid, supplyChainAddress, dtm, nftAssetClassHex)
            setLoading(() => false)
            setInputValue('');
            setShowQrCode(() => true)
            toast.success("Sucessfully Added")
        } catch (error) {
            toast.error("Something Went Wrong")
            console.log("error", error)
        }



    };

    const qrData = { nftPolicyIdHex: nftPolicyIdHex as string, nftTokenhex: nftTokenhex as string, nftAssetClassHex };
    const qrDataJSON = JSON.stringify(qrData);
    console.log("SupplyChainPhoto", supplyChainDatum.photos)

    return (
        <div className='addInputContainer'>
            {showQrCode ? (
                <QrCode
                    data={qrDataJSON}
                    setShowQrCode={setShowQrCode}
                    setSupplyChainToInitial={() => setSupplyChainDatum(initialSupplyChainDatum)}
                />
            ) : null}
            <form onSubmit={handleSubmit}>
                <div className='inputIndv'><b>Manufacture Date</b>
                    <input
                        type="date"
                        name="manufactureDate"
                        value={supplyChainDatum.manufactureDate}
                        onChange={handleInputChange}
                    />
                </div>
                <br />
                <div className='inputIndv'><b>Expiry Date</b>
                    <input
                        type="date"
                        name="expiryDate"
                        value={supplyChainDatum.expiryDate}
                        onChange={handleInputChange}
                    />
                </div>
                <br />
                <div className='inputIndv'><b>Photos</b>
                    <div className='inputPhoto'>
                        <input
                            type="text"
                            className='textInput'
                            placeholder="Paste IPFS Link"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button type="button" className='addLink' onClick={handleAddLink}>
                            Add Link
                        </button>
                    </div>
                    <br />
                </div>
                {supplyChainDatum.photos.map((link, index) => (
                    <img className='productPhoto' key={index} src={changeHexTotext(link)} alt='Plz add correct Link of Image' />
                ))}
                <br />
                <button className='submitProduct' type="submit">{loading ? "Submitting" : "Submit"}</button>
            </form>
        </div>
    );
};

export default AddProductInput;

