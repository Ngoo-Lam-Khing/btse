<script setup lang="ts">
import { ref, watch } from "vue";
import usePrice from '../composable/usePrice';

const props = defineProps<{
  className: string;
  arr: string[][];
  sumArr: number[];
  sum: number;
}>();

const priceArr = ref<string[]>([]);
const sizeArr = ref<string[]>([]);
const highlightArr = ref<string[]>([]);
watch(
  () => props.arr,
  (newArr, oldArr) => {
    const oldPriceArr = oldArr.map(([price]) => Number(price));
    for (let i = 0; i < 8; i++) {
      const newPrice = Number(newArr[i][0]);
      const oldPrice = Number(oldArr[i][0]);
      // for price fluctuation
      if (newPrice > oldPrice) {
        priceArr.value[i] = 'price--larger';
      } else if (newPrice < oldPrice) {
        priceArr.value[i] = 'price--smaller';
      } else {
        priceArr.value[i] = 'price--same';
      }
      // for size fluctuation
      const newSize = Number(newArr[i][1]);
      const oldSize = Number(oldArr[i][1]);
      if (newSize > oldSize) {
        sizeArr.value[i] = 'size--larger';
      } else if (newSize < oldSize) {
        sizeArr.value[i] = 'size--smaller';
      } else {
        sizeArr.value[i] = 'size--same';
      }
      // for new price
      if (!oldPriceArr.includes(newPrice)) {
        highlightArr.value[i] = 'highlight';
      } else {
        highlightArr.value[i] = '';
      }
    }
  },
  { deep: true }
);
</script>

<template>
  <div v-for="([price, size], index) in arr" :key="index" :class="['tr', className, highlightArr[index]]">
    <span :class="['td', priceArr[index]]">{{ usePrice(Number(price)) }}</span>
    <span :class="['td', sizeArr[index]]">{{ usePrice(Number(size)) }}</span>
    <span class="td">{{ usePrice(sumArr[index]) }}</span>
    <span class="ratio" :style="{ transform: `translateX(${100 - (Number(size)) / sum * 100}%)` }"></span>
  </div>
</template>

<style lang="scss" scoped>
$larger-c: #00b15d;
$larger-bgc: rgba(16, 186, 104, 0.12);
$smaller-c: #FF5B5A;
$smaller-bgc: rgba(134, 152, 170, 0.12);
$hover-color: #1E3059;
$flash-green-bgc: rgba(0, 177, 93, 0.5);
$flash-red-bgc: rgba(255, 91, 90, 0.5);
$asks-bar: rgba(255, 90, 90, 0.12);
$bids-bar: rgba(16, 186, 104, 0.12);

@keyframes fadeRed {
  0% {
    background-color: $flash-red-bgc;
  }

  100% {
    background-color: transparent;
  }
}

@keyframes fadeGreen {
  0% {
    background-color: $flash-green-bgc;
  }

  100% {
    background-color: transparent;
  }
}

.tr {
  position: relative;
  overflow: hidden;
  @media (hover: hover) {
    &:hover {
      background-color: $hover-color;
    }
  }

  &.asks {
    &.highlight {
      animation: fadeRed 1s forwards;
    }

    .ratio {
      background-color: $asks-bar;
    }
  }

  &.bids {
    &.highlight {
      animation: fadeGreen 1s forwards;
    }

    .ratio {
      background-color: $bids-bar;
    }
  }

  .price {
    &--larger {
      color: $larger-c;
    }

    &--smaller {
      color: $smaller-c;
    }
  }

  .size {
    &--larger {
      background-color: $larger-bgc;
    }

    &--smaller {
      background-color: $smaller-bgc;
    }
  }
  .ratio {
    display: block;
    width: 100%;
    height: 95%;
    position: absolute;
    left: 0;
  }

}
</style>
