const axios =  require('axios');

const APIS = {
    base: "https://blockstream.info/api",
    blockHeight: (height) => `${APIS.base}/block-height/${height}`,
    blockDetails: (hash) => `${APIS.base}/block/${hash}`,
    allBlockTxs: (hash) => `${APIS.base}/block/${hash}/txids`,
    transactionDetail: (txid) => `${APIS.base}/tx/${txid}`,
}

async function get(url) {
    const response = await axios.get(url);
    return response.data;
}

async function main() {
    const hash = await get(APIS.blockHeight(680000));
    const ids = await get(APIS.allBlockTxs(hash));

    const tx = await get(APIS.transactionDetail(ids[2]));

    console.log(tx)
}

main();