function JsonToObject (params) {
  const json = JSON.stringify(params, null, 2)
  const result = eval('(' + json + ')')
  // const result = JSON.parse(json)
  return result
}

const a = {
  "key": 123,
  a: '123',
  "a-b": '123',
  a_b: 123
}
console.log(JsonToObject(a))