import '@/styles/globals.css'
import '../styles/spinner.css'
import {configureChains, createClient, WagmiConfig} from "wagmi";
import {bscTestnet} from "@wagmi/chains";
import {Web3Modal} from "@web3modal/react";
import {WALLET_CONNECT_ID} from "@/constants";
import {EthereumClient, w3mConnectors, w3mProvider,} from "@web3modal/ethereum";

const projectId = WALLET_CONNECT_ID;
let chains = [bscTestnet];
const {provider} = configureChains(chains, [w3mProvider({projectId})]);
const wagmiClient = createClient({
    autoConnect: true,
    connectors: w3mConnectors({projectId, version: 1, chains}),
    provider,
});
const ethereumClient = new EthereumClient(wagmiClient, chains);

export default function App({Component, pageProps}) {
    return (
        <>
            <WagmiConfig client={wagmiClient}>
                <Component {...pageProps} />
            </WagmiConfig>
            <Web3Modal projectId={projectId} ethereumClient={ethereumClient}/>
        </>
    );
}
