// utils/euclideanDistance.js

export default function euclideanDistance(arr1, arr2) {

  if (!arr1 || !arr2) return 999;

  // Convert string JSON to array if needed
  if (typeof arr1 === "string")
    arr1 = JSON.parse(arr1);

  if (typeof arr2 === "string")
    arr2 = JSON.parse(arr2);

  // Handle nested arrays
  if (Array.isArray(arr1[0]))
    arr1 = arr1[0];

  if (Array.isArray(arr2[0]))
    arr2 = arr2[0];

  if (arr1.length !== arr2.length)
    return 999;

  let sum = 0;

  for (let i = 0; i < arr1.length; i++) {

    const diff = arr1[i] - arr2[i];

    sum += diff * diff;

  }

  return Math.sqrt(sum);
}
