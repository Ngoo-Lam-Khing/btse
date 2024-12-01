export default function (price: number) {
  return new Intl.NumberFormat().format(price);
}
