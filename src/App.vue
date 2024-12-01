<script setup lang="ts">
// import HelloWorld from "./components/HelloWorld.vue";
import { ref, computed, provide, watch } from "vue";
import type { OrderBookData } from "./types";
import OrderTable from "./components/OrderTable.vue";

const url = "wss://testws.btse.io/ws/oss/futures";
const orderBookData = ref<null | OrderBookData["data"]>(null);
provide("orderBookData", orderBookData);

let orderBookSocket = new WebSocket(url);
// open socket
orderBookSocket.addEventListener("open", () => {
  orderBookSocket.send(
    JSON.stringify({
      op: "subscribe",
      args: ["update:BTCPFC"],
    })
  );
});
// receive socket data
orderBookSocket.addEventListener("message", (e) => {
  const data = JSON.parse(e.data);
  if (data["topic"]) {
    orderBookData.value = data.data;
  }
});
// close socket
orderBookSocket.addEventListener("close", (_e) =>
  console.log(
    "The order book connection has been closed successfully. Its readystate: ",
    orderBookSocket.readyState
  )
);
// show socket's error
orderBookSocket.addEventListener("error", (e) =>
  console.error("order book WebSocket error: ", e)
);
/*
check the latest data's prevSeqNum if it's equal to prev one's seqNum
if not, close it and then reopen
*/
const reopenInterval = 3000;
watch(
  () => orderBookData.value,
  (newOrderBookData, oldOrderBookData) => {
    if (newOrderBookData && oldOrderBookData) {
      const { prevSeqNum } = newOrderBookData;
      const { seqNum } = oldOrderBookData;
      if (prevSeqNum !== seqNum) {
        orderBookSocket.close();
        setTimeout(() => orderBookSocket = new WebSocket(
          "wss://testws.btse.io/ws/oss/futures"
        ), reopenInterval);
      }
    }
  },
  {
    deep: true,
  }
);
</script>

<template>
  <header>Order Book</header>
  <OrderTable />
</template>

<style lang="scss">
$bgc: #131b29;
$color: #F0F4F8;

body {
  background-color: $bgc;
  color: $color;
}

table {
  width: 500px;
  border: unset;
  border-collapse: collapse;

  thead,
  tbody,
  tr,
  th,
  td {
    border: unset;
  }
}
</style>
