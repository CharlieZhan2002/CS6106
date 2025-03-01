// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract EnhancedLendingProtocol is ReentrancyGuard, Ownable {
    struct AssetInfo {
        IERC20 token;
        AggregatorV3Interface priceFeed;
        uint256 totalDeposits;
        uint256 totalBorrows;
        uint256 reserveFactor;
        uint256 lastUpdateTimestamp;
        bool isActive;
    }

    //store user deposit info
    struct UserDeposit {
        uint256 amount;
        uint256 lastUpdateTimestamp;
    }

    //store user borrow info
    struct UserBorrow {
        uint256 amount;
        uint256 lastUpdateTimestamp;
    }

    //assetInfo: 儲存每個資產地址對應的資產資訊。
    //userDeposits: 儲存用戶針對每個資產的存款資訊。
    //userBorrows: 儲存用戶針對每個資產的借款資訊。
    mapping(address => AssetInfo) public assetInfo;
    mapping(address => mapping(address => UserDeposit)) public userDeposits;
    mapping(address => mapping(address => UserBorrow)) public userBorrows;

    address public constant WBTC = address(0x29f2D40B0605204364af54EC677bD022dA425d03);
    address public constant ETH = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    address public constant USDC = address(0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8);
    address public constant DAI = address(0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357);

    uint256 public constant LIQUIDATION_THRESHOLD = 150; // 150% collateralization ratio
    uint256 public constant LIQUIDATION_BONUS = 2; // 2% bonus for liquidators
    uint256 public constant BORROW_RATE = 3e16; // 3% annual borrow rate
    uint256 public constant DEPOSIT_RATE = 2e16; // 2% annual deposit rate

    // Chainlink Price Feed Addresses on Sepolia Testnet
    address public constant USDC_USD_PRICE_FEED = 0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E;
    address public constant DAI_USD_PRICE_FEED = 0x14866185B1962B63C3Ea9E03Bc1da838bab34C19;
    address public constant ETH_USD_PRICE_FEED = 0x694AA1769357215DE4FAC081bf1f309aDC325306;
    address public constant BTC_USD_PRICE_FEED = 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43;

    constructor() Ownable(msg.sender) {
        // Initialize asset price feeds
        initializeAsset(USDC, USDC, USDC_USD_PRICE_FEED);
        initializeAsset(DAI, DAI, DAI_USD_PRICE_FEED);
        initializeAsset(ETH, ETH, ETH_USD_PRICE_FEED);
        initializeAsset(WBTC, WBTC, BTC_USD_PRICE_FEED);
    }

    //用來存儲所有已初始化資產的地址
    address[] public activeAssets;
    //初始化資產的基本設定，包括資產的 ERC-20 代幣介面和價格餵價地址
    function initializeAsset(address asset, address tokenAddress, address priceFeedAddress) public onlyOwner {
        //檢查該資產是否已經被初始化
        require(!assetInfo[asset].isActive, "Asset already initialized");
        assetInfo[asset].token = IERC20(tokenAddress);
        assetInfo[asset].priceFeed = AggregatorV3Interface(priceFeedAddress);
        assetInfo[asset].isActive = true;
        assetInfo[asset].lastUpdateTimestamp = block.timestamp;

        activeAssets.push(asset); // Add assets to list
    }

    function deposit(address asset, uint256 amount) external payable nonReentrant {
        require(isAssetSupported(asset), "Asset not supported");
        updateInterest(asset);

        if (asset == ETH) {
            require(msg.value == amount, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "ETH not accepted for this asset");
            require(IERC20(asset).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        }

        userDeposits[asset][msg.sender].amount += amount;
        userDeposits[asset][msg.sender].lastUpdateTimestamp = block.timestamp;
        assetInfo[asset].totalDeposits += amount;

        emit Deposit(msg.sender, asset, amount);
    }

    function withdraw(address asset, uint256 amount) external nonReentrant {
        require(isAssetSupported(asset), "Asset not supported");
        updateInterest(asset);

        UserDeposit storage userDeposit = userDeposits[asset][msg.sender];
        require(userDeposit.amount >= amount, "Insufficient balance");

        userDeposit.amount -= amount;
        userDeposit.lastUpdateTimestamp = block.timestamp;
        assetInfo[asset].totalDeposits -= amount;

        if (asset == ETH) {
            payable(msg.sender).transfer(amount);
        } else {
            require(IERC20(asset).transfer(msg.sender, amount), "Transfer failed");
        }

        emit Withdraw(msg.sender, asset, amount);
    }

    function borrow(address borrowAsset, address collateralAsset, uint256 borrowAmount) external nonReentrant {
        require(isAssetSupported(borrowAsset) && isAssetSupported(collateralAsset), "Asset not supported");
        require(borrowAsset != collateralAsset, "Cannot borrow the same asset as collateral");
        updateInterest(borrowAsset);
        updateInterest(collateralAsset);

        uint256 collateralValue = getAssetValue(collateralAsset, userDeposits[collateralAsset][msg.sender].amount);
        uint256 borrowValue = getAssetValue(borrowAsset, borrowAmount);

        require(collateralValue >= borrowValue * LIQUIDATION_THRESHOLD / 100, "Insufficient collateral");

        userBorrows[borrowAsset][msg.sender].amount += borrowAmount;
        userBorrows[borrowAsset][msg.sender].lastUpdateTimestamp = block.timestamp;
        assetInfo[borrowAsset].totalBorrows += borrowAmount;

        if (borrowAsset == ETH) {
            payable(msg.sender).transfer(borrowAmount);
        } else {
            require(IERC20(borrowAsset).transfer(msg.sender, borrowAmount), "Transfer failed");
        }

        emit Borrow(msg.sender, borrowAsset, borrowAmount, collateralAsset);
    }

    function repay(address asset, uint256 amount) external payable nonReentrant {
        require(isAssetSupported(asset), "Asset not supported");
        updateInterest(asset);

        UserBorrow storage userBorrow = userBorrows[asset][msg.sender];
        uint256 repayAmount = amount > userBorrow.amount ? userBorrow.amount : amount;

        if (asset == ETH) {
            require(msg.value >= repayAmount, "Insufficient ETH sent");
            if (msg.value > repayAmount) {
                payable(msg.sender).transfer(msg.value - repayAmount);
            }
        } else {
            require(IERC20(asset).transferFrom(msg.sender, address(this), repayAmount), "Transfer failed");
        }

        userBorrow.amount -= repayAmount;
        userBorrow.lastUpdateTimestamp = block.timestamp;
        assetInfo[asset].totalBorrows -= repayAmount;

        emit Repay(msg.sender, asset, repayAmount);
    }

    function liquidate(address borrower, address borrowAsset, address collateralAsset) external payable nonReentrant {
        require(isAssetSupported(borrowAsset) && isAssetSupported(collateralAsset), "Asset not supported");
        updateInterest(borrowAsset);
        updateInterest(collateralAsset);

        require(isLiquidatable(borrower, borrowAsset, collateralAsset), "Position is not liquidatable");

        uint256 borrowAmount = userBorrows[borrowAsset][borrower].amount;
        uint256 liquidationAmount = borrowAmount * LIQUIDATION_BONUS / 100;
        uint256 liquidatedCollateral = getAssetAmount(collateralAsset, getAssetValue(borrowAsset, liquidationAmount));

        userBorrows[borrowAsset][borrower].amount -= liquidationAmount;
        assetInfo[borrowAsset].totalBorrows -= liquidationAmount;
        userDeposits[collateralAsset][borrower].amount -= liquidatedCollateral;
        assetInfo[collateralAsset].totalDeposits -= liquidatedCollateral;

        if (borrowAsset == ETH) {
            require(msg.value >= liquidationAmount, "Insufficient ETH sent");
            if (msg.value > liquidationAmount) {
                payable(msg.sender).transfer(msg.value - liquidationAmount);
            }
        } else {
            require(IERC20(borrowAsset).transferFrom(msg.sender, address(this), liquidationAmount), "Transfer failed");
        }

        if (collateralAsset == ETH) {
            payable(msg.sender).transfer(liquidatedCollateral);
        } else {
            require(IERC20(collateralAsset).transfer(msg.sender, liquidatedCollateral), "Transfer failed");
        }

        emit Liquidation(borrower, borrowAsset, collateralAsset, liquidationAmount, liquidatedCollateral);
    }

    function getAccruedInterest(address asset, address user) external view returns (uint256) {
        UserBorrow storage userBorrow = userBorrows[asset][user];
        uint256 timePassed = block.timestamp - userBorrow.lastUpdateTimestamp;
        return userBorrow.amount * BORROW_RATE * timePassed / (365 days * 1e18);
    }

    function setAssetPriceFeed(address asset, address priceFeed) external onlyOwner {
        require(isAssetSupported(asset), "Asset not supported");
        assetInfo[asset].priceFeed = AggregatorV3Interface(priceFeed);
        emit AssetPriceFeedUpdated(asset, priceFeed);
    }

    function getAssetPrice(address asset) public view returns (uint256) {
        require(address(assetInfo[asset].priceFeed) != address(0), "Price feed not set");
        (, int256 price,,,) = assetInfo[asset].priceFeed.latestRoundData();
        require(price > 0, "Invalid price");
        return uint256(price);
    }

    function getMaxBorrowAmount(address borrowAsset, address collateralAsset, uint256 collateralAmount) external view returns (uint256) {
        uint256 collateralValue = getAssetValue(collateralAsset, collateralAmount);
        uint256 maxBorrowValue = collateralValue * 100 / LIQUIDATION_THRESHOLD;
        return getAssetAmount(borrowAsset, maxBorrowValue);
    }

    function isLiquidatable(address borrower, address borrowAsset, address collateralAsset) public view returns (bool) {
        uint256 borrowAmount = userBorrows[borrowAsset][borrower].amount;
        uint256 collateralAmount = userDeposits[collateralAsset][borrower].amount;

        uint256 borrowValue = getAssetValue(borrowAsset, borrowAmount);
        uint256 collateralValue = getAssetValue(collateralAsset, collateralAmount);

        return collateralValue < borrowValue * LIQUIDATION_THRESHOLD / 100;
    }

    function getAssetPriceFeed(address asset) external view returns (address) {
        require(isAssetSupported(asset), "Asset not supported");
        return address(assetInfo[asset].priceFeed);
    }

    function updateInterest(address asset) internal {
        uint256 timePassed = block.timestamp - assetInfo[asset].lastUpdateTimestamp;
        if (timePassed > 0) {
            uint256 borrowInterest = assetInfo[asset].totalBorrows * BORROW_RATE * timePassed / (365 days * 1e18);
            uint256 depositInterest = assetInfo[asset].totalDeposits * DEPOSIT_RATE * timePassed / (365 days * 1e18);
            
            assetInfo[asset].totalBorrows += borrowInterest;
            assetInfo[asset].totalDeposits += depositInterest;
            assetInfo[asset].lastUpdateTimestamp = block.timestamp;
        }
    }

    function isAssetSupported(address asset) public view returns (bool) {
        return assetInfo[asset].isActive;
    }

    function getAssetValue(address asset, uint256 amount) internal view returns (uint256) {
        uint256 price = getAssetPrice(asset);
        return price * amount / 1e8; // Assuming price is scaled to 8 decimals
    }

    function getAssetAmount(address asset, uint256 value) internal view returns (uint256) {
        uint256 price = getAssetPrice(asset);
        return value * 1e8 / price; // Assuming price is scaled to 8 decimals
    }

    function getMaxBorrowableAmounts(address user) external view returns (uint256[] memory, address[] memory) {
        uint256 collateralValue = 0;
        uint256 borrowValue = 0;
        uint256 assetCount = activeAssets.length;

        // Initialize result array
        uint256[] memory maxBorrowableAmounts = new uint256[](assetCount);
        address[] memory assets = new address[](assetCount);

        // Calculate the total value of collateral and total loan amount
        for (uint256 i = 0; i < assetCount; i++) {
            address asset = activeAssets[i];

            uint256 depositAmount = userDeposits[asset][user].amount;
            uint256 borrowAmount = userBorrows[asset][user].amount;

            // turn to value (USD)
            if (depositAmount > 0) {
                collateralValue += getAssetValue(asset, depositAmount);
            }
            if (borrowAmount > 0) {
                borrowValue += getAssetValue(asset, borrowAmount);
            }

            // Storage asset address
            assets[i] = asset;
        }

        // Calculate remaining loan amount
        uint256 maxBorrowValue = (collateralValue * 100) / LIQUIDATION_THRESHOLD;
        if (borrowValue >= maxBorrowValue) {
            // If there is no available credit, the borrowable quantity of all assets is 0
            for (uint256 i = 0; i < assetCount; i++) {
                maxBorrowableAmounts[i] = 0;
            }
        } else {
            uint256 remainingBorrowValue = maxBorrowValue - borrowValue;

            // Calculate the maximum amount that can be borrowed for each asset
            for (uint256 i = 0; i < assetCount; i++) {
                address asset = assets[i];
                uint256 maxAmount = getAssetAmount(asset, remainingBorrowValue);
                maxBorrowableAmounts[i] = maxAmount;
            }
        }

        return (maxBorrowableAmounts, assets);
    }

    // Events
    event Deposit(address indexed user, address indexed asset, uint256 amount);
    event Withdraw(address indexed user, address indexed asset, uint256 amount);
    event Borrow(address indexed user, address indexed borrowAsset, uint256 amount, address indexed collateralAsset);
    event Repay(address indexed user, address indexed asset, uint256 amount);
    event Liquidation(address indexed borrower, address indexed borrowAsset, address indexed collateralAsset, uint256 liquidationAmount, uint256 liquidatedCollateral);
    event AssetPriceFeedUpdated(address indexed asset, address indexed priceFeed);
}
