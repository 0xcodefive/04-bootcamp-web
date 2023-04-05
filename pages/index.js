import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import {Web3Button} from "@web3modal/react";
import NftViewer from "./nftViewer";

export default function Main() {
    return (
        <>
            <Head>
                <title>NFT Students of 0xc0de</title>
                <meta name="description" content="Students of 0xc0de"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main className={styles.main}>
                <div className={styles.description}>
                    <p>
                        <Web3Button icon="show" label="Connect Wallet" balance="show"/>
                    </p>
                    <div>
                        <a
                            href="https://github.com/0xcodefive/04-bootcamp-web"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            By{" "}
                            <Image
                                src="/0xc0de-fon.png"
                                alt="0xc0de Logo"
                                width={70}
                                height={70}
                                priority
                            />
                        </a>
                    </div>
                </div>

                <NftViewer/>
            </main>
        </>
    );
}
