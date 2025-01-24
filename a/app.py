from flask import Flask, redirect, render_template, request, jsonify, url_for
from web3 import Web3
import os
import sqlite3




app = Flask(__name__)

# 使用環境變量存儲敏感信息
infura_url = os.environ.get('INFURA_URL', "https://sepolia.infura.io/v3/your-infura-project-id")
web3 = Web3(Web3.HTTPProvider(infura_url))

# 合約地址與 ABI
contract_address = "0x7660fFdD34a455F02D329E341F7A84642d3731CE"
abi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": True,
				"internalType": "address",
				"name": "asset",
				"type": "address"
			},
			{
				"indexed": True,
				"internalType": "address",
				"name": "priceFeed",
				"type": "address"
			}
		],
		"name": "AssetPriceFeedUpdated",
		"type": "event"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": True,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": True,
				"internalType": "address",
				"name": "borrowAsset",
				"type": "address"
			},
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": True,
				"internalType": "address",
				"name": "collateralAsset",
				"type": "address"
			}
		],
		"name": "Borrow",
		"type": "event"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": True,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": True,
				"internalType": "address",
				"name": "asset",
				"type": "address"
			},
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Deposit",
		"type": "event"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": True,
				"internalType": "address",
				"name": "borrower",
				"type": "address"
			},
			{
				"indexed": True,
				"internalType": "address",
				"name": "borrowAsset",
				"type": "address"
			},
			{
				"indexed": True,
				"internalType": "address",
				"name": "collateralAsset",
				"type": "address"
			},
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "liquidationAmount",
				"type": "uint256"
			},
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "liquidatedCollateral",
				"type": "uint256"
			}
		],
		"name": "Liquidation",
		"type": "event"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": True,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": True,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": True,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": True,
				"internalType": "address",
				"name": "asset",
				"type": "address"
			},
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Repay",
		"type": "event"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": True,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": True,
				"internalType": "address",
				"name": "asset",
				"type": "address"
			},
			{
				"indexed": False,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Withdraw",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "BORROW_RATE",
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
		"name": "BTC_USD_PRICE_FEED",
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
		"name": "DEPOSIT_RATE",
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
		"name": "ETH_USD_PRICE_FEED",
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
		"name": "LIQUIDATION_BONUS",
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
		"name": "LIQUIDATION_THRESHOLD",
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
		"name": "USDC_USD_PRICE_FEED",
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
		"inputs": [],
		"name": "USDT_USD_PRICE_FEED",
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
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "assetInfo",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "contract AggregatorV3Interface",
				"name": "priceFeed",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "totalDeposits",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalBorrows",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "reserveFactor",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastUpdateTimestamp",
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
				"name": "borrowAsset",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "collateralAsset",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "borrowAmount",
				"type": "uint256"
			}
		],
		"name": "borrow",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "asset",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "asset",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getAccruedInterest",
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
				"name": "asset",
				"type": "address"
			}
		],
		"name": "getAssetPrice",
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
				"name": "asset",
				"type": "address"
			}
		],
		"name": "getAssetPriceFeed",
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
				"name": "collateralAsset",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getCollateralValue",
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
				"name": "borrowAsset",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "collateralAsset",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "collateralAmount",
				"type": "uint256"
			}
		],
		"name": "getMaxBorrowAmount",
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
				"name": "asset",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "priceFeedAddress",
				"type": "address"
			}
		],
		"name": "initializeAsset",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "asset",
				"type": "address"
			}
		],
		"name": "isAssetSupported",
		"outputs": [
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
				"name": "borrower",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "borrowAsset",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "collateralAsset",
				"type": "address"
			}
		],
		"name": "isLiquidatable",
		"outputs": [
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
				"name": "borrower",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "borrowAsset",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "collateralAsset",
				"type": "address"
			}
		],
		"name": "liquidate",
		"outputs": [],
		"stateMutability": "payable",
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
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "asset",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "repay",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "asset",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "priceFeed",
				"type": "address"
			}
		],
		"name": "setAssetPriceFeed",
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
		"name": "transferOwnership",
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
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userBorrows",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastUpdateTimestamp",
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
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userDeposits",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastUpdateTimestamp",
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
				"name": "asset",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

# 建立合約實例
contract = web3.eth.contract(address=contract_address, abi=abi)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/deposit')
def deposit():
    return render_template('deposit.html')

@app.route('/deposit', methods=['POST'])
def deposit_post():
    asset = request.form['asset']
    amount = request.form['amount']
    # 這裡添加與合約交互的邏輯
    return jsonify({'message': f'Successfully deposited {amount} {asset}'})

@app.route('/borrow')
def borrow():
    return render_template('borrow.html')

@app.route('/repay')
def repay():
    return render_template('repay.html')

@app.route('/liquidation')
def liquidation():
    return render_template('liquidation.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')


# @app.route('/indexP2PMainPage', methods=["GET", "POST"])
# def indexP2PMainPage():

#     return render_template('indexP2PMainPage.html')

@app.route('/p2plending', methods=["GET", "POST"])
def redirect_to_p2plending():
    return render_template('indexP2PMainPage.html')

@app.route('/P2PMainPage',methods=["get","post"])
def P2PMainPage():
	r = request.form.get("name")
	conn=sqlite3.connect('dapp.db')
	c = conn.cursor()
	c.execute("insert into user values (?)",(r,))
	conn.commit()
	c.close()
	conn.close()
	return render_template('P2PMainPage.html',r=r)

@app.route('/depositor')
def depositor():
    return render_template('P2PDepositor.html')

@app.route('/borrower')
def borrower():
    return render_template('P2PBorrower.html')


# 连接数据库并创建表
def create_database():
    # 连接数据库，如果不存在则自动创建
    conn = sqlite3.connect('dapp.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE if not exists user (
			username text
        );
    ''')
    # 创建 depositor 表
    c.execute('''
        CREATE TABLE if not exists depositor (
            Depositor_address text  ,
            depositeAmount INT   DEFAULT 0,
            canLendAmount INT   DEFAULT 0
        );
    ''')
    
    # 创建 borrowoption 表
    c.execute('''
        CREATE TABLE if not exists borrowoption (
            Depositor_address text  ,
            maxAmount INT  DEFAULT 0,
            minAmount INT   DEFAULT 0,
            interestRate INT   DEFAULT 0,
            maxTimeBeforeReturn INT   DEFAULT 0,
            collateralRate INT   DEFAULT 0,
            isActive INT   DEFAULT 0
        );
    ''')

    # 创建 borrower 表
    c.execute('''
        CREATE TABLE if not exists borrower (
            canBorrowCollateralAmount INT   DEFAULT 0,
            Borrower_address text ,
            collateralAmount INT  DEFAULT 0,
            totalBorrowAmount INT   DEFAULT 0,
            borrowAmountRepaid INT   DEFAULT 0
        );
    ''')

    # 创建 borrowrecord 表
    c.execute('''
        CREATE TABLE if not exists borrowrecord (
            Depositor_address text NOT NULL,
            amount INT   DEFAULT 0,
            repaidAmount INT   DEFAULT 0,
            startedTime INT   DEFAULT 0,
            endsTime INT   DEFAULT 0,
            interestRate INT   DEFAULT 0,
            collateralRate INT   DEFAULT 0,
            isActive INT   DEFAULT 0
        );
    ''')

    # 提交更改并关闭连接
    conn.commit()
    c.close()
    conn.close()
    
if __name__ == '__main__':
    create_database()
    app.run(debug=True)
