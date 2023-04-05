import { configureChains, createClient, WagmiConfig } from "wagmi";
import Main from "./main";
import { bscTestnet } from "@wagmi/chains";
import { Web3Modal } from "@web3modal/react";
import { WALLET_CONNECT_ID } from "../constants";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";

const projectId = WALLET_CONNECT_ID;
let chains = [bscTestnet];
const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiClient = createClient({
  autoConnect: false,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider,
});
const ethereumClient = new EthereumClient(wagmiClient, chains);

export default function Home() {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <Main />
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
