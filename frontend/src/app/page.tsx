"use client";

import Head from "next/head";
import Web3Modal from "web3modal";
import { ethers, providers } from "ethers";
import { useState, useEffect, useRef } from "react";

const Home = () => {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [ens, setENS] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const web3ModalRef = useRef<Web3Modal | undefined>(undefined);

  /**
   * setENSOrAddress: Sets the ENS if the current connected address has one associated with it or else it sets the
   *                  address to the connected wallet
   */
  const setENSOrAddress = async (address: string, web3Provider: providers.Web3Provider) => {
    const _ens = await web3Provider.lookupAddress(address);
    _ens ? setENS(_ens) : setAddress(address);
  };

  /**
   * getProviderOrSigner: Helper function to fetch a Provider/Signer instance from Metamask
   */
  const getProviderOrSigner = async (needSigner = false) => {
    if (!web3ModalRef.current) {
      throw new Error("web3ModalRef.current is undefined");
    }

    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Please switch the network to Goerli");
      throw new Error("Please switch the network to Goerli");
    }

    const signer = web3Provider.getSigner() as providers.JsonRpcSigner;
    const address = await signer.getAddress();
    await setENSOrAddress(address, web3Provider);
    return signer;
  };

  /**
   * connectWallet: Connects the MetaMask wallet
   */
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * renderButton: Returns a button based on the state of the dApp
   */
  const renderButton = () => {
    return walletConnected ? (
      <div>Wallet connected</div>
    ) : (
      <button
        onClick={connectWallet}
        className="button rounded-md bg-blue-500 border-none text-white text-base px-5 py-4 w-52 cursor-pointer mb-2"
      >
        Connect your wallet
      </button>
    );
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>ENS dApp</title>
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>
      <div className="min-h-screen flex flex-row justify-center items-center font-mono">
        <div className="mx-8">
          <div className="text-4xl mb-2">
            Welcome to LearnWeb3 Associates {ens ? ens : address}!
          </div>
          <div className="text-lg">It&#39;s an NFT collection for LearnWeb3Associates.</div>
          {renderButton()}
        </div>
        <div>
          <img
            className="w-70 h-50 ml-20"
            src="./learnweb3associates.png"
          />
        </div>
      </div>
      <footer className="flex justify-center items-center py-8 border-t-2 border-gray-300">
        Made with &#10084; by LearnWeb3 Associates
      </footer>
    </div>
  );
};

export default Home;
