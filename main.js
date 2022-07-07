const axios =  require('axios');
const {Scheduler} = require('./Scheduler')


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

async function getTxDetail(id) {
    const data = await get(APIS.transactionDetail(id));
    
    if(!vin[id])    vin[id] = [];
    data.vin.forEach(vinObj => {
        vin[id].push(vinObj.txid)
    });
    return data;
}

const vin = {};
const aMap = {};


/**
 * 
 * A -> B, C
 * B -> E, F
 */

function buildAncestor(id) {
    let ancs = vin[id];
    if(!aMap[id])   aMap[id] = new Set();

    if(ancs?.length) {
        ancs.forEach(ancId => {
            if(vin[ancId])  aMap[id].add(ancId);

            buildAncestor(ancId);

            const ancsIds = aMap[ancId];
            ancsIds.forEach(key => {
                if(vin[key])    aMap[id].add(key)
            });
        })
    }
}

async function getTop10Ids() {
    const hash = await get(APIS.blockHeight(680000));
    const ids = await get(APIS.allBlockTxs(hash));

    const runner = new Scheduler(20);

    runner.addTasks(ids.map(id => () => getTxDetail(id)), (res) => {
        ids.forEach(id => {
            buildAncestor(id);
        })
        
        const sortableIds = [];

        for(let id in aMap) {
            sortableIds.push({id, size: aMap[id].size});
        }

        sortableIds.sort((a,b) => (b.size - a.size));

        const top10 = sortableIds.splice(0, 10);

        console.log(top10);
        return top10;
    });
}

getTop10Ids();