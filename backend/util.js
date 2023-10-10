const { PriorityQueue } = require("@datastructures-js/priority-queue");

let fundsData = [];

// socket.id -> customid
const clientMap = new Map();

const pq = new PriorityQueue((a, b) => {
  if (a.amount > b.amount) {
    return -1;
  }
  if (a.amount < b.amount) {
    return 1;
  }
});

//contains customId -> {paymentdata}
const paymentIdPendingMap = new Map();
const fundIdMap = new Map();

module.exports = {
  fundsData,
  fundIdMap,
  paymentIdPendingMap,
  clientMap,
  pq,
};
