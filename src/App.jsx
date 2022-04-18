import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import "./App.css";

const App = () => {
  /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  /*
   * All state property to store all waves
   */
  const [allWaves, setAllWaves] = useState([]);
  /*
  * Setup a state to get form content
  */
  const [formData, setFormData] = useState({ message: "", contractAddress: "" });
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async (contractAddress) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();
        console.log(` waves: ${JSON.stringify(waves)}`);

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const wave = async (data) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract("0x336F639aBE72C47BEba9B295aa652E3937A6FC61", contractABI, signer);
        console.log('go');
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(data.message);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  }

  const handleChangeOnPaste = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.clipboardData.getData('text')
    });
  }

  const handleSubmit = async (event) => {
    await wave(formData);
    event.preventDefault();
  }

  /*
  * This runs our function when the page loads.
  */
  useEffect(async () => {
    await checkIfWalletIsConnected();
  }, []);

  useEffect(async () => {
    console.log(formData.contractAddress, currentAccount);
    if (currentAccount) await getAllWaves("0x336F639aBE72C47BEba9B295aa652E3937A6FC61");
  }, [currentAccount]);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          I am rick and i'm happy to learn web3 concepts on buildspace.so
        </div>
        <form onSubmit={handleSubmit}>
          <input type="text" name="contractAddress" placeholder="Your eth address" defaultValue={formData.contractAddress} onPaste={handleChangeOnPaste} required/>
          <textarea name="message" value={formData.message} placeholder="Your message" onInput={handleChange} required/>
          <input type="submit" className="waveButton" value="Wave at Me" />
        </form>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App