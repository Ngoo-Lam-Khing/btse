import { type Ref } from "vue";
import { OrderBookData } from "../types";

export default function updateArr(
  originalArray: Ref<[string, string][]>,
  newSource: OrderBookData["data"]["asks" | "bids"]
): [string, string][] {
  // 如果原陣列為空，直接取新來源的前八筆（忽略 size 為 0 的項目）
  if (originalArray.value.length === 0) {
    return newSource.filter(([_price, size]) => size !== "0").slice(0, 8);
  }

  let mergedArray: [string, string][] = [];
  let i = 0; // 指向 originalArray
  let j = 0; // 指向 newSource

  // 兩個陣列已排序，合併處理
  while (
    mergedArray.length < 8 &&
    (i < originalArray.value.length || j < newSource.length)
  ) {
    const originalItem = originalArray.value[i];
    const newItem = newSource[j];

    if (!originalItem) {
      // 如果 originalArray 已經迭代完，只處理 newSource
      if (newItem[1] !== "0") mergedArray.push(newItem);
      j++;
    } else if (!newItem) {
      // 如果 newSource 已經迭代完，只處理 originalArray
      mergedArray.push(originalItem);
      i++;
    } else {
      // 比較兩個陣列的價格
      const originalPrice = parseFloat(originalItem[0]);
      const newPrice = parseFloat(newItem[0]);

      if (originalPrice > newPrice) {
        // 保留 originalArray 的項目
        mergedArray.push(originalItem);
        i++;
      } else if (originalPrice < newPrice) {
        // 保留 newSource 的項目
        if (newItem[1] !== "0") mergedArray.push(newItem);
        j++;
      } else {
        // 價格相等時，用 newSource 更新 originalArray
        if (newItem[1] === "0") {
          i++; // 刪除 originalItem
        } else {
          mergedArray.push(newItem); // 更新
        }
        j++;
        i++;
      }
    }
  }

  // 更新原陣列，僅保留前八筆
  return mergedArray;
}
