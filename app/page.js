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
  Paper,
} from "@mui/material";

import abi from "./abi.json";
import MenuIcon from "@mui/icons-material/Menu";

import { ethers } from "ethers";
import { formatEther, parseUnits } from "@ethersproject/units";

import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";

// Initialize MetaMask connector
const [metaMask, hooks] = initializeConnector(
  (actions) => new MetaMask({ actions })
);
const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider } =
  hooks;

const contractChain = 11155111;
const contractAddress = "0x8556DE1E07addC420b9E0572c2e73D042EBd9F10"; //address of smart contract

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
  }, [isActive]);

  const [ETHValue, setETHValue] = useState(0);
  const handleBuy = async () => {
    if (ETHValue <= 0) {
      return;
    }
    const signer = provider.getSigner();
    const smartContract = new ethers.Contract(contractAddress, abi, signer);
    const weiValue = parseUnits(ETHValue.toString(), "ether");
    const tx = await smartContract.buy({
      value: weiValue.toString(),
    });
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
    <Paper sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="static"
          sx={{ bgcolor: "white", boxShadow: "none", padding: 1 }}
        >
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="default"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, color: "#333" }}
            >
              Kays Crypto Rich
            </Typography>

            {!isActive ? (
              <Button
                variant="contained"
                onClick={handleConnect}
                sx={{
                  bgcolor: "#333",
                  "&:hover": { bgcolor: "#555" },
                  textTransform: "none",
                }}
              >
                Connect Wallet
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Chip
                  label={getAddressTxt(accounts[0])}
                  variant="outlined"
                  sx={{ bgcolor: "#e0e0e0" }}
                />
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDisconnect}
                  sx={{ textTransform: "none" }}
                >
                  Disconnect Wallet
                </Button>
              </Stack>
            )}
          </Toolbar>
        </AppBar>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 4 }}>
        {isActive ? (
          <Card
            sx={{
              padding: 3,
              borderRadius: 2,
              boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  UDS Balance
                </Typography>
                <TextField
                  label="Address"
                  value={getAddressTxt(accounts[0])}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  variant="outlined"
                />
                <TextField
                  label="UDS Balance"
                  value={balance}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  variant="outlined"
                />
                <Divider />
                <Typography variant="h6">Buy UDS (1 ETH = 10 UDS)</Typography>
                <TextField
                  label="ETH"
                  type="number"
                  onChange={(e) => setETHValue(parseFloat(e.target.value))}
                  value={ETHValue}
                  fullWidth
                  variant="outlined"
                />
                <Button
                  variant="contained"
                  onClick={handleBuy}
                  sx={{
                    bgcolor: "#333",
                    "&:hover": { bgcolor: "#555" },
                    textTransform: "none",
                  }}
                  fullWidth
                >
                  Buy
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : null}
      </Container>
    </Paper>
  );
}
