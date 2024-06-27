require('dotenv').config();
const { ethers } = require('ethers');

const provider = new ethers.providers.JsonRpcProvider(process.env.RENZO_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const bridgeAbi = [
    {
        "type": "function",
        "name": "fee",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            { "type": "uint256", "name": "fee" }
        ]
    },
    {
        "type": "function",
        "name": "mint",
        "constant": false,
        "stateMutability": "payable",
        "payable": true,
        "inputs": [
            { "type": "address", "name": "_to" },
            { "type": "uint256", "name": "_amount" }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "quoteBridge",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            { "type": "uint32", "name": "_destination" }
        ],
        "outputs": [
            { "type": "uint256", "name": "nativeFee" }
        ]
    },
    {
        "type": "function",
        "name": "bridgeHFT",
        "constant": false,
        "stateMutability": "payable",
        "payable": true,
        "inputs": [
            { "type": "uint32", "name": "_destination" },
            { "type": "uint256", "name": "_amount" }
        ],
        "outputs": [
            { "type": "bytes32", "name": "messageId" }
        ]
    }
];

const bridgeContractAddress = process.env.BRIDGE_CONTRACT_ADDRESS;
const bridgeContract = new ethers.Contract(bridgeContractAddress, bridgeAbi, wallet);

const sendTokens = async (to, amount, destinationChainId) => {
    try {
        const quote = await bridgeContract.quoteBridge(destinationChainId);
        const tx = await bridgeContract.bridgeHFT(destinationChainId, amount, { value: quote });
        console.log(`Transaction hash: ${tx.hash}`);
        await tx.wait();
        console.log('Transaction confirmed!');
    } catch (error) {
        console.error(`Error sending tokens: ${error.message}`);
    }
};

const main = async () => {
    const to = 'адрес_получателя'; // Замените на реальный адрес получателя
    const amount = ethers.utils.parseUnits('10.0', 18); // Количество токенов для отправки
    const destinationChainId = 100; // ID целевой сети

    await sendTokens(to, amount, destinationChainId);
};

main();
