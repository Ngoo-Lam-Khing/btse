export default function sum(arr: string[][], key: string) {
  let index = 0;
  let copiedArr = JSON.parse(JSON.stringify(arr));
  if (key === "asks") {
    copiedArr.reverse();
  }
  const result: number[] = [];
  for (const [_price, size] of copiedArr) {
    const prevSize = result[index - 1] || 0;
    result[index] = Number(size) + prevSize;
    index++;
  }
  if (key === "asks") {
    return result.reverse();
  }
  return result;
}
