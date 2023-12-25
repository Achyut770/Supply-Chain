import { Address, AddressDetails, Data, Datum, Lucid, PolicyId, SpendingValidator, Unit, applyParamsToScript, fromText, getAddressDetails } from 'lucid-cardano';
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'react-toastify';
import { AppState } from '../../App';
import "../styles/AddProductInput.css";
import { signAndSubmitTx } from '../utils';
import QrCode from './QrCode';

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
            "59115e59115b010000323232323322323322323233223232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232222323232323232322322323253353232323232323232323253350081330343301b4912153686f756c64206265207369676e65642062792043757272656e74204f776e6572005003330343301b49011b4f6e6c7920436f6d6d656e74732073686f756c64206368616e676500335503a301b4911b506c7a2077726974652074686520636f727265637420646174756d003303433038302400930245004330343302e302500930255004330343302e302f009302f50043303433320015037301e009301e500433034330383030009303050043303433320015036302300930235004330343302e333200150353355026302a12001303100948008cd54098c0a848004c0c54010ccc800540dcc0c4024d4c07448004c0c54010cc0d0cc06d240112436865636b204e667420696e20696e7075740050013301b49113436865636b204e667420696e204f75747075740050021330343301b4912153686f756c64206265207369676e65642062792043757272656e74204f776e6572005003330343301b4901294f6e6c79204f776e657220616e642043757272656e744f776e65722073686f756c64206368616e676500335503a301b4911b506c7a2077726974652074686520636f727265637420646174756d003303433038302400930245004330343302e302500930255004330343302e302f009302f50043303433320015037301e009301e500433034323253353303a002001104b104c30315005303000933034330383030500435301c12001302350043303433320015037303100930315004330343302e333200150353355026302a12001302300948008cd54098c0a848004c08d4010ccc800540d8d4c07448004c08d4010c08c024cc0d0cc06d24112436865636b204e667420696e20696e7075740050013301b49113436865636b204e667420696e204f757470757400500213302d330323019533530270062135001220011350514901184f6e6c79206f6e65206f757470757420657870656374656400009480084cc0b0cc0c4c061400c02120021335503732235002222222222222533533355303512001503425335333573466e3c0380041581544d417400454170010841584151400cc0b401854cd4c8c94ccd40084c98c8148cd5ce24929466f756e6420436f6c6c61746572616c206f757470757420627574204e6f4f7574707574446174756d0005221301e0012321533535003222222222222300d00221302000115050320013550542253350011505122135002225335333573466e3c00801c13c1384d41580044c01800d400cc8d400488880094004840045854cd54cd4c08c00884d400488d40048888d402488d4008888888888888ccd54c0dc4800488d400888894cd4d406088d401888c8cd40148cd401094cd4ccd5cd19b8f00200106706615003106620662335004206625335333573466e3c00800419c1985400c419854cd400c854cd400884cd40088cd40088cd40088cd40088cc16000800481a48cd400881a48cc1600080048881a4888cd401081a48894cd4ccd5cd19b8700600306c06b15335333573466e1c0140081b01ac4cc14001000441ac41ac419054cd40048419041904cd418c018014401541780284c98c813ccd5ce249024c660004f130474988854cd40044008884c12d26135001220023333573466e1cd55cea802a4000466442466002006004646464646464646464646464646666ae68cdc39aab9d500c480008cccccccccccc88888888888848cccccccccccc00403403002c02802402001c01801401000c008cd410c110d5d0a80619a8218221aba1500b33504304535742a014666aa08eeb94118d5d0a804999aa823bae504635742a01066a0860986ae85401cccd5411c135d69aba150063232323333573466e1cd55cea801240004664424660020060046464646666ae68cdc39aab9d5002480008cc8848cc00400c008cd415dd69aba150023058357426ae8940088c98c8190cd5ce02d83203109aab9e5001137540026ae854008c8c8c8cccd5cd19b8735573aa004900011991091980080180119a82bbad35742a00460b06ae84d5d1280111931903219ab9c05b064062135573ca00226ea8004d5d09aba250022326320603357380ae0c00bc26aae7940044dd50009aba1500533504375c6ae854010ccd5411c1248004d5d0a801999aa823bae200135742a00460966ae84d5d1280111931902e19ab9c05305c05a135744a00226ae8940044d5d1280089aba25001135744a00226ae8940044d5d1280089aba25001135744a00226ae8940044d55cf280089baa00135742a00a60766ae84d5d1280291931902719ab9c04504e04c3333573466e1d40192002212200123333573466e1d401d2000212200223263204e33573808a09c0980966666ae68cdc39aab9d500d480008ccccccc0a8dd71aba1500d375a6ae854030dd69aba1500b33503375c6ae854028dd71aba1500933503375c6ae854020cd40cdd71aba135744a010464c6409866ae7010c130128cd54114dd70079bae00e104a13504849010350543500135573ca00226ea80044d55ce9baa001135744a00226ae8940044d5d1280089aba25001135744a00226aae7940044dd500091a800911100191299a8008818899ab9c002030320013550392212533500113263203b335738921134e6f742074686520456d7074792041727261790003b2215335001100222135300712001003320013550382212533500115034221533500115036221335037004353007120010032350012222222004232323232323232323333333574801246666ae68cdc39aab9d5009480008cccd55cfa8049281e91999aab9f50092503e233335573ea0124a07e46666aae7d4024941008cccd55cfa8049282091999aab9f500925042233335573ea0124a08646666aae7cd5d128051299aa99aa99aa99aa99aa99aa99a980b1aba150112135046302700115044215335301635742a022426a08e60040022a08a2a08842a66a602c6ae85404084d411cc0080045411454110854cd4cd405405cd5d0a807909a82398010008a8228a82210a99a980b9aba1500e21350473002001150451504421533533501501735742a01a426a08e60040022a08a2a08842a66a66a02a02e6ae85403084d411cc00800454114541109411011c11811411010c108104100940f00f8940ec940ec940ec940ec0f84d5d1280089aba25001135744a00226ae8940044d5d1280089aba25001135573ca00226ea800448c88ccccccd5d20009281a1281a118019bac0022503425034037320013550362233335573e00246a06aa0644a66a60086ae84008854cd4c010d5d1001909a81b99a8198010008a81a8a81a01b91999999aba4001250312503125031235032375a0044a06206846666666ae90004940c0940c0940c0940c08d40c4dd700101991a800911111100111a800911111100391a800911111100308911999aa8011919a80511199a8058018008011a80400099a8049111801980100090009119b800014800800520003200135502e221122253350011002221330050023335530071200100500400123500122350022222222222223333500d25038250382503823335530121200150112350012253355335333573466e3cd400888008d4010880080d40d04ccd5cd19b8735002220013500422001035034103413503c0031503b00d133500422533500221003100150273200135502b221122253350011350060032213335009005300400233355300712001005004001123500122001123500122002122123300100300222333573466e1c0080040780748d400488888880148d4004888888800c8d40048888888004888888848ccccccc00402001c01801401000c00888d400488c8c8c004018c8004d5409c88cd400520002235002225335333573466e3c0080240880844c01c0044c01800cc8004d5409888cd400520002235002225335333573466e3c00801c08408040044c01800c894cd40084004405c488cdc000100089a98018900080109a98010900080091199ab9a3371e004002028026640026aa038442444a66a0042a66a002202c44202e442a66a006202e442a66a6600e0080042666a60122400200e0060022032224460040022464460046eb0004c8004d5406c88cccd55cf8009280b919a80b18021aba1002300335744004038464646666ae68cdc39aab9d5002480008cc8848cc00400c008c028d5d0a80118029aba135744a004464c6403866ae7004c0700684d55cf280089baa0012323232323333573466e1cd55cea8022400046666444424666600200a0080060046464646666ae68cdc39aab9d5002480008cc8848cc00400c008c04cd5d0a80119a8068091aba135744a004464c6404266ae7006008407c4d55cf280089baa00135742a008666aa010eb9401cd5d0a8019919191999ab9a3370ea0029002119091118010021aba135573ca00646666ae68cdc3a80124004464244460020086eb8d5d09aab9e500423333573466e1d400d20002122200323263202333573803404604204003e26aae7540044dd50009aba1500233500975c6ae84d5d1280111931900e99ab9c01401d01b135744a00226ae8940044d55cf280089baa0011335500175ceb44488c88c008dd5800990009aa80c11191999aab9f0022501523350143355016300635573aa004600a6aae794008c010d5d100180d09aba100112232323333573466e1d400520002350163005357426aae79400c8cccd5cd19b87500248008940588c98c8068cd5ce00880d00c00b89aab9d500113754002464646666ae68cdc3a800a400c46424444600800a600e6ae84d55cf280191999ab9a3370ea004900211909111180100298049aba135573ca00846666ae68cdc3a801a400446424444600200a600e6ae84d55cf280291999ab9a3370ea00890001190911118018029bae357426aae7940188c98c8068cd5ce00880d00c00b80b00a89aab9d500113754002464646666ae68cdc39aab9d5002480008cc8848cc00400c008c014d5d0a8011bad357426ae8940088c98c8058cd5ce00680b00a09aab9e5001137540024646666ae68cdc39aab9d5001480008dd71aba135573ca004464c6402866ae7002c0500484dd5000919191919191999ab9a3370ea002900610911111100191999ab9a3370ea004900510911111100211999ab9a3370ea00690041199109111111198008048041bae35742a00a6eb4d5d09aba2500523333573466e1d40112006233221222222233002009008375c6ae85401cdd71aba135744a00e46666ae68cdc3a802a400846644244444446600c01201060186ae854024dd71aba135744a01246666ae68cdc3a8032400446424444444600e010601a6ae84d55cf280591999ab9a3370ea00e900011909111111180280418071aba135573ca018464c6403a66ae7005007406c06806406005c0580544d55cea80209aab9e5003135573ca00426aae7940044dd50009191919191999ab9a3370ea002900111999110911998008028020019bad35742a0086eb4d5d0a8019bad357426ae89400c8cccd5cd19b875002480008c8488c00800cc020d5d09aab9e500623263201633573801a02c02802626aae75400c4d5d1280089aab9e500113754002464646666ae68cdc3a800a400446424460020066eb8d5d09aab9e500323333573466e1d400920002321223002003375c6ae84d55cf280211931900999ab9c00a013011010135573aa00226ea8004488c8c8cccd5cd19b87500148010848880048cccd5cd19b875002480088c84888c00c010c018d5d09aab9e500423333573466e1d400d20002122200223263201433573801602802402202026aae7540044dd50009191999ab9a3370ea0029001100291999ab9a3370ea0049000100291931900819ab9c00701000e00d135573a6ea8004488008488005240103505431002350074901184f6e6c79206f6e65206f757470757420657870656374656400112200212212233001004003112212330010030021212230020031122001123263200333573800200693090008891918008009119801980100100081",
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
    try {
        const tx = await lucid
            .newTx()
            .payToContract(supplyChainAddress, { inline: dtm }, { [nftAssetClassHex]: BigInt(1) })
            .complete();
        await signAndSubmitTx(tx);
        toast.success("Succesfully Added product")
    } catch (error) {
        toast.error("Something Went Wrong")
    }
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
        // if (!lucid) {
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
        setLoading(() => true)
        try {
            await createSupplyChaintxn(lucid, supplyChainAddress, dtm, nftAssetClassHex)
            setLoading(() => false)
            setInputValue('');
            setShowQrCode(() => true)
        } catch (error) { }

    };

    const qrData = { nftPolicyIdHex: nftPolicyIdHex as string, nftTokenhex: nftTokenhex as string, nftAssetClassHex };
    const qrDataJSON = JSON.stringify(qrData);

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
                    <img className='productPhoto' key={index} src={link} alt='Plz add correct Link of Image' />
                ))}
                <br />
                <button className='submitProduct' type="submit">{loading ? "Submitting" : "Submit"}</button>
            </form>
        </div>
    );
};

export default AddProductInput;


// c8f54ee3507aff0e13efbff50d6bea4b0a4008c2f2910fc5ac969aa1 537570706c79436861696e204e4654 c8f54ee3507aff0e13efbff50d6bea4b0a4008c2f2910fc5ac969aa1537570706c79436861696e204e4654
//c8f54ee3507aff0e13efbff50d6bea4b0a4008c2f2910fc5ac969aa1537570706c79436861696e204e4654