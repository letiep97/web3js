import Web3 from 'web3'
// import Web3EthContract from 'web3-eth-contract'
import React, { useEffect, useState } from 'react';
import { Button, Container, Row, Col, Form } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import Common from '@ethereumjs/common';
import { Transaction } from '@ethereumjs/tx';
import { abi as ABI } from "./ABI.json"
import { BigNumber } from "bignumber.js";

let web3;

function App() {
  const [loading, setLoading] = useState(false)
  const [accountInfo, setAccountInfo] = useState({
    address: "",
    name: "",
    total: 0,
  });
  const [formSent, setFormSent] = useState({
    address: "",
    amount: null,
  });
  const [formCallSC, setFormCallSC] = useState({
    token: "",
    address: "",
    amount: null,
  });
  const [listToken, setListToken] = useState([
    "0x9fd715f62abcb402682889fb958fa88a9fd1cf16"
  ])
  const config = {
    chain_name: 'rinkeby'
  }
  const common = new Common({ chain: config.chain_name })

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
      // await sendETH(user2.address, 0.12);

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

  const sendETH = async (address, amount) => {
    setLoading(true);
    try {
      // const Tx = require('@ethereumjs/tx').Transaction;
      const nonce = await web3.eth.getTransactionCount(user1.address, 'pending');
      const price = await web3.eth.getGasPrice();
      const rawTx = {
        nonce: web3.utils.toHex(nonce),
        gasLimit: 21000,
        gasPrice: web3.utils.toHex(price),
        to: address,
        data: '0x',
        value: web3.utils.toHex(amount * 10 ** 18) // 0
      };
      console.log(rawTx);

      const tx = Transaction.fromTxData(rawTx, { common })
      const privateKey = Buffer.from(user1.privateKey, 'hex');
      const signedTx = tx.sign(privateKey)
      const serializedTx = signedTx.serialize()
      web3.eth
        .sendSignedTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
          if (!err) {
            // onClear();
            console.log(hash);
            debugger
          } else {
            setLoading(false);
            console.log(err);
          }
        })
        .once('transactionHash', e => {
          debugger
          // setTxHash(e);
        })
        .on('receipt', (msg) => {
          debugger
          console.log(msg)
        })
        .once('confirmation', () => {
          // setReloadToken(true);
          setLoading(false);
          debugger
        })
    } catch (error) {
      setLoading(true);
      console.log(error);
    }
  };

  const sentToken = async (address, amount) => {
    setLoading(true);
    try {
      // ERC 20
      const Erc20Contract = new web3.eth.Contract(ABI, formCallSC.token);
      const decimalToken = await Erc20Contract.methods.decimals().call();
      const sendAmount = new BigNumber(amount).multipliedBy(Math.pow(10, decimalToken))

      const data = Erc20Contract.methods.transfer(formCallSC.address, sendAmount.toFixed());
      // 2. Create Tx params
      const nonce = await web3.eth.getTransactionCount(user1.address, 'pending');
      const price = await web3.eth.getGasPrice();
      const limit = await data.estimateGas({ from: user1.address });
      const rawTx = {
        nonce: web3.utils.toHex(nonce),
        gasLimit: limit,
        gasPrice: web3.utils.toHex(price),
        to: formCallSC.token,
        data: data.encodeABI(),
        value: web3.utils.toHex(0) // 0
      };
      console.log(rawTx);

      // 3. Sign transaction
      const common = new Common({ chain: config.chain_name })
      var tx = Transaction.fromTxData(rawTx, { common })

      const privateKey = Buffer.from(user1.privateKey, 'hex');
      const signedTx = tx.sign(privateKey);
      const serializedTx = signedTx.serialize();

      // 4. Send 
      web3.eth
        .sendSignedTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
          if (!err) {
            // onClear();
            console.log(hash);
            debugger
          } else {
            setLoading(false);
            console.log(err);
          }
        })
        .once('transactionHash', e => {
          debugger
          // setTxHash(e);
        })
        .on('receipt', (msg) => {
          debugger
          console.log(msg)
        })
        .once('confirmation', () => {
          // setReloadToken(true);
          setLoading(false);
          debugger
        })
    } catch (error) {
      setLoading(true);
      console.log(error);
    }
  }

  return (
    <Container>
      <h1>Hello, World!</h1>
      <p>Your account: {accountInfo.address}</p>

      {loading && "Processing..."}
      <Row>
        {/* Eth */}
        <Col>
          <Form onSubmit={
            (e) => {
              sendETH(formSent.address, formSent.amount);
              e.preventDefault();
              return false;
            }
          }>
            Sent coin ETH:
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control value={formSent.address} onChange={(e) => {
                setFormSent({ ...formSent, address: e.target.value });
              }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Amount
              </Form.Label>
              <Form.Control
                type={"number"} value={formSent.amount} onChange={(e) => {
                  setFormSent({ ...formSent, amount: e.target.value });
                }}></Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit"  > Send </Button>
          </Form>

        </Col>
        {/* Token E20 */}
        <Col>
          <Form onSubmit={
            (e) => {
              sentToken(formCallSC.address, formCallSC.amount);
              e.preventDefault();
              return false;
            }
          }>
            Call smart contract: 
            <Form.Group className="mb-3">
              <Form.Label>Token</Form.Label>
              <Form.Select value={formCallSC.token} onChange={e => {
                setFormCallSC({ ...formCallSC, token: e.target.value })
              }}>
                <option value={""}></option>
                {listToken.map(v =>
                  <option value={v}>SINI</option>
                )}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Address
              </Form.Label>
              <Form.Control value={formCallSC.address} onChange={(e) => {
                setFormCallSC({ ...formCallSC, address: e.target.value });
              }}></Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control type={"number"} value={formCallSC.amount} onChange={(e) => {
                setFormCallSC({ ...formCallSC, amount: e.target.value });
              }}></Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit" > Send </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export default App;
