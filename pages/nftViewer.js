import React, { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSigner } from "wagmi";
import { ethers } from "ethers";
import { Container, Row, Col, Card, Image } from "react-bootstrap";
import {
  NFT_CONTRACT_ADDRESS,
  NFT_ABI,
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_ABI,
} from "../constants";
import { Inter } from "next/font/google";
import styles from "@/styles/NFT.module.css";

const NftViewer = () => {
  const [showMintBtn, setShowMintBtn] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(false);
  const [nftMetadatas, setNFTMetadatas] = useState([]);
  const [nftImages, setNFTImages] = useState([]);
  const { data: signer, isError } = useSigner();

  const account = useAccount();
  let nftContract, tokenContract;

  useEffect(() => {
    if (signer && account) {
      nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
      tokenContract = new ethers.Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_ABI,
        signer
      );
      getNFT();
    }
  }, [signer, account]);

  const getNFT = async () => {
    const addressSigner = await signer.getAddress();
    const totalSupply = await nftContract.totalSupply();

    let metadatas = [];
    let images = [];

    const dontShowMintBtn = await nftContract.addressMinted(addressSigner);
    setShowMintBtn(!dontShowMintBtn);

    const _balance = ethers.utils.formatEther(
      await tokenContract.balanceOf(addressSigner)
    );
    const _balanceToStr = parseFloat(_balance).toFixed(1);
    setTokenBalance(_balanceToStr);

    for (var i = 0; i < totalSupply; i++) {
      // Получение метаданных NFT контракта
      const tokenURI = (await nftContract.tokenURI(i)).replace(
        "ipfs://",
        "https://ipfs.io/ipfs/"
      );
      const response = await fetch(tokenURI);
      const metadata = await response.json();
      metadata.token_id = i;
      let ownerOf = await nftContract.ownerOf(i);

      if (ownerOf.toLowerCase() === TOKEN_CONTRACT_ADDRESS.toLowerCase()) {
        ownerOf = await tokenContract._owners(i);
        metadata.isStaked = true;
        const lastStakeTime = await tokenContract._lastStakeTime(i);
        metadata.lastStakeTime = lastStakeTime;
        const block = await signer.provider.getBlock("latest");
        const STAKING_REWARD = await tokenContract.STAKING_REWARD();
        const ACCRUAL_PERIOD = await tokenContract.ACCRUAL_PERIOD();
        const _reward = ethers.utils
          .formatEther(
            ethers.BigNumber.from(block.timestamp)
              .sub(lastStakeTime)
              .mul(STAKING_REWARD)
              .div(ACCRUAL_PERIOD)
          )
          .toString();
        metadata.reward = parseFloat(_reward).toFixed(1);
      }

      metadata.isOwned = ownerOf.toLowerCase() === addressSigner.toLowerCase();
      metadata.owner = ownerOf;
      metadatas.push(metadata);

      // Получение изображения NFT
      const imageURI = metadata.image.replace(
        "ipfs://",
        "https://ipfs.io/ipfs/"
      );
      const imageData = await fetch(imageURI);
      const blob = await imageData.blob();
      const imageURL = URL.createObjectURL(blob);
      images.push(imageURL);
    }
    setNFTMetadatas(metadatas);
    setNFTImages(images);
  };

  const mintNFT = async () => {
    const totalSupply = await nftContract.totalSupply();
    try {
      const tx = await nftContract.safeMint({
        value: ethers.utils.parseEther("0.001"),
      });
      console.log(tx);
      setShowMintBtn(nftMetadatas.length);
      await getNFT();
    } catch (error) {
      console.error(error);
    }
  };

  function stakeNFT(index) {
    return async () => {
      try {
        const WAIT_BLOCK_CONFIRMATIONS = 2;
        if (
          (await nftContract.getApproved(index)).toLowerCase() !==
          TOKEN_CONTRACT_ADDRESS.toLowerCase()
        ) {
          const tx = await nftContract.approve(TOKEN_CONTRACT_ADDRESS, index);
          console.log(`approve: ${tx.hash}`);
          await signer.provider.waitForTransaction(
            tx.hash,
            WAIT_BLOCK_CONFIRMATIONS
          );
        }
        const txS = await tokenContract.stake(index);
        console.log(`stake: ${txS.hash}`);
        await signer.provider.waitForTransaction(
          txS.hash,
          WAIT_BLOCK_CONFIRMATIONS
        );

        await getNFT();
      } catch (error) {
        console.error(error);
      }
    };
  }

  function unstakeNFT(index) {
    return async () => {
      try {
        const WAIT_BLOCK_CONFIRMATIONS = 3;
        await tokenContract.unstake(index).wait(WAIT_BLOCK_CONFIRMATIONS);
        await getNFT();
      } catch (error) {
        console.error(error);
      }
    };
  }

  if (!signer || !account) {
    return (
      <div className={styles.return}>
        <h1 className={styles.h1}>Connect your wallet to look NFT</h1>
      </div>
    );
  }

  return (
    <div className={styles.return}>
      {showMintBtn ? (
        <div>
          <button className={styles.mint_button} onClick={mintNFT}>
            Mint your first NFT by 0.001 BNB
          </button>
        </div>
      ) : (
        <></>
      )}

      <h1 className={styles.h1}>Your balance {tokenBalance} T0xC</h1>

      <h1 className={styles.h1}>Your collection</h1>
      <div className={styles.container}>
        <div className={styles.row}>
          {nftImages.map((nftImage, i) =>
            nftMetadatas[i].isOwned ? (
              <div key={i} className={styles.col}>
                <div className={styles.card} key={i}>
                  <div className={styles.side_left}>
                    <div
                      className={`${styles.stamped_image} ${
                        nftMetadatas[i].isStaked ? styles.staked : ""
                      }`}
                    >
                      <img
                        className={`${styles.image} ${
                          nftMetadatas[i].isStaked ? styles.black_and_white : ""
                        }`}
                        src={nftImage}
                        alt="NFT Image"
                      />
                      {nftMetadatas[i].isStaked ? (
                        <span className={styles.stamp}>STAKED</span>
                      ) : null}
                    </div>
                  </div>
                  <div className={styles.side_right}>
                    <h2 className={styles.card_title}>
                      {nftMetadatas[i].name}
                    </h2>
                    <p className={styles.card_text}>
                      {nftMetadatas[i].description}
                    </p>
                    <p className={styles.card_text}>
                      Token ID: {nftMetadatas[i].token_id}
                    </p>
                    <h2 className={styles.card_title}>Attributes</h2>
                    {nftMetadatas[i].attributes.map((attr, j) => (
                      <div className={styles.attribute} key={j}>
                        <span className={styles.attribute_label}>
                          {attr.trait_type}:
                        </span>
                        <span className={styles.attribute_value}>
                          {attr.value}
                        </span>
                      </div>
                    ))}
                    {!nftMetadatas[i].isStaked ? (
                      <div>
                        <h2 className={styles.card_title}>
                          Oh no, you ain't minting our token T0xC yet?
                        </h2>
                        <button
                          className={styles.mint_button}
                          onClick={stakeNFT(nftMetadatas[i].token_id)}
                        >
                          Click it fast, yo!
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h2 className={styles.card_title}>
                          Wow, you can get more than {nftMetadatas[i].reward}{" "}
                          T0xC!
                        </h2>
                        <button
                          className={styles.mint_button}
                          onClick={unstakeNFT(nftMetadatas[i].token_id)}
                        >
                          Give me everything, pronto!
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              ""
            )
          )}
        </div>
      </div>

      <h1 className={styles.h1}>
        All collection has {nftMetadatas.length} NFT's
      </h1>
      <div className={styles.container2}>
        <div className={styles.row2}>
          {nftImages.map((nftImage, i) => (
            <div key={i} className={styles.col2}>
              <div className={styles.card2}>
                <div
                  className={`${styles.image_container2} ${
                    nftMetadatas[i].isStaked ? styles.staked : ""
                  }`}
                >
                  <img
                    className={`${styles.image2} ${
                      nftMetadatas[i].isStaked ? styles.black_and_white : ""
                    }`}
                    src={nftImage}
                    alt="NFT Image"
                  />
                  {nftMetadatas[i].isStaked ? (
                    <span className={styles.stamp}>STAKED</span>
                  ) : null}
                </div>
                <div className={styles.owner2}>
                  Owner: {nftMetadatas[i].owner}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p>NFT contract address: {NFT_CONTRACT_ADDRESS}</p>
      <p>T0xC contract address: {TOKEN_CONTRACT_ADDRESS}</p>
    </div>
  );
};

export default NftViewer;
