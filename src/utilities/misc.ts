export function filter_data(data: Array<object>, filter: keyof object) {
  return data.map((job) => job[filter]);
}
