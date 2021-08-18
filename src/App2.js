import Web3 from 'web3'
import Common from '@ethereumjs/common'
import React, { useEffect, useState } from 'react';
import { Transaction } from '@ethereumjs/tx'

let web3;

function App() {
  const [accountInfo, setAccountInfo] = useState({
    address: "",
    name: "",
    total: 0,
  });

  const config = {
    chain_name: 'rinkeby'
  }
  const user1 = {
    privateKey: "383fb5b9fbdcd79b6bce0f03a67dc1c2d2f9ad315f2b6d004409ca1377591af4",
    address: "0xC5FEdBD978E30862957637f32C53E92184E40835"
  }
  const user2 = {
    address: "0x399C3A3b0fa0Cc447869Ee815475d26264D44804"
  }

  useEffect(() => {
    (async () => {
      // Case 1:
      // await loadWeb3();
      // await getData();
      // Case 2:
      // await loadBlockchainData();
      // Case 3:
      web3 = new Web3("https://rinkeby.infura.io/v3/c9f9eba874a24d339db4c886f6964321")

      // Send
      await sendETH(0.12);

      // await sentDoc("0x399C3A3b0fa0Cc447869Ee815475d26264D44804", 1);

    })();
  }, [])

  const loadWeb3 = async () => {
    if (window.ethereum) {
      web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  const getData = async () => {
    const network = await web3.eth.net.getNetworkType();
    // await window.ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    setAccountInfo({ ...accountInfo, address: accounts[0] });
    console.log("TCL: getData -> network", network);
    console.log("TCL: getData -> accounts", accounts);
  };

  const loadBlockchainData = async () => {
    const web3 = new Web3(Web3.givenProvider);
    const accounts = await web3.eth.requestAccounts();
    setAccountInfo({ ...accountInfo, address: accounts[0] });
  }

  const sendETH = async (amount) => {
    try {
      const nonce = await web3.eth.getTransactionCount(user1.address, 'pending');
      const price = await web3.eth.getGasPrice();
      debugger
      const rawTx = {
        nonce: web3.utils.toHex(nonce),
        gasLimit: 21000,
        gasPrice: web3.utils.toHex(price),
        // from: user1.address,
        to: user2.address,
        data: '0x',
        value: web3.utils.toHex(amount * 10 ** 18) // 0
      };
      console.log(rawTx);
      const common = new Common({ chain: config.chain_name })
      const tx = Transaction.fromTxData(rawTx, { common })
      // const tx = new Tx(rawTx, { chain: config.chain_name.toLowerCase() });
      const privateKey = Buffer.from(user1.privateKey, 'hex');
      tx.sign(privateKey);
      const serializedTx = tx.serialize();
      debugger
      web3.eth
        .sendSignedTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
          debugger
          if (!err) {
            // onClear();
            console.log(hash);
            debugger
          } else {
            console.log(err);
          }
        })
        .once('confirmation', () => {
          // setReloadToken(true);
          debugger
        })
        .on('receipt', (msg) => {
          debugger
          console.log(msg)

        })
        .once('transactionHash', e => {
          debugger
          // setTxHash(e);
        });
    } catch (error) {
      debugger
      console.log(error);
    }
  };



  return (
    <div className="container">
      <h1>Hello, World!</h1>
      <p>Your account: {accountInfo.address}</p>
    </div>
  )
}

export default App;
