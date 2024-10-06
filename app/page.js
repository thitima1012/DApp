"use client";
import React, { useState, useEffect } from "react";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Chip,
  Stack,
  Container,
  Card,
  CardContent,
  TextField,
  Box,
  IconButton,
  Divider,
} from "@mui/material";

import abi from "./abi.json";
import MenuIcon from "@mui/icons-material/Menu";

import { ethers } from "ethers";
import { formatEther, parseUnits } from "@ethersproject/units";

import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";

const [metaMask, hooks] = initializeConnector(
  (actions) => new MetaMask({ actions })
);
const { useChainId, useAccounts, useIsActive, useProvider } = hooks;
const contractChain = 11155111;
const contractAddress = "0x320eA8c2a01cF366E80eaD0cD4316F83e25E53Bc"; // address of smart contract

const getAddressTxt = (str, s = 6, e = 6) => {
  if (str) {
    return `${str.slice(0, s)}...${str.slice(str.length - e)}`;
  }
  return "";
};

export default function Page() {
  const chainId = useChainId();
  const accounts = useAccounts();
  const isActive = useIsActive();
  const provider = useProvider();
  const [error, setError] = useState(undefined);
  const [balance, setBalance] = useState("");

  useEffect(() => {
    const fetchBalance = async () => {
      const signer = provider.getSigner();
      const smartContract = new ethers.Contract(contractAddress, abi, signer);
      const myBalance = await smartContract.balanceOf(accounts[0]);
      setBalance(formatEther(myBalance));
    };
    if (isActive) {
      fetchBalance();
    }
  }, [isActive, accounts, provider]);

  const [ETHValue, setETHValue] = useState(0);
  const handleBuy = async () => {
    if (ETHValue <= 0) {
      return;
    }
    const signer = provider.getSigner();
    const smartContract = new ethers.Contract(contractAddress, abi, signer);
    const weiValue = parseUnits(ETHValue.toString(), "ether");
    const tx = await smartContract.buy({ value: weiValue.toString() });
    console.log("Transaction hash:", tx.hash);
  };

  useEffect(() => {
    void metaMask.connectEagerly().catch(() => {
      console.debug("Failed to connect eagerly to metamask");
    });
  }, []);

  const handleConnect = () => {
    metaMask.activate(contractChain);
  };

  const handleDisconnect = () => {
    metaMask.resetState();
    alert(
      "To fully disconnect, please remove this site from MetaMask's connected sites by locking metamask."
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFE4B5' }}> {/* Light peach color for background */}
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: '#FFA07A' }}> {/* Light orange color */}
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Pimpakarn DApp CryptoExchange
            </Typography>

            {!isActive ? (
              <Button variant="contained" onClick={handleConnect} sx={{ backgroundColor: '#FFA07A' }}>
                Connect
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Chip label={getAddressTxt(accounts[0])} variant="outlined" />
                <Button
                  variant="contained"
                  color="inherit"
                  onClick={handleDisconnect}
                  sx={{ backgroundColor: '#FFA07A' }}
                >
                  Disconnect
                </Button>
              </Stack>
            )}
          </Toolbar>
        </AppBar>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 4, flex: 1 }}>
        {isActive ? (
          <Card variant="outlined" sx={{ padding: 3, backgroundColor: '#FFB6C1' }}> {/* Light pink color */}
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h5" align="center">
                  UDS Wallet
                </Typography>
                <TextField
                  label="Address"
                  value={accounts[0]}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <TextField
                  label="UDS Balance"
                  value={balance}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Divider />
                <Typography align="center">Buy UDS (1 ETH = 10 UDS)</Typography>
                <TextField
                  label="ETH"
                  type="number"
                  variant="outlined"
                  onChange={(e) => setETHValue(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleBuy}
                  sx={{ alignSelf: 'center', backgroundColor: '#FFA07A' }} // Light orange color
                >
                  Buy
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : null}
      </Container>

      <footer style={{ backgroundColor: '#FFA07A', padding: '10px', textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          © 2024 My Full-Screen App. All rights reserved.
        </Typography>
      </footer>
    </div>
  );
}
