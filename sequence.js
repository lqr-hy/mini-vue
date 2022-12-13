
function sequence (arr) {
  // 长度
  let len = arr.length
  // 已默认第0个为基准来做序列
  const result = [0]
  let start
  let end
  let middle
  let resultLastIndex
  for (let index = 0; index < len; index++) {
    const arrI = arr[index];
    if (arrI !== 0) {
      resultLastIndex = result[result.length - 1]
      if (arr[resultLastIndex] < arrI) { // 比较最后一项比当前项大 大就将索引推入
        result.push(index)
        continue
      }

      // 通过二分法在结果中找到比当前值大的 用当前值的索引替换

      // 递增序列 
      start = 0
      end = result.length - 1
      while (start < end) { // start == end 停止
        middle = ((start + end) / 2) | 0 // 中间值
        if (arr[result[middle]] < arrI) {
          start = middle + 1
        } else {
          end = middle
        }
      }
      // 找到中间值替换
      if (arr[result[end]] > arrI) {
        result[end] = index
      }
    }
  }
  return result
}

console.log(sequence([3, 2, 8, 9, 5, 6, 7, 11, 15, 4]))