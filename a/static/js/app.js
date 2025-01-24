let web3;
let contract;
const contractAddress = "0xa0005fcEed94DC24dAD3A1f661D2298b078a73b8";
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_maxAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_minAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_interestRate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_maxTimeBeforeReturn",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_collateralRate",
				"type": "uint256"
			}
		],
		"name": "addBorrowOption",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "_isActive",
				"type": "bool"
			}
		],
		"name": "adjustBorrowOption",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_depositor",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_maxTimeBeforeReturn",
				"type": "uint256"
			}
		],
		"name": "borrowMoney",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Deposit",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "depositCollateral",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "depositMoney",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "getCollateralFromUser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "getTokensFromUser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "registerBorrower",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "registerDepositor",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "repay",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_collateralTokenAddress",
				"type": "address"
			}
		],
		"name": "setCollateralToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_minDeposit",
				"type": "uint256"
			}
		],
		"name": "setMinDeposit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "setOwner",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_tokenAddress",
				"type": "address"
			}
		],
		"name": "setToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "borrowers",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "collateralAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "canBorrowCollateralAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalBorrowAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "borrowAmountRepaid",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "borrowRecords_num",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "borrowOptions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "maxAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "minAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "interestRate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "maxTimeBeforeReturn",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "collateralRate",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "borrowRecords",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "repaidAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "startedTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "endsTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "interestRate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "collateralRate",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "depositor",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "collateralRate",
				"type": "uint256"
			}
		],
		"name": "calcCollateralAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "interestRate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "duration",
				"type": "uint256"
			}
		],
		"name": "calcInterest",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "interestRate",
				"type": "uint256"
			}
		],
		"name": "calcInterestRatePerSecond",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "DECIMAL",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "depositors",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "depositeAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "canLendAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "borrowOptions_num",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ETH",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "SECONDS_IN_YEAR",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "seeMinDeposit",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "seetokentype",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "USDC",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "USDT",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "depositor_add",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "viewBorrowOption",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "borrower_add",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "viewBorrowRecord",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "WBTC",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

async function connectWallet() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.enable();
            const accounts = await web3.eth.getAccounts();
            document.getElementById("wallet-address").innerText = `Connected: ${accounts[0]}`;
            contract = new web3.eth.Contract(contractABI, contractAddress);
            setupEventListeners();
            await updateUI();
            await checkOwnerAndUpdateUI();
        } catch (error) {
            console.error("User denied account access", error);
        }
    } else {
        alert("Please install MetaMask!");
    }
}

function setupEventListeners() {
    contract.events.Deposit()
        .on('data', (event) => {
            console.log('Deposit event:', event.returnValues);
            updateUI();
        })
        .on('error', console.error);
}

async function updateUI() {
    const accounts = await web3.eth.getAccounts();
    const depositorInfo = await contract.methods.depositors(accounts[0]).call();
    document.getElementById("depositor-info").innerText = `Total Deposit: ${depositorInfo.depositeAmount}, Can Lend: ${depositorInfo.canLendAmount}`;
    
    const borrowerInfo = await contract.methods.borrowers(accounts[0]).call();
    document.getElementById("borrower-info").innerText = `Collateral: ${borrowerInfo.collateralAmount}, Can Borrow: ${borrowerInfo.canBorrowCollateralAmount}, Total Borrowed: ${borrowerInfo.totalBorrowAmount}`;

    await updateMinDepositUI();
}

async function isContractOwner() {
    const accounts = await web3.eth.getAccounts();
    const owner = await contract.methods.owner().call();
    return accounts[0].toLowerCase() === owner.toLowerCase();
}

async function setMinDeposit() {
    if (!await isContractOwner()) {
        alert("Only the contract owner can set the minimum deposit.");
        return;
    }

    const minDepositAmount = document.getElementById("min-deposit-amount").value;
    try {
        await contract.methods.setMinDeposit(minDepositAmount).send({ from: (await web3.eth.getAccounts())[0] });
        alert("Minimum deposit amount set successfully!");
        await updateMinDepositUI();
    } catch (error) {
        console.error("Error setting minimum deposit:", error);
        alert("Failed to set minimum deposit. See console for details.");
    }
}

async function getMinDeposit() {
    try {
        const minDeposit = await contract.methods.seeMinDeposit().call();
        return minDeposit;
    } catch (error) {
        console.error("Error getting minimum deposit:", error);
        return null;
    }
}

async function updateMinDepositUI() {
    const minDeposit = await getMinDeposit();
    if (minDeposit !== null) {
        document.getElementById("current-min-deposit").innerText = `Current Minimum Deposit: ${web3.utils.fromWei(minDeposit, 'ether')} ETH`;
    }
}

async function checkOwnerAndUpdateUI() {
    const isOwner = await isContractOwner();
    document.getElementById("set-min-deposit-container").style.display = isOwner ? "block" : "none";
}

// Depositor functions
async function registerDepositor() {
    const accounts = await web3.eth.getAccounts();
    try {
        await contract.methods.registerDepositor().send({ from: accounts[0] });
        alert("Successfully registered as a depositor!");
    } catch (error) {
        console.error("Error registering depositor:", error);
        alert("Failed to register as a depositor. See console for details.");
    }
}

async function depositMoney() {
    const accounts = await web3.eth.getAccounts();
    const amount = document.getElementById("deposit-amount").value;
    try {
        await contract.methods.depositMoney(amount).send({ from: accounts[0] });
        alert("Deposit successful!");
        updateUI();
    } catch (error) {
        console.error("Error depositing money:", error);
        alert("Failed to deposit money. See console for details.");
    }
}

async function addBorrowOption(event) {
	event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    const maxAmount = document.getElementById("maxAmount").value;
    const minAmount = document.getElementById("minAmount").value;
    const interestRate = document.getElementById("interestRate").value;
    const collateralRate = document.getElementById("collateralRate").value;
    const maxTime = document.getElementById("maxTime").value;
    try {
        await contract.methods.addBorrowOption(maxAmount, minAmount, interestRate, maxTime, collateralRate).send({ from: accounts[0] });
        alert("Borrow option added successfully!");
    } catch (error) {
        console.error("Error adding borrow option:", error);
        alert("Failed to add borrow option. See console for details.");
    }
}

// Borrower functions
async function registerBorrower() {
    const accounts = await web3.eth.getAccounts();
    try {
        await contract.methods.registerBorrower().send({ from: accounts[0] });
        alert("Successfully registered as a borrower!");
    } catch (error) {
        console.error("Error registering borrower:", error);
        alert("Failed to register as a borrower. See console for details.");
    }
}

async function depositCollateral() {
    const accounts = await web3.eth.getAccounts();
    const amount = document.getElementById("collateral-amount").value;
    try {
        await contract.methods.depositCollateral(amount).send({ from: accounts[0] });
        alert("Collateral deposited successfully!");
        updateUI();
    } catch (error) {
        console.error("Error depositing collateral:", error);
        alert("Failed to deposit collateral. See console for details.");
    }
}

async function borrowMoney() {
    const accounts = await web3.eth.getAccounts();
    const depositorAddress = document.getElementById("depositor-address").value;
    const index = document.getElementById("borrow-index").value;
    const amount = document.getElementById("borrow-amount").value;
    const maxTime = document.getElementById("borrow-time").value;

    console.log("Borrow Money Parameters:");
    console.log("Depositor Address:", depositorAddress);
    console.log("Index:", index);
    console.log("Amount:", amount);
    console.log("Max Time:", maxTime);
    console.log("From Account:", accounts[0]);

    try {
        await contract.methods.borrowMoney(depositorAddress, index, amount, maxTime).send({ from: accounts[0] });
        alert("Money borrowed successfully!");
        updateUI();
    } catch (error) {
        console.error("Error borrowing money:", error);
        alert("Failed to borrow money. See console for details.");
    }
}

async function repay() {
    const accounts = await web3.eth.getAccounts();
    const index = document.getElementById("repay-index").value;
    const amount = document.getElementById("repay-amount").value;
    try {
        await contract.methods.repay(index, amount).send({ from: accounts[0] });
        alert("Repayment successful!");
        updateUI();
    } catch (error) {
        console.error("Error repaying loan:", error);
        alert("Failed to repay loan. See console for details.");
    }
}

// Helper functions
async function getBorrowOptions(depositorAddress) {
    try {
        const optionsContainer = document.getElementById("borrow-options");
        optionsContainer.innerHTML = '';

        // 获取存款人的借款选项数量
        const borrowOptionsCount = await contract.methods.depositors(depositorAddress).call();
        const optionsCount = borrowOptionsCount.borrowOptions_num;

        for (let i = 0; i < optionsCount; i++) {
            const option = await contract.methods.viewBorrowOption(depositorAddress, i).call();
            optionsContainer.innerHTML += `
                <div>
                    Option ${i}: Max: ${option[0]}, Min: ${option[1]}, 
                    Interest: ${option[2]}, Max Time: ${option[3]}, 
                    Collateral Rate: ${option[4]}, Active: ${option[5]}
                </div>
            `;
        }
    } catch (error) {
        console.error("Error getting borrow options:", error);
        alert("Failed to get borrow options. See console for details.");
    }
}

async function getBorrowRecords() {
    try {
        const accounts = await web3.eth.getAccounts();
        const recordsContainer = document.getElementById("borrow-records");
        recordsContainer.innerHTML = '';

        // 获取借款人的借款记录数量
        const borrowRecordsCount = await contract.methods.borrowers(accounts[0]).call();
        const recordsCount = borrowRecordsCount.borrowRecords_num;

        for (let i = 0; i < recordsCount; i++) {
            const record = await contract.methods.viewBorrowRecord(accounts[0], i).call();
            recordsContainer.innerHTML += `
                <div>
                    Record ${i}: Amount: ${record[0]}, Repaid: ${record[1]}, 
                    Started: ${new Date(record[2] * 1000).toLocaleString()}, 
                    Ends: ${new Date(record[3] * 1000).toLocaleString()}, 
                    Interest: ${record[4]}, Collateral Rate: ${record[5]}, 
                    Depositor: ${record[6]}, Active: ${record[7]}
                </div>
            `;
        }
    } catch (error) {
        console.error("Error getting borrow records:", error);
        alert("Failed to get borrow records. See console for details.");
    }
}

// Initialize the app
window.addEventListener('load', async () => {
    await connectWallet();
    document.getElementById("connect-button").addEventListener("click", connectWallet);
    document.getElementById("set-min-deposit-button").addEventListener("click", setMinDeposit);
    document.getElementById("register-depositor-button").addEventListener("click", registerDepositor);
    document.getElementById("deposit-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        await depositMoney();
    });
    document.getElementById("register-borrower-button").addEventListener("click", registerBorrower);
    document.getElementById("collateral-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        await depositCollateral();
    });
    document.getElementById("borrow-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        await borrowMoney();
    });
    document.getElementById("repay-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        await repay();
    });

    // Initial UI update
    await updateUI();
    await checkOwnerAndUpdateUI();
});
