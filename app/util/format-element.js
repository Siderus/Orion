/**
 * Format an element to string as:
 *
 * `filenames - hash - size`
 *
 * Ex: `orion.png - jh4cq9 - 24.2 kB`
 *
 * This only shows the last 6 charts of the hash.
 * If the name of the files are longer than 25 chars it truncates with ellipsis.
 *
 * ```
 * Element {
 *  hash: string;
 *  dag: object;
 *  stat: object;
 * }
 * ```
 * @param {Element} element
 */
function formatElement (el) {
  const size = `${el.stat.CumulativeSize.value} ${el.stat.CumulativeSize.unit}`
  let files = el.dag.links
    // filter out unnamed links (usually pieces of a file)
    .filter(link => !!link.name)
    .map(link => link.name)
    .join(', ')
  // truncate + ellipsis if it's too long
  files = files.length <= 25 ? files : `${files.substr(0, 25)}…`

  // skip the dash if files is empty
  return `${files ? `${files} - ` : ''}${el.hash.substr(el.hash.length - 6)} - ${size}`
}

export default formatElement
