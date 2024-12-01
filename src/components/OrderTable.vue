<script setup lang="ts">
import { ref, inject, computed, type Ref, watch, ComputedRef } from 'vue';
import { OrderBookData } from '../types';
import usePrice from '../composable/usePrice';
import useSum from '../composable/useSum';
import useUpdateQuote from '../composable/useUpdateQuote';
import OrderTableRow from './OrderTableRow.vue';

const theads = ['Price(USD)', 'Size', 'Total']
const orderBookData = inject('orderBookData') as Ref<OrderBookData['data']>;

const aksArr: Ref<OrderBookData['data']['asks']> = ref([]);
const sumAsksArr: ComputedRef<number[]> = computed(() => useSum(aksArr.value, 'asks'));
const sumAsks: ComputedRef<number> = computed(() => sumAsksArr.value[0]);
const bidsArr: Ref<OrderBookData['data']['bids']> = ref([]);
const sumBidsArr: ComputedRef<number[]> = computed(() => useSum(bidsArr.value, 'bids'));
const sumBids: ComputedRef<number> = computed(() => sumBidsArr.value[7]);

// 比較orderbookdata資料
watch(() => orderBookData.value, (newOrderBookData, _oldOrderBookData) => {
  if (newOrderBookData.asks.length !== 0) {
    aksArr.value = useUpdateQuote(aksArr, newOrderBookData.asks);
  }
  if (newOrderBookData.bids.length !== 0) {
    bidsArr.value = useUpdateQuote(bidsArr, newOrderBookData.bids);
  }
}, { deep: true })
// 比較lastPrice

const lastPriceSocket = new WebSocket("wss://ws.btse.com/ws/futures");
const lastPrice: Ref<any | null> = ref(null);
lastPriceSocket.addEventListener("open", () => {
  lastPriceSocket.send(
    JSON.stringify({
      op: "subscribe",
      args: ["tradeHistoryApi:BTCPFC"],
    })
  );
});
lastPriceSocket.addEventListener("message", (e) => {
  const data = JSON.parse(e.data);
  if (data["topic"]) {
    lastPrice.value = data.data[0];
  }
});
// close socket
lastPriceSocket.addEventListener("close", (_e) =>
  console.log(
    "The Last price connection has been closed successfully. Its readystate: ",
    lastPriceSocket.readyState
  )
);
// show socket's error
lastPriceSocket.addEventListener("error", (e) =>
  console.error("Last price WebSocket error: ", e)
);

const lastPriceClass: Ref<string> = ref('');
const lastPriceEntity = computed(() => {
  if (lastPriceClass.value === 'up') return '&#8593;';
  if (lastPriceClass.value === 'down') return '&#8595;';
  return '';
})
watch(() => lastPrice.value, (newLastPrice, oldLastPrice) => {
  if (newLastPrice?.price > oldLastPrice?.price) {
    lastPriceClass.value = 'up'
  } else if (newLastPrice?.price < oldLastPrice?.price) {
    lastPriceClass.value = 'down'
  }
})
</script>
<template>
  <section class="table">
    <div class="thead">
      <div class="tr">
        <span class="th" v-for="thead in theads" :key="thead">
          {{ thead }}
        </span>
      </div>
    </div>
    <div class="tbody">
      <template v-if="orderBookData && orderBookData.asks">
        <OrderTableRow :className="'asks'" :arr="aksArr" :sumArr="sumAsksArr" :sum="sumAsks" />
      </template>
      <div :class="['tr', 'last-price', lastPriceClass]">
        <div class="td" v-html="`${lastPrice && usePrice(lastPrice.price)} ${lastPriceEntity}`">
        </div>
      </div>
      <template v-if="orderBookData && orderBookData.bids">
        <OrderTableRow :className="'bids'" :arr="bidsArr" :sumArr="sumBidsArr" :sum="sumBids" />
      </template>
    </div>
  </section>
</template>
<style lang="scss" scoped>
$thead-color: #8698aa;
$larger-c: #00b15d;
$smaller-c: #FF5B5A;
$up-bg: rgba(16, 186, 104, 0.12);
$down-bg: rgba(255, 90, 90, 0.12);

.table {
  width: 300px;
  .thead {
    color: $thead-color;
    .tr {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      .th {
        flex: 1;
        text-align: center;
      }
    }
  }
  .tbody {
    :deep(.tr) {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      .td {
        flex: 1;
        text-align: center;
      }
    }
  }
}


.last-price {
  background-color: rgba(134, 152, 170, .12);
  font-size: 16.8px;
  font-weight: bold;

  &.up {
    color: $larger-c;
    background-color: $up-bg;
  }

  &.down {
    color: $smaller-c;
    background-color: $down-bg;
  }
}</style>