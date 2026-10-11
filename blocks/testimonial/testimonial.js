/**
 * Decorates testimonial rows as semantic quotes with attribution.
 * @param {Element} block The testimonial block.
 */
export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const [quoteCell, attributionCell] = row.children;
    if (!quoteCell || !attributionCell) return null;

    const figure = document.createElement('figure');
    figure.className = 'testimonial-item';

    const quote = quoteCell.querySelector('blockquote') || document.createElement('blockquote');
    if (!quoteCell.contains(quote)) quote.append(...quoteCell.childNodes);
    quote.classList.add('testimonial-quote');

    const attribution = document.createElement('figcaption');
    attribution.className = 'testimonial-attribution';
    attribution.append(...attributionCell.childNodes);

    figure.append(quote, attribution);
    return figure;
  }).filter(Boolean);

  block.replaceChildren(...items);
}
